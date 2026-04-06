import { useTranslation } from 'react-i18next';
import type { ActivityStatus } from '../../types';

const STATUS_CLASSNAME: Record<ActivityStatus, string> = {
  DRAFT: 'bg-slate-100 text-slate-500',
  PREHEAT: 'bg-amber-100 text-amber-700',
  PUBLISHED: 'bg-emerald-100 text-emerald-700',
  SELLING_OUT: 'bg-rose-100 text-rose-600',
  SOLD_OUT: 'bg-slate-200 text-slate-500',
  OFFLINE: 'bg-slate-100 text-slate-500',
  CANCELLED: 'bg-red-100 text-red-600',
};

export function StatusChip({ status }: { status: ActivityStatus }) {
  const { t } = useTranslation();

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${STATUS_CLASSNAME[status]}`}
    >
      {t(`status.${status}`)}
    </span>
  );
}
