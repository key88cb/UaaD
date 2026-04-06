package middleware

import (
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/uaad/backend/pkg/jwtutil"
)

// OptionalJWTAuth validates Bearer token when present and sets user_id and role on the context.
// Missing or invalid tokens do not abort the request. Use JWTAuth for routes that require login.
func OptionalJWTAuth(secret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.Next()
			return
		}
		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.Next()
			return
		}
		claims, err := jwtutil.ValidateToken(parts[1], secret)
		if err != nil {
			c.Next()
			return
		}
		c.Set("user_id", claims.UserID)
		c.Set("role", claims.Role)
		c.Next()
	}
}
