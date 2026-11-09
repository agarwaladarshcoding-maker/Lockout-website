package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"lockout-backend/internal/database"
	"lockout-backend/internal/handlers"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
)

func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		w.Header().Set("Access-Control-Allow-Credentials", "true")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func main() {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// 1. Connect to PostgreSQL
	// Change this DSN to your actual Postgres username/password/database
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://adarshagarwala:@localhost:5432/lockout?sslmode=disable"
	}

	dbPool, err := pgxpool.New(ctx, dbURL)
	if err != nil {
		log.Fatalf("❌ Unable to create Postgres pool: %v\n", err)
	}
	defer dbPool.Close()

	if err := dbPool.Ping(ctx); err != nil {
		log.Fatalf("❌ Postgres ping failed: %v\n", err)
	}
	fmt.Println("✅ Connected to PostgreSQL successfully")

	// 2. Connect to Redis
	redisAddr := os.Getenv("REDIS_ADDR")
	if redisAddr == "" {
		redisAddr = "localhost:6379"
	}

	rdb := redis.NewClient(&redis.Options{
		Addr: redisAddr,
	})
	defer rdb.Close()

	if err := rdb.Ping(ctx).Err(); err != nil {
		log.Fatalf("❌ Redis ping failed: %v\n", err)
	}
	fmt.Println("✅ Connected to Redis successfully")

	// 3. Initialize Stores & Handlers
	userStore := database.NewPostgresUserStore(dbPool)
	sessionStore := database.NewRedisSessionStore(rdb)
	authHandler := handlers.NewAuthHandler(userStore, sessionStore)

	// 4. Standard Go ServeMux Routing
	mux := http.NewServeMux()

	// Auth Endpoints
	mux.HandleFunc("POST /api/auth/signup", authHandler.HandleSignUp)
	mux.HandleFunc("POST /api/auth/signin", authHandler.HandleSignIn)
	mux.HandleFunc("GET /api/auth/me", authHandler.HandleAutoLogin)
	mux.HandleFunc("POST /api/auth/logout", authHandler.HandleLogout)

	// Codeforces Onboarding Endpoints
	mux.HandleFunc("POST /api/onboarding/codeforces/start", authHandler.HandleStartCFVerification)
	mux.HandleFunc("POST /api/onboarding/codeforces/verify", authHandler.HandleVerifyCF)

	// Problem Picker Endpoint
	mux.HandleFunc("POST /api/problems/pick", authHandler.HandleProblemPicker)

	// 5. Wrap with CORS Middleware and Start Server
	handler := enableCORS(mux)

	port := ":8080"
	fmt.Printf("🚀 Lockout server listening on http://localhost%s\n", port)
	if err := http.ListenAndServe(port, handler); err != nil {
		log.Fatalf("Server error: %v\n", err)
	}
}
