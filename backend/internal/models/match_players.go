package models

// Table match_players {
//   id int [pk, increment]
//   match_id int [ref: > matches.id, not null]
//   user_id int [ref: > users.id, not null]
//   role varchar [not null] // 'challenger' or 'accepter'
//   score int [default: 0]
//   is_winner boolean [default: false]

//	  indexes {
//	    (match_id, user_id) [unique]
//	    user_id
//	  }
//	}
type MatchPlayer struct {
	ID       int    `json:"id"`
	MatchID  int    `json:"match_id"`
	UserID   int    `json:"user_id"`
	Role     string `json:"role"`
	Score    int    `json:"score"`
	IsWinner bool   `json:"is_winner"`
}
