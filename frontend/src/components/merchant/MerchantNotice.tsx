import { AlertTriangle, BadgeCheck, Info } from 'lucide-react';
import type { ReactNode } from 'react';

export type MerchantNoticeTone = 'success' | 'error' | 'info';

interface MerchantNoticeProps {
  tone: MerchantNoticeTone;
  title?: string;
  message: string;
  action?: ReactNode;
}

const TONE_STYLES: Record<
  MerchantNoticeTone,
  {
    wrapper: string;
    icon: string;
  }
> = {
  success: {
    wrapper: 'border-emerald-400/20 bg-emerald-500/10 text-emerald-100',
    icon: 'bg-emerald-400/15 text-emerald-300',
  },
  error: {
    wrapper: 'border-red-400/25 bg-red-500/10 text-red-100',
    icon: 'bg-red-400/15 text-red-300',
  },
  info: {
    wrapper: 'border-cyan-400/20 bg-cyan-500/10 text-cyan-100',
    icon: 'bg-cyan-400/15 text-cyan-300',
  },
};

const TONE_ICON = {
  success: BadgeCheck,
  error: AlertTriangle,
  info: Info,
} as const;

export function MerchantNotice({ tone, title, message, action }: MerchantNoticeProps) {
  const Icon = TONE_ICON[tone];
  const styles = TONE_STYLES[tone];

  return (
    <div
      className={`flex flex-col gap-4 rounded-2xl border px-4 py-4 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.8)] sm:flex-row sm:items-start sm:justify-between ${styles.wrapper}`}
      role={tone === 'error' ? 'alert' : 'status'}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 rounded-xl p-2 ${styles.icon}`}>
          <Icon size={16} />
        </div>
        <div className="space-y-1">
          {title ? <p className="text-sm font-semibold">{title}</p> : null}
          <p className="text-sm leading-6 text-inherit/90">{message}</p>
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
