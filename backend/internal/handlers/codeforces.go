package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"time"
)

// Request & Response Structs for Codeforces Verification

type StartCFRequest struct {
	Handle string `json:"codeforces_handle"`
}

type StartCFResponse struct {
	Message          string `json:"message"`
	Problem          string `json:"problem"`
	ExpiresInSeconds int    `json:"expires_in_seconds"`
}

type VerifyCFResponse struct {
	Message string       `json:"message"`
	User    UserResponse `json:"user"`
}

// Codeforces Public API Structs

type CFProblem struct {
	ContestID int    `json:"contestId"`
	Index     string `json:"index"`
}

type CFSubmission struct {
	ID                  int64     `json:"id"`
	ContestID           int       `json:"contestId"`
	Problem             CFProblem `json:"problem"`
	Verdict             string    `json:"verdict"`             // Expected: "COMPILATION_ERROR"
	CreationTimeSeconds int64     `json:"creationTimeSeconds"` // Epoch timestamp in seconds
}

type CFStatusResponse struct {
	Status  string         `json:"status"`
	Comment string         `json:"comment"`
	Result  []CFSubmission `json:"result"`
}

// Step 1: POST /api/onboarding/codeforces/start
// Initiates the 5-minute verification window and saves pending handle in Redis
func (h *AuthHandler) HandleStartCFVerification(w http.ResponseWriter, r *http.Request) {
	// 1. Authenticate user from session cookie
	cookie, err := r.Cookie("session_id")
	if err != nil {
		http.Error(w, "Unauthorized: missing session cookie", http.StatusUnauthorized)
		return
	}
	userID, err := h.sessionStore.GetUserID(r.Context(), cookie.Value)
	if err != nil {
		http.Error(w, "Unauthorized: session expired", http.StatusUnauthorized)
		return
	}

	// 2. Decode JSON request
	var req StartCFRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON format", http.StatusBadRequest)
		return
	}

	handle := strings.TrimSpace(req.Handle)
	if handle == "" {
		http.Error(w, "Handle cannot be empty", http.StatusBadRequest)
		return
	}

	// 3. Check if handle is already claimed by another user in Postgres
	existingUser, _ := h.userStore.GetUserByCodeforces(r.Context(), handle)
	if existingUser != nil && existingUser.ID != userID {
		http.Error(w, "This Codeforces handle is already linked to another account", http.StatusConflict)
		return
	}

	// 4. Save pending verification in Redis with 5-minute TTL (300 seconds)
	verificationTTL := 300 * time.Second
	if err := h.sessionStore.SetCFVerification(r.Context(), userID, handle, verificationTTL); err != nil {
		http.Error(w, "Failed to start verification window in Redis", http.StatusInternalServerError)
		return
	}

	// 5. Update user onboarding step in DB
	_ = h.userStore.UpdateOnboardingStep(r.Context(), userID, "VERIFY_CODEFORCES")

	// 6. Return response matching contracts.md
	res := StartCFResponse{
		Message:          "Verification started",
		Problem:          "1A",
		ExpiresInSeconds: int(verificationTTL.Seconds()),
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(res)
}

// Step 2: POST /api/onboarding/codeforces/verify
// Checks Codeforces API for a COMPILATION_ERROR on problem 1A within the 5-minute window
func (h *AuthHandler) HandleVerifyCF(w http.ResponseWriter, r *http.Request) {
	// 1. Authenticate user from session cookie
	cookie, err := r.Cookie("session_id")
	if err != nil {
		http.Error(w, "Unauthorized: missing session cookie", http.StatusUnauthorized)
		return
	}
	userID, err := h.sessionStore.GetUserID(r.Context(), cookie.Value)
	if err != nil {
		http.Error(w, "Unauthorized: session expired", http.StatusUnauthorized)
		return
	}

	// 2. Fetch pending verification handle from Redis
	handle, err := h.sessionStore.GetCFVerification(r.Context(), userID)
	if err != nil || handle == "" {
		http.Error(w, "Verification window expired. Please enter your handle again.", http.StatusGone) // 410 Gone
		return
	}

	// 3. Fetch latest submissions from Codeforces API
	cfURL := fmt.Sprintf("https://codeforces.com/api/user.status?handle=%s&from=1&count=10", url.QueryEscape(handle))
	client := &http.Client{Timeout: 8 * time.Second}

	req, err := http.NewRequestWithContext(r.Context(), http.MethodGet, cfURL, nil)
	if err != nil {
		http.Error(w, "Failed to create Codeforces request", http.StatusInternalServerError)
		return
	}
	req.Header.Set("User-Agent", "Lockout-Web/1.0 (Competitive Programming Lockout Platform)")

	resp, err := client.Do(req)
	if err != nil {
		http.Error(w, "Failed to connect to Codeforces API", http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()

	var cfStatus CFStatusResponse
	if err := json.NewDecoder(resp.Body).Decode(&cfStatus); err != nil {
		http.Error(w, "Failed to parse Codeforces API response", http.StatusInternalServerError)
		return
	}

	if cfStatus.Status != "OK" {
		http.Error(w, fmt.Sprintf("Codeforces error: %s", cfStatus.Comment), http.StatusBadRequest)
		return
	}

	// 4. Verify that problem 1A has a COMPILATION_ERROR submitted within the last 5 minutes (+30s buffer)
	fiveMinutesAgo := time.Now().Unix() - 330
	verified := false

	for _, sub := range cfStatus.Result {
		isProblem1A := sub.Problem.ContestID == 1 && strings.EqualFold(sub.Problem.Index, "A")
		isCompilationError := strings.EqualFold(sub.Verdict, "COMPILATION_ERROR")
		isWithinWindow := sub.CreationTimeSeconds >= fiveMinutesAgo

		if isProblem1A && isCompilationError && isWithinWindow {
			verified = true
			break
		}
	}

	if !verified {
		http.Error(w, "No compilation error found on problem 1A submitted within the last 5 minutes. Please try again.", http.StatusBadRequest)
		return
	}

	// 5. Update Postgres: link handle and mark onboarding as COMPLETED
	if err := h.userStore.UpdateCodeforcesHandle(r.Context(), userID, handle); err != nil {
		http.Error(w, "Failed to update Codeforces handle in database", http.StatusInternalServerError)
		return
	}

	if err := h.userStore.UpdateOnboardingStep(r.Context(), userID, "COMPLETED"); err != nil {
		http.Error(w, "Failed to update onboarding step", http.StatusInternalServerError)
		return
	}

	// 6. Fetch updated user profile
	user, err := h.userStore.GetUserByID(r.Context(), userID)
	if err != nil {
		http.Error(w, "Failed to fetch updated profile", http.StatusInternalServerError)
		return
	}

	// 7. Send 200 OK JSON response
	res := VerifyCFResponse{
		Message: "Codeforces handle verified successfully",
		User: UserResponse{
			ID:               user.ID,
			Username:         user.Username,
			FullName:         user.FullName,
			Email:            user.Email,
			CodeforcesHandle: user.CodeforcesHandle,
			OnboardingStep:   user.OnboardingStep,
		},
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(res)
}
