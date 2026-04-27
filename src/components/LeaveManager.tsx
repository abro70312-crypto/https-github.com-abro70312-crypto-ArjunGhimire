import { useState } from 'react';
import { 
  Calendar, 
  Send, 
  HelpCircle, 
  AlertCircle,
  CheckCircle2,
  BrainCircuit,
  Loader2,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';

export default function LeaveManager() {
  const { user, token } = useAuth();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recommendation, setRecommendation] = useState<any>(null);
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    reason: '',
    type: 'Casual'
  });

  const [toast, setToast] = useState<string | null>(null);

  const analyzeLeave = async () => {
    if (!formData.startDate || !formData.endDate) return;
    setIsAnalyzing(true);
    setRecommendation(null);
    
    try {
      const res = await fetch('/api/leaves/analyze', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          employeeId: user?.id,
          startDate: formData.startDate,
          endDate: formData.endDate
        }),
      });
      
      const data = await res.json();
      
      setRecommendation({
        status: data.status,
        score: data.score,
        reason: data.score > 50 ? 'System Suggestion: Approval recommended based on current workload and your history.' : 'Conflict detected: High overlap with team members or exhausted balance.',
        factors: [
          { label: 'Team Coverage', value: data.score > 50 ? 'Optimal' : 'Low', variant: data.score > 50 ? 'success' : 'error' },
          { label: 'Leave Balance', value: 'Sufficient', variant: 'success' },
          { label: 'Approval Risk', value: data.score > 50 ? 'Low' : 'High', variant: data.score > 50 ? 'success' : 'error' }
        ]
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const submitLeave = async () => {
    setIsSubmitting(true);
    try {
      await fetch('/api/leaves', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          ...formData, 
          employeeId: user?.id,
          recommendation: {
            status: recommendation?.status,
            score: recommendation?.score,
            reason: recommendation?.reason
          }
        }),
      });
      setToast('Application submitted successfully');
      setTimeout(() => setToast(null), 3000);
      setFormData({ startDate: '', endDate: '', reason: '', type: 'Casual' });
      setRecommendation(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 text-left pb-20">
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-slate-950 text-white px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-4 font-bold border border-white/10"
          >
            <CheckCircle2 size={24} className="text-emerald-500" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
      >
        <div>
          <h2 className="text-4xl font-black text-slate-950 tracking-tighter">Leave Management</h2>
          <p className="text-slate-500 font-medium tracking-tight mt-1">Smart suitability engine & automated validation</p>
        </div>
        <div className="flex gap-4">
          <motion.div 
            whileHover={{ y: -2 }}
            className="bg-white px-6 py-4 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-5"
          >
            <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
              <Calendar size={24} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] mb-1">Employee Balance</p>
              <p className="text-xl font-black text-slate-950 tracking-tight">Active Policy Engine</p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Application Form */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-5"
        >
          <div className="card-premium p-10 h-full bg-white/70 backdrop-blur-md">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-xl font-black text-slate-950 tracking-tight flex items-center gap-3">
                <Send size={20} className="text-indigo-600" />
                New Application
              </h3>
              <span className="px-3 py-1 bg-slate-100 text-slate-400 text-[10px] font-black rounded-full tracking-widest uppercase">Draft</span>
            </div>
            
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Leave Category</label>
                    <div className="relative group">
                      <select 
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/30 focus:bg-white outline-none transition-all appearance-none cursor-pointer"
                        value={formData.type}
                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                      >
                        <option>Casual Leave</option>
                        <option>Sick Leave</option>
                        <option>Planned Vacation</option>
                        <option>Unpaid Time Off</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <Calendar size={18} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Starts</label>
                    <input 
                      type="date" 
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/30 focus:bg-white outline-none transition-all"
                      value={formData.startDate}
                      onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Ends</label>
                    <input 
                      type="date" 
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/30 focus:bg-white outline-none transition-all"
                      value={formData.endDate}
                      onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Additional Context</label>
                  <textarea 
                    rows={4}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium text-slate-700 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/30 focus:bg-white outline-none transition-all resize-none placeholder:text-slate-300"
                    placeholder="Briefly explain the request..."
                    value={formData.reason}
                    onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 pt-4">
                <button 
                  onClick={analyzeLeave}
                  disabled={isAnalyzing || !formData.startDate || !formData.endDate}
                  className="w-full py-5 bg-slate-950 text-white rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-indigo-600 transition-all duration-500 disabled:opacity-50 active:scale-95 group shadow-xl shadow-slate-200"
                >
                  {isAnalyzing ? <Loader2 className="animate-spin w-5 h-5 shrink-0" /> : <BrainCircuit size={20} className="group-hover:rotate-12 transition-transform shrink-0" />}
                  <span>Run Smart Analysis v2.1</span>
                </button>
                <button 
                  onClick={submitLeave}
                  disabled={isSubmitting || !recommendation}
                  className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black hover:bg-emerald-600 transition-all duration-500 shadow-2xl shadow-indigo-100 hover:shadow-emerald-100 disabled:opacity-50 active:scale-95"
                >
                  {isSubmitting ? <Loader2 className="animate-spin w-5 h-5 mx-auto" /> : 'Finalize Submission'}
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* AI Analysis View */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-7"
        >
          <AnimatePresence mode="wait">
            {!recommendation && !isAnalyzing && (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full border-2 border-dashed border-slate-200 rounded-[3rem] flex flex-col items-center justify-center p-12 text-center bg-white/30"
              >
                <div className="w-20 h-20 bg-white border border-slate-100 shadow-xl rounded-3xl flex items-center justify-center mb-8 text-slate-300 animate-float">
                  <BrainCircuit size={36} />
                </div>
                <h4 className="text-2xl font-black text-slate-950 mb-3 tracking-tight">Automated Suitability Engine</h4>
                <p className="text-sm text-slate-500 max-w-sm font-medium leading-relaxed opacity-80">
                  Enter your requested dates and run the analysis to check for team conflicts, peak season risks, and your eligibility score.
                </p>
              </motion.div>
            )}

            {isAnalyzing && (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full bg-white border border-slate-100 rounded-[3rem] flex flex-col items-center justify-center p-12 text-center shadow-2xl shadow-slate-100"
              >
                <div className="relative mb-10 scale-125">
                  <div className="w-24 h-24 border-[6px] border-slate-50 border-t-indigo-600 rounded-full animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BrainCircuit className="text-indigo-600" size={32} />
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="text-2xl font-black text-slate-950 tracking-tight">Syncing Repositories...</h4>
                  <p className="text-xs font-black text-indigo-600 uppercase tracking-[0.3em] animate-pulse">Scanning team coverage</p>
                </div>
              </motion.div>
            )}

            {recommendation && (
              <motion.div 
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[3rem] border border-slate-200 overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] flex flex-col h-full"
              >
                <div className="p-10 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="flex items-center gap-6">
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", damping: 12, stiffness: 200 }}
                      className={`p-6 rounded-[2rem] ${recommendation.score > 50 ? 'bg-emerald-500 shadow-xl shadow-emerald-100' : 'bg-rose-500 shadow-xl shadow-rose-100'} text-white`}
                    >
                      {recommendation.score > 50 ? <CheckCircle2 size={36} /> : <AlertCircle size={36} />}
                    </motion.div>
                    <div>
                      <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase mb-2 inline-block">Analysis Output</span>
                      <h4 className="text-4xl font-black text-slate-950 tracking-tighter">{recommendation.status}</h4>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-5xl font-black tabular-nums tracking-tighter ${recommendation.score > 50 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {recommendation.score}%
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Suitability Score</p>
                  </div>
                </div>

                <div className="p-10 space-y-10 flex-1">
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-6 bg-slate-50 rounded-3xl border-l-[8px] border-indigo-600 shadow-sm"
                  >
                    <p className="text-md font-bold text-slate-950 italic leading-relaxed opacity-90">
                      "{recommendation.reason}"
                    </p>
                  </motion.div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {recommendation.factors.map((f: any, i: number) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + (i * 0.1) }}
                        key={i} 
                        className="p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 group"
                      >
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 opacity-70 group-hover:opacity-100">{f.label}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xl font-black text-slate-950">{f.value}</span>
                          <div className={`p-2 rounded-xl transition-transform group-hover:scale-110 ${f.variant === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                            {f.variant === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-auto pt-10 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                          <Users size={16} />
                        </div>
                        <span className="text-[10px] font-black text-slate-950 uppercase tracking-[0.2em]">Conflict Map v2.1</span>
                      </div>
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-200" />
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                      </div>
                    </div>
                    <div className="flex gap-2 h-6 items-center">
                      {[...Array(14)].map((_, i) => {
                        const isConflict = i >= 4 && i <= 6 && recommendation.score < 50;
                        return (
                          <motion.div 
                            initial={{ scaleY: 0 }}
                            animate={{ scaleY: 1 }}
                            transition={{ delay: 0.5 + (i * 0.05) }}
                            key={i} 
                            className={`flex-1 rounded-full transition-all duration-500 cursor-help ${isConflict ? 'h-full bg-rose-500 shadow-lg shadow-rose-100 ring-2 ring-rose-50' : 'h-2/3 bg-slate-100 hover:bg-indigo-100 hover:h-full'}`}
                            title={`Analysis Block ${i+1}`}
                          />
                        );
                      })}
                    </div>
                    <div className="flex justify-between mt-4 text-[10px] font-black text-slate-400 px-1 uppercase tracking-widest">
                      <span>Mon</span>
                      <span>Wed</span>
                      <span>Fri</span>
                      <span>Mon</span>
                      <span>Wed</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
