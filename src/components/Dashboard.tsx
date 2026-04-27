import { 
  TrendingUp, 
  Users, 
  Calendar, 
  Clock,
  ArrowUpRight,
  Loader2,
  Trophy,
  Activity,
  CalendarCheck,
  Layers,
  ChevronRight,
  Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, token } = useAuth();
  const [metrics, setMetrics] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
       try {
          const headers = { 'Authorization': `Bearer ${token}` };
          const taskRes = await fetch('/api/tasks', { headers });
          setTasks(await taskRes.json());

          if (user?.role === 'admin') {
            const metricRes = await fetch('/api/admin/metrics', { headers });
            setMetrics(await metricRes.json());
          }
       } finally {
          setIsLoading(false);
       }
    };
    fetchData();
  }, [user, token]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left pb-12">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
      >
        <div>
          <h2 className="text-4xl font-black text-slate-950 tracking-tighter">
            Welcome, {user?.name.split(' ')[0]}
          </h2>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-slate-500 font-medium tracking-tight">
              {user?.role === 'admin' ? 'Monitoring organization health' : `Viewing stats for ${user?.department} Team`}
            </p>
          </div>
        </div>
        <motion.div 
          className="flex gap-3"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <button 
            onClick={() => navigate('/attendance')}
            className="bg-white border text-slate-700 border-slate-200 px-6 py-3 rounded-2xl font-bold hover:bg-slate-50 transition-all text-sm shadow-sm hover:shadow-md active:scale-95"
          >
            Clock In
          </button>
          <button className="bg-slate-950 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-600 transition-all text-sm shadow-xl shadow-slate-200 hover:shadow-indigo-500/20 active:scale-95">
            Create Report
          </button>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {user?.role === 'admin' ? (
          <>
            <StatCard index={0} title="Workforce" value={metrics?.totalEmployees} suffix="Members" icon={<Users className="text-indigo-600" size={20} />} />
            <StatCard index={1} title="Depts" value={metrics?.totalDepartments} suffix="Active" icon={<TrendingUp className="text-emerald-600" size={20} />} />
            <StatCard index={2} title="Salary Index" value={`$${(metrics?.monthlyPayroll / 1000).toFixed(1)}k`} suffix="Month" icon={<Activity className="text-amber-600" size={20} />} />
            <StatCard index={3} title="Leaves" value={metrics?.leaves.pending} suffix="Review" icon={<Calendar className="text-rose-600" size={20} />} />
          </>
        ) : (
          <>
            <StatCard index={0} title="Directives" value={tasks.filter(t => t.status !== 'Completed').length} suffix="Active" icon={<Layers className="text-indigo-600" size={20} />} />
            <StatCard index={1} title="Efficiency" value="88" suffix="%" icon={<Trophy className="text-emerald-600" size={20} />} />
            <StatCard index={2} title="On Time" value="94" suffix="%" icon={<Clock className="text-amber-600" size={20} />} />
            <StatCard index={3} title="Projects" value="04" suffix="Active" icon={<Target className="text-rose-600" size={20} />} />
          </>
        )}
      </div>

      <div className="grid grid-cols-12 gap-8 items-stretch">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="col-span-12 lg:col-span-8 card-premium p-0 bg-white/50 backdrop-blur-sm overflow-hidden flex flex-col"
        >
          <div className="p-10 border-b border-slate-50 flex items-center justify-between">
             <div>
                <h3 className="text-xl font-black text-slate-950 tracking-tight">Assigned Directives</h3>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">High priority missions v2.1</p>
             </div>
             <button onClick={() => navigate('/tasks')} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:text-indigo-600 hover:bg-indigo-50 transition-all">
                <ChevronRight size={20} />
             </button>
          </div>
          
          <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-[450px] custom-scrollbar">
            {tasks.length > 0 ? (
               tasks.slice(0, 5).map((task, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + (i * 0.1) }}
                    key={task._id} 
                    className="p-6 bg-white border border-slate-100 rounded-[2rem] hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/5 transition-all group flex items-center justify-between"
                  >
                     <div className="flex items-center gap-5">
                        <div className={`p-4 rounded-2xl ${task.priority === 'High' ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'} transition-transform group-hover:scale-110`}>
                           <Target size={20} />
                        </div>
                        <div>
                           <h4 className="text-sm font-black text-slate-950 tracking-tight">{task.title}</h4>
                           <p className="text-xs text-slate-500 font-medium mt-1">Status: {task.status} | By {task.assignedBy?.name}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-4">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200/40">
                           {new Date(task.deadline).toLocaleDateString()}
                        </span>
                     </div>
                  </motion.div>
               ))
            ) : (
               <div className="h-64 flex flex-col items-center justify-center text-slate-300">
                  <Layers size={48} className="mb-4 opacity-20" />
                  <p className="text-[10px] font-black uppercase tracking-widest">No active directives</p>
               </div>
            )}
          </div>

          <div className="p-6 bg-slate-50 border-t border-slate-100">
             <button 
                onClick={() => navigate('/tasks')}
                className="w-full py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-950 hover:text-white transition-all shadow-sm active:scale-95"
              >
                Launch Unified Workspace
             </button>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="col-span-12 lg:col-span-4"
        >
          <div className="card-premium p-10 h-full bg-slate-950 text-white border-white/5 shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 blur-[100px] rounded-full" />
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-10 relative z-10">Security & Access</h3>
            <div className="space-y-10 relative z-10">
              <SecurityItem label="Identity Verified" status="Verified" type="success" dark />
              <SecurityItem label="Session Integrity" status="Active" type="success" dark />
              <SecurityItem label="Bio-Authentication" status="Enabled" type="success" dark />
              <SecurityItem label="Last Portal Login" status={new Date().toLocaleTimeString()} type="neutral" dark />
            </div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="mt-14 p-8 bg-white/5 rounded-3xl border border-white/5 backdrop-blur-md relative overflow-hidden group"
            >
               <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 blur-3xl rounded-full" />
               <div className="flex items-center gap-3 mb-6">
                 <div className="p-2.5 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-500/20 group-hover:rotate-12 transition-transform">
                   <Activity size={18} />
                 </div>
                 <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Efficiency Insight</h4>
               </div>
               <p className="text-xs text-slate-300 font-semibold leading-relaxed font-italic italic opacity-90">
                 "Strategic micro-breaks identified to increase focus by 14% for your current role profile."
               </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function StatCard({ title, value, suffix, icon, index }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      className="card-premium p-8 group hover:-translate-y-1"
    >
      <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 w-fit mb-8 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors">
        {icon}
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-3 opacity-70">{title}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-black text-slate-950 tabular-nums tracking-tighter">
          {typeof value === 'number' ? <Counter value={value} /> : value}
        </span>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{suffix}</span>
      </div>
    </motion.div>
  );
}

function Counter({ value }: { value: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    const duration = 1500;
    const increment = end / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    
    return () => clearInterval(timer);
  }, [value]);

  return <>{count}</>;
}

function SecurityItem({ label, status, type, dark }: any) {
  const dotColor = type === 'success' ? 'bg-emerald-500' : 'bg-indigo-500';

  return (
    <div className="flex items-center justify-between group">
      <div>
        <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1.5 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
          {label}
        </p>
        <p className={`text-md font-black tracking-tight ${dark ? 'text-white' : 'text-slate-950'}`}>
          {status}
        </p>
      </div>
      <div className={`w-2.5 h-2.5 rounded-full ${dotColor} shadow-xl transition-all duration-300 group-hover:scale-150 ${type === 'success' ? 'shadow-emerald-500/20' : 'shadow-indigo-500/20'}`} />
    </div>
  );
}
