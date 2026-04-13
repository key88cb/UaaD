import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Clock3, CreditCard, ReceiptText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { listOrders } from '../api/endpoints';
import type { OrderItem } from '../types';
import { formatExactCurrency, formatLongDate } from '../utils/formatters';

const STATUS_STYLES: Record<OrderItem['status'], string> = {
  PENDING: 'border-amber-500/20 bg-amber-500/10 text-amber-200',
  PAID: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200',
  CLOSED: 'border-slate-700 bg-slate-800/80 text-slate-300',
  REFUNDED: 'border-sky-500/20 bg-sky-500/10 text-sky-200',
};

export default function OrdersPage() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    listOrders(1, 50)
      .then((result) => {
        if (!active) {
          return;
        }

        setOrders(result.list);
        setError('');
      })
      .catch(() => {
        if (active) {
          setOrders([]);
          setError(t('orders.loadError'));
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
  }, [t]);

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12">
      <section className="overflow-hidden rounded-[32px] border border-slate-800/80 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.2),transparent_34%),linear-gradient(160deg,rgba(15,23,42,0.96),rgba(2,6,23,0.96))] px-6 py-8 shadow-[0_28px_90px_-48px_rgba(15,23,42,0.98)] lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-300/80">UAAD</p>
        <h2 className="mt-3 text-3xl font-black tracking-tight text-white">
          {t('orders.title')}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 lg:text-base">
          {t('orders.subtitle')}
        </p>
      </section>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="rounded-[28px] border border-slate-800 bg-slate-900/45 p-6 shadow-[0_20px_60px_-36px_rgba(15,23,42,0.95)]"
            >
              <div className="h-5 w-44 animate-pulse rounded-full bg-slate-800" />
              <div className="mt-4 h-4 w-full animate-pulse rounded-full bg-slate-800" />
              <div className="mt-2 h-4 w-2/3 animate-pulse rounded-full bg-slate-800" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-[28px] border border-amber-500/20 bg-amber-500/10 px-6 py-5 text-sm text-amber-200 shadow-sm">
          {error}
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-[32px] border border-dashed border-slate-700 bg-slate-900/35 px-6 py-12 text-center shadow-sm">
          <ReceiptText className="mx-auto text-slate-500" size={28} />
          <p className="mt-4 text-lg font-bold text-white">{t('orders.emptyTitle')}</p>
          <p className="mt-2 text-sm leading-7 text-slate-300">{t('orders.emptyDescription')}</p>
          <Link
            to="/app/activities"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-blue-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-400"
          >
            {t('orders.browseActivities')}
            <ChevronRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <article
              key={order.id}
              className="rounded-[28px] border border-slate-800 bg-slate-900/45 p-6 shadow-[0_20px_60px_-36px_rgba(15,23,42,0.95)] backdrop-blur-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${STATUS_STYLES[order.status]}`}
                    >
                      {t(`orders.status.${order.status}`)}
                    </span>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      {order.orderNo}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-black text-white">
                      {formatExactCurrency(order.amount)}
                    </p>
                    <p className="text-sm text-slate-300">
                      {t('orders.createdAt', { time: formatLongDate(order.createdAt) })}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-slate-300">
                  {order.status === 'PAID' ? (
                    <p>{t('orders.paidAt', { time: formatLongDate(order.paidAt || order.updatedAt) })}</p>
                  ) : (
                    <p>{t('orders.expireAt', { time: formatLongDate(order.expiredAt) })}</p>
                  )}
                </div>
              </div>

              <div className="mt-5 flex flex-wrap justify-end gap-3">
                {order.status === 'PENDING' ? (
                  <Link
                    to={`/app/orders/${order.id}`}
                    className="inline-flex items-center gap-2 rounded-full bg-blue-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-400"
                  >
                    <CreditCard size={16} />
                    {t('orders.payNow')}
                  </Link>
                ) : null}
                <Link
                  to={`/app/orders/${order.id}`}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-950/60 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-blue-500/35 hover:text-white"
                >
                  <Clock3 size={16} />
                  {t('orders.viewDetail')}
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
