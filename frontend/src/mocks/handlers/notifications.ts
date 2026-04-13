import { delay, http, HttpResponse } from 'msw';

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    title: '报名成功提醒',
    content: '你关注的活动已经开放报名，建议尽快完成锁票。',
    createdAt: '2026-04-05T08:00:00Z',
    isRead: false,
    type: 'ACTIVITY_REMINDER',
  },
  {
    id: 2,
    title: '订单即将过期',
    content: '请在 15 分钟内完成支付，逾期后名额将自动释放。',
    createdAt: '2026-04-04T12:00:00Z',
    isRead: false,
    type: 'ORDER_EXPIRE',
  },
];

export const notificationHandlers = [
  http.get('http://localhost:8080/api/v1/notifications/unread-count', async () => {
    await delay(120);

    return HttpResponse.json({
      code: 0,
      message: 'ok',
      data: {
        count: MOCK_NOTIFICATIONS.filter((item) => !item.isRead).length,
      },
    });
  }),
  http.get('http://localhost:8080/api/v1/notifications', async () => {
    await delay(180);

    return HttpResponse.json({
      code: 0,
      message: 'ok',
      data: MOCK_NOTIFICATIONS,
    });
  }),
  http.put('http://localhost:8080/api/v1/notifications/:id/read', async ({ params }) => {
    await delay(120);

    const targetId = Number(params.id);
    const target = MOCK_NOTIFICATIONS.find((item) => item.id === targetId);

    if (target) {
      target.isRead = true;
    }

    return HttpResponse.json({
      code: 0,
      message: 'ok',
      data: null,
    });
  }),
];
