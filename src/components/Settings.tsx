import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  ShieldCheck, 
  Key, 
  Lock, 
  CheckCircle2, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Settings() {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      setStatus({ type: 'error', message: 'Passwords do not match' });
      return;
    }

    setIsLoading(true);
    setStatus(null);

    // Simulate API update
    setTimeout(() => {
      setStatus({ type: 'success', message: 'Security credentials updated successfully' });
      setIsLoading(false);
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    }, 1500);
  };

  return (
    <div className="max-w-2xl mx-auto text-left space-y-8">
      <div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Security Settings</h2>
        <p className="text-slate-500 font-medium tracking-tight">Maintain your digital footprint and access credentials</p>
      </div>

      <div className="card-premium p-8">
        <div className="flex items-center gap-6 mb-10 pb-10 border-b border-slate-50">
          <div className="w-16 h-16 rounded-3xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <ShieldCheck size={32} />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Account Integrity</h3>
            <p className="text-sm text-slate-400 font-medium">Logged in as <span className="text-slate-900 font-bold">{user?.email}</span></p>
          </div>
        </div>

        <AnimatePresence>
          {status && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`mb-8 p-4 rounded-2xl flex items-center gap-3 text-sm font-bold border ${status.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-600'}`}
            >
              {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              {status.message}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="password" 
                required
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                value={formData.currentPassword}
                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">New Password</label>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="password" 
                  required
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm New Password</label>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="password" 
                  required
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                'Update Security Credentials'
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="p-8 bg-amber-50 border border-amber-100 rounded-[2rem] flex items-start gap-4">
        <div className="p-2 bg-white rounded-xl text-amber-500 shadow-sm">
          <AlertCircle size={20} />
        </div>
        <div>
          <h4 className="text-sm font-black text-amber-900 uppercase tracking-widest mb-1">Security Recommendation</h4>
          <p className="text-xs text-amber-700 font-medium leading-relaxed">
            Ensure your new password contains at least 8 characters, including symbols and numbers to maintain system-wide security standards compliance.
          </p>
        </div>
      </div>
    </div>
  );
}
