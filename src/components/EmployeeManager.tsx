import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Users, 
  Plus, 
  Search, 
  X, 
  Edit3, 
  Trash2, 
  Loader2, 
  Mail, 
  Hash,
  Briefcase,
  Layers,
  DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function EmployeeManager() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<any>({
    name: '', email: '', employeeID: '', role: 'employee', 
    department: '', designation: '', salary: 0, gender: 'Male'
  });
  const { token } = useAuth();

  const fetchData = async () => {
    const [eRes, dRes] = await Promise.all([
      fetch('/api/employees', { headers: { 'Authorization': `Bearer ${token}` } }),
      fetch('/api/departments', { headers: { 'Authorization': `Bearer ${token}` } })
    ]);
    setEmployees(await eRes.json());
    setDepartments(await dRes.json());
    setIsLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/employees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(formData),
    });
    if (res.ok) {
      setIsModalOpen(false);
      fetchData();
    }
  };

  const filtered = employees.filter(e => 
    e.name.toLowerCase().includes(search.toLowerCase()) || 
    e.employeeID.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 text-left">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Employee Directory</h2>
          <p className="text-slate-500 font-medium tracking-tight">Manage your global workforce</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-slate-100"
        >
          <Plus size={20} /> Add Employee
        </button>
      </div>

      <div className="card-premium p-6">
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or Employee ID..."
            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="animate-spin text-indigo-600" size={32} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-slate-100">
                  <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Profile</th>
                  <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID</th>
                  <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</th>
                  <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</th>
                  <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(emp => (
                  <tr key={emp._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400">
                          {emp.name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{emp.name}</p>
                          <p className="text-xs text-slate-400 font-medium">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 font-mono text-xs text-slate-500">{emp.employeeID}</td>
                    <td className="py-5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${emp.role === 'admin' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                        {emp.role}
                      </span>
                    </td>
                    <td className="py-5 text-sm font-bold text-slate-700">{emp.department?.name || '---'}</td>
                    <td className="py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="p-2 text-slate-400 hover:text-indigo-600"><Edit3 size={16} /></button>
                        <button className="p-2 text-slate-400 hover:text-rose-600"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl p-8 my-8">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black text-slate-900 tracking-tight">New Workforce Entry</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-xl"><X size={20} /></button>
              </div>

              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input required className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 outline-none" value={formData.name} onChange={(e)=>setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                  <input required type="email" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 outline-none" value={formData.email} onChange={(e)=>setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Employee ID</label>
                  <input required className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 outline-none" value={formData.employeeID} onChange={(e)=>setFormData({...formData, employeeID: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Department</label>
                  <select className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 outline-none" value={formData.department} onChange={(e)=>setFormData({...formData, department: e.target.value})}>
                    <option value="">Select Dept</option>
                    {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Designation</label>
                  <input className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 outline-none" value={formData.designation} onChange={(e)=>setFormData({...formData, designation: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Base Salary</label>
                  <input type="number" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 outline-none" value={formData.salary} onChange={(e)=>setFormData({...formData, salary: Number(e.target.value)})} />
                </div>
                <div className="col-span-2">
                  <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold transition-all shadow-xl shadow-slate-200">Register Employee</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
