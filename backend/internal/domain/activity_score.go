package domain

import "time"

// ActivityScore stores a computed hot / rank score for one activity.
type ActivityScore struct {
	ID              uint64    `gorm:"primaryKey" json:"id"`
	ActivityID      uint64    `gorm:"uniqueIndex;not null" json:"activity_id"`
	Score           float64   `gorm:"not null;default:0" json:"score"`
	ScoreComponents string    `gorm:"type:json;not null" json:"score_components"`
	CalculatedAt    time.Time `gorm:"not null" json:"calculated_at"`
	Rank            int       `gorm:"not null;default:0" json:"rank"`
}
