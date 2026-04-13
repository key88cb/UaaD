import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { listActivities } from '../api/endpoints';
import type { ActivityListItem } from '../types';
import { formatLongDate } from '../utils/formatters';

const DashboardPage = () => {
  const { t } = useTranslation();

  const [stats, setStats] = useState<
    Array<{ label: string; value: string; trend: string; color: string }>
  >([]);
  const [activities, setActivities] = useState<ActivityListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [overviewResult, recentResult] = await Promise.all([
          listActivities({
            keyword: '',
            region: 'ALL',
            artist: '',
            category: 'ALL',
            sort: 'hot',
            page: 1,
            pageSize: 12,
          }),
          listActivities({
            keyword: '',
            region: 'ALL',
            artist: '',
            category: 'ALL',
            sort: 'recent',
            page: 1,
            pageSize: 4,
          }),
        ]);

        const totalEnrollments = overviewResult.list.reduce(
          (sum, item) => sum + item.enrollCount,
          0,
        );
        const activeSelling = overviewResult.list.filter((item) =>
          ['PUBLISHED', 'SELLING_OUT'].includes(item.status),
        ).length;
        const successRate = overviewResult.list.length
          ? `${Math.round((activeSelling / overviewResult.list.length) * 100)}%`
          : '0%';

        setStats([
          {
            label: t('dashboard.activeActivities'),
            value: String(overviewResult.total),
            trend: t('dashboard.liveNow'),
            color: 'from-blue-500/20 to-indigo-500/20',
          },
          {
            label: t('dashboard.totalRegistrations'),
            value: totalEnrollments.toLocaleString(),
            trend: t('dashboard.hotRanking'),
            color: 'from-purple-500/20 to-pink-500/20',
          },
          {
            label: t('dashboard.successRate'),
            value: successRate,
            trend: t('dashboard.stableOperation'),
            color: 'from-emerald-500/20 to-teal-500/20',
          },
        ]);
        setActivities(recentResult.list);
      } catch {
        setError(t('public.errorDescription'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [t]);

  return (
    <div className="mx-auto w-full max-w-6xl animate-fade-in space-y-8 pb-12">
      <section className="overflow-hidden rounded-[32px] border border-rose-100 bg-[linear-gradient(135deg,#fff7f1_0%,#ffffff_58%,#fff1eb_100%)] px-6 py-8 shadow-[0_24px_60px_-40px_rgba(225,29,72,0.28)] lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-rose-400">UAAD</p>
        <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900">
          {t('dashboard.overview')}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500 lg:text-base">
          {t('dashboard.welcome')}
        </p>
      </section>

      {loading ? (
        <div className="flex items-center justify-center rounded-[32px] border border-rose-100 bg-white px-6 py-14 shadow-sm">
          <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
        </div>
      ) : (
        <section className="grid gap-5 lg:grid-cols-3">
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4 }}
              className="rounded-[28px] border border-rose-100 bg-white p-6 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.5)]"
            >
              <p className="text-sm font-semibold text-slate-400">{stat.label}</p>
              <div className="mt-4 flex items-end justify-between gap-4">
                <span className="text-4xl font-black tracking-tight text-slate-900">
                  {stat.value}
                </span>
                <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-rose-500">
                  {stat.trend}
                </span>
              </div>
            </motion.div>
          ))}
        </section>
      )}

      <section className="overflow-hidden rounded-[32px] border border-rose-100 bg-white shadow-sm">
        <div className="border-b border-rose-100 px-6 py-6 lg:px-8">
          <h3 className="text-2xl font-black tracking-tight text-slate-900">
            {t('dashboard.highlights')}
          </h3>
        </div>

        <div className="px-6 py-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-rose-400" />
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-700">
              {error}
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className="flex flex-col gap-4 rounded-[28px] border border-slate-200 bg-[#fffaf7] p-5 transition hover:border-rose-200 hover:bg-white sm:flex-row sm:items-center"
                >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[radial-gradient(circle_at_top,_#ffcadb,_#fb7185_62%,_#f97316)] text-lg font-black text-white">
                    {activity.title.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-lg font-bold text-slate-900">{activity.title}</h4>
                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">
                      {activity.description}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                      {formatLongDate(activity.activityAt)}
                    </span>
                    <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-rose-500">
                      {t(`status.${activity.status}`)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
