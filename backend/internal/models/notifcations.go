package models

import "time"

// Table notifications {
//   id int [pk, increment]
//   user_id int [ref: > users.id, not null]
//   match_id int [ref: > matches.id, not null]
//   status varchar [not null, default: 'unread'] // 'unread', 'read', 'accepted', 'declined', 'expired'
//   created_at timestamp [default: `now()`]

//   indexes {
//     user_id
//   }
// }

type Notification struct {
	ID        int       `json:"id"`
	UserId    int       `json:"user_id"`
	MatchID   int       `json:"match_id"`
	Status    string    `json:"status"`
	CreatedAt time.Time `json:"created_at"`
}
