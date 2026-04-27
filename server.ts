import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_KEY || "ems-secret-2024";

app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URL || "mongodb://localhost:27017/EmployeeManagmentSystem";

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB successfully.");
    bootstrapAdmin();
  })
  .catch((err) => {
    console.error("CRITICAL ERROR: MongoDB connection failed.");
    console.error("--------------------------------------------------");
    console.error("The error was:", err.message);
    try {
      const url = new URL(MONGODB_URI);
      console.error("Target Host:", url.hostname);
      if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
        console.error("ACTION REQUIRED: Localhost connections are not supported in this cloud environment.");
        console.error("Please provide a remote MongoDB URI (e.g., MongoDB Atlas) in your MONGODB_URL environment variable.");
      }
    } catch (e) {
      console.error("Invalid MONGODB_URL format provided.");
    }
    console.error("--------------------------------------------------");
  });

// Schemas
const DepartmentSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  createdAt: { type: Date, default: Date.now }
});

const EmployeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  employeeID: { type: String, required: true, unique: true },
  dob: String,
  gender: { type: String, enum: ["Male", "Female", "Other"] },
  maritalStatus: { type: String, enum: ["Single", "Married", "Other"] },
  designation: String,
  department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
  salary: { type: Number, default: 0 },
  role: { type: String, enum: ["admin", "employee"], default: "employee" },
  profileImage: String,
  leaveBalance: { type: Number, default: 20 },
  performanceScore: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const AttendanceSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  checkIn: String,
  checkOut: String,
  status: { type: String, enum: ["present", "absent", "late"], default: "present" },
});

const LeaveRequestSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  type: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  reason: String,
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  recommendation: {
    status: String,
    score: Number,
    reason: String,
  }
});

const SalaryHistorySchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  baseSalary: Number,
  allowances: Number,
  deductions: Number,
  netSalary: Number,
  payDate: { type: String, required: true }, // YYYY-MM
  createdAt: { type: Date, default: Date.now }
});

const Department = mongoose.model("Department", DepartmentSchema);
const Employee = mongoose.model("Employee", EmployeeSchema);
const Attendance = mongoose.model("Attendance", AttendanceSchema);
const LeaveRequest = mongoose.model("LeaveRequest", LeaveRequestSchema);
const SalaryHistory = mongoose.model("SalaryHistory", SalaryHistorySchema);

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  priority: { type: String, enum: ["Low", "Medium", "High", "Critical"], default: "Medium" },
  status: { type: String, enum: ["Todo", "In Progress", "Review", "Completed"], default: "Todo" },
  deadline: String,
  completedAt: Date,
  createdAt: { type: Date, default: Date.now }
});

const NotificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  title: String,
  message: String,
  type: { type: String, enum: ["Info", "Success", "Warning", "Alert"], default: "Info" },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const AuditLogSchema = new mongoose.Schema({
  action: String,
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  details: String,
  timestamp: { type: Date, default: Date.now }
});

const Task = mongoose.model("Task", TaskSchema);
const Notification = mongoose.model("Notification", NotificationSchema);
const AuditLog = mongoose.model("AuditLog", AuditLogSchema);

// Utils
async function createAuditLog(action: string, userId: string, details: string) {
  try {
    const log = new AuditLog({ action, performedBy: userId, details });
    await log.save();
  } catch (e) {
    console.error("Audit log error:", e);
  }
}

async function createNotification(recipient: string, title: string, message: string, type: string = "Info") {
  try {
    const notif = new Notification({ recipient, title, message, type });
    await notif.save();
  } catch (e) {
    console.error("Notification error:", e);
  }
}

// Bootstrap admin
async function bootstrapAdmin() {
  const adminExists = await Employee.findOne({ role: "admin" });
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    const admin = new Employee({
      name: "System Admin",
      email: "admin@ems.com",
      password: hashedPassword,
      employeeID: "EMP001",
      role: "admin",
      department: null
    });
    await admin.save();
    console.log("Bootstrap admin created: admin@ems.com / admin123");
  }

  const userExists = await Employee.findOne({ email: "user@ems.com" });
  if (!userExists) {
    const hashedPassword = await bcrypt.hash("123456", 10);
    const user = new Employee({
      name: "Sample Employee",
      email: "user@ems.com",
      password: hashedPassword,
      employeeID: "EMP002",
      role: "employee",
      department: null
    });
    await user.save();
    console.log("Bootstrap user created: user@ems.com / 123456");
  }
}

// Auth Middleware
const authenticate = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Access denied" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// --- AUTH ROUTES ---
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  
  // Check if DB is connected
  if (mongoose.connection.readyState !== 1) {
    console.error("Database not ready. Current state:", mongoose.connection.readyState);
    return res.status(500).json({ error: "Database connection is not active. Please ensure your MongoDB URL is correct." });
  }

  try {
    console.log(`Login attempt for: ${email}`);
    const user = await Employee.findOne({ email }).populate("department");
    
    if (!user) {
      console.warn(`User not found: ${email}`);
      return res.status(404).json({ error: "User not found" });
    }

    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) {
      console.warn(`Invalid password for: ${email}`);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET);
    console.log(`Login successful: ${email} (${user.role})`);

    await createAuditLog("LOGIN", user._id.toString(), `Access granted via portal entry`);

    res.json({ token, user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department ? (user.department as any).name : "N/A",
      employeeID: user.employeeID
    }});
  } catch (err) {
    console.error("Login route error:", err);
    res.status(500).json({ error: `Server error: ${err instanceof Error ? err.message : 'Unknown error'}` });
  }
});

