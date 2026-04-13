import { AlertTriangle, LoaderCircle, PackageOpen } from 'lucide-react';
import type { ReactNode } from 'react';

type MerchantStateTone = 'loading' | 'empty' | 'error';

interface MerchantStateCardProps {
  tone: MerchantStateTone;
  title: string;
  description: string;
  action?: ReactNode;
  compact?: boolean;
}

const STATE_ICON = {
  loading: LoaderCircle,
  empty: PackageOpen,
  error: AlertTriangle,
} as const;

const STATE_ICON_CLASS: Record<MerchantStateTone, string> = {
  loading: 'text-cyan-300',
  empty: 'text-slate-300',
  error: 'text-red-300',
};

export function MerchantStateCard({
  tone,
  title,
  description,
  action,
  compact = false,
}: MerchantStateCardProps) {
  const Icon = STATE_ICON[tone];

  return (
    <div
      className={`flex flex-col items-center justify-center rounded-[28px] border border-white/8 bg-slate-950/45 px-6 text-center shadow-[0_24px_60px_-40px_rgba(15,23,42,0.9)] ${
        compact ? 'min-h-[240px] py-10' : 'min-h-[320px] py-14'
      }`}
    >
      <div className="mb-5 rounded-2xl border border-white/10 bg-white/5 p-4">
        <Icon
          size={24}
          className={`${STATE_ICON_CLASS[tone]} ${tone === 'loading' ? 'animate-spin' : ''}`}
        />
      </div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
