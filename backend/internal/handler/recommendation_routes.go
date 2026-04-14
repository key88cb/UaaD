package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/uaad/backend/internal/middleware"
)

// RegisterRecommendationRoutes registers recommendation endpoints.
// OptionalJWTAuth is used so unauthenticated users can receive fallback hot ranking.
func RegisterRecommendationRoutes(v1 *gin.RouterGroup, h *RecommendationHandler, jwtSecret string) {
	g := v1.Group("/recommendations", middleware.OptionalJWTAuth(jwtSecret))
	{
		g.GET("", h.List)
		g.GET("/hot", h.Hot)
	}
}
