package service

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"math"
	"sync"
	"time"

	"github.com/uaad/backend/internal/config"
	"github.com/uaad/backend/internal/repository"
)

var (
	ErrInvalidRecommendationLimit  = errors.New("invalid recommendation limit")
	ErrInvalidRecommendationOffset = errors.New("invalid recommendation offset")
)

// RecommendationItemDTO is the API model returned to handlers.
type RecommendationItemDTO struct {
	ActivityID      uint64    `json:"activity_id"`
	Title           string    `json:"title"`
	CoverURL        *string   `json:"cover_url"`
	Category        string    `json:"category"`
	Location        string    `json:"location"`
	Price           float64   `json:"price"`
	EnrollOpenAt    time.Time `json:"enroll_open_at"`
	Score           float64   `json:"score"`
	RecommendReason string    `json:"recommend_reason"`
}

// RecommendationResult contains recommendation list and strategy metadata.
type RecommendationResult struct {
	List     []RecommendationItemDTO
	Total    int
	Strategy string
}

// RecommendationService defines recommendation use cases.
type RecommendationService interface {
	GetRecommendations(userID *uint64, limit, offset int, needRefresh bool) (RecommendationResult, error)
	GetHotRecommendations(limit, offset int, needRefresh bool) (RecommendationResult, error)
	RecalculateAllScores(ctx context.Context) error
}

type cachedRecommendation struct {
	expiresAt time.Time
	result    RecommendationResult
}

type recommendationService struct {
	repo     repository.RecommendationRepository
	scoring  config.ScoringWeights
	cacheTTL time.Duration

	mu    sync.RWMutex
	cache map[string]cachedRecommendation
}

const collaborativeThreshold int64 = 20

// NewRecommendationService creates a recommendation service with in-process TTL cache.
func NewRecommendationService(repo repository.RecommendationRepository, scoring config.ScoringWeights, cacheTTL time.Duration) RecommendationService {
	if cacheTTL <= 0 {
		cacheTTL = 5 * time.Minute
	}
	return &recommendationService{
		repo:     repo,
		scoring:  scoring,
		cacheTTL: cacheTTL,
		cache:    map[string]cachedRecommendation{},
	}
}

func (s *recommendationService) GetHotRecommendations(limit, offset int, needRefresh bool) (RecommendationResult, error) {
	if limit <= 0 || limit > 100 {
		return RecommendationResult{}, ErrInvalidRecommendationLimit
	}
	if offset < 0 {
		return RecommendationResult{}, ErrInvalidRecommendationOffset
	}

	cacheKey := fmt.Sprintf("hot:%d:%d", limit, offset)
	if !needRefresh {
		if hit, ok := s.getCache(cacheKey); ok {
			return hit, nil
		}
	}

	hot, err := s.repo.ListHotActivities(limit, offset)
	if err != nil {
		return RecommendationResult{}, err
	}
	result := RecommendationResult{
		List:     toDTOWithReason(hot, "热门活动"),
		Total:    len(hot),
		Strategy: "hot_ranking",
	}
	s.setCache(cacheKey, result)
	return result, nil
}

func (s *recommendationService) GetRecommendations(userID *uint64, limit, offset int, needRefresh bool) (RecommendationResult, error) {
	if limit <= 0 || limit > 100 {
		return RecommendationResult{}, ErrInvalidRecommendationLimit
	}
	if offset < 0 {
		return RecommendationResult{}, ErrInvalidRecommendationOffset
	}

	uid := uint64(0)
	if userID != nil {
		uid = *userID
	}
	cacheKey := fmt.Sprintf("rec:%d:%d:%d", uid, limit, offset)
	if !needRefresh {
		if hit, ok := s.getCache(cacheKey); ok {
			return hit, nil
		}
	}

	var result RecommendationResult
	if userID == nil {
		list, err := s.getAnonymousMix(limit, offset)
		if err != nil {
			return RecommendationResult{}, err
		}
		result = RecommendationResult{
			List:     list,
			Total:    len(list),
			Strategy: "hot_ranking",
		}
	} else {
		list, strategy, err := s.getLoggedInMix(*userID, limit, offset)
		if err != nil {
			return RecommendationResult{}, err
		}
		result = RecommendationResult{
			List:     list,
			Total:    len(list),
			Strategy: strategy,
		}
	}

	s.setCache(cacheKey, result)
	return result, nil
}

