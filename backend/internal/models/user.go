package models

import "time"

type User struct {
	ID               int       `json:"id"`
	Username         string    `json:"username"`
	FullName         string    `json:"full_name"`
	Email            string    `json:"email"`
	PasswordHash     string    `json:"-"`
	CodeforcesHandle string    `json:"codeforces_handle"`
	OnboardingStep   string    `json:"onboarding_step"`
	CreatedAt        time.Time `json:"created_at"`
}
