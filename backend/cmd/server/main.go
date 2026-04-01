package main

import (
	"log"
	"net/http"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/uaad/backend/internal/domain"
	"github.com/uaad/backend/internal/handler"
	"github.com/uaad/backend/internal/middleware"
	"github.com/uaad/backend/internal/repository"
	"github.com/uaad/backend/internal/service"
	"golang.org/x/time/rate"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func main() {
	// 1. Initialize DB
	db, err := gorm.Open(sqlite.Open("uaad.db"), &gorm.Config{})
	if err != nil {
		log.Fatalf("failed to connect database: %v", err)
	}

	// 1b. Optimize DB Connection Pool (BE-02)
	sqlDB, err := db.DB()
	if err != nil {
		log.Fatalf("failed to get sql.DB: %v", err)
	}
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)

	// Auto Migration
	if err := db.AutoMigrate(&domain.User{}); err != nil {
		log.Fatalf("failed to migrate database: %v", err)
	}

	// 2. Setup Dependency Injection
	userRepo := repository.NewUserRepository(db)
	authSvc := service.NewAuthService(userRepo, "uaad-super-secret-key-2026") // In production, move to env
	authHandler := handler.NewAuthHandler(authSvc)

	// BE-03: Rate Limiter logic
	// Allow 5 registration requests per minute (5 burst, 5/60 rate per second)
	regLimit := middleware.NewIPRateLimiter(rate.Limit(5.0/60.0), 5)

	// 3. Setup Router
	r := gin.Default()

	// CORS Middleware
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173", "http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Routes
	v1 := r.Group("/api/v1")
	{
		auth := v1.Group("/auth")
		{
			// Apply BE-03 rate limiter only to registration
			auth.POST("/register", middleware.RateLimitMiddleware(regLimit), authHandler.Register)
			auth.POST("/login", authHandler.Login)
		}
	}

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	log.Println("Server starting on :8080")
	if err := r.Run(":8080"); err != nil {
		log.Fatalf("failed to run server: %v", err)
	}
}
