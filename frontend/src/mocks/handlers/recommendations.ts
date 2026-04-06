import { delay, http, HttpResponse } from 'msw';

const RECOMMEND_ITEMS = [
  {
    activity_id: 101,
    title: '2026 张杰「开往 1982」巡回演唱会 北京站',
    description: '热度持续上升，适合偏好大型体育场演出的用户。',
    cover_url:
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=900&q=80',
    location: '北京 国家体育场-鸟巢',
    category: 'CONCERT',
    tags: ['张杰', '演唱会'],
    max_capacity: 80000,
    price: 380,
    enroll_open_at: '2026-04-06T11:00:00Z',
    activity_at: '2026-06-06T11:00:00Z',
    status: 'SELLING_OUT',
    enroll_count: 67123,
    view_count: 198223,
    stock_remaining: 12877,
    recommend_reason: '基于你最近浏览的演唱会内容推荐',
  },
  {
    activity_id: 103,
    title: '丝路沉浸艺术特展',
    description: '文博展览热度飙升，适合周末轻松出行。',
    cover_url:
      'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=900&q=80',
    location: '北京 保利美高梅博物馆',
    category: 'EXHIBITION',
    tags: ['展览', '艺术'],
    max_capacity: 18000,
    price: 0,
    enroll_open_at: '2026-04-02T09:00:00Z',
    activity_at: '2026-04-30T12:00:00Z',
    status: 'PUBLISHED',
    enroll_count: 5022,
    view_count: 43770,
    stock_remaining: 12978,
    recommend_reason: '近期北京展览热度榜单前列',
  },
  {
    activity_id: 104,
    title: '开心麻花《乌龙山伯爵》特别场',
    description: '适合想找高口碑剧场内容的用户。',
    cover_url:
      'https://images.unsplash.com/photo-1507924538820-ede94a04019d?auto=format&fit=crop&w=900&q=80',
    location: '上海 海派剧院',
    category: 'THEATER',
    tags: ['开心麻花', '喜剧'],
    max_capacity: 3600,
    price: 180,
    enroll_open_at: '2026-04-10T08:00:00Z',
    activity_at: '2026-04-19T12:00:00Z',
    status: 'PUBLISHED',
    enroll_count: 2678,
    view_count: 20800,
    stock_remaining: 922,
    recommend_reason: '你可能会喜欢的高评分剧场内容',
  },
];

export const recommendationHandlers = [
  http.get('http://localhost:8080/api/v1/recommendations', async ({ request }) => {
    await delay(220);
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get('limit') ?? '6');

    return HttpResponse.json({
      code: 0,
      message: 'ok',
      data: {
        list: RECOMMEND_ITEMS.slice(0, limit),
        total: RECOMMEND_ITEMS.length,
      },
      strategy: 'hybrid_mock',
    });
  }),
  http.get('http://localhost:8080/api/v1/recommendations/hot', async ({ request }) => {
    await delay(180);
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get('limit') ?? '6');

    return HttpResponse.json({
      code: 0,
      message: 'ok',
      data: {
        list: RECOMMEND_ITEMS.slice(0, limit),
        total: RECOMMEND_ITEMS.length,
      },
      strategy: 'hot_ranking',
    });
  }),
];
