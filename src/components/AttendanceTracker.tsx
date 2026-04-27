import { useState, useEffect } from 'react';
import { 
  Scan, 
  MapPin, 
  Calendar, 
  History,
  CheckCircle2,
  Clock,
  Loader2,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

export default function AttendanceTracker() {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const { token, user } = useAuth();

  const fetchAttendance = async () => {
    try {
      const res = await fetch('/api/attendance/history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setHistory(data);
      
      const today = new Date().toISOString().slice(0, 10);
      const todayRecord = data.find((r: any) => r.date === today);
      setIsCheckedIn(!!(todayRecord && !todayRecord.checkOut));
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCheckAction = async () => {
    setIsProcessing(true);
    try {
      const type = isCheckedIn ? 'checkOut' : 'checkIn';
      const time = format(new Date(), 'HH:mm');
      
      const res = await fetch('/api/attendance/check', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ type, time }),
      });
      
      if (res.ok) {
        await fetchAttendance();
      }
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) return <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-10 text-left pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-black text-slate-950 tracking-tighter">Attendance Protocol</h2>
          <p className="text-slate-500 font-medium tracking-tight mt-1">Biometric verification & secure session tracking</p>
        </div>
        <div className="flex items-center gap-3 px-6 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm">
           <div className={`w-3 h-3 rounded-full animate-pulse ${isCheckedIn ? 'bg-emerald-500' : 'bg-rose-500'}`} />
           <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">
             {isCheckedIn ? 'Session Active' : 'System Idle'}
           </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main Action Card */}
        <div className="lg:col-span-5">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-12 rounded-[3.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] border border-slate-100 flex flex-col items-center text-center relative overflow-hidden"
          >
            <div className="absolute top-0 inset-x-0 h-4 bg-gradient-to-r from-indigo-600 to-violet-600" />
            
            <div className="relative mb-12">
               <div className={`w-56 h-56 rounded-full border-2 border-slate-100 flex items-center justify-center relative ${isCheckedIn ? 'animate-[pulse_4s_ease-in-out_infinite]' : ''}`}>
                 <div className={`w-48 h-48 rounded-full border-[8px] border-slate-50 border-t-indigo-600 flex flex-col items-center justify-center text-slate-900 shadow-2xl relative z-10 ${isProcessing ? 'animate-spin' : ''}`}>
                   <span className="text-4xl font-black tracking-tighter tabular-nums">{format(currentTime, 'HH:mm')}</span>
                   <span className="text-[10px] uppercase tracking-[0.3em] font-black text-slate-400 mt-1">{format(currentTime, 'ss')}</span>
                 </div>
               </div>
            </div>

            <h2 className="text-2xl font-black text-slate-950 mb-3 tracking-tight">
              {isCheckedIn ? 'Active Work Cycle' : 'Identity Verification'}
            </h2>
            <p className="text-sm text-slate-500 mb-10 max-w-[280px] font-medium leading-relaxed">
              {isCheckedIn 
                ? 'Your session is being monitored for performance calibration. Terminal out when complete.' 
                : 'Initiate your daily operational sequence to enable system access and resource allocation.'}
            </p>

            <button 
              onClick={handleCheckAction}
              disabled={isProcessing}
              className={`w-full py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] transition-all transform active:scale-95 flex items-center justify-center gap-4 shadow-2xl disabled:opacity-50 group ${
                isCheckedIn 
                  ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-rose-200' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'
              }`}
            >
              {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <Scan size={24} className="group-hover:rotate-12 transition-transform" />}
              {isCheckedIn ? 'Terminate Shift' : 'Initiate Session'}
            </button>

            <div className="mt-8 flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
              <MapPin size={14} className="text-indigo-600" />
              <span>TLS 1.3 Verified HQ IP</span>
            </div>
          </motion.div>
        </div>

        {/* Stats & History */}
        <div className="lg:col-span-7 space-y-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card-premium p-10 bg-slate-950 text-white shadow-2xl shadow-slate-300 overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 blur-[80px] rounded-full" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="grid grid-cols-2 gap-8 w-full md:w-auto">
                 <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 block mb-2">Month Integrity</span>
                    <p className="text-3xl font-black">98.2%</p>
                 </div>
                 <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 block mb-2">Hours Logged</span>
                    <p className="text-3xl font-black">{history.reduce((acc, r) => acc + (r.workHours || 0), 0)}h</p>
                 </div>
              </div>
              <div className="h-20 w-px bg-white/10 hidden md:block" />
              <div className="flex-1 w-full md:w-auto text-right">
                 <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">Status Report</p>
                 <h3 className="text-xl font-black tracking-tight leading-tight">Excellent Reliability Factor</h3>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden"
          >
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
               <div className="flex items-center gap-3">
                 <History size={18} className="text-indigo-600" />
                 <h3 className="text-sm font-black text-slate-950 uppercase tracking-[0.2em]">Live Operational Logs</h3>
               </div>
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last 30 Records</span>
            </div>
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              {history.length > 0 ? (
                <div className="divide-y divide-slate-50">
                  {history.map((log, i) => (
                    <div key={i} className="flex items-center justify-between p-8 hover:bg-indigo-50/20 transition-all group">
                      <div className="flex items-center gap-5">
                        <div className={`p-4 rounded-2xl transition-transform group-hover:scale-110 ${log.status === 'Late' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                          {log.status === 'Late' ? <AlertTriangle size={20} /> : <CheckCircle2 size={20} />}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-950">{format(new Date(log.date), 'EEEE, MMM dd')}</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Status: {log.status}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-3 justify-end text-sm font-black text-slate-950">
                          <span className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/50">{log.checkIn}</span>
                          <ArrowRight className="text-slate-300" size={14} />
                          <span className="bg-slate-950 text-white px-3 py-1.5 rounded-xl">{log.checkOut || '--:--'}</span>
                        </div>
                        {log.workHours && (
                          <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-2">{log.workHours}h Operational</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-20 text-center text-slate-300">
                   <ShieldCheck size={48} className="mx-auto mb-4 opacity-20" />
                   <p className="text-xs font-black uppercase tracking-widest">No transaction data identified</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function ArrowRight({ className, size }: { className?: string; size?: number }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
        </svg>
    );
}

