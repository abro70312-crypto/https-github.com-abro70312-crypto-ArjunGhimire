import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  TrendingUp, 
  CalendarCheck, 
  Users, 
  ArrowRight, 
  Check, 
  X, 
  Info,
  Users2,
  Building2,
  Receipt,
  FileClock,
  Search,
  Plus,
  Loader2,
  ShieldCheck,
  Layers,
  Clock
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

export default function AdminPanel() {
  const [metrics, setMetrics] = useState<any>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [salaryRecs, setSalaryRecs] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { 'Authorization': `Bearer ${token}` };
        const [mRes, eRes, sRes, lRes, tRes, logRes] = await Promise.all([
          fetch('/api/admin/metrics', { headers }),
          fetch('/api/employees', { headers }),
          fetch('/api/recommendations/salary', { headers }),
          fetch('/api/leaves', { headers }),
          fetch('/api/tasks', { headers }),
          fetch('/api/audit-logs', { headers }),
        ]);

        const [m, e, s, l, t, log] = await Promise.all([
          mRes.json(), eRes.json(), sRes.json(), lRes.json(), tRes.json(), logRes.json()
        ]);

        setMetrics(m);
        setEmployees(e);
        setSalaryRecs(s);
        setLeaves(l);
        setTasks(t);
        setLogs(log);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLeaveAction = async (id: string, status: string) => {
    await fetch(`/api/leaves/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status }),
    });
    // Refresh leaves
    const res = await fetch('/api/leaves', { headers: { 'Authorization': `Bearer ${token}` } });
    setLeaves(await res.json());
  };

  if (isLoading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Admin Console</h2>
          <p className="text-slate-500 font-medium tracking-tight">System stats & intelligence engine v2.1</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<Users2 />} label="Total Employees" value={metrics?.totalEmployees} color="indigo" />
        <StatCard icon={<Building2 />} label="Departments" value={metrics?.totalDepartments} color="emerald" />
        <StatCard icon={<Receipt />} label="Monthly Payroll" value={`$${metrics?.monthlyPayroll.toLocaleString()}`} color="amber" />
        <StatCard icon={<FileClock />} label="Pending Leaves" value={metrics?.leaves.pending} color="rose" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Operational Intelligence Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="card-premium p-8 h-full bg-slate-950 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600/20 blur-[80px] rounded-full" />
            
            <div className="relative z-10">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-10">Real-time Signals</h3>
              
              <div className="space-y-10">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                     <p className="text-[10px] font-black text-white uppercase tracking-widest">Active Directives</p>
                     <span className="text-[10px] font-black text-indigo-400">{tasks.filter(t => t.status !== 'Completed').length} Pending</span>
                  </div>
                  <div className="space-y-2">
                    {tasks.slice(0, 3).map((task, i) => (
                      <div key={i} className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between group hover:bg-white/10 transition-all cursor-pointer" onClick={() => navigate('/tasks')}>
                         <span className="text-[11px] font-medium text-slate-300 truncate pr-4">{task.title}</span>
                         <div className={`w-1.5 h-1.5 rounded-full ${task.priority === 'High' ? 'bg-rose-500' : 'bg-indigo-500'}`} />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-white/5">
                   <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black text-white uppercase tracking-widest">Security Stream</p>
                      <button onClick={() => navigate('/audit-logs')} className="text-[10px] font-black text-slate-500 hover:text-indigo-400 uppercase tracking-widest transition-colors">View Vault</button>
                   </div>
                   <div className="space-y-3">
                      {logs.slice(0, 3).map((log, i) => (
                        <div key={i} className="flex gap-3">
                           <div className="w-1 h-8 bg-indigo-600 rounded-full shrink-0" />
                           <div>
                              <p className="text-[10px] font-black text-white uppercase tracking-tight">{log.action}</p>
                              <p className="text-[9px] text-slate-500 font-medium truncate w-48">{log.details}</p>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              </div>

              <div className="mt-12 p-6 bg-white/5 rounded-[2rem] border border-white/5 backdrop-blur-md">
                 <div className="flex items-center gap-3 mb-4">
                    <ShieldCheck className="text-indigo-400" size={16} />
                    <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Integrity Factor</h4>
                 </div>
                 <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '94%' }}
                      className="h-full bg-indigo-600"
                    />
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Leave Approvals & Performance Index */}
        <div className="lg:col-span-8 space-y-8">
          <div className="card-premium p-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <CalendarCheck size={18} className="text-indigo-600" />
                Smart Leave Approvals
              </h3>
              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-[10px] font-black rounded-full uppercase tracking-widest">AI Engine Active</span>
            </div>
            
            <div className="space-y-4">
              {leaves.filter(l => l.status === 'pending').slice(0, 3).map((req, i) => (
                <div key={i} className="p-5 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-white hover:shadow-lg transition-all">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center font-black text-slate-900 text-sm">
                      {req.employeeId?.name[0]}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{req.employeeId?.name}</p>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{req.type} • {req.startDate}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-8 w-full md:w-auto">
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">
                        {req.reason}
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleLeaveAction(req._id, 'approved')}
                        className="p-2.5 bg-white border border-slate-200 text-slate-400 rounded-lg hover:text-emerald-600 hover:border-emerald-600 transition-all"
                      >
                        <Check size={20} />
                      </button>
                      <button 
                        onClick={() => handleLeaveAction(req._id, 'rejected')}
                        className="p-2.5 bg-white border border-slate-200 text-slate-400 rounded-lg hover:text-rose-600 hover:border-rose-600 transition-all"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {leaves.filter(l => l.status === 'pending').length === 0 && (
                <p className="text-center py-8 text-slate-400 font-medium text-sm">No pending leave requests.</p>
              )}
            </div>
          </div>

          <div className="card-premium p-8 overflow-hidden">
             <div className="flex justify-between items-center mb-8">
               <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp size={18} className="text-indigo-600" />
                  Employee Performance Index
               </h3>
             </div>
             
             <div className="overflow-x-auto">
               <table className="w-full">
                 <thead>
                   <tr className="text-left">
                     <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee Profile</th>
                     <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</th>
                     <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Efficiency</th>
                     <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Status</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {employees.slice(0, 5).map((e, i) => (
                     <tr key={i} className="group hover:bg-slate-50 transition-colors">
                       <td className="py-5 pr-4">
                         <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500">
                             {e.name.split(' ').map((n:any)=>n[0]).join('')}
                           </div>
                           <div>
                             <p className="text-sm font-bold text-slate-900">{e.name}</p>
                             <p className="text-[10px] font-medium text-slate-400">{e.email}</p>
                           </div>
                         </div>
                       </td>
                       <td className="py-5 text-sm font-black text-slate-700">{e.department?.name || 'N/A'}</td>
                       <td className="py-5">
                         <div className="flex items-center gap-3">
                           <span className="text-sm font-black text-slate-900">{e.performanceScore}%</span>
                           <div className="flex-1 min-w-[60px] h-1.5 bg-slate-100 rounded-full">
                             <div 
                              className={`h-full rounded-full transition-all duration-1000 ${e.performanceScore > 90 ? 'bg-indigo-600' : e.performanceScore > 80 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                              style={{ width: `${e.performanceScore}%` }}
                             />
                           </div>
                         </div>
                       </td>
                       <td className="py-5 text-right">
                         <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100">
                           {e.role}
                         </span>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: any) {
  const colors: any = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    rose: 'bg-rose-50 text-rose-600',
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg transition-all cursor-default group">
      <div className={`w-12 h-12 rounded-2xl ${colors[color]} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
        {React.cloneElement(icon, { size: 24 })}
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <h3 className="text-2xl font-black text-slate-900 tracking-tight">{value}</h3>
    </div>
  );
}
