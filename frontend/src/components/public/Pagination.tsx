import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PaginationProps {
  currentPage: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  total,
  pageSize,
  onPageChange,
}: PaginationProps) {
  const { t } = useTranslation();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  if (totalPages <= 1) {
    return null;
  }

  const pages = Array.from({ length: Math.min(totalPages, 5) }, (_, index) => {
    if (totalPages <= 5) {
      return index + 1;
    }

    const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
    return start + index;
  });

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 pt-8">
      <button
        type="button"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-500 transition enabled:hover:border-rose-200 enabled:hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft size={16} />
        {t('common.previousPage')}
      </button>

      {pages.map((page) => (
        <button
          key={page}
          type="button"
          onClick={() => onPageChange(page)}
          className={`h-11 min-w-11 rounded-full px-4 text-sm font-semibold transition ${
            page === currentPage
              ? 'bg-rose-500 text-white shadow-lg shadow-rose-200'
              : 'border border-slate-200 bg-white text-slate-600 hover:border-rose-200 hover:text-rose-600'
          }`}
        >
          {page}
        </button>
      ))}

      <button
        type="button"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-500 transition enabled:hover:border-rose-200 enabled:hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {t('common.nextPage')}
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
