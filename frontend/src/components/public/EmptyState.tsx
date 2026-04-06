import { SearchX } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function EmptyState({
  title,
  description,
}: {
  title?: string;
  description?: string;
}) {
  const { t } = useTranslation();

  return (
    <div className="rounded-[28px] border border-dashed border-slate-200 bg-white p-10 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <SearchX size={28} />
      </div>
      <h3 className="mt-5 text-xl font-black text-slate-900">
        {title ?? t('public.emptyTitle')}
      </h3>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-500">
        {description ?? t('public.emptyDescription')}
      </p>
    </div>
  );
}
