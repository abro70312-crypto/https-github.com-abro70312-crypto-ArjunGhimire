export interface Employee {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'employee';
  department: string;
  leaveBalance: number;
  performanceScore: number;
}

export interface Attendance {
  _id: string;
  employeeId: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: 'present' | 'absent' | 'late';
}

export interface LeaveRequest {
  _id: string;
  employeeId: string | Employee;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  recommendation?: {
    status: string;
    score: number;
    reason: string;
  };
}
