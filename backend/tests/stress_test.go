//go:build stress

// Stress / benchmark tests for the UAAD enrollment engine.
//
// Prerequisites:
//   1. Server running: cd backend && go run ./cmd/server
//   2. Seed data loaded: cd backend && go run ./scripts/seed
//
// Run:
//   cd backend && go test -v -tags=stress -bench=. -benchtime=10s -count=1 ./tests/

package tests

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"sync"
	"sync/atomic"
	"testing"
	"time"

	"github.com/uaad/backend/internal/domain"
	"golang.org/x/crypto/bcrypt"
)

const stressBaseURL = "http://localhost:8080/api/v1"

func stressLoginToken(b *testing.B, phone, password string) string {
	b.Helper()
	body, _ := json.Marshal(map[string]string{"phone": phone, "password": password})
	resp, err := http.Post(stressBaseURL+"/auth/login", "application/json", bytes.NewReader(body))
	if err != nil {
		b.Fatalf("login failed: %v", err)
	}
	defer resp.Body.Close()
	var result struct {
		Data struct {
			Token string `json:"token"`
		} `json:"data"`
	}
	json.NewDecoder(resp.Body).Decode(&result)
	return result.Data.Token
}

func stressRegisterDB(b *testing.B, phone, username, password string) {
	b.Helper()
	db := openTestDB(b)
	sqlDB, _ := db.DB()
	defer sqlDB.Close()
	hash, _ := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	user := domain.User{Phone: phone, Username: username, PasswordHash: string(hash), Role: "USER"}
	db.Where("phone = ?", phone).FirstOrCreate(&user)
}

func stressCreateActivity(b *testing.B, merchantToken string, cap int) uint64 {
	b.Helper()
	now := time.Now()
	body, _ := json.Marshal(map[string]interface{}{
		"title": fmt.Sprintf("压力测试-%d", now.UnixMilli()), "description": "bench",
		"location": "测试", "category": "CONCERT", "max_capacity": cap, "price": 1.0,
		"enroll_open_at":  now.Add(-1 * time.Hour).Format(time.RFC3339),
		"enroll_close_at": now.Add(24 * time.Hour).Format(time.RFC3339),
		"activity_at":     now.Add(48 * time.Hour).Format(time.RFC3339),
	})
	req, _ := http.NewRequest("POST", stressBaseURL+"/activities", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+merchantToken)
	resp, _ := http.DefaultClient.Do(req)
	defer resp.Body.Close()
	rb, _ := io.ReadAll(resp.Body)
	var d map[string]interface{}
	json.Unmarshal(rb, &d)
	dm := d["data"].(map[string]interface{})
	aid := uint64(dm["activity_id"].(float64))

	// Publish
	pr, _ := http.NewRequest("PUT", fmt.Sprintf("%s/activities/%d/publish", stressBaseURL, aid), nil)
	pr.Header.Set("Authorization", "Bearer "+merchantToken)
	r, _ := http.DefaultClient.Do(pr)
	r.Body.Close()
	return aid
}

// =============================================================================
// BenchmarkEnrollmentThroughput — measures pure enroll throughput excluding login prep
// =============================================================================
func BenchmarkEnrollmentThroughput(b *testing.B) {
	merchantToken := stressLoginToken(b, "13800000004", "test123456")
	activityID := stressCreateActivity(b, merchantToken, b.N+1000)

	// Pre-register and login users outside the timed section so benchmark only measures enroll.
	poolSize := b.N
	if poolSize < 1 {
		poolSize = 1
	}
	tokens := make([]string, poolSize)
	for i := 0; i < poolSize; i++ {
		phone := fmt.Sprintf("155%08d", i+1)
		stressRegisterDB(b, phone, fmt.Sprintf("bench%d", i+1), "test123456")
		tokens[i] = stressLoginToken(b, phone, "test123456")
	}

	var idx atomic.Int64
	var total atomic.Int64
	var accepted atomic.Int64

	b.ResetTimer()
	start := time.Now()
	b.RunParallel(func(pb *testing.PB) {
		client := &http.Client{}
		for pb.Next() {
			i := int(idx.Add(1)-1) % poolSize
			body, _ := json.Marshal(map[string]uint64{"activity_id": activityID})
			req, _ := http.NewRequest("POST", stressBaseURL+"/enrollments", bytes.NewReader(body))
			req.Header.Set("Content-Type", "application/json")
			req.Header.Set("Authorization", "Bearer "+tokens[i])
			resp, err := client.Do(req)
			if err == nil {
				total.Add(1)
				if resp.StatusCode == http.StatusAccepted {
					accepted.Add(1)
				}
				io.Copy(io.Discard, resp.Body)
				resp.Body.Close()
			}
		}
	})
	elapsed := time.Since(start)
	b.StopTimer()

	if elapsed > 0 {
		b.ReportMetric(float64(total.Load())/elapsed.Seconds(), "req/s")
		b.ReportMetric(float64(accepted.Load())/elapsed.Seconds(), "accepted/s")
	}
}

