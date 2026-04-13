import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Camera, Mail, Phone, Shield, Trash2, User } from 'lucide-react';
import { getProfile } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import { useAvatarObjectUrl } from '../hooks/useAvatarObjectUrl';
import { useUserPreferences } from '../hooks/useUserPreferences';
import type { UserProfile } from '../types';

function maskPhone(value: string) {
  if (value.length < 7) {
    return value;
  }

  return `${value.slice(0, 3)} **** ${value.slice(-4)}`;
}

export default function ProfilePage() {
  const { t } = useTranslation();
  const { isAuthenticated, session } = useAuth();
  const { preferences, updatePreferences } = useUserPreferences();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [emailDraft, setEmailDraft] = useState(() => preferences.email);
  const [feedback, setFeedback] = useState('');
  const [feedbackTone, setFeedbackTone] = useState<'success' | 'error'>('success');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let active = true;

    getProfile({ skipAuthRedirect: true })
      .then((data) => {
        if (active) {
          setProfile(data);
        }
      })
      .catch(() => {
        if (active) {
          setError(t('profile.loadError'));
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

  const createdAtLabel = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('zh-CN')
    : t('profile.unavailable');
  const displayName = profile?.username || session?.username || t('profile.unavailable');
  const displayPhone = profile?.phone ? maskPhone(profile.phone) : t('profile.unavailable');
  const displayEmail = preferences.email || t('profile.emailUnavailable');
  const roleLabel = profile?.role
    ? t(`profile.roles.${profile.role}`)
    : session?.role
      ? t(`profile.roles.${session.role}`)
      : t('profile.unavailable');
  const avatarSeed = displayName.trim().charAt(0).toUpperCase() || '?';
  const avatarUrl = useAvatarObjectUrl(preferences.avatarDataUrl);

  const handleAvatarUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      updatePreferences({ avatarDataUrl: result });
      setFeedbackTone('success');
      setFeedback(t('profile.avatarSaved'));
    };

    reader.readAsDataURL(file);
  };

  const handleEmailSave = () => {
    const trimmedEmail = emailDraft.trim();
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);

    if (!isValidEmail) {
      setFeedbackTone('error');
      setFeedback(t('profile.invalidEmail'));
      return;
    }

    updatePreferences({ email: trimmedEmail });
    setFeedbackTone('success');
    setFeedback(t('profile.emailSaved'));
  };

  return (
    <div className="mx-auto w-full max-w-6xl animate-fade-in space-y-8 pb-12">
      <section className="overflow-hidden rounded-[32px] border border-slate-800/80 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.2),transparent_34%),linear-gradient(160deg,rgba(15,23,42,0.96),rgba(2,6,23,0.96))] px-6 py-8 shadow-[0_28px_90px_-48px_rgba(15,23,42,0.98)] lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-300/80">UAAD</p>
        <h2 className="mt-3 text-3xl font-black tracking-tight text-white">
          {t('dashboard.profile')}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 lg:text-base">
          {t('profile.subtitle')}
        </p>
      </section>

      {feedback ? (
        <div
          className={`rounded-2xl px-5 py-4 text-sm ${
            feedbackTone === 'success'
              ? 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-200'
              : 'border border-red-500/20 bg-red-500/10 text-red-200'
          }`}
        >
          {feedback}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-5 py-4 text-sm text-amber-200">
          {error}
        </div>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div>
          <div className="rounded-[32px] border border-slate-800 bg-slate-900/45 p-6 text-center shadow-[0_24px_70px_-42px_rgba(15,23,42,0.98)] backdrop-blur-sm">
            <div className="mx-auto mb-4 flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-violet-600 text-4xl font-black text-white ring-4 ring-slate-950 ring-offset-2 ring-offset-slate-950">
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
              ) : (
                avatarSeed
              )}
            </div>
            <h3 className="text-xl font-black text-white">
              {loading ? t('profile.loading') : displayName}
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              {t('profile.memberSince', { date: createdAtLabel })}
            </p>
            <span className="mt-4 inline-flex rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-blue-300">
              {roleLabel}
            </span>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />

            <div className="mt-6 grid gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-400"
              >
                <Camera size={16} />
                {t('profile.uploadAvatar')}
              </button>
              {avatarUrl ? (
                <button
                  type="button"
                  onClick={() => {
                    updatePreferences({ avatarDataUrl: '' });
                    setFeedbackTone('success');
                    setFeedback(t('profile.avatarRemoved'));
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-700 bg-slate-950/60 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-blue-500/35 hover:text-white"
                >
                  <Trash2 size={16} />
                  {t('profile.removeAvatar')}
                </button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[32px] border border-slate-800 bg-slate-900/45 p-6 shadow-[0_24px_70px_-42px_rgba(15,23,42,0.98)] backdrop-blur-sm">
            <h4 className="mb-6 flex items-center gap-2 text-lg font-black text-white">
              <User size={20} className="text-blue-400" />
              {t('profile.identityTitle')}
            </h4>
            <div className="space-y-4">
              <div className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-950/60 p-4 sm:flex-row sm:items-center">
                <div>
                  <p className="mb-1 text-sm font-medium text-slate-400">{t('profile.displayName')}</p>
                  <p className="font-medium tracking-wide text-slate-100">
                    {loading ? t('profile.loading') : displayName}
                  </p>
                </div>
                <button
                  type="button"
                  disabled
                  className="mt-2 cursor-not-allowed text-sm font-medium text-slate-500 sm:mt-0"
                >
                  {t('profile.actions.readOnly')}
                </button>
              </div>
              <div className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-950/60 p-4 sm:flex-row sm:items-center">
                <div>
                  <p className="mb-1 flex items-center gap-2 text-sm font-medium text-slate-400">
                    <Phone size={14} /> {t('profile.phone')}
                  </p>
                  <p className="font-medium tracking-wide text-slate-100">
                    {loading ? t('profile.loading') : displayPhone}
                  </p>
                </div>
                <button
                  type="button"
                  disabled
                  className="mt-2 cursor-not-allowed text-sm font-medium text-slate-500 sm:mt-0"
                >
                  {t('profile.actions.readOnly')}
                </button>
              </div>
              <div className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-950/60 p-4 sm:flex-row sm:items-center">
                <div className="w-full">
                  <p className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-400">
                    <Mail size={14} /> {t('profile.email')}
                  </p>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <input
                      type="email"
                      value={emailDraft}
                      onChange={(event) => setEmailDraft(event.target.value)}
                      placeholder={displayEmail}
                      className="w-full rounded-full border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/15"
                    />
                    <button
                      type="button"
                      onClick={handleEmailSave}
                      className="rounded-full bg-blue-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-400"
                    >
                      {t('profile.saveEmail')}
                    </button>
                  </div>
                  <p className="mt-3 text-sm text-slate-400">
                    {preferences.email ? preferences.email : t('profile.emailUnavailable')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-800 bg-slate-900/45 p-6 shadow-[0_24px_70px_-42px_rgba(15,23,42,0.98)] backdrop-blur-sm">
            <h4 className="mb-6 flex items-center gap-2 text-lg font-black text-white">
              <Shield size={20} className="text-violet-400" />
              {t('profile.securityTitle')}
            </h4>
            <p className="mb-4 text-sm leading-7 text-slate-300">
              {t('profile.securityDescription')}
            </p>
            <div
              className={`flex items-center justify-between rounded-2xl border p-4 ${
                isAuthenticated
                  ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200'
                  : 'border-red-500/20 bg-red-500/10 text-red-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`h-2 w-2 rounded-full ${isAuthenticated ? 'bg-emerald-400' : 'bg-red-400'}`} />
                <span className="text-sm font-medium">{t('profile.activeSession')}</span>
              </div>
              <span className="text-xs">{isAuthenticated ? t('profile.valid') : t('profile.invalid')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
