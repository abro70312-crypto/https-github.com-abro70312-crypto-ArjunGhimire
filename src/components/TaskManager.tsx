import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Plus, 
  Trash2, 
  Loader2, 
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function TaskManager() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'Medium',
    deadline: ''
  });
  const { user, token } = useAuth();

  const fetchData = async () => {
    try {
      const [tRes, eRes] = await Promise.all([
        fetch('/api/tasks', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/employees', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      setTasks(await tRes.json());
      setEmployees(await eRes.json());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(formData),
    });
    setIsModalOpen(false);
    setFormData({ title: '', description: '', assignedTo: '', priority: 'Medium', deadline: '' });
    fetchData();
  };

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status, completedAt: status === 'Completed' ? new Date() : null }),
    });
    fetchData();
  };

  const priorityColors: any = {
    Low: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    Medium: 'bg-amber-50 text-amber-600 border-amber-100',
    High: 'bg-rose-50 text-rose-600 border-rose-100',
    Critical: 'bg-slate-900 text-white border-slate-800'
  };

  if (isLoading) return <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>;

  return (
    <div className="space-y-8 text-left pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-black text-slate-950 tracking-tighter">Task Management</h2>
          <p className="text-slate-500 font-medium tracking-tight mt-1">Assign, track and optimize workflow precision</p>
        </div>
        {user?.role === 'admin' && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-slate-950 text-white rounded-2xl font-black flex items-center gap-2 hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 active:scale-95"
          >
            <Plus size={20} />
            Assign New Task
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {tasks.map((task) => (
          <motion.div 
            layout
            key={task._id}
            className="card-premium p-8 flex flex-col group hover:border-indigo-100"
          >
            <div className="flex justify-between items-start mb-6">
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${priorityColors[task.priority]}`}>
                {task.priority}
              </span>
              <div className="flex items-center gap-2 text-slate-400">
                <Clock size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  {new Date(task.deadline).toLocaleDateString()}
                </span>
              </div>
            </div>

            <h4 className="text-xl font-black text-slate-950 mb-3 tracking-tight group-hover:text-indigo-600 transition-colors">
              {task.title}
            </h4>
            <p className="text-sm text-slate-500 font-medium line-clamp-3 mb-8 flex-1 leading-relaxed">
              {task.description}
            </p>

            <div className="pt-6 border-t border-slate-50 mt-auto space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[10px] font-black text-indigo-600">
                    {task.assignedTo?.name[0]}
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900">{task.assignedTo?.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Assignee</p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${task.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                  {task.status}
                </div>
              </div>

              {task.assignedTo?._id === user?.id && task.status !== 'Completed' && (
                <button 
                  onClick={() => updateStatus(task._id, 'Completed')}
                  className="w-full py-3 bg-slate-50 text-slate-900 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all active:scale-95 border border-slate-100"
                >
                  Mark as Completed
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Audit Logs Trigger (Admin) */}
      {user?.role === 'admin' && (
        <div className="mt-20 pt-10 border-t border-slate-200">
           <div className="card-premium p-10 bg-slate-50/50 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                 <div className="p-4 bg-white rounded-3xl shadow-xl shadow-slate-200 text-slate-900">
                    <Layers size={32} />
                 </div>
                 <div>
                    <h3 className="text-2xl font-black text-slate-950 tracking-tight">System Audit Integrity</h3>
                    <p className="text-sm text-slate-500 font-medium">Review granular logs of all critical system actions and modifications.</p>
                 </div>
              </div>
              <button 
                onClick={() => window.location.href = '/audit-logs'}
                className="px-8 py-5 bg-white border border-slate-200 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-950 hover:text-white transition-all shadow-xl shadow-slate-100 flex items-center gap-3 active:scale-95 group"
              >
                Access Security Vault
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
           </div>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-950/40 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-2xl p-10">
              <h3 className="text-2xl font-black text-slate-950 tracking-tighter mb-8">Deploy New Directive</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Task Scope</label>
                  <input required placeholder="Project milestone or ticket item..." className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assign Force</label>
                  <select required className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:bg-white transition-all" value={formData.assignedTo} onChange={(e) => setFormData({...formData, assignedTo: e.target.value})}>
                    <option value="">Select Employee</option>
                    {employees.map(e => <option key={e._id} value={e._id}>{e.name} ({e.designation})</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Priority</label>
                    <select className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:bg-white transition-all" value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})}>
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                      <option>Critical</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Deadline Date</label>
                    <input type="date" required className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:bg-white transition-all" value={formData.deadline} onChange={(e) => setFormData({...formData, deadline: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Operational Details</label>
                  <textarea rows={4} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium text-slate-700 outline-none focus:bg-white transition-all resize-none" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                </div>
                <button type="submit" className="w-full py-5 bg-slate-950 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-indigo-600 transition-all active:scale-95">Deploy Task</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
