import api from '../axios';
import type { NotificationItem } from '../../types';

interface BackendEnvelope<T> {
  code: number;
  message: string;
  data: T;
}

interface PaginatedBlock<T> {
  list: T[];
  total: number;
  page: number;
  page_size: number;
}

interface BackendNotificationRow {
  id: number;
  user_id?: number;
  title: string;
  content: string;
  type: string;
  related_id?: number | null;
  is_read: boolean;
  created_at: string;
}

const NOTIFICATION_TYPES: NotificationItem['type'][] = [
  'ENROLL_SUCCESS',
  'ENROLL_FAIL',
  'ORDER_EXPIRE',
  'ACTIVITY_REMINDER',
];

function normalizeType(value: string): NotificationItem['type'] {
  return (NOTIFICATION_TYPES.includes(value as NotificationItem['type'])
    ? value
    : 'ACTIVITY_REMINDER') as NotificationItem['type'];
}

function normalizeNotification(row: BackendNotificationRow): NotificationItem {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    createdAt: row.created_at,
    isRead: row.is_read,
    type: normalizeType(row.type),
  };
}

export interface NotificationListResult {
  list: NotificationItem[];
  total: number;
  page: number;
  pageSize: number;
}

export async function listNotifications(
  page = 1,
  pageSize = 20,
): Promise<NotificationListResult> {
  const response = await api.get<BackendEnvelope<PaginatedBlock<BackendNotificationRow>>>(
    '/notifications',
    {
      params: { page, page_size: pageSize },
    },
  );

  const block = response.data.data;
  return {
    list: block.list.map(normalizeNotification),
    total: block.total,
    page: block.page,
    pageSize: block.page_size,
  };
}

export async function getUnreadNotificationCount(): Promise<number> {
  const response = await api.get<BackendEnvelope<{ unread_count: number }>>(
    '/notifications/unread-count',
  );

  return response.data.data.unread_count;
}

export async function markNotificationRead(id: number): Promise<void> {
  await api.put(`/notifications/${id}/read`);
}