// =============================================================================
// BenchmarkActivityList — measures activity list query performance
// =============================================================================
func BenchmarkActivityList(b *testing.B) {
	b.RunParallel(func(pb *testing.PB) {
		client := &http.Client{}
		for pb.Next() {
			resp, err := client.Get(stressBaseURL + "/activities?page=1&page_size=20&sort=hot")
			if err == nil {
				io.Copy(io.Discard, resp.Body)
				resp.Body.Close()
			}
		}
	})
}

// =============================================================================
// TestConcurrentEnrollment_Stock10 — 500 goroutine 抢 10 张票
// =============================================================================
func TestConcurrentEnrollment_Stock10(t *testing.T) {
	merchantToken := stressLoginToken(&testing.B{}, "13800000004", "test123456")

	// Need to use testing.T helper, re-login
	body, _ := json.Marshal(map[string]string{"phone": "13800000004", "password": "test123456"})
	resp, _ := http.Post(stressBaseURL+"/auth/login", "application/json", bytes.NewReader(body))
	var lr struct {
		Data struct{ Token string } `json:"data"`
	}
	json.NewDecoder(resp.Body).Decode(&lr)
	resp.Body.Close()
	merchantToken = lr.Data.Token

	aid := stressCreateActivity(&testing.B{}, merchantToken, 10)
	t.Logf("活动 ID=%d, stock=10", aid)

	const concurrency = 500
	tokens := make([]string, concurrency)
	db := openTestDB(t)
	sqlDB, _ := db.DB()
	defer sqlDB.Close()
	hash, _ := bcrypt.GenerateFromPassword([]byte("test123456"), bcrypt.DefaultCost)
	for i := 0; i < concurrency; i++ {
		phone := fmt.Sprintf("133%08d", i+1)
		user := domain.User{Phone: phone, Username: fmt.Sprintf("s%d", i), PasswordHash: string(hash), Role: "USER"}
		db.Where("phone = ?", phone).FirstOrCreate(&user)
	}

	for i := 0; i < concurrency; i++ {
		phone := fmt.Sprintf("133%08d", i+1)
		body, _ := json.Marshal(map[string]string{"phone": phone, "password": "test123456"})
		resp, _ := http.Post(stressBaseURL+"/auth/login", "application/json", bytes.NewReader(body))
		var r struct {
			Data struct{ Token string } `json:"data"`
		}
		json.NewDecoder(resp.Body).Decode(&r)
		resp.Body.Close()
		tokens[i] = r.Data.Token
	}
	t.Logf("准备 %d 用户", concurrency)

	var success, fail atomic.Int32
	var totalDurationNs atomic.Int64
	var maxDurationNs atomic.Int64
	var wg sync.WaitGroup
	ready := make(chan struct{})

	wallStart := time.Now()
	for i := 0; i < concurrency; i++ {
		wg.Add(1)
		go func(idx int) {
			defer wg.Done()
			<-ready
			body, _ := json.Marshal(map[string]uint64{"activity_id": aid})
			req, _ := http.NewRequest("POST", stressBaseURL+"/enrollments", bytes.NewReader(body))
			req.Header.Set("Content-Type", "application/json")
			req.Header.Set("Authorization", "Bearer "+tokens[idx])

			begin := time.Now()
			resp, err := http.DefaultClient.Do(req)
			duration := time.Since(begin)
			totalDurationNs.Add(duration.Nanoseconds())
			for {
				currentMax := maxDurationNs.Load()
				if duration.Nanoseconds() <= currentMax || maxDurationNs.CompareAndSwap(currentMax, duration.Nanoseconds()) {
					break
				}
			}

			if err != nil {
				fail.Add(1)
				return
			}
			defer resp.Body.Close()
			rb, _ := io.ReadAll(resp.Body)
			var d map[string]interface{}
			json.Unmarshal(rb, &d)
			code, _ := d["code"].(float64)
			if code == 0 || code == 1201 {
				success.Add(1)
			} else {
				fail.Add(1)
			}
		}(i)
	}

	close(ready)
	wg.Wait()
	wallElapsed := time.Since(wallStart)

	s := success.Load()
	avgDuration := time.Duration(totalDurationNs.Load() / concurrency)
	maxDuration := time.Duration(maxDurationNs.Load())
	throughput := float64(concurrency) / wallElapsed.Seconds()

	t.Logf("enroll 实际耗时: avg=%s, max=%s, wall=%s", avgDuration, maxDuration, wallElapsed)
	t.Logf("当前吞吐量: %.2f enroll requests/sec", throughput)
	t.Logf("结果: 成功=%d, 失败=%d (stock=10, 并发=%d)", s, fail.Load(), concurrency)
	if s > 10 {
		t.Errorf("❌ 超卖! stock=10 但 %d 成功", s)
	} else if s == 10 {
		t.Log("✅ 零超卖: stock=10, 恰好 10 成功")
	} else {
		t.Logf("⚠️ 少卖: 只有 %d 成功 (可能有并发冲突丢失)", s)
	}
}
