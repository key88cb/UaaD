package infra

import (
	"context"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
	"github.com/uaad/backend/internal/config"
)

// NewRedisClient creates a Redis client from application config and verifies
// connectivity with a PING. It panics when the initial handshake fails so
// that the server never starts in a half-broken state.
func NewRedisClient(cfg *config.Config) *redis.Client {
	rdb := redis.NewClient(&redis.Options{
		Addr:         fmt.Sprintf("%s:%s", cfg.RedisHost, cfg.RedisPort),
		DB:           0,
		PoolSize:     128,
		MinIdleConns: 16,
		ReadTimeout:  3 * time.Second,
		WriteTimeout: 3 * time.Second,
	})

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := rdb.Ping(ctx).Err(); err != nil {
		panic(fmt.Sprintf("redis ping failed: %v", err))
	}
	return rdb
}
