import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';

const DashboardPage = () => {
  const { t } = useTranslation();

  const [stats, setStats] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, activitiesRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/activities/recent')
        ]);
        setStats(statsRes.data);
        if (activitiesRes.status === 202) {
          setError(activitiesRes.data.error || 'Queueing...');
        } else {
          setActivities(activitiesRes.data);
        }
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="w-full animate-fade-in pb-12">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">{t('dashboard.overview')}</h2>
        <p className="text-slate-400">{t('dashboard.welcome')}</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {stats.map((stat) => (
             <motion.div
               key={stat.label}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               whileHover={{ y: -4 }}
               className={`p-6 rounded-2xl bg-gradient-to-br ${stat.color} border border-white/5 backdrop-blur-sm shadow-xl`}
             >
               <h3 className="text-slate-400 font-medium mb-1">{stat.label}</h3>
               <div className="flex items-end justify-between">
                 <span className="text-3xl font-bold text-white">{stat.value}</span>
                 <span className="text-emerald-400 text-sm font-bold bg-emerald-400/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                   {stat.trend}
                 </span>
               </div>
             </motion.div>
          ))}
        </div>
      )}

      <section className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm shadow-2xl">
        <h3 className="text-xl font-bold text-white mb-6 border-b border-white/5 pb-4">{t('dashboard.highlights')}</h3>
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-slate-500 animate-spin" /></div>
        ) : error ? (
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-400 flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse ring-2 ring-yellow-400/50 ring-offset-2 ring-offset-slate-900"></div>
             {error}
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <motion.div 
                key={activity.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-xl bg-slate-800/20 border border-slate-800/30 hover:border-blue-500/40 hover:bg-slate-800/40 transition-all cursor-pointer group shadow-lg"
              >
                <div className="w-14 h-14 bg-slate-800 rounded-lg overflow-hidden flex-shrink-0 border border-slate-700">
                   <div className="w-full h-full bg-gradient-to-br from-blue-500/40 to-purple-500/40 group-hover:from-blue-500/60 group-hover:to-purple-500/60 transition-colors"></div>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-lg text-slate-100 group-hover:text-blue-400 transition-colors mb-1">{activity.title}</h4>
                  <p className="text-sm text-slate-400">{activity.description}</p>
                </div>
                <div className="sm:text-right mt-2 sm:mt-0 flex sm:block items-center justify-between">
                  <p className="text-slate-300 font-medium">{activity.date}</p>
                  <p className="text-sm text-emerald-400 font-medium bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 mt-1 inline-block">{activity.status}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default DashboardPage;
