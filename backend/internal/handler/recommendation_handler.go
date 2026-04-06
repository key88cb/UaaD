package handler

import (
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/uaad/backend/internal/service"
	"github.com/uaad/backend/pkg/response"
)

// RecommendationHandler handles recommendation APIs.
type RecommendationHandler struct {
	svc service.RecommendationService
}

func NewRecommendationHandler(svc service.RecommendationService) *RecommendationHandler {
	return &RecommendationHandler{svc: svc}
}

// List handles GET /api/v1/recommendations.
func (h *RecommendationHandler) List(c *gin.Context) {
	limit, err := strconv.Atoi(c.DefaultQuery("limit", "20"))
	if err != nil {
		response.BadRequest(c, "limit 参数非法")
		return
	}
	offset, err := strconv.Atoi(c.DefaultQuery("offset", "0"))
	if err != nil {
		response.BadRequest(c, "offset 参数非法")
		return
	}
	needRefresh := c.DefaultQuery("need_refresh", "false") == "true"

	uid := getOptionalUserID(c)
	result, err := h.svc.GetRecommendations(uid, limit, offset, needRefresh)
	if err != nil {
		switch err {
		case service.ErrInvalidRecommendationLimit:
			response.BadRequest(c, "limit 范围应为 1~100")
		case service.ErrInvalidRecommendationOffset:
			response.BadRequest(c, "offset 必须大于等于 0")
		default:
			response.InternalError(c, "获取推荐列表失败")
		}
		return
	}

	c.JSON(200, gin.H{
		"code":    0,
		"message": "ok",
		"data": gin.H{
			"list":  result.List,
			"total": result.Total,
		},
		"strategy": result.Strategy,
	})
}

// Hot handles GET /api/v1/recommendations/hot.
func (h *RecommendationHandler) Hot(c *gin.Context) {
	limit, err := strconv.Atoi(c.DefaultQuery("limit", "20"))
	if err != nil {
		response.BadRequest(c, "limit 参数非法")
		return
	}
	offset, err := strconv.Atoi(c.DefaultQuery("offset", "0"))
	if err != nil {
		response.BadRequest(c, "offset 参数非法")
		return
	}
	needRefresh := c.DefaultQuery("need_refresh", "false") == "true"

	result, err := h.svc.GetHotRecommendations(limit, offset, needRefresh)
	if err != nil {
		switch err {
		case service.ErrInvalidRecommendationLimit:
			response.BadRequest(c, "limit 范围应为 1~100")
		case service.ErrInvalidRecommendationOffset:
			response.BadRequest(c, "offset 必须大于等于 0")
		default:
			response.InternalError(c, "获取热门推荐失败")
		}
		return
	}

	response.Success(c, gin.H{
		"list":  result.List,
		"total": result.Total,
	})
}

func getOptionalUserID(c *gin.Context) *uint64 {
	if v, ok := c.Get("user_id"); ok {
		if uid, okCast := v.(uint64); okCast {
			return &uid
		}
	}
	return nil
}
