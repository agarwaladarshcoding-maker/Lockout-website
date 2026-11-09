package models

import "time"

// Table matches {
//   id int [pk, increment]
//   num_problems int [default: 5]
//   starting_rating int [default: 800]
//   duration_minutes int [not null]
//   status varchar [not null, default: 'in_progress'] // 'in_progress', 'tiebreaker', 'completed', 'cancelled'
//   went_to_tiebreaker boolean [default: false]
//   started_at timestamp [default: `now()`]
//   ended_at timestamp
// }

type Match struct {
	ID               int        `json:"id"`
	NumberOfProblems int        `json:"num_problems"`
	StartingRating   int        `json:"starting_rating"`
	DurationMinutes  int        `json:"duration_minutes"`
	Status           string     `json:"status"`
	WentToTiebreaker bool       `json:"went_to_tiebreaker"`
	StartedAt        time.Time  `json:"started_at"`
	EndedAt          *time.Time `json:"ended_at"`
}
