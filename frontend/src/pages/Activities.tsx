import { Search, CalendarDays, MapPin, Loader2, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { listActivities } from '../api/endpoints';
import {
  CATEGORY_OPTIONS,
  CITY_OPTIONS,
  DEFAULT_ACTIVITY_SEARCH,
  SORT_OPTIONS,
} from '../constants/public';
import { usePreferredCity } from '../hooks/usePreferredCity';
import type { ActivityListItem, ActivitySearchParams } from '../types';
import { formatCurrency, formatLongDate } from '../utils/formatters';

const STATUS_STYLES: Record<ActivityListItem['status'], string> = {
  DRAFT: 'border-slate-700 bg-slate-800/80 text-slate-300',
  PREHEAT: 'border-amber-500/20 bg-amber-500/10 text-amber-200',
  PUBLISHED: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200',
  SELLING_OUT: 'border-rose-500/20 bg-rose-500/10 text-rose-200',
  SOLD_OUT: 'border-slate-700 bg-slate-800/80 text-slate-300',
  OFFLINE: 'border-slate-700 bg-slate-800/80 text-slate-300',
  CANCELLED: 'border-red-500/20 bg-red-500/10 text-red-200',
};

function readParams(searchParams: URLSearchParams, preferredCity: string): ActivitySearchParams {
  const region = searchParams.get('region') ?? preferredCity;

  return {
    keyword: searchParams.get('keyword') ?? DEFAULT_ACTIVITY_SEARCH.keyword,
    region: region || DEFAULT_ACTIVITY_SEARCH.region,
    artist: searchParams.get('artist') ?? DEFAULT_ACTIVITY_SEARCH.artist,
    category:
      (searchParams.get('category') as ActivitySearchParams['category']) ??
      DEFAULT_ACTIVITY_SEARCH.category,
    sort:
      (searchParams.get('sort') as ActivitySearchParams['sort']) ??
      DEFAULT_ACTIVITY_SEARCH.sort,
    page: Number(searchParams.get('page') ?? DEFAULT_ACTIVITY_SEARCH.page),
    pageSize: DEFAULT_ACTIVITY_SEARCH.pageSize,
  };
}

export default function ActivitiesPage() {
  const { t } = useTranslation();
  const { city, setCity } = usePreferredCity();
  const [searchParams, setSearchParams] = useSearchParams();
  const [draftKeyword, setDraftKeyword] = useState('');
  const [draftArtist, setDraftArtist] = useState('');
  const [items, setItems] = useState<ActivityListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const filters = useMemo(() => readParams(searchParams, city), [searchParams, city]);
  const totalPages = Math.max(1, Math.ceil(total / filters.pageSize));

  useEffect(() => {
    setDraftKeyword(filters.keyword);
    setDraftArtist(filters.artist);
  }, [filters.keyword, filters.artist]);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        setError('');
        const result = await listActivities(filters);

        if (!active) {
          return;
        }

        setItems(result.list);
        setTotal(result.total);
      } catch {
        if (active) {
          setItems([]);
          setTotal(0);
          setError(t('public.errorDescription'));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [filters, t]);

  const updateParams = (next: Partial<ActivitySearchParams>) => {
    const merged: ActivitySearchParams = {
      ...filters,
      ...next,
      page:
        next.page ??
        (next.sort ||
        next.category ||
        next.region ||
        next.keyword !== undefined ||
        next.artist !== undefined
          ? 1
          : filters.page),
    };

    const params = new URLSearchParams();

    if (merged.keyword) {
      params.set('keyword', merged.keyword);
    }

    if (merged.region && merged.region !== 'ALL') {
      params.set('region', merged.region);
    }

    if (merged.artist) {
      params.set('artist', merged.artist);
    }

    if (merged.category !== 'ALL') {
      params.set('category', merged.category);
    }

    if (merged.sort !== DEFAULT_ACTIVITY_SEARCH.sort) {
      params.set('sort', merged.sort);
    }

    if (merged.page > 1) {
      params.set('page', String(merged.page));
    }

    setSearchParams(params);
  };

  const pageNumbers = useMemo(() => {
    if (totalPages <= 1) {
      return [];
    }

    return Array.from({ length: Math.min(totalPages, 5) }, (_, index) => {
      if (totalPages <= 5) {
        return index + 1;
      }

      const start = Math.max(1, Math.min(filters.page - 2, totalPages - 4));
      return start + index;
    });
  }, [filters.page, totalPages]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateParams({
      keyword: draftKeyword.trim(),
      artist: draftArtist.trim(),
    });
  };

  return (
    <div className="mx-auto w-full max-w-6xl animate-fade-in space-y-8 pb-12">
      <section className="overflow-hidden rounded-[32px] border border-slate-800/80 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.22),transparent_32%),radial-gradient(circle_at_82%_18%,rgba(168,85,247,0.14),transparent_28%),linear-gradient(160deg,rgba(15,23,42,0.96),rgba(2,6,23,0.96))] px-6 py-8 shadow-[0_28px_90px_-48px_rgba(15,23,42,0.98)] lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-300/80">UAAD</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-white">
              {t('dashboard.activities')}
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300 lg:text-base">
              {t('activities.totalProducts', { count: total })}
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-slate-950/50 px-4 py-2 text-sm font-semibold text-slate-200">
            <Sparkles size={16} className="text-blue-300" />
            {t('sort.hot')}
          </div>
        </div>
      </section>

      <section className="rounded-[32px] border border-slate-800 bg-slate-900/45 p-5 shadow-[0_20px_60px_-36px_rgba(15,23,42,0.95)] backdrop-blur-sm lg:p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px_auto]">
            <label className="flex items-center gap-3 rounded-full border border-slate-700 bg-slate-950/60 px-4 py-3">
              <Search size={18} className="text-slate-500" />
              <input
                value={draftKeyword}
                onChange={(event) => setDraftKeyword(event.target.value)}
                className="w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
                placeholder={t('activities.keywordPlaceholder')}
              />
            </label>
            <input
              value={draftArtist}
              onChange={(event) => setDraftArtist(event.target.value)}
              className="rounded-full border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-500"
              placeholder={t('activities.artistPlaceholder')}
            />
            <button
              type="submit"
              className="rounded-full bg-blue-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-400"
            >
              {t('public.searchAction')}
            </button>
          </div>

          <div className="space-y-5 border-t border-white/6 pt-6">
            <div className="grid gap-3 lg:grid-cols-[84px_minmax(0,1fr)]">
              <span className="pt-2 text-base font-bold text-slate-400">{t('activities.region')}</span>
              <div className="flex flex-wrap gap-3">
                {CITY_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setCity(option.value);
                      updateParams({ region: option.value });
                    }}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      filters.region === option.value
                        ? 'border border-blue-400/30 bg-blue-500 text-white shadow-lg shadow-blue-950/40'
                        : 'border border-slate-700 bg-slate-950/60 text-slate-300 hover:border-blue-500/30 hover:text-white'
                    }`}
                  >
                    {t(`cities.${option.value}`)}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-3 lg:grid-cols-[84px_minmax(0,1fr)]">
              <span className="pt-2 text-base font-bold text-slate-400">{t('activities.category')}</span>
              <div className="flex flex-wrap gap-3">
                {CATEGORY_OPTIONS.map((category) => (
                  <button
                    key={category.value}
                    type="button"
                    onClick={() => updateParams({ category: category.value })}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      filters.category === category.value
                        ? 'border border-blue-400/30 bg-blue-500 text-white shadow-lg shadow-blue-950/40'
                        : 'border border-slate-700 bg-slate-950/60 text-slate-300 hover:border-blue-500/30 hover:text-white'
                    }`}
                  >
                    {t(`categories.${category.value}`)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </form>
      </section>

      <section className="overflow-hidden rounded-[32px] border border-slate-800 bg-slate-900/45 shadow-[0_24px_70px_-42px_rgba(15,23,42,0.98)] backdrop-blur-sm">
        <div className="flex flex-wrap border-b border-white/6">
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => updateParams({ sort: option.value })}
              className={`border-r border-white/6 px-6 py-4 text-sm font-bold transition last:border-r-0 ${
                filters.sort === option.value
                  ? 'bg-blue-500/12 text-blue-200'
                  : 'bg-transparent text-slate-400 hover:bg-slate-950/50 hover:text-white'
              }`}
            >
              {t(`sort.${option.value}`)}
            </button>
          ))}
        </div>

        <div className="space-y-5 p-5 lg:p-8">
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-[28px] border border-slate-800 bg-slate-950/55 p-5"
                >
                  <div className="h-5 w-44 animate-pulse rounded-full bg-slate-800" />
                  <div className="mt-4 h-4 w-full animate-pulse rounded-full bg-slate-800" />
                  <div className="mt-2 h-4 w-3/4 animate-pulse rounded-full bg-slate-800" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="rounded-[28px] border border-amber-500/20 bg-amber-500/10 px-6 py-5 text-sm text-amber-200">
              {error}
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-[32px] border border-dashed border-slate-700 bg-slate-950/35 px-6 py-12 text-center">
              <Loader2 className="mx-auto text-slate-500" size={28} />
              <p className="mt-4 text-lg font-bold text-white">{t('public.emptyTitle')}</p>
              <p className="mt-2 text-sm leading-7 text-slate-300">{t('public.emptyDescription')}</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {items.map((item) => (
                  <Link
                    key={item.id}
                    to={`/activity/${item.id}`}
                    className="group block rounded-[28px] border border-slate-800 bg-slate-950/55 p-5 transition hover:border-blue-500/35 hover:bg-slate-950/80"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
                      <div className="flex min-w-0 flex-1 gap-4">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_top,_rgba(96,165,250,0.92),_rgba(99,102,241,0.78)_55%,_rgba(15,23,42,1))] text-xl font-black text-white shadow-lg shadow-blue-950/60">
                          {item.coverUrl ? (
                            <img src={item.coverUrl} alt={item.title} className="h-full w-full object-cover" />
                          ) : (
                            item.title.charAt(0)
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-3">
                            <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${STATUS_STYLES[item.status]}`}>
                              {t(`status.${item.status}`)}
                            </span>
                            <span className="rounded-full border border-white/8 bg-slate-900/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                              {t(`categories.${item.category}`)}
                            </span>
                          </div>

                          <h3 className="mt-3 text-xl font-black text-white transition group-hover:text-blue-200">
                            {item.title}
                          </h3>
                          <p className="mt-2 line-clamp-2 text-sm leading-7 text-slate-300">
                            {item.description}
                          </p>

                          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-400">
                            <span className="inline-flex items-center gap-2">
                              <CalendarDays size={15} className="text-slate-500" />
                              {formatLongDate(item.activityAt)}
                            </span>
                            <span className="inline-flex items-center gap-2">
                              <MapPin size={15} className="text-slate-500" />
                              {item.location}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 lg:w-52 lg:items-end">
                        <div className="rounded-[24px] border border-slate-800 bg-slate-900/80 px-4 py-3 text-right">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                            {t('public.priceStarts')}
                          </p>
                          <p className="mt-2 text-xl font-black text-white">{formatCurrency(item.price)}</p>
                        </div>
                        <div className="rounded-[24px] border border-slate-800 bg-slate-900/80 px-4 py-3 text-right">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                            {t('activityDetail.stockLabel')}
                          </p>
                          <p className="mt-2 text-sm font-semibold text-slate-200">
                            {item.stockRemaining} / {item.maxCapacity}
                          </p>
                        </div>
                        <span className="inline-flex items-center gap-2 rounded-full bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition group-hover:bg-blue-400">
                          {t('orders.viewDetail')}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {pageNumbers.length ? (
                <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
                  <button
                    type="button"
                    disabled={filters.page <= 1}
                    onClick={() => updateParams({ page: filters.page - 1 })}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-950/60 px-4 py-2 text-sm font-medium text-slate-200 transition enabled:hover:border-blue-500/35 enabled:hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft size={16} />
                    {t('common.previousPage')}
                  </button>

                  {pageNumbers.map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => updateParams({ page })}
                      className={`h-11 min-w-11 rounded-full px-4 text-sm font-semibold transition ${
                        page === filters.page
                          ? 'bg-blue-500 text-white shadow-lg shadow-blue-950/40'
                          : 'border border-slate-700 bg-slate-950/60 text-slate-300 hover:border-blue-500/35 hover:text-white'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    type="button"
                    disabled={filters.page >= totalPages}
                    onClick={() => updateParams({ page: filters.page + 1 })}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-950/60 px-4 py-2 text-sm font-medium text-slate-200 transition enabled:hover:border-blue-500/35 enabled:hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {t('common.nextPage')}
                    <ChevronRight size={16} />
                  </button>
                </div>
              ) : null}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