func (s *recommendationService) RecalculateAllScores(ctx context.Context) error {
	activities, err := s.repo.ListPublishedActivitiesForScoring()
	if err != nil {
		return err
	}

	ttlHours := s.scoring.HotTTLLHours
	if ttlHours <= 0 {
		ttlHours = 720
	}

	now := time.Now().UTC()
	for i := range activities {
		if err := ctx.Err(); err != nil {
			return err
		}
		a := activities[i]

		viewScore := math.Log(1 + float64(a.ViewCount))
		enrollRatio := float64(a.EnrollCount) / math.Max(float64(a.MaxCapacity), 1)
		elapsedHours := math.Max(now.Sub(a.CreatedAt).Hours(), 1)
		speedScore := float64(a.EnrollCount) / elapsedHours
		timeDecay := math.Max(0, 1-now.Sub(a.CreatedAt).Hours()/ttlHours)

		score := s.scoring.ViewWeight*viewScore +
			s.scoring.EnrollWeight*enrollRatio +
			s.scoring.SpeedWeight*speedScore -
			s.scoring.TimeDecayWeight*timeDecay

		componentsMap := map[string]float64{
			"view_weight":   s.scoring.ViewWeight * viewScore,
			"enroll_weight": s.scoring.EnrollWeight * enrollRatio,
			"speed_weight":  s.scoring.SpeedWeight * speedScore,
			"time_decay":    s.scoring.TimeDecayWeight * timeDecay,
		}
		componentsBytes, err := json.Marshal(componentsMap)
		if err != nil {
			return err
		}

		if err := s.repo.UpsertActivityScore(a.ID, score, string(componentsBytes), now); err != nil {
			return err
		}
	}

	if err := s.repo.UpdateScoreRanks(); err != nil {
		return err
	}

	s.clearCache()
	return nil
}

func (s *recommendationService) getAnonymousMix(limit, offset int) ([]RecommendationItemDTO, error) {
	hotLimit := limit
	freshLimit := int(math.Max(1, float64(limit)*0.2))
	if hotLimit < freshLimit {
		hotLimit = freshLimit
	}

	hot, err := s.repo.ListHotActivities(hotLimit+offset, 0)
	if err != nil {
		return nil, err
	}
	fresh, err := s.repo.ListFreshActivities(freshLimit)
	if err != nil {
		return nil, err
	}

	out := mergeRecommendations(limit+offset,
		toDTOWithReason(hot, "热门活动"),
		toDTOWithReason(fresh, "新上架活动"),
	)
	if offset >= len(out) {
		return []RecommendationItemDTO{}, nil
	}
	end := offset + limit
	if end > len(out) {
		end = len(out)
	}
	return out[offset:end], nil
}

func (s *recommendationService) getLoggedInMix(userID uint64, limit, offset int) ([]RecommendationItemDTO, string, error) {
	behaviorCount, err := s.repo.CountUserBehaviors(userID)
	if err != nil {
		return nil, "", err
	}
	if behaviorCount == 0 {
		list, err := s.getAnonymousMix(limit, offset)
		return list, "hot_ranking", err
	}
	if behaviorCount > collaborativeThreshold {
		return s.getCollaborativeMix(userID, limit, offset)
	}

	categories, err := s.repo.ListPreferredCategories(userID, 3)
	if err != nil {
		return nil, "", err
	}

	hot, err := s.repo.ListHotActivities(limit*2+offset, 0)
	if err != nil {
		return nil, "", err
	}
	preferred, err := s.repo.ListHotActivitiesByCategories(categories, limit*2)
	if err != nil {
		return nil, "", err
	}

	all := mergeRecommendations(limit+offset,
		toDTOWithReason(preferred, "基于您近期浏览偏好推荐"),
		toDTOWithReason(hot, "热门活动"),
	)
	if offset >= len(all) {
		return []RecommendationItemDTO{}, "cold_fill", nil
	}
	end := offset + limit
	if end > len(all) {
		end = len(all)
	}
	return all[offset:end], "cold_fill", nil
}

