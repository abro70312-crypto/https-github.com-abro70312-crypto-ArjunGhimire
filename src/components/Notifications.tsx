import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Bell, 
  CheckCircle2, 
  AlertCircle, 
  Info,
  Clock,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Notifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { token } = useAuth();

  const fetchNotifs = async () => {
    try {
      const res = await fetch('/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setNotifications(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  const markAllRead = async () => {
    await fetch('/api/notifications/read-all', {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchNotifs();
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 bg-white border border-slate-200/60 rounded-2xl flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm active:scale-90 relative"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div 
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute right-0 mt-4 w-96 bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 z-50 overflow-hidden"
            >
              <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                   <h4 className="text-sm font-black text-slate-950 uppercase tracking-[0.2em]">Notifications</h4>
                   <span className="px-2 py-0.5 bg-indigo-600 text-white text-[8px] font-black rounded-full uppercase">Live</span>
                </div>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllRead}
                    className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest"
                  >
                    <Check size={10} />
                    Clear All
                  </button>
                )}
              </div>

              <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300">
                      <Bell size={24} />
                    </div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No signals detected</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {notifications.map((n) => (
                      <div key={n._id} className={`p-6 hover:bg-slate-50 transition-colors group relative ${!n.isRead ? 'bg-indigo-50/20' : ''}`}>
                        <div className="flex gap-4">
                          <div className={`p-2.5 rounded-xl shrink-0 h-fit ${
                            n.type === 'Success' ? 'bg-emerald-50 text-emerald-600' : 
                            n.type === 'Alert' ? 'bg-rose-50 text-rose-600' : 
                            'bg-indigo-50 text-indigo-600'
                          }`}>
                            {n.type === 'Success' ? <CheckCircle2 size={16} /> : 
                             n.type === 'Alert' ? <AlertCircle size={16} /> : <Info size={16} />}
                          </div>
                          <div className="space-y-1">
                            <h5 className="text-xs font-black text-slate-950 tracking-tight">{n.title}</h5>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed opacity-80">{n.message}</p>
                            <div className="flex items-center gap-2 pt-1">
                               <Clock size={10} className="text-slate-300" />
                               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                 {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                               </span>
                            </div>
                          </div>
                        </div>
                        {!n.isRead && (
                          <div className="absolute right-6 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <button className="w-full py-4 bg-slate-50 text-center border-t border-slate-100 text-[10px] font-black text-slate-400 hover:text-slate-950 transition-colors uppercase tracking-[0.2em]">
                View All Activity
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
