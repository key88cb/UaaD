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
    <div className="w-full animate-fade-in space-y-8 pb-12">
      <section className="overflow-hidden rounded-[32px] border border-slate-800/80 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.22),transparent_34%),radial-gradient(circle_at_82%_18%,rgba(168,85,247,0.16),transparent_28%),linear-gradient(160deg,rgba(15,23,42,0.96),rgba(2,6,23,0.96))] px-6 py-8 shadow-[0_28px_90px_-48px_rgba(15,23,42,0.98)] lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-300/80">UAAD</p>
        <h2 className="mt-3 text-3xl font-black tracking-tight text-white">
          {t('dashboard.overview')}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 lg:text-base">
          {t('dashboard.welcome')}
        </p>
      </section>

      {loading ? (
        <div className="flex items-center justify-center rounded-[32px] border border-slate-800 bg-slate-900/50 px-6 py-14 shadow-2xl backdrop-blur-sm">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
        </div>
      ) : (
        <section className="grid gap-5 lg:grid-cols-3">
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4 }}
              className={`rounded-[28px] border border-white/6 bg-gradient-to-br ${stat.color} p-6 shadow-[0_24px_70px_-42px_rgba(15,23,42,0.95)] backdrop-blur-sm`}
            >
              <p className="text-sm font-semibold text-slate-300">{stat.label}</p>
              <div className="mt-4 flex items-end justify-between gap-4">
                <span className="text-4xl font-black tracking-tight text-white">
                  {stat.value}
                </span>
                <span className="rounded-full border border-white/10 bg-slate-950/55 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-200">
                  {stat.trend}
                </span>
              </div>
            </motion.div>
          ))}
        </section>
      )}

      <section className="overflow-hidden rounded-[32px] border border-slate-800 bg-slate-900/45 shadow-[0_24px_70px_-42px_rgba(15,23,42,0.98)] backdrop-blur-sm">
        <div className="border-b border-white/6 px-6 py-6 lg:px-8">
          <h3 className="text-2xl font-black tracking-tight text-white">
            {t('dashboard.highlights')}
          </h3>
        </div>

        <div className="px-6 py-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-5 py-4 text-sm text-amber-200">
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
                  className="flex flex-col gap-4 rounded-[28px] border border-slate-800 bg-slate-950/55 p-5 transition hover:border-blue-500/35 hover:bg-slate-950/80 sm:flex-row sm:items-center"
                >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[radial-gradient(circle_at_top,_rgba(96,165,250,0.92),_rgba(99,102,241,0.78)_55%,_rgba(15,23,42,1))] text-lg font-black text-white shadow-lg shadow-blue-950/60">
                    {activity.title.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-lg font-bold text-slate-100">{activity.title}</h4>
                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-400">
                      {activity.description}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                    <span className="rounded-full border border-white/8 bg-slate-900/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
                      {formatLongDate(activity.activityAt)}
                    </span>
                    <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-emerald-300">
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
