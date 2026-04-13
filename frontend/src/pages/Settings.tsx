import { Bell, Globe, MapPinned, RotateCcw, Shield, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useUserPreferences } from '../hooks/useUserPreferences';
import { usePreferredCity } from '../hooks/usePreferredCity';
import { CITY_OPTIONS } from '../constants/public';

export default function SettingsPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { logout, session } = useAuth();
  const { preferences, updatePreferences, resetPreferences } = useUserPreferences();
  const { city, setCity } = usePreferredCity();

  return (
    <div className="mx-auto w-full max-w-5xl animate-fade-in space-y-8 pb-12">
      <section className="overflow-hidden rounded-[32px] border border-slate-800/80 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.2),transparent_34%),linear-gradient(160deg,rgba(15,23,42,0.96),rgba(2,6,23,0.96))] px-6 py-8 shadow-[0_28px_90px_-48px_rgba(15,23,42,0.98)] lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-300/80">UAAD</p>
        <h2 className="mt-3 text-3xl font-black tracking-tight text-white">
          {t('dashboard.settings', 'Settings')}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 lg:text-base">
          Control your universal platform preferences.
        </p>
      </section>

      <div className="space-y-8">
        <section className="rounded-[32px] border border-slate-800 bg-slate-900/45 p-6 shadow-[0_24px_70px_-42px_rgba(15,23,42,0.98)] backdrop-blur-sm">
          <div className="mb-6 flex items-start gap-4 border-b border-white/6 pb-6">
            <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-3 text-blue-300">
              <Bell size={24} />
            </div>
            <div>
              <h3 className="mb-1 text-xl font-black text-white">
                {t('settings.notificationsTitle')}
              </h3>
              <p className="text-sm text-slate-300">{t('settings.notificationsDescription')}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-950/60 p-4 sm:flex-row sm:items-center">
              <div>
                <p className="mb-1 text-sm font-medium text-slate-200">
                  {t('settings.emailNotifications')}
                </p>
                <p className="text-sm text-slate-400">{t('settings.emailNotificationsHint')}</p>
              </div>
              <button
                type="button"
                onClick={() =>
                  updatePreferences({ emailNotifications: !preferences.emailNotifications })
                }
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  preferences.emailNotifications
                    ? 'bg-blue-500 text-white hover:bg-blue-400'
                    : 'border border-slate-700 bg-slate-900 text-slate-200 hover:border-blue-500/35 hover:text-white'
                }`}
              >
                {preferences.emailNotifications ? t('settings.enabled') : t('settings.disabled')}
              </button>
            </div>

            <div className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-950/60 p-4 sm:flex-row sm:items-center">
              <div>
                <p className="mb-1 text-sm font-medium text-slate-200">
                  {t('settings.smsNotifications')}
                </p>
                <p className="text-sm text-slate-400">{t('settings.smsNotificationsHint')}</p>
              </div>
              <button
                type="button"
                onClick={() => updatePreferences({ smsNotifications: !preferences.smsNotifications })}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  preferences.smsNotifications
                    ? 'bg-blue-500 text-white hover:bg-blue-400'
                    : 'border border-slate-700 bg-slate-900 text-slate-200 hover:border-blue-500/35 hover:text-white'
                }`}
              >
                {preferences.smsNotifications ? t('settings.enabled') : t('settings.disabled')}
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-[32px] border border-slate-800 bg-slate-900/45 p-6 shadow-[0_24px_70px_-42px_rgba(15,23,42,0.98)] backdrop-blur-sm">
          <div className="mb-6 flex items-start gap-4 border-b border-white/6 pb-6">
            <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-3 text-blue-300">
              <Globe size={24} />
            </div>
            <div>
              <h3 className="mb-1 text-xl font-black text-white">
                {t('settings.languageTitle')}
              </h3>
              <p className="text-sm text-slate-300">{t('settings.languageDescription')}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <button
              type="button"
              onClick={() => i18n.changeLanguage('zh')}
              className={`rounded-2xl border px-4 py-4 text-left transition ${
                i18n.resolvedLanguage?.startsWith('zh')
                  ? 'border-blue-500/35 bg-blue-500/12 text-blue-200'
                  : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-blue-500/30'
              }`}
            >
              <p className="text-sm font-bold uppercase tracking-[0.18em]">ZH</p>
              <p className="mt-2 text-sm">{t('settings.languageChinese')}</p>
            </button>
            <button
              type="button"
              onClick={() => i18n.changeLanguage('en')}
              className={`rounded-2xl border px-4 py-4 text-left transition ${
                i18n.resolvedLanguage?.startsWith('en')
                  ? 'border-blue-500/35 bg-blue-500/12 text-blue-200'
                  : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-blue-500/30'
              }`}
            >
              <p className="text-sm font-bold uppercase tracking-[0.18em]">EN</p>
              <p className="mt-2 text-sm">{t('settings.languageEnglish')}</p>
            </button>
          </div>
        </section>

        <section className="rounded-[32px] border border-slate-800 bg-slate-900/45 p-6 shadow-[0_24px_70px_-42px_rgba(15,23,42,0.98)] backdrop-blur-sm">
          <div className="mb-6 flex items-start gap-4 border-b border-white/6 pb-6">
            <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-3 text-blue-300">
              <MapPinned size={24} />
            </div>
            <div>
              <h3 className="mb-1 text-xl font-black text-white">
                {t('settings.discoveryTitle')}
              </h3>
              <p className="text-sm text-slate-300">{t('settings.discoveryDescription')}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
            <label className="block text-sm font-medium text-slate-200">
              {t('settings.preferredCity')}
            </label>
            <select
              value={city}
              onChange={(event) => setCity(event.target.value)}
              className="mt-3 w-full rounded-full border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/15"
            >
              {CITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {t(`cities.${option.value}`)}
                </option>
              ))}
            </select>
          </div>
        </section>

        <section className="rounded-[32px] border border-slate-800 bg-slate-900/45 p-6 shadow-[0_24px_70px_-42px_rgba(15,23,42,0.98)] backdrop-blur-sm">
          <div className="mb-6 flex items-start gap-4 border-b border-white/6 pb-6">
            <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-3 text-blue-300">
              <Shield size={24} />
            </div>
            <div>
              <h3 className="mb-1 text-xl font-black text-white">
                {t('settings.accountTitle')}
              </h3>
              <p className="text-sm text-slate-300">{t('settings.accountDescription')}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
              <p className="text-sm font-medium text-slate-200">{t('settings.currentAccount')}</p>
              <p className="mt-2 text-sm text-slate-400">
                {session?.username} ·{' '}
                {session?.role ? t(`profile.roles.${session.role}`) : '-'}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  resetPreferences();
                  setCity('ALL');
                }}
                className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-950/60 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-blue-500/35 hover:text-white"
              >
                <RotateCcw size={16} />
                {t('settings.resetPersonalization')}
              </button>
              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate('/', { replace: true });
                }}
                className="inline-flex items-center gap-2 rounded-full bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-400"
              >
                <LogOut size={16} />
                {t('settings.logoutToHome')}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
