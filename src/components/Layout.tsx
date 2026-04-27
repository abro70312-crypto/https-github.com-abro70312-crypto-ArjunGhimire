import { ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UserCheck, 
  CalendarDays, 
  Users, 
  LogOut,
  ChevronRight,
  Building2,
  Users2,
  DollarSign,
  Settings as SettingsIcon,
  PieChart,
  ShieldCheck,
  Layers
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import Notifications from './Notifications';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path === '/attendance') return 'Attendance';
    if (path === '/leave') return 'Leave Management';
    if (path === '/admin') return 'Admin Portal';
    if (path === '/departments') return 'Departments';
    if (path === '/employees') return 'Workforce';
    if (path === '/salary') return 'Payroll';
    if (path === '/settings') return 'Security';
    return 'System';
  };

  return (
    <div className="flex h-screen bg-slate-50 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Sidebar Navigation */}
      <aside className="w-72 bg-white border-r border-slate-200/60 flex flex-col h-full overflow-hidden shadow-[1px_0_0_0_rgba(0,0,0,0.02)]">
        <div className="p-10">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-4 mb-10 group"
          >
            <div className="w-12 h-12 bg-slate-950 rounded-[1.25rem] flex items-center justify-center shadow-2xl shadow-indigo-200 group-hover:bg-indigo-600 transition-colors duration-500">
              <PieChart className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-950 tracking-tighter leading-none">Smart EMS</h1>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mt-1.5 italic">OS v2.1.0</p>
            </div>
          </motion.div>
        </div>

        <nav className="flex-1 px-6 space-y-1.5 overflow-y-auto custom-scrollbar pb-10">
          <p className="px-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 mt-2 ml-1 opacity-50">Main Deck</p>
          <NavItem to="/" icon={<LayoutDashboard size={20} />} label="Dashboard" />
          <NavItem to="/tasks" icon={<Layers size={20} />} label="Directives" />
          <NavItem to="/attendance" icon={<UserCheck size={20} />} label="Attendance" />
          <NavItem to="/leave" icon={<CalendarDays size={20} />} label="Leaves" />
          
          {user?.role === 'admin' && (
            <>
              <p className="px-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 mt-10 ml-1 opacity-50">Management</p>
              <NavItem to="/admin" icon={<Users size={20} />} label="Analytics" />
              <NavItem to="/audit-logs" icon={<ShieldCheck size={20} />} label="Security Vault" />
              <NavItem to="/departments" icon={<Building2 size={20} />} label="Departments" />
              <NavItem to="/employees" icon={<Users2 size={20} />} label="Workforce" />
              <NavItem to="/salary" icon={<DollarSign size={20} />} label="Payroll" />
            </>
          )}

          <p className="px-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 mt-10 ml-1 opacity-50">Account</p>
          <NavItem to="/settings" icon={<SettingsIcon size={20} />} label="Security" />
        </nav>

        <div className="p-6 mt-auto border-t border-slate-100 bg-slate-50/30">
          <div className="p-5 bg-white rounded-[2rem] border border-slate-200/60 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-12 h-12 bg-indigo-500/5 blur-2xl rounded-full" />
            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-1.5">
              {user?.role === 'admin' ? 'Root Access' : 'Node Verified'}
            </p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">TLS 1.3 Encryption</p>
          </div>
          <button 
            onClick={logout}
            className="flex items-center gap-3 text-slate-400 hover:text-rose-600 transition-all w-full px-5 py-5 mt-4 text-xs font-black uppercase tracking-widest group border border-transparent hover:border-rose-100 hover:bg-rose-50 rounded-2xl active:scale-95"
          >
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span>Terminate Session</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full bg-[#FAFAFB] overflow-hidden">
        <header className="h-24 bg-white/50 backdrop-blur-2xl border-b border-slate-200/60 px-10 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center text-slate-400 text-xs font-black gap-3">
            <span className="hover:text-slate-600 cursor-pointer uppercase tracking-[0.2em] transition-colors">EMS</span>
            <ChevronRight size={14} className="opacity-30" />
            <span className="text-slate-950 uppercase tracking-[0.2em] font-black bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200/50">{getPageTitle()}</span>
          </div>
          
          <div className="flex items-center gap-6">
            <Notifications />
            <div className="text-right hidden md:block">
              <p className="text-md font-black text-slate-950 tracking-tight leading-none">{user?.name}</p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-indigo-600 font-black mt-2 bg-indigo-50 px-3 py-0.5 rounded-full inline-block">
                {user?.role === 'admin' ? 'Senior Operator' : `Tier 1: ${user?.department}`}
              </p>
            </div>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-12 h-12 rounded-[1.25rem] bg-indigo-600 p-[2px] shadow-2xl shadow-indigo-200 cursor-pointer overflow-hidden ring-4 ring-white"
            >
              <div className="w-full h-full rounded-[1.125rem] overflow-hidden bg-white">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`} alt="Avatar" className="w-full h-full object-cover" />
              </div>
            </motion.div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 lg:p-14 custom-scrollbar bg-gradient-to-br from-transparent to-indigo-500/[0.02]">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}

function NavItem({ to, icon, label }: { to: string, icon: any, label: string }) {
  return (
    <NavLink 
      to={to} 
      className={({ isActive }) => 
        `flex items-center gap-4 px-5 py-4 rounded-[1.5rem] text-sm font-black transition-all duration-500 group relative overflow-hidden ${
          isActive 
            ? 'bg-slate-950 text-white shadow-[0_20px_40px_-12px_rgba(15,23,42,0.3)]' 
            : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'
        }`
      }
    >
      <div className="relative z-10 flex items-center gap-4">
        <span className={`inline-flex shrink-0 transition-transform duration-500 group-hover:scale-110 group-active:scale-90`}>{icon}</span>
        <span className="tracking-tight uppercase tracking-[0.05em] text-xs transition-transform duration-500 group-hover:translate-x-1">{label}</span>
      </div>
    </NavLink>
  );
}
