import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PenLine, Rocket, PlusCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { listMerchantActivities, publishMerchantActivity } from '../api/endpoints';
import type { ActivityListItem } from '../types';
import { formatCurrency } from '../utils/formatters';

export default function MerchantActivitiesPage() {
  const { t } = useTranslation();
  const location = useLocation();
  const [items, setItems] = useState<ActivityListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishingId, setPublishingId] = useState<number | null>(null);
  const banner = (location.state as { message?: string } | null)?.message ?? '';

  const load = async () => {
    setLoading(true);

    try {
      const nextItems = await listMerchantActivities();
      setItems(nextItems);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    listMerchantActivities()
      .then((nextItems) => {
        if (active) {
          setItems(nextItems);
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

  const canPublish = (status: ActivityListItem['status']) => status === 'DRAFT' || status === 'PREHEAT';

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 pb-12">
      <section className="flex flex-wrap items-end justify-between gap-4 overflow-hidden rounded-[32px] border border-rose-100 bg-[linear-gradient(135deg,#fff7f1_0%,#ffffff_58%,#fff1eb_100%)] px-6 py-8 shadow-[0_24px_60px_-40px_rgba(225,29,72,0.28)] lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-rose-400">UAAD</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900">
            {t('merchant.activityList')}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500 lg:text-base">
            {t('merchant.listSubtitle')}
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

      {banner ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {banner}
        </div>
      ) : null}

      <section className="overflow-hidden rounded-[32px] border border-rose-100 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[#fff7f1] text-slate-500">
            <tr>
              <th className="px-5 py-4">{t('merchant.table.activity')}</th>
              <th className="px-5 py-4">{t('merchant.table.status')}</th>
              <th className="px-5 py-4">{t('merchant.table.price')}</th>
              <th className="px-5 py-4">{t('merchant.table.enroll')}</th>
              <th className="px-5 py-4">{t('merchant.table.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-slate-500">
                  {t('merchant.loading')}
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-slate-500">
                  {t('merchant.empty')}
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="border-t border-rose-100 text-slate-700">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-900">{item.title}</p>
                    <p className="mt-1 text-xs text-slate-400">{item.location}</p>
                  </td>
                  <td className="px-5 py-4">{t(`status.${item.status}`)}</td>
                  <td className="px-5 py-4">{formatCurrency(item.price)}</td>
                  <td className="px-5 py-4">{item.enrollCount.toLocaleString()}</td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        to={`/merchant/activities/${item.id}/edit`}
                        className="inline-flex items-center gap-1 rounded-full border border-rose-100 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-rose-200 hover:text-rose-600"
                      >
                        <PenLine size={12} />
                        {t('merchant.edit')}
                      </Link>
                      <button
                        type="button"
                        disabled={!canPublish(item.status) || publishingId === item.id}
                        onClick={async () => {
                          setPublishingId(item.id);
                          await publishMerchantActivity(item.id).catch(() => undefined);
                          setPublishingId(null);
                          await load();
                        }}
                        className="inline-flex items-center gap-1 rounded-lg bg-rose-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Rocket size={12} />
                        {t('merchant.publish')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
