import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { HOME_CATEGORY_RAIL } from '../../constants/public';

export function CategoryStrip() {
  const { t } = useTranslation();

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm lg:p-8">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {HOME_CATEGORY_RAIL.map((category) => {
          const Icon = category.icon;

          return (
            <Link
              key={category.value}
              to={`/activities?category=${category.value}`}
              className="group flex flex-col items-center rounded-3xl border border-slate-100 bg-slate-50 px-4 py-6 text-center transition hover:-translate-y-1 hover:border-rose-100 hover:bg-rose-50"
            >
              {Icon ? (
                <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white text-rose-500 shadow-sm transition group-hover:bg-rose-500 group-hover:text-white">
                  <Icon size={24} />
                </span>
              ) : null}
              <span className="text-sm font-semibold text-slate-800">
                {t(`categories.${category.value}`)}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
