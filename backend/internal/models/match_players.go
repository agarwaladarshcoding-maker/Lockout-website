package models

type MatchPlayer struct {
	MatchID  int    `json:"match_id"`
	UserID   int    `json:"user_id"`
	Role     string `json:"role"`
	Score    int    `json:"score"`
	IsWinner bool   `json:"is_winner"`
}
