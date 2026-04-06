import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { listNotifications } from '../api/endpoints';
import type { NotificationItem } from '../types';

export default function NotificationsPage() {
  const { t } = useTranslation();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    listNotifications()
      .then((data) => {
        if (active) {
          setItems(data);
        }
      })
      .catch(() => {
        if (active) {
          setItems([]);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="mx-auto max-w-4xl pb-12">
      <div className="mb-8 border-b border-white/5 pb-8">
        <h2 className="text-3xl font-bold text-white">{t('public.notifications')}</h2>
        <p className="mt-2 text-slate-400">{t('notifications.subtitle')}</p>
      </div>

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
          items.map((item) => (
            <article
              key={item.id}
              className={`rounded-2xl border p-6 ${
                item.isRead
                  ? 'border-slate-800 bg-slate-900/30'
                  : 'border-rose-500/30 bg-rose-500/10'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{item.content}</p>
                </div>
                <span className="rounded-full bg-slate-950/50 px-3 py-1 text-xs font-semibold text-slate-400">
                  {new Date(item.createdAt).toLocaleDateString('zh-CN')}
                </span>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
