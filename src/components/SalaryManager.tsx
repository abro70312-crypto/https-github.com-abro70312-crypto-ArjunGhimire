import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  DollarSign, 
  Send, 
  TrendingUp, 
  History, 
  Search, 
  Loader2,
  CalendarCheck,
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';

export default function SalaryManager() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEmp, setSelectedEmp] = useState<any>(null);
  const [formData, setFormData] = useState({
    baseSalary: 0,
    allowances: 0,
    deductions: 0,
    payDate: new Date().toISOString().slice(0, 7)
  });
  const { token } = useAuth();

  useEffect(() => {
    fetch('/api/employees', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        setEmployees(data);
        setIsLoading(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const netSalary = formData.baseSalary + formData.allowances - formData.deductions;
    
    await fetch('/api/salary/record', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ 
        ...formData, 
        employeeId: selectedEmp._id,
        netSalary 
      }),
    });
    
    alert('Salary record created successfully');
    setSelectedEmp(null);
  };

  const filtered = employees.filter(e => 
    e.name.toLowerCase().includes(search.toLowerCase()) || 
    e.employeeID.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 text-left">
      <div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Payroll Management</h2>
        <p className="text-slate-500 font-medium tracking-tight">Process payments and analyze performance-based adjustments</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Employee Selector */}
        <div className="lg:col-span-5 space-y-6">
          <div className="card-premium p-6">
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search employee..."
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {isLoading ? (
                <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>
              ) : (
                filtered.map(emp => (
                  <button 
                    key={emp._id}
                    onClick={() => {
                      setSelectedEmp(emp);
                      setFormData({ ...formData, baseSalary: emp.salary });
                    }}
                    className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center gap-4 ${selectedEmp?._id === emp._id ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100' : 'bg-white border-slate-100 hover:border-indigo-200'}`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${selectedEmp?._id === emp._id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'}`}>
                      {emp.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-black">{emp.name}</p>
                      <p className={`text-[10px] font-bold uppercase tracking-widest ${selectedEmp?._id === emp._id ? 'text-white/60' : 'text-slate-400'}`}>
                        {emp.department?.name || 'No Dept'} • {emp.employeeID}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Processing Form */}
        <div className="lg:col-span-7">
          {selectedEmp ? (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card-premium p-8">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <DollarSign size={24} className="text-indigo-600" />
                  Process Payment
                </h3>
                <span className="px-4 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-full uppercase tracking-widest border border-emerald-100">
                  Ready to process
                </span>
              </div>

              <div className="p-6 bg-indigo-50 rounded-3xl mb-8 border border-indigo-100">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Active Performance Multiplier</p>
                <div className="flex items-end justify-between">
                  <h4 className="text-2xl font-black text-indigo-900">{selectedEmp.name}</h4>
                  <div className="text-right">
                    <p className="text-2xl font-black text-indigo-600">{selectedEmp.performanceScore}%</p>
                    <p className="text-[10px] font-bold text-indigo-400">Score Indicator</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Base Salary ($)</label>
                    <input type="number" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 outline-none" value={formData.baseSalary} onChange={(e)=>setFormData({...formData, baseSalary: Number(e.target.value)})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Pay Period (Month)</label>
                    <input type="month" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 outline-none" value={formData.payDate} onChange={(e)=>setFormData({...formData, payDate: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Allowances / Bonuses</label>
                    <input type="number" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 outline-none" value={formData.allowances} onChange={(e)=>setFormData({...formData, allowances: Number(e.target.value)})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Deductions (Tax/Leave)</label>
                    <input type="number" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 outline-none" value={formData.deductions} onChange={(e)=>setFormData({...formData, deductions: Number(e.target.value)})} />
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Net Payable</p>
                    <h3 className="text-3xl font-black text-slate-900">${formData.baseSalary + formData.allowances - formData.deductions}</h3>
                  </div>
                  <button type="submit" className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">
                    <Send size={18} />
                    Confirm & Send
                  </button>
                </div>
              </form>
            </motion.div>
          ) : (
            <div className="h-full border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center p-12 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mb-6 text-slate-300">
                <Receipt size={40} />
              </div>
              <h4 className="text-xl font-black text-slate-900 mb-2">Process Registry</h4>
              <p className="text-sm text-slate-400 max-w-xs font-medium">Select an employee from the directory to process their monthly salary and view performance scores.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Receipt({ size }: any) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-receipt">
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z" />
      <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
      <path d="M12 17.5v-11" />
    </svg>
  );
}
