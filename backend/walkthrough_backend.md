# Backend Core Foundations Implementation (BE-02 & BE-03)

This document walk-through covers the backend advancements for handling high concurrency and preventing registration spam on the UAAD platform.

## 🏗️ 1. Database Connection Pool Optimization (BE-02)
We have optimized how our Go backend interacts with the database to handle heavy concurrent traffic without locking issues.
- **Underlying SQL Connection Tuning**: We extracted the `*sql.DB` object from our GORM instance in `main.go`.
- **Concurrency Parameters**: 
  - `MaxOpenConns`: Set to **100** to allow significant parallel query execution.
  - `MaxIdleConns`: Set to **10** to keep a warm pool of active connections.
  - `ConnMaxLifetime`: Set to **1 hour** to recycle stale connections.

## 🛡️ 2. Registration Anti-Spam / Rate Limiting (BE-03)
To prevent malicious bots or scripts from flooding our registration endpoint, we implemented a custom IP-based rate limiter.
- **`RateLimitMiddleware`**: A newly created middleware in `backend/internal/middleware/rate_limit.go`.
- **Policy**: We allowing **5 registration attempts per minute** per unique IP address ($5/60$ tokens/sec with a burst of 5).
- **Graceful Rejection**: When a user (or bot) exceeds the limit, the server now responds with a standard **HTTP 429 Too Many Requests** and a clear JSON error message.

## ✅ Verification
We simulated a high-concurrency attack on the `/api/v1/auth/register` endpoint.
1. **Requests 1-5**: Successfully processed (returning 201 or 409).
2. **Requests 6+**: Verified that the server correctly identified the flood and returned **429 Too Many Requests**.

> [!NOTE]
> This rate limiter is currently in-memory. For a truly distributed UAAD deployment across multiple Kubernetes pods, this logic will eventually need to be migrated to a shared Redis cluster using Lua scripts to maintain global state.

## 🚀 Conclusion
The backend now possesses a "defense-in-depth" layer for the registration flow and is technically prepared for basic load testing. Our next move will be to implement real `Activity` data structures and the concurrent enrollment engine.
