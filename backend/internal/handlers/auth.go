package handlers

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"lockout-backend/internal/database"
	"lockout-backend/internal/models"
	"log"
	"net/http"
	"regexp"
	"time"

	"golang.org/x/crypto/bcrypt"
)

func isEmailValid(e string) bool {
	emailRegex := regexp.MustCompile(`^[a-zA-Z0-9.!#$%&'*+/=?^_` + "`" + `{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$`)
	return emailRegex.MatchString(e)
}

type AuthHandler struct {
	userStore    database.UserStore
	sessionStore database.SessionStore
}

func NewAuthHandler(userStore database.UserStore, sessionStore database.SessionStore) *AuthHandler {
	return &AuthHandler{
		userStore:    userStore,
		sessionStore: sessionStore,
	}
}

// Request & Response Structs

type SignUpRequest struct {
	Username string `json:"username"`
	FullName string `json:"full_name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type SignInRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// FIX: Expanded UserResponse to include FullName and CodeforcesHandle
// according to our API contract for profile & auto-login
type UserResponse struct {
	ID               int    `json:"id"`
	Username         string `json:"username"`
	FullName         string `json:"full_name"`
	Email            string `json:"email"`
	CodeforcesHandle string `json:"codeforces_handle"`
	OnboardingStep   string `json:"onboarding_step"`
}

type SignUpResponse struct {
	User UserResponse `json:"user"`
}

type SignInResponse struct {
	User UserResponse `json:"user"`
}

// FIX: Added quotes around "user" in JSON tag (`json:"user"`)
type AutoLoginResponse struct {
	User UserResponse `json:"user"`
}

type LogoutResponse struct {
	Message string `json:"message"`
}

// Security & Crypto Helpers

// FIX: Changed bcrypt cost from 14 (takes ~2s per request) to bcrypt.DefaultCost (10, ~60ms)
func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

func generateToken() (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}

// Handlers

func (h *AuthHandler) HandleSignUp(w http.ResponseWriter, r *http.Request) {
	// 1. Unpack request JSON
	var req SignUpRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON format", http.StatusBadRequest)
		return
	}

	// 2. Validate input boundaries
	if len(req.Username) < 3 || len(req.Username) > 20 ||
		!isEmailValid(req.Email) ||
		len(req.FullName) < 3 || len(req.FullName) > 50 ||
		len(req.Password) < 8 || len(req.Password) > 50 {
		http.Error(w, "Invalid input validation", http.StatusBadRequest)
		return
	}

	// FIX: Check if email is already taken (return 409 Conflict instead of 500 error)
	if existing, _ := h.userStore.GetUserByEmail(r.Context(), req.Email); existing != nil {
		http.Error(w, "Email is already registered", http.StatusConflict)
		return
	}

	// FIX: Check if username is already taken (return 409 Conflict)
	if existing, _ := h.userStore.GetUserByUsername(r.Context(), req.Username); existing != nil {
		http.Error(w, "Username is already taken", http.StatusConflict)
		return
	}

	// 3. Hash password
	passwordHash, err := HashPassword(req.Password)
	if err != nil {
		http.Error(w, "Failed to hash password", http.StatusInternalServerError)
		return
	}

	// 4. Assemble Domain Model
	user := models.User{
		Username:       req.Username,
		FullName:       req.FullName,
		Email:          req.Email,
		PasswordHash:   passwordHash,
		OnboardingStep: "LINK_CODEFORCES",
	}

	// 5. Save to Postgres
	userID, err := h.userStore.CreateUser(r.Context(), &user)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error creating user: %v", err), http.StatusInternalServerError)
		return
	}

	// 6. Generate session token & store in Redis (30 days TTL)
	token, err := generateToken()
	if err != nil {
		http.Error(w, "Error generating session token", http.StatusInternalServerError)
		return
	}

	sessionTTL := 30 * 24 * time.Hour
	if err := h.sessionStore.CreateSession(r.Context(), token, userID, sessionTTL); err != nil {
		http.Error(w, "Error saving session", http.StatusInternalServerError)
		return
	}

	// 7. Set HTTP-Only Cookie
	cookie := &http.Cookie{
		Name:     "session_id",
		Value:    token,
		Path:     "/",
		MaxAge:   int(sessionTTL.Seconds()), // 30 days
		HttpOnly: true,                      // Protect from XSS (JS cannot read it)
		Secure:   false,                     // Set to true in production with HTTPS
		SameSite: http.SameSiteLaxMode,
	}
	http.SetCookie(w, cookie)

	// 8. Send 201 Created JSON response
	res := SignUpResponse{
		User: UserResponse{
			ID:               userID,
			Username:         user.Username,
			FullName:         user.FullName,
			Email:            user.Email,
			CodeforcesHandle: "",
			OnboardingStep:   user.OnboardingStep,
		},
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(res)
}

func (h *AuthHandler) HandleSignIn(w http.ResponseWriter, r *http.Request) {
	// 1. Unpack request JSON
	var req SignInRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON format", http.StatusBadRequest)
		return
	}

	// 2. Find user in Postgres
	user, err := h.userStore.GetUserByEmail(r.Context(), req.Email)
	if err != nil {
		http.Error(w, "Invalid email or password", http.StatusUnauthorized)
		return
	}

	// 3. Verify password
	if !CheckPasswordHash(req.Password, user.PasswordHash) {
		http.Error(w, "Invalid email or password", http.StatusUnauthorized)
		return
	}

	// 4. Generate session token & store in Redis (30 days TTL)
	token, err := generateToken()
	if err != nil {
		http.Error(w, "Error generating session token", http.StatusInternalServerError)
		return
	}

	sessionTTL := 30 * 24 * time.Hour
	if err := h.sessionStore.CreateSession(r.Context(), token, user.ID, sessionTTL); err != nil {
		http.Error(w, "Error saving session", http.StatusInternalServerError)
		return
	}

	// 5. Set HTTP-Only Cookie
	cookie := &http.Cookie{
		Name:     "session_id",
		Value:    token,
		Path:     "/",
		MaxAge:   int(sessionTTL.Seconds()), // 30 days
		HttpOnly: true,                      // Protect from XSS
		Secure:   false,                     // Set to true in production with HTTPS
		SameSite: http.SameSiteLaxMode,
	}
	http.SetCookie(w, cookie)

	// 6. Send 200 OK JSON response (FIX: Changed from StatusCreated 201 to StatusOK 200)
	res := SignInResponse{
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

func (h *AuthHandler) HandleAutoLogin(w http.ResponseWriter, r *http.Request) {
	// 1. Read session cookie
	cookie, err := r.Cookie("session_id")
	if err != nil {
		switch {
		case errors.Is(err, http.ErrNoCookie):
			http.Error(w, "Not logged in", http.StatusUnauthorized)
		default:
			log.Println("Error reading cookie:", err)
			http.Error(w, "Server error", http.StatusInternalServerError)
		}
		return
	}

	// 2. Fetch User ID from Redis session
	userID, err := h.sessionStore.GetUserID(r.Context(), cookie.Value)
	if err != nil {
		http.Error(w, "Session expired", http.StatusUnauthorized)
		return
	}

	// 3. Fetch full profile from Postgres
	user, err := h.userStore.GetUserByID(r.Context(), userID)
	if err != nil {
		http.Error(w, "User not found", http.StatusUnauthorized)
		return
	}

	// 4. Send 200 OK JSON response
	res := AutoLoginResponse{
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

// FIX: Added HandleLogout method
func (h *AuthHandler) HandleLogout(w http.ResponseWriter, r *http.Request) {
	// 1. Read session cookie
	cookie, err := r.Cookie("session_id")
	if err != nil {
		http.Error(w, "Not logged in", http.StatusUnauthorized)
		return
	}

	// 2. Invalidate session in Redis
	if err := h.sessionStore.DeleteSession(r.Context(), cookie.Value); err != nil {
		log.Printf("Warning: failed to delete session in Redis: %v\n", err)
	}

	// 3. Instruct browser to destroy cookie (MaxAge: -1 kills it immediately)
	clearCookie := &http.Cookie{
		Name:     "session_id",
		Value:    "",
		Path:     "/",
		MaxAge:   -1,
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
	}
	http.SetCookie(w, clearCookie)

	// 4. Send 200 OK Response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(LogoutResponse{
		Message: "Logged out successfully",
	})
}
