import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import AttendanceTracker from './components/AttendanceTracker';
import LeaveManager from './components/LeaveManager';
import TaskManager from './components/TaskManager';
import AuditLogs from './components/AuditLogs';
import AdminPanel from './components/AdminPanel';
import Login from './components/Login';
import DepartmentManager from './components/DepartmentManager';
import EmployeeManager from './components/EmployeeManager';
import SalaryManager from './components/SalaryManager';
import Settings from './components/Settings';
import { Loader2 } from 'lucide-react';

function AppRoutes() {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/attendance" element={<AttendanceTracker />} />
        <Route path="/tasks" element={<TaskManager />} />
        <Route path="/leave" element={<LeaveManager />} />
        <Route path="/settings" element={<Settings />} />
        
        {user?.role === 'admin' && (
          <>
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/audit-logs" element={<AuditLogs />} />
            <Route path="/departments" element={<DepartmentManager />} />
            <Route path="/employees" element={<EmployeeManager />} />
            <Route path="/salary" element={<SalaryManager />} />
          </>
        )}
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
