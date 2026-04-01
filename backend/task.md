# Task: Backend Core Foundations (BE-02 & BE-03)

- [x] [BE-02] Database Connection Pool Optimization
  - [x] Extract `*sql.DB` from GORM instance in `main.go`.
  - [x] Configure `MaxIdleConns`, `MaxOpenConns`, and `ConnMaxLifetime`.
- [x] [BE-03] Registration Anti-Spam / Rate Limiting
  - [x] Create IP-based rate limiter middleware in `backend/internal/middleware/rate_limit.go`.
  - [x] Integrate the rate limiter into the registration route in `main.go`.
  - [x] Verify the rate limiter with multiple rapid requests. (Verified: HTTP 429 confirmed)
