import { useCallback, useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { listNotifications, markNotificationRead } from '../api/endpoints';
import type { NotificationItem } from '../types';
import { getRequestErrorMessage } from '../utils/requestErrorMessage';

const PAGE_SIZE = 20;

export default function NotificationsPage() {
  const { t } = useTranslation();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');

  const loadPage = useCallback(async (nextPage: number, append: boolean) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setError('');
      }

      const result = await listNotifications(nextPage, PAGE_SIZE);

      setTotal(result.total);
      setPage(result.page);
      setItems((prev) => (append ? [...prev, ...result.list] : result.list));
    } catch (err) {
      setError(getRequestErrorMessage(err));
      if (!append) {
        setItems([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    void loadPage(1, false);
  }, [loadPage]);

  const hasMore = items.length < total;

  const handleMarkRead = async (item: NotificationItem) => {
    if (item.isRead) {
      return;
    }

    try {
      await markNotificationRead(item.id);
      setItems((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n)),
      );
    } catch (err) {
      setError(getRequestErrorMessage(err));
    }
  };

  return (
    <div className="mx-auto max-w-4xl pb-12">
      <div className="mb-8 border-b border-white/5 pb-8">
        <h2 className="text-3xl font-bold text-white">{t('public.notifications')}</h2>
        <p className="mt-2 text-slate-400">{t('notifications.subtitle')}</p>
      </div>

      {error ? (
        <div className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      ) : null}

      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6"
            >
              <div className="h-5 w-40 animate-pulse rounded-full bg-slate-800" />
              <div className="mt-4 h-4 w-full animate-pulse rounded-full bg-slate-800" />
              <div className="mt-2 h-4 w-3/4 animate-pulse rounded-full bg-slate-800" />
            </div>
          ))
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/30 p-10 text-center">
            <Bell className="mx-auto text-slate-500" size={28} />
            <p className="mt-4 text-slate-300">{t('notifications.empty')}</p>
          </div>
        ) : (
          <>
            {items.map((item) => (
              <article
                key={item.id}
                role="button"
                tabIndex={0}
                onClick={() => void handleMarkRead(item)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    void handleMarkRead(item);
                  }
                }}
                className={`rounded-2xl border p-6 text-left transition ${
                  item.isRead
                    ? 'cursor-default border-slate-800 bg-slate-900/30'
                    : 'cursor-pointer border-rose-500/30 bg-rose-500/10 hover:border-rose-400/50'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">{item.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-300">{item.content}</p>
                    {!item.isRead ? (
                      <p className="mt-2 text-xs text-rose-300/90">{t('notifications.tapToMarkRead')}</p>
                    ) : null}
                  </div>
                  <span className="shrink-0 rounded-full bg-slate-950/50 px-3 py-1 text-xs font-semibold text-slate-400">
                    {new Date(item.createdAt).toLocaleDateString('zh-CN')}
                  </span>
                </div>
              </article>
            ))}

            {hasMore ? (
              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  disabled={loadingMore}
                  onClick={() => void loadPage(page + 1, true)}
                  className="rounded-full border border-slate-600 px-6 py-2 text-sm font-semibold text-slate-200 transition hover:border-rose-400 hover:text-rose-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loadingMore ? t('merchant.loading') : t('notifications.loadMore')}
                </button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
