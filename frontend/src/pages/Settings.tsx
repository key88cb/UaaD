import { Globe, Bell, Shield, PaintBucket } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function SettingsPage() {
  const { t } = useTranslation();

  const settingsGroups = [
    {
      title: 'Appearance',
      icon: PaintBucket,
      description: 'Customize how UAAD looks on your device.',
      options: [
        { label: 'Theme', value: 'Dark (System Default)', action: 'Change' },
        { label: 'Compact Density', value: 'Off', action: 'Toggle' }
      ]
    },
    {
      title: 'Notifications',
      icon: Bell,
      description: 'Choose what activity alerts you receive.',
      options: [
        { label: 'Email Alerts', value: 'Important only', action: 'Edit' },
        { label: 'SMS Warnings', value: 'Disabled', action: 'Enable' }
      ]
    },
    {
      title: 'Privacy & Security',
      icon: Shield,
      description: 'Manage your data footprint and session constraints.',
      options: [
        { label: 'Two-Factor Auth', value: 'Inactive', action: 'Setup' },
        { label: 'Active Sessions', value: '1 device', action: 'Manage' }
      ]
    },
    {
      title: 'Language & Region',
      icon: Globe,
      description: 'Manage your linguistic preferences.',
      options: [
        { label: 'Display Language', value: t('settings.currentLang', 'System Locale'), action: 'Manage via Topbar' },
        { label: 'Timezone', value: 'UTC+8 (China Standard Time)', action: 'Change' }
      ]
    }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in pb-12">
      <div className="mb-8 border-b border-white/5 pb-8">
        <h2 className="text-3xl font-bold text-white mb-2">{t('dashboard.settings', 'Settings')}</h2>
        <p className="text-slate-400">Control your universal platform preferences.</p>
      </div>

      <div className="space-y-8">
        {settingsGroups.map((group, idx) => (
          <div key={idx} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm transition-all hover:border-slate-700">
             <div className="flex items-start gap-4 mb-6 pb-6 border-b border-slate-800/50">
                <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500 border border-blue-500/20">
                  <group.icon size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{group.title}</h3>
                  <p className="text-slate-400 text-sm">{group.description}</p>
                </div>
             </div>
             
             <div className="space-y-4">
               {group.options.map((opt, oIdx) => (
                 <div key={oIdx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-950/50 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors">
                   <div className="mb-2 sm:mb-0">
                     <p className="text-sm font-medium text-slate-300 mb-1">{opt.label}</p>
                     <p className="text-slate-500 font-medium tracking-wide">{opt.value}</p>
                   </div>
                   <button className="text-blue-400 text-sm hover:text-blue-300 hover:bg-blue-400/10 px-4 py-2 rounded-lg font-medium transition-colors border border-transparent">
                     {opt.action}
                   </button>
                 </div>
               ))}
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
