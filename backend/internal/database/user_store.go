package database

import (
	"context"
	"fmt"
	"lockout-backend/internal/models"

	"github.com/jackc/pgx/v5/pgxpool"
)

type PostgresUserStore struct {
	pool *pgxpool.Pool // (The connection pool to PostgreSQL)
}

func NewPostgresUserStore(pool *pgxpool.Pool) *PostgresUserStore {
	return &PostgresUserStore{pool: pool}
}

type UserStore interface {
	CreateUser(ctx context.Context, user *models.User) (int, error)
	GetUserByEmail(ctx context.Context, email string) (*models.User, error)
	GetUserByUsername(ctx context.Context, username string) (*models.User, error)
	GetUserByCodeforces(ctx context.Context, codeforces string) (*models.User, error)
	GetUserByID(ctx context.Context, id int) (*models.User, error)
	UpdateCodeforcesHandle(ctx context.Context, userID int, handle string) error
	UpdateOnboardingStep(ctx context.Context, userID int, step string) error
}

func (pgs *PostgresUserStore) CreateUser(ctx context.Context, user *models.User) (int, error) {
	query := `
		INSERT INTO users (username, full_name, email, password_hash, onboarding_step)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id;
	`
	var newID int
	err := pgs.pool.QueryRow(ctx, query,
		user.Username,
		user.FullName,
		user.Email,
		user.PasswordHash,
		user.OnboardingStep,
	).Scan(&newID)

	if err != nil {
		return 0, fmt.Errorf("failed to insert user: %w", err)
	}

	return newID, nil
}
func (pgs *PostgresUserStore) GetUserByEmail(ctx context.Context, email string) (*models.User, error) {
	query :=
		`
	SELECT id, username, full_name, email, password_hash, codeforces_handle, onboarding_step, created_at
	FROM users
	WHERE email = $1
	`
	var userInfo models.User
	err := pgs.pool.QueryRow(ctx, query, email).Scan(
		&userInfo.ID,
		&userInfo.Username,
		&userInfo.FullName,
		&userInfo.Email,
		&userInfo.PasswordHash,
		&userInfo.CodeforcesHandle,
		&userInfo.OnboardingStep,
		&userInfo.CreatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to insert user: %w", err)
	}
	return &userInfo, nil
}
func (pgs *PostgresUserStore) GetUserByID(ctx context.Context, id int) (*models.User, error) {
	query :=
		`
	SELECT id, username, full_name, email, password_hash, codeforces_handle, onboarding_step, created_at
	FROM users
	WHERE id = $1
	`
	var userInfo models.User
	err := pgs.pool.QueryRow(ctx, query, id).Scan(
		&userInfo.ID,
		&userInfo.Username,
		&userInfo.FullName,
		&userInfo.Email,
		&userInfo.PasswordHash,
		&userInfo.CodeforcesHandle,
		&userInfo.OnboardingStep,
		&userInfo.CreatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to insert user: %w", err)
	}
	return &userInfo, nil
}
func (pgs *PostgresUserStore) GetUserByUsername(ctx context.Context, username string) (*models.User, error) {
	query :=
		`
	SELECT id, username, full_name, email, password_hash, codeforces_handle, onboarding_step, created_at
	FROM users
	WHERE username = $1
	`
	var userInfo models.User
	err := pgs.pool.QueryRow(ctx, query, username).Scan(
		&userInfo.ID,
		&userInfo.Username,
		&userInfo.FullName,
		&userInfo.Email,
		&userInfo.PasswordHash,
		&userInfo.CodeforcesHandle,
		&userInfo.OnboardingStep,
		&userInfo.CreatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to insert user: %w", err)
	}
	return &userInfo, nil
}
func (pgs *PostgresUserStore) GetUserByCodeforces(ctx context.Context, codeforces string) (*models.User, error) {
	query :=
		`
	SELECT id, username, full_name, email, password_hash, codeforces_handle, onboarding_step, created_at
	FROM users
	WHERE codeforces_handle = $1
	`
	var userInfo models.User
	err := pgs.pool.QueryRow(ctx, query, codeforces).Scan(
		&userInfo.ID,
		&userInfo.Username,
		&userInfo.FullName,
		&userInfo.Email,
		&userInfo.PasswordHash,
		&userInfo.CodeforcesHandle,
		&userInfo.OnboardingStep,
		&userInfo.CreatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to insert user: %w", err)
	}
	return &userInfo, nil
}
func (pgs *PostgresUserStore) UpdateCodeforcesHandle(ctx context.Context, userID int, handle string) error {
	query := `
		UPDATE users
		SET codeforces_handle = $1
		WHERE id = $2;
	`
	_, err := pgs.pool.Exec(ctx, query, handle, userID)
	if err != nil {
		return fmt.Errorf("failed to update codeforces handle: %w", err)
	}
	return nil
}

func (pgs *PostgresUserStore) UpdateOnboardingStep(ctx context.Context, userID int, step string) error {
	query := `
		UPDATE users
		SET onboarding_step = $1
		WHERE id = $2;
	`
	_, err := pgs.pool.Exec(ctx, query, step, userID)
	if err != nil {
		return fmt.Errorf("failed to update onboarding step: %w", err)
	}
	return nil
}
