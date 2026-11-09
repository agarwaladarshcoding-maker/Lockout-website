package handlers

import (
	"encoding/json"
	"lockout-backend/internal/models"
	"net/http"
	"time"
)

// Request sent by the challenger (Alice)
type ChallengeRequest struct {
	OpponentIdentifier string `json:"opponent_identifier"` // "username", "cf_handle", or "email"
	OpponentInfo       string `json:"opponent_info"`       // The actual username, handle, or email value
	StartScore         int    `json:"start_score"`         // e.g. 800, 900
	MatchDuration      int    `json:"match_duration"`      // e.g. 15, 30, 45 (minutes)
	NumProblems        int    `json:"num_problems"`        // default 5
	Tiebreaker         bool   `json:"tiebreaker"`          // true or false
}
type ProblemSet struct {
	StartingScore int      `json:"starting_score"`
	NumProblems   int      `json:"num_problems"`
	Tiebreaker    bool     `json:"tiebreaker"`
	Problems      []string `json:"problems"`
}

// Payload stored in Redis during the 5-minute countdown
type PendingChallengeData struct {
	ChallengeID        string `json:"challenge_id"`
	ChallengerID       int    `json:"challenger_id"`
	ChallengerUsername string `json:"challenger_username"`
	OpponentID         int    `json:"opponent_id"`
	OpponentUsername   string `json:"opponent_username"`
	StartScore         int    `json:"start_score"`
	MatchDuration      int    `json:"match_duration"`
	NumProblems        int    `json:"num_problems"`
	Tiebreaker         bool   `json:"tiebreaker"`
	Status             string `json:"status"` // "pending", "accepted", "declined"
	ExpiresAt          int64  `json:"expires_at"`
}

// Response returned to the challenger immediately
type ChallengeResponse struct {
	ChallengeID      string `json:"challenge_id"`
	Message          string `json:"message"`
	ExpiresAt        int64  `json:"expires_at"`
	ExpiresInSeconds int    `json:"expires_in_seconds"`
}

