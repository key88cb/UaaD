import { MapPin, Search, UserCircle2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CITY_OPTIONS } from '../../constants/public';
import { useAuth } from '../../context/AuthContext';
import { NotificationBell } from './NotificationBell';

interface PublicHeaderProps {
  preferredCity: string;
  onCityChange: (city: string) => void;
  initialSearchValue: string;
  onSearchSubmit: (value: string) => void;
}

export function PublicHeader({
  preferredCity,
  onCityChange,
  initialSearchValue,
  onSearchSubmit,
}: PublicHeaderProps) {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [searchValue, setSearchValue] = useState(initialSearchValue);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearchSubmit(searchValue);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-4 px-4 py-4 lg:px-6">
        <NavLink to="/" className="flex shrink-0 items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[radial-gradient(circle_at_top,_#ff9cc6,_#ff2d7a_55%,_#ff6a00)] text-white shadow-lg shadow-rose-200">
            <span className="text-xl font-black">U</span>
          </div>
          <div className="hidden sm:block">
            <p className="text-3xl font-black tracking-tight text-rose-600">UAAD</p>
            <p className="text-xs font-semibold tracking-[0.3em] text-rose-300">
              {t('public.brandTagline')}
            </p>
          </div>
        </NavLink>

        <div className="hidden items-center gap-2 lg:flex">
          <label className="flex items-center gap-2 rounded-full bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700">
            <MapPin size={16} className="text-slate-400" />
            <select
              value={preferredCity}
              onChange={(event) => onCityChange(event.target.value)}
              className="appearance-none bg-transparent pr-3 text-sm font-medium outline-none"
            >
              {CITY_OPTIONS.map((city) => (
                <option key={city.value} value={city.value}>
                  {t(`cities.${city.value}`)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <nav className="hidden items-center gap-1 md:flex">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `rounded-full px-4 py-2 text-base font-semibold transition ${
                isActive
                  ? 'bg-rose-50 text-rose-600'
                  : 'text-slate-700 hover:bg-slate-50 hover:text-rose-600'
              }`
            }
          >
            {t('public.navHome')}
          </NavLink>
          <NavLink
            to="/activities"
            className={({ isActive }) =>
              `rounded-full px-4 py-2 text-base font-semibold transition ${
                isActive
                  ? 'bg-rose-50 text-rose-600'
                  : 'text-slate-700 hover:bg-slate-50 hover:text-rose-600'
              }`
            }
          >
            {t('public.navCategories')}
          </NavLink>
        </nav>

        <form
          onSubmit={handleSubmit}
          className="ml-auto flex min-w-0 flex-1 items-center gap-2 lg:max-w-2xl"
        >
          <div className="flex min-w-0 flex-1 items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-3">
            <Search size={20} className="shrink-0 text-slate-400" />
            <input
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              className="min-w-0 flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 lg:text-base"
              placeholder={t('public.searchPlaceholder')}
            />
          </div>
          <button
            type="submit"
            className="shrink-0 rounded-full bg-rose-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-rose-200 transition hover:bg-rose-600 lg:px-8 lg:text-base"
          >
            {t('public.searchAction')}
          </button>
        </form>

        <div className="flex shrink-0 items-center gap-2">
          <NotificationBell />
          <NavLink
            to={isAuthenticated ? '/app/overview' : '/login'}
            className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-rose-200 hover:text-rose-600 lg:flex"
          >
            <UserCircle2 size={18} />
            {isAuthenticated ? t('public.myAccount') : t('auth.login')}
          </NavLink>
        </div>
      </div>
    </header>
  );
}
