import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, Shield } from 'lucide-react';

export default function ProfilePage() {
  const { t } = useTranslation();
  // Using context just as a placeholder to show it's connected
  const { isAuthenticated } = useAuth();

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in pb-12">
      <div className="mb-8 border-b border-white/5 pb-8">
        <h2 className="text-3xl font-bold text-white mb-2">{t('dashboard.profile', 'Profile')}</h2>
        <p className="text-slate-400">Manage your persona and basic contact details.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="col-span-1">
          <div className="bg-slate-900/40 rounded-2xl border border-slate-800 p-6 flex flex-col items-center text-center shadow-xl backdrop-blur-sm">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-4 ring-4 ring-slate-900 ring-offset-2 ring-offset-slate-950 flex items-center justify-center text-4xl text-white font-bold">
               U
            </div>
            <h3 className="text-xl font-bold text-white mb-1">Demo User</h3>
            <p className="text-slate-400 mb-4 leading-tight text-sm">Universal Access Token Holder</p>
            <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs font-medium">Standard Account</span>
          </div>
        </div>

        <div className="col-span-2 space-y-6">
          <div className="bg-slate-900/40 rounded-2xl border border-slate-800 p-6 shadow-xl backdrop-blur-sm">
            <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <User size={20} className="text-blue-500" />
              Identity Information
            </h4>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-950/50 rounded-xl border border-slate-800">
                <div>
                  <p className="text-sm font-medium text-slate-400 mb-1">Display Name</p>
                  <p className="text-slate-100 font-medium tracking-wide">Demo User</p>
                </div>
                <button className="text-blue-400 text-sm hover:text-blue-300 font-medium mt-2 sm:mt-0">Edit</button>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-950/50 rounded-xl border border-slate-800">
                <div>
                  <p className="text-sm font-medium text-slate-400 flex items-center gap-2 mb-1">
                    <Phone size={14} /> Registered Phone
                  </p>
                  <p className="text-slate-100 font-medium tracking-wide">+86 138 **** 8888</p>
                </div>
                <button className="text-blue-400 text-sm hover:text-blue-300 font-medium mt-2 sm:mt-0">Change</button>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-950/50 rounded-xl border border-slate-800">
                <div>
                  <p className="text-sm font-medium text-slate-400 flex items-center gap-2 mb-1">
                    <Mail size={14} /> Email Address
                  </p>
                  <p className="text-slate-100 font-medium tracking-wide">Not linked</p>
                </div>
                <button className="text-blue-400 text-sm hover:text-blue-300 font-medium mt-2 sm:mt-0">Link Email</button>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-900/40 rounded-2xl border border-slate-800 p-6 shadow-xl backdrop-blur-sm">
             <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Shield size={20} className="text-purple-500" />
              Security Check
            </h4>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              Your account is currently protected by standard JWT stateless authentication. For full-scale enterprise distribution access, please verify your identity via OAuth.
            </p>
            <div className={`p-4 rounded-xl border flex items-center justify-between ${isAuthenticated ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
              <div className="flex items-center gap-3">
                 <div className={`w-2 h-2 rounded-full ${isAuthenticated ? 'bg-emerald-400' : 'bg-red-400'}`}></div>
                 <span className="font-medium text-sm">Active Session</span>
              </div>
              <span className="text-xs">{isAuthenticated ? 'Valid' : 'Invalid'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
