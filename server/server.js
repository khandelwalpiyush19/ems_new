import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./db/database.js";
import {errorHandler} from "./middlewares/errorHandler.js";
import { apiLimiter } from "./middlewares/rateLimiter.js";
import adminRouter from "./routes/Auth/AdminRoutes.js";
import employeeRouter from "./routes/Auth/EmployeeRoutes.js";
import leaveEmployeeRouter from "./routes/Employee/LeaveEmployeeRoutes.js"
import leaveAdminRouter from "./routes/Admin/LeaveAdminRoutes.js"
import projectRouter from "./routes/Admin/ProjectsRoutes.js"
import attendanceRouter from "./routes/Both/AttendaceRoutes.js"
import payrollRouter from "./routes/Admin/PayrollRoutes.js"
import profileDetailsRouter from "./routes/Employee/ProfileDetailsRoutes.js"
import notificationRouter from "./routes/Admin/NotificationRoutes.js"
import uploadRouter from "./routes/Both/UploadRoutes.js"
import forgotPasswordRouter from "./routes/Both/ForgotPasswordRoutes.js"
import taskRouter from "./routes/Both/TaskRoutes.js"




const app  = express();

dotenv.config();

const PORT = process.env.PORT || 5000

//mongoose connection
connectDB();

//middleware 
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(apiLimiter); // Apply rate limiting to all routes
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));








// -------- ADMIN ROUTES-------------
app.use("/api/v1/admin/auth",adminRouter);
app.use("/api/v1/admin/leave",leaveAdminRouter);
app.use("/api/v1/admin/project",projectRouter);
app.use("/api/v1/admin/payroll",payrollRouter);
 
// app.use("/api/v1/admin/profile-details",profileDetailsRouter);

// -------- EMPLOYEE ROUTES-------------
app.use("/api/v1/employee/auth",employeeRouter);
app.use("/api/v1/employee/leave",leaveEmployeeRouter);



// ----------------BOTH ROUTES ---------------
app.use("/api/v1/both/attendance",attendanceRouter);
app.use("/api/v1/both/notification",notificationRouter);
app.use("/api/v1/both/profile-details",profileDetailsRouter);
app.use("/api/v1/both/document",uploadRouter);
app.use("/api/v1/both/password",forgotPasswordRouter)
app.use("/api/v1/both/project-task",taskRouter)



//basic routes
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'API is running...',
        version: '1.0.0'
    });
});
// Handle 404 routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

//error handler
app.use(errorHandler);

app.get("/test", (req, res) => {
  res.send("API working correctly ✅");
});
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
}); 
