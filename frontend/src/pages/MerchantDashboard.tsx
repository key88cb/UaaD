import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, CalendarRange, CircleDot, PlusCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { listMerchantActivities } from '../api/endpoints';
import type { ActivityListItem } from '../types';

export default function MerchantDashboardPage() {
  const { t } = useTranslation();
  const [items, setItems] = useState<ActivityListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listMerchantActivities()
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const total = items.length;
    const published = items.filter((item) => ['PUBLISHED', 'SELLING_OUT'].includes(item.status)).length;
    const draft = items.filter((item) => item.status === 'DRAFT' || item.status === 'PREHEAT').length;
    const enrollTotal = items.reduce((sum, item) => sum + item.enrollCount, 0);
    return { total, published, draft, enrollTotal };
  }, [items]);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 pb-12">
      <section className="flex flex-wrap items-end justify-between gap-4 overflow-hidden rounded-[32px] border border-rose-100 bg-[linear-gradient(135deg,#fff7f1_0%,#ffffff_58%,#fff1eb_100%)] px-6 py-8 shadow-[0_24px_60px_-40px_rgba(225,29,72,0.28)] lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-rose-400">UAAD</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900">
            {t('merchant.dashboard')}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500 lg:text-base">
            {t('merchant.dashboardSubtitle')}
          </p>
        </div>
        <Link
          to="/merchant/activities/new"
          className="inline-flex items-center gap-2 rounded-full bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-600"
        >
          <PlusCircle size={16} />
          {t('merchant.createActivity')}
        </Link>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[28px] border border-rose-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-400">{t('merchant.stats.total')}</p>
          <p className="mt-2 text-3xl font-black text-slate-900">{loading ? '-' : stats.total}</p>
        </div>
        <div className="rounded-[28px] border border-rose-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-400">{t('merchant.stats.published')}</p>
          <p className="mt-2 text-3xl font-black text-emerald-600">
            {loading ? '-' : stats.published}
          </p>
        </div>
        <div className="rounded-[28px] border border-rose-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-400">{t('merchant.stats.draft')}</p>
          <p className="mt-2 text-3xl font-black text-amber-600">{loading ? '-' : stats.draft}</p>
        </div>
        <div className="rounded-[28px] border border-rose-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-400">{t('merchant.stats.enrollTotal')}</p>
          <p className="mt-2 text-3xl font-black text-rose-500">
            {loading ? '-' : stats.enrollTotal.toLocaleString()}
          </p>
        </div>
      </section>

      <section className="rounded-[32px] border border-rose-100 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-2xl font-black tracking-tight text-slate-900">
          {t('merchant.recentActivities')}
        </h3>
        {loading ? (
          <p className="text-slate-500">{t('merchant.loading')}</p>
        ) : items.length === 0 ? (
          <p className="text-slate-500">{t('merchant.empty')}</p>
        ) : (
          <div className="space-y-3">
            {items.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-[28px] border border-slate-200 bg-[#fffaf7] p-4"
              >
                <div>
                  <p className="font-semibold text-slate-900">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{item.location}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                  <BarChart3 size={14} />
                  {item.enrollCount.toLocaleString()}
                  <CircleDot size={12} className="text-rose-400" />
                  <CalendarRange size={14} />
                  {new Date(item.activityAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
