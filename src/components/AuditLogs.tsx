import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  ShieldCheck, 
  Clock, 
  User, 
  Activity, 
  ArrowLeft,
  Loader2,
  Lock,
  Database
} from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

export default function AuditLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { token, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/');
      return;
    }
    fetch('/api/audit-logs', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        setLogs(Array.isArray(data) ? data : []);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const getActionColor = (action: string) => {
    if (action.includes('DELETE')) return 'bg-rose-50 text-rose-600 border-rose-100';
    if (action.includes('CREATE') || action.includes('PAY')) return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    if (action.includes('LOGIN')) return 'bg-indigo-50 text-indigo-600 border-indigo-100';
    return 'bg-slate-50 text-slate-600 border-slate-100';
  };

  if (isLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" size={48} /></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-10 text-left pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
           <button onClick={() => navigate(-1)} className="p-4 bg-white border border-slate-100 rounded-3xl shadow-sm hover:bg-slate-50 transition-all text-slate-400 hover:text-slate-900 active:scale-95">
              <ArrowLeft size={24} />
           </button>
           <div>
              <h2 className="text-4xl font-black text-slate-950 tracking-tighter">Security Vault</h2>
              <p className="text-slate-500 font-medium tracking-tight mt-1">Granular immutable audit records for the entire organization</p>
           </div>
        </div>
        <div className="hidden md:flex items-center gap-3 px-6 py-3 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em]">
           <Lock size={14} />
           FIPS 140-2 Compliant Logs
        </div>
      </div>

      <div className="card-premium p-0 overflow-hidden bg-white/50 backdrop-blur-xl">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
           <div className="flex items-center gap-4">
              <div className="p-2.5 bg-slate-950 text-white rounded-xl">
                 <Database size={20} />
              </div>
              <h3 className="text-sm font-black text-slate-950 uppercase tracking-[0.2em]">Action Transaction History</h3>
           </div>
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Real-time Sync Active</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-slate-50">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Transaction ID</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Actor</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Vector / Action</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Payload Context</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {logs.map((log) => (
                <tr key={log._id} className="hover:bg-indigo-50/20 transition-colors">
                  <td className="px-8 py-6 font-mono text-[10px] text-slate-400 truncate max-w-[120px]">
                    {log._id}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">
                        {log.performedBy?.name ? log.performedBy.name[0] : 'S'}
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900">{log.performedBy?.name || 'System'}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{log.performedBy?.role || 'Root'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.15em] border ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-xs text-slate-500 font-semibold tracking-tight">{log.details}</p>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex flex-col items-end">
                       <span className="text-xs font-black text-slate-900">{new Date(log.timestamp).toLocaleTimeString()}</span>
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(log.timestamp).toLocaleDateString()}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
