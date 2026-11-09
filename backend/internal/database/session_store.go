package database

import (
	"context"
	"fmt"
	"strconv"
	"time"

	"github.com/redis/go-redis/v9"
)

type RedisSessionStore struct {
	client *redis.Client
}

func NewRedisSessionStore(client *redis.Client) *RedisSessionStore {
	return &RedisSessionStore{client: client}
}

type SessionStore interface {
	// Saves session token mapped to user ID with expiration TTL (e.g., 30 days)
	CreateSession(ctx context.Context, token string, userID int, ttl time.Duration) error

	// Looks up the user ID associated with a session token. Returns error if expired/missing.
	GetUserID(ctx context.Context, token string) (int, error)

	// Deletes the session token from Redis on logout.
	DeleteSession(ctx context.Context, token string) error

	// Temporary 5-minute verification window for Codeforces linking
	SetCFVerification(ctx context.Context, userID int, handle string, ttl time.Duration) error
	GetCFVerification(ctx context.Context, userID int) (string, error)

	// Challenge & Matchmaking methods
	IsPlayerBusy(ctx context.Context, userID int) (bool, error)
	CreatePendingChallenge(ctx context.Context, challengeID string, challengerID, opponentID int, challengeJSON []byte, ttl time.Duration) error
	GetIncomingChallenge(ctx context.Context, userID int) (string, error)
	GetChallengeData(ctx context.Context, challengeID string) ([]byte, error)
	ClearChallenge(ctx context.Context, challengeID string, challengerID, opponentID int) error
	SetPlayerInMatch(ctx context.Context, userID int, matchID int) error
}

func (s *RedisSessionStore) CreateSession(ctx context.Context, token string, userID int, ttl time.Duration) error {
	key := "session:" + token
	err := s.client.Set(ctx, key, userID, ttl).Err()
	if err != nil {
		return fmt.Errorf("failed to set session in redis: %w", err)
	}
	return nil
}

func (s *RedisSessionStore) GetUserID(ctx context.Context, token string) (int, error) {
	key := "session:" + token
	val, err := s.client.Get(ctx, key).Int()
	if err != nil {
		return 0, err
	}
	return val, nil
}

func (s *RedisSessionStore) DeleteSession(ctx context.Context, token string) error {
	key := "session:" + token
	err := s.client.Del(ctx, key).Err()
	if err != nil {
		return fmt.Errorf("failed to delete session: %w", err)
	}
	return nil
}

func (s *RedisSessionStore) SetCFVerification(ctx context.Context, userID int, handle string, ttl time.Duration) error {
	key := strconv.Itoa(userID) + ":cf_verification"
	err := s.client.Set(ctx, key, handle, ttl).Err()
	if err != nil {
		return fmt.Errorf("failed to set cf verification: %w", err)
	}
	return nil
}

func (s *RedisSessionStore) GetCFVerification(ctx context.Context, userID int) (string, error) {
	key := strconv.Itoa(userID) + ":cf_verification"
	handle, err := s.client.Get(ctx, key).Result()
	if err != nil {
		return "", err
	}
	return handle, nil
}

// Check if a player is in a match or has an active pending challenge
func (s *RedisSessionStore) IsPlayerBusy(ctx context.Context, userID int) (bool, error) {
	key := fmt.Sprintf("player:%d:status", userID)
	count, err := s.client.Exists(ctx, key).Result()
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

// Stores the challenge and sets status flags for both players (TTL 5 minutes)
func (s *RedisSessionStore) CreatePendingChallenge(ctx context.Context, challengeID string, challengerID, opponentID int, challengeJSON []byte, ttl time.Duration) error {
	// 1. Save full challenge payload
	if err := s.client.Set(ctx, "challenge:"+challengeID, challengeJSON, ttl).Err(); err != nil {
		return err
	}

	// 2. Map opponent's incoming challenge pointer
	if err := s.client.Set(ctx, fmt.Sprintf("player:%d:incoming", opponentID), challengeID, ttl).Err(); err != nil {
		return err
	}

	// 3. Mark both players as busy in Redis
	s.client.Set(ctx, fmt.Sprintf("player:%d:status", challengerID), "CHALLENGING", ttl)
	s.client.Set(ctx, fmt.Sprintf("player:%d:status", opponentID), "CHALLENGED", ttl)

	return nil
}

// Retrieves the active challenge ID waiting for this user (for polling)
func (s *RedisSessionStore) GetIncomingChallenge(ctx context.Context, userID int) (string, error) {
	key := fmt.Sprintf("player:%d:incoming", userID)
	challengeID, err := s.client.Get(ctx, key).Result()
	if err != nil {
		if err == redis.Nil {
			return "", nil // No challenge waiting
		}
		return "", err
	}
	return challengeID, nil
}

// Fetches the JSON payload of a specific challenge
func (s *RedisSessionStore) GetChallengeData(ctx context.Context, challengeID string) ([]byte, error) {
	key := "challenge:" + challengeID
	val, err := s.client.Get(ctx, key).Bytes()
	if err != nil {
		return nil, err
	}
	return val, nil
}

// Cleans up a challenge when declined or cancelled
func (s *RedisSessionStore) ClearChallenge(ctx context.Context, challengeID string, challengerID, opponentID int) error {
	s.client.Del(ctx, "challenge:"+challengeID)
	s.client.Del(ctx, fmt.Sprintf("player:%d:incoming", opponentID))
	s.client.Del(ctx, fmt.Sprintf("player:%d:status", challengerID))
	s.client.Del(ctx, fmt.Sprintf("player:%d:status", opponentID))
	return nil
}

// Sets player status to IN_MATCH (with a 3-hour safety TTL)
func (s *RedisSessionStore) SetPlayerInMatch(ctx context.Context, userID int, matchID int) error {
	key := fmt.Sprintf("player:%d:status", userID)
	return s.client.Set(ctx, key, fmt.Sprintf("IN_MATCH:%d", matchID), 3*time.Hour).Err()
}