// --- TASK ROUTES ---
app.get("/api/tasks", authenticate, async (req: any, res) => {
  const query: any = req.user.role === 'admin' ? {} : { assignedTo: req.user.id };
  const tasks = await Task.find(query).populate("assignedTo assignedBy").sort({ createdAt: -1 });
  res.json(tasks);
});

app.post("/api/tasks", authenticate, async (req: any, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'manager') return res.status(403).json({ error: "Forbidden" });
  const task = new Task({ ...req.body, assignedBy: req.user.id });
  await task.save();
  
  await createNotification(req.body.assignedTo, "New Task Assigned", `Task: ${req.body.title}`, "Info");
  await createAuditLog("TASK_CREATE", req.user.id, `Created task: ${task.title}`);
  
  res.json(task);
});

app.put("/api/tasks/:id", authenticate, async (req: any, res) => {
  const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (req.body.status === 'Completed' && task) {
    await createNotification(task.assignedBy.toString(), "Task Completed", `Employee completed: ${task.title}`, "Success");
  }
  res.json(task);
});

// --- NOTIFICATION ROUTES ---
app.get("/api/notifications", authenticate, async (req: any, res) => {
  const notifs = await Notification.find({ recipient: req.user.id }).sort({ createdAt: -1 }).limit(20);
  res.json(notifs);
});

app.put("/api/notifications/read-all", authenticate, async (req: any, res) => {
  await Notification.updateMany({ recipient: req.user.id, isRead: false }, { isRead: true });
  res.json({ success: true });
});

// --- AUDIT LOGS ---
app.get("/api/audit-logs", authenticate, async (req: any, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: "Unauthorized" });
  const logs = await AuditLog.find().populate("performedBy").sort({ timestamp: -1 }).limit(50);
  res.json(logs);
});

// --- ADMIN STATS ---
app.get("/api/admin/metrics", authenticate, async (req: any, res: any) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Unauthorized" });
  
  const totalEmployees = await Employee.countDocuments();
  const totalDepartments = await Department.countDocuments();
  const currentMonth = new Date().toISOString().slice(0, 7);
  const salarySum = await SalaryHistory.aggregate([
    { $match: { payDate: currentMonth } },
    { $group: { _id: null, total: { $sum: "$netSalary" } } }
  ]);
  const leaves = await LeaveRequest.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } }
  ]);

  res.json({
    totalEmployees,
    totalDepartments,
    monthlyPayroll: salarySum[0]?.total || 0,
    leaves: {
      approved: leaves.find(l => l._id === "approved")?.count || 0,
      pending: leaves.find(l => l._id === "pending")?.count || 0,
      rejected: leaves.find(l => l._id === "rejected")?.count || 0
    }
  });
});

// --- DEPARTMENT CRUD ---
app.get("/api/departments", authenticate, async (req, res) => {
  const departments = await Department.find();
  res.json(departments);
});

app.post("/api/departments", authenticate, async (req: any, res: any) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Unauthorized" });
  const dept = new Department(req.body);
  await dept.save();
  res.status(201).json(dept);
});

app.put("/api/departments/:id", authenticate, async (req, res) => {
  const dept = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(dept);
});

app.delete("/api/departments/:id", authenticate, async (req, res) => {
  await Department.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

// --- EMPLOYEE CRUD ---
app.get("/api/employees", authenticate, async (req, res) => {
  const query: any = req.query.search ? { employeeID: req.query.search as string } : {};
  const employees = await Employee.find(query).populate("department");
  res.json(employees);
});

app.post("/api/employees", authenticate, async (req: any, res: any) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Unauthorized" });
  const hashedPassword = await bcrypt.hash(req.body.password || "123456", 10);
  const employee = new Employee({ ...req.body, password: hashedPassword });
  await employee.save();
  res.status(201).json(employee);
});

app.get("/api/employees/:id", authenticate, async (req, res) => {
  const employee = await Employee.findById(req.params.id).populate("department");
  const salaryHistory = await SalaryHistory.find({ employeeId: req.params.id });
  const leaveHistory = await LeaveRequest.find({ employeeId: req.params.id });
  res.json({ ...employee?.toObject(), salaryHistory, leaveHistory });
});

// --- SALARY & RECOMMENDATIONS ---
app.get("/api/recommendations/salary", authenticate, async (req, res) => {
  const employees = await Employee.find().populate("department");
  const recs = await Promise.all(employees.map(async emp => {
    const attendance = await Attendance.countDocuments({ employeeId: emp._id, status: "present" });
    const score = Math.min(100, attendance * 10); // Simplified scoring
    return { name: emp.name, score, recommendation: score > 80 ? "10% Increment" : "Standard" };
  }));
  res.json(recs);
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => res.sendFile(path.join(distPath, "index.html")));
  }
  app.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));
}

startServer();