func (s *recommendationService) getCollaborativeMix(userID uint64, limit, offset int) ([]RecommendationItemDTO, string, error) {
	seedActivityIDs, err := s.repo.ListUserInteractedActivityIDs(userID, 50)
	if err != nil {
		return nil, "", err
	}
	if len(seedActivityIDs) == 0 {
		fallback, err := s.getLoggedInMixColdOnly(userID, limit, offset)
		return fallback, "cold_fill", err
	}

	cfFetch := maxInt(1, int(math.Ceil(float64(limit+offset)*0.4))*3)
	hotFetch := maxInt(1, int(math.Ceil(float64(limit+offset)*0.4))*2)
	freshFetch := maxInt(1, int(math.Ceil(float64(limit+offset)*0.2))*2)

	cfCandidates, err := s.repo.ListSimilarActivitiesBySeed(seedActivityIDs, cfFetch)
	if err != nil {
		return nil, "", err
	}
	hotCandidates, err := s.repo.ListHotActivities(hotFetch, 0)
	if err != nil {
		return nil, "", err
	}
	freshCandidates, err := s.repo.ListFreshActivities(freshFetch)
	if err != nil {
		return nil, "", err
	}

	out := mergeRecommendations(limit+offset,
		toDTOWithReason(cfCandidates, "基于相似用户行为推荐"),
		toDTOWithReason(hotCandidates, "热门活动"),
		toDTOWithReason(freshCandidates, "新上架活动"),
	)
	if offset >= len(out) {
		return []RecommendationItemDTO{}, "collaborative_filtering", nil
	}
	end := offset + limit
	if end > len(out) {
		end = len(out)
	}
	return out[offset:end], "collaborative_filtering", nil
}

func (s *recommendationService) getLoggedInMixColdOnly(userID uint64, limit, offset int) ([]RecommendationItemDTO, error) {
	categories, err := s.repo.ListPreferredCategories(userID, 3)
	if err != nil {
		return nil, err
	}
	hot, err := s.repo.ListHotActivities(limit*2+offset, 0)
	if err != nil {
		return nil, err
	}
	preferred, err := s.repo.ListHotActivitiesByCategories(categories, limit*2)
	if err != nil {
		return nil, err
	}
	all := mergeRecommendations(limit+offset,
		toDTOWithReason(preferred, "基于您近期浏览偏好推荐"),
		toDTOWithReason(hot, "热门活动"),
	)
	if offset >= len(all) {
		return []RecommendationItemDTO{}, nil
	}
	end := offset + limit
	if end > len(all) {
		end = len(all)
	}
	return all[offset:end], nil
}

func toDTOWithReason(items []repository.RecommendationItem, reason string) []RecommendationItemDTO {
	out := make([]RecommendationItemDTO, 0, len(items))
	for i := range items {
		it := items[i]
		out = append(out, RecommendationItemDTO{
			ActivityID:      it.ActivityID,
			Title:           it.Title,
			CoverURL:        it.CoverURL,
			Category:        it.Category,
			Location:        it.Location,
			Price:           it.Price,
			EnrollOpenAt:    it.EnrollOpenAt,
			Score:           it.Score,
			RecommendReason: reason,
		})
	}
	return out
}

func mergeRecommendations(limit int, groups ...[]RecommendationItemDTO) []RecommendationItemDTO {
	if limit <= 0 {
		return []RecommendationItemDTO{}
	}
	seen := make(map[uint64]struct{})
	out := make([]RecommendationItemDTO, 0, limit)
	for _, group := range groups {
		for i := range group {
			item := group[i]
			if _, ok := seen[item.ActivityID]; ok {
				continue
			}
			seen[item.ActivityID] = struct{}{}
			out = append(out, item)
			if len(out) >= limit {
				return out
			}
		}
	}
	return out
}

func maxInt(a, b int) int {
	if a > b {
		return a
	}
	return b
}

func (s *recommendationService) getCache(key string) (RecommendationResult, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	item, ok := s.cache[key]
	if !ok {
		return RecommendationResult{}, false
	}
	if time.Now().After(item.expiresAt) {
		return RecommendationResult{}, false
	}
	return item.result, true
}

func (s *recommendationService) setCache(key string, result RecommendationResult) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.cache[key] = cachedRecommendation{
		expiresAt: time.Now().Add(s.cacheTTL),
		result:    result,
	}
}

func (s *recommendationService) clearCache() {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.cache = map[string]cachedRecommendation{}
}