// POST /api/challenges - Creates a 5-minute challenge in Redis
func (h *AuthHandler) ChallengeNew(w http.ResponseWriter, r *http.Request) {
	// 1. Authenticate challenger from session cookie & Redis
	cookie, err := r.Cookie("session_id")
	if err != nil {
		http.Error(w, "Unauthorized: missing session cookie", http.StatusUnauthorized)
		return
	}

	challengerID, err := h.sessionStore.GetUserID(r.Context(), cookie.Value)
	if err != nil {
		http.Error(w, "Unauthorized: session expired or invalid", http.StatusUnauthorized)
		return
	}

	// 2. Decode JSON request
	var req ChallengeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// 3. Validate request parameters
	if req.MatchDuration <= 0 || req.NumProblems <= 0 || req.StartScore < 800 || req.OpponentIdentifier == "" || req.OpponentInfo == "" {
		http.Error(w, "Invalid challenge parameters", http.StatusBadRequest)
		return
	}

	// 4. Find opponent by chosen identifier (cf_handle, username, or email)
	var opponent *models.User
	if req.OpponentIdentifier == "cf_handle" {
		opponent, err = h.userStore.GetUserByCodeforces(r.Context(), req.OpponentInfo)
	} else if req.OpponentIdentifier == "username" {
		opponent, err = h.userStore.GetUserByUsername(r.Context(), req.OpponentInfo)
	} else if req.OpponentIdentifier == "email" {
		opponent, err = h.userStore.GetUserByEmail(r.Context(), req.OpponentInfo)
	} else {
		http.Error(w, "Invalid opponent identifier type", http.StatusBadRequest)
		return
	}

	if err != nil || opponent == nil {
		http.Error(w, "Opponent not found", http.StatusNotFound)
		return
	}

	// Cannot challenge yourself
	if opponent.ID == challengerID {
		http.Error(w, "You cannot challenge yourself", http.StatusBadRequest)
		return
	}

	// 5. STATUS CHECK 1: Is Challenger already in a match or challenge?
	challengerBusy, err := h.sessionStore.IsPlayerBusy(r.Context(), challengerID)
	if err != nil {
		http.Error(w, "Error checking challenger status", http.StatusInternalServerError)
		return
	}
	if challengerBusy {
		http.Error(w, "You already have an active challenge or match", http.StatusConflict) // 409
		return
	}

	// 6. STATUS CHECK 2: Is Opponent already in a match or deciding on a challenge?
	opponentBusy, err := h.sessionStore.IsPlayerBusy(r.Context(), opponent.ID)
	if err != nil {
		http.Error(w, "Error checking opponent status", http.StatusInternalServerError)
		return
	}
	if opponentBusy {
		http.Error(w, "Opponent is currently busy in a match or challenge", http.StatusConflict) // 409
		return
	}

	// 7. Generate unique Challenge ID and 5-minute expiration clock
	challengeID, err := generateToken()
	if err != nil {
		http.Error(w, "Failed to generate challenge token", http.StatusInternalServerError)
		return
	}

	challengerUser, _ := h.userStore.GetUserByID(r.Context(), challengerID)
	challengerName := "Challenger"
	if challengerUser != nil {
		challengerName = challengerUser.Username
	}

	ttl := 300 * time.Second
	expiresAt := time.Now().Add(ttl).Unix()

	challengeData := PendingChallengeData{
		ChallengeID:        challengeID,
		ChallengerID:       challengerID,
		ChallengerUsername: challengerName,
		OpponentID:         opponent.ID,
		OpponentUsername:   opponent.Username,
		StartScore:         req.StartScore,
		MatchDuration:      req.MatchDuration,
		NumProblems:        req.NumProblems,
		Tiebreaker:         req.Tiebreaker,
		Status:             "pending",
		ExpiresAt:          expiresAt,
	}

	challengeJSON, err := json.Marshal(challengeData)
	if err != nil {
		http.Error(w, "Failed to serialize challenge data", http.StatusInternalServerError)
		return
	}

	// 8. Save in Redis with 5-minute TTL and flag both players as busy
	if err := h.sessionStore.CreatePendingChallenge(r.Context(), challengeID, challengerID, opponent.ID, challengeJSON, ttl); err != nil {
		http.Error(w, "Failed to save challenge to Redis", http.StatusInternalServerError)
		return
	}

	// 9. Send Response back to Alice
	res := ChallengeResponse{
		ChallengeID:      challengeID,
		Message:          "Challenge sent successfully",
		ExpiresAt:        expiresAt,
		ExpiresInSeconds: int(ttl.Seconds()),
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(res)
}

// GET /api/challenges/pending - Bob polls this to check if someone challenged him
func (h *AuthHandler) HandleGetPendingChallenge(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("session_id")
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	userID, err := h.sessionStore.GetUserID(r.Context(), cookie.Value)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Check if this user has any incoming challenge
	challengeID, err := h.sessionStore.GetIncomingChallenge(r.Context(), userID)
	if err != nil || challengeID == "" {
		// No challenge waiting -> return 204 No Content
		w.WriteHeader(http.StatusNoContent)
		return
	}

	// Fetch the full challenge details
	challengeJSON, err := h.sessionStore.GetChallengeData(r.Context(), challengeID)
	if err != nil || challengeJSON == nil {
		w.WriteHeader(http.StatusNoContent)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(challengeJSON)
}

// POST /api/challenges/decline - Bob declines the incoming challenge
func (h *AuthHandler) HandleDeclineChallenge(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("session_id")
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	userID, err := h.sessionStore.GetUserID(r.Context(), cookie.Value)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	challengeID, err := h.sessionStore.GetIncomingChallenge(r.Context(), userID)
	if err != nil || challengeID == "" {
		http.Error(w, "No active challenge to decline", http.StatusNotFound)
		return
	}

	challengeJSON, err := h.sessionStore.GetChallengeData(r.Context(), challengeID)
	if err == nil && challengeJSON != nil {
		var data PendingChallengeData
		if err := json.Unmarshal(challengeJSON, &data); err == nil {
			_ = h.sessionStore.ClearChallenge(r.Context(), challengeID, data.ChallengerID, data.OpponentID)
		}
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Challenge declined successfully",
	})
}
