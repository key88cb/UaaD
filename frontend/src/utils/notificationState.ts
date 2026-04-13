import type { NotificationItem } from '../types';

const NOTIFICATION_STATE_EVENT = 'uaad:notifications-updated';
const NOTIFICATION_STORAGE_PREFIX = 'uaad.notifications.read';

function createStorageKey(userId: number | undefined) {
  return `${NOTIFICATION_STORAGE_PREFIX}.${userId ?? 'guest'}`;
}

function readStoredReadIds(userId: number | undefined) {
  const serialized = localStorage.getItem(createStorageKey(userId));

  if (!serialized) {
    return new Set<number>();
  }

  try {
    const parsed = JSON.parse(serialized) as unknown[];
    const ids = parsed.filter((item): item is number => typeof item === 'number');
    return new Set(ids);
  } catch {
    localStorage.removeItem(createStorageKey(userId));
    return new Set<number>();
  }
}

function writeStoredReadIds(userId: number | undefined, ids: number[]) {
  const storageKey = createStorageKey(userId);
  localStorage.setItem(storageKey, JSON.stringify(ids));

  window.dispatchEvent(
    new CustomEvent<{ userId?: number }>(NOTIFICATION_STATE_EVENT, {
      detail: { userId },
    }),
  );
}

export function mergeNotificationReadState(
  items: NotificationItem[],
  userId: number | undefined,
) {
  const readIds = readStoredReadIds(userId);

  return items.map((item) =>
    readIds.has(item.id)
      ? {
          ...item,
          isRead: true,
        }
      : item,
  );
}

export function rememberReadNotifications(userId: number | undefined, ids: number[]) {
  if (!ids.length) {
    return;
  }

  const nextReadIds = new Set(readStoredReadIds(userId));
  ids.forEach((id) => nextReadIds.add(id));
  writeStoredReadIds(userId, [...nextReadIds]);
}

export function subscribeNotificationState(
  userId: number | undefined,
  callback: () => void,
) {
  const handleCustomEvent = (event: Event) => {
    const detail = (event as CustomEvent<{ userId?: number }>).detail;

    if (detail?.userId === userId) {
      callback();
    }
  };

  const handleStorageEvent = (event: StorageEvent) => {
    if (event.key === createStorageKey(userId)) {
      callback();
    }
  };

  window.addEventListener(NOTIFICATION_STATE_EVENT, handleCustomEvent);
  window.addEventListener('storage', handleStorageEvent);

  return () => {
    window.removeEventListener(NOTIFICATION_STATE_EVENT, handleCustomEvent);
    window.removeEventListener('storage', handleStorageEvent);
  };
}
