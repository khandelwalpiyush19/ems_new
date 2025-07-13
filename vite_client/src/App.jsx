import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Register from './Auth/Register';
import Login from './Auth/Login';
import DashboardAdmin from './Admin/DashboardAdmin';
import DashboardEmployee from './Employee/Dashboard/DashboardEmployee';
import Header from './Shared/Header'; // Import Header component
import AddEmployee from './Admin/Employee/AddEmployee'; // Import AddEmployee component
import AddProject from './Admin/project/AddProject'; // Import AddProject component
import ProjectCard from './Admin/project/ProjectCard'; // Import AddProject component
// import EmployeeDetails from './Admin/EmployeeDetail'; // Import EmployeeDetails component
import ProfileDetails from './Employee/Profile details/ProfileDetails'; // Import ProfileDetails component
import ContactDetails from './Employee/Profile details/ContactDetails';
import ProfileSidebar from './Employee/ProfileSidebar'; // Import ProfileSidebar component
import NextOfKinDetails from './Employee/Additional details/NextOfKinDetails';
import EducationQualifications from './Employee/Profile details/EducationQualifications';
import GuarantorDetails from './Employee/Additional details/GuarantorDetails';
import FamilyDetails from './Employee/Additional details/FamilyDetails';
import JobDetails from "./Employee/Additional details/JobDetails"
import FinancialDetails from './Employee/Profile details/FinancialDetails';
import DailyReport from './Others/DailyReport'; // Import DailyReport component
import AttendanceDashboard from './Both/AttendanceDashboard';
import EmployeePayroll from './Employee/EmployeePayroll';
import Leave from './Employee/Leave/LeaveApplication';
import LeaveManagement from './Admin/LeaveManagement';
import AdminPayroll from './Admin/Payroll/AdminPayroll';
import ProjectsPage from './/Admin/project/ProjectPage';
import ProjectDetailPage from './Admin/project/ProjectDetailPage';
import EmployeesPage from './Admin/Employee/EmployeesPage';
import UpdatePayroll from './Admin/Payroll/UpdatePayroll';
import MyLeavePage from './Employee/Leave/MyLeave';
import AttendanceStats from './Employee/Attendance/AttendanceStats';
import EmployeeDetailsPage from './Admin/Employee/EmployeeDetailsPage';
import ViewProfile from './Employee/Profile details/ViewProfile';
import TodayStatusComponent from './Admin/Attendance/TodayStatusComponent';
import AllAttendanceStatsComponent from './Admin/Attendance/AllAttendanceStatsComponent';
import ForgotPasswordEmail from './Both/ForgotPasswordEmail';
import ResetPassword from './Both/ResetPassword';
import NotFound from './Others/NotFound';
import EmployeeTasks from './Employee/Project/EmployeeTasks';
import EmployeeProjects from './Employee/Project/EmployeeProjects';
function App() {
    const location = useLocation();
    const hideHeaderRoutes = ['/', '/login', '/register']; // Routes where Header and Sidebar should not be shown
    const showSidebarRoutes = [
        '/profile-details',
        '/contact-details',
        '/next-of-kin-details',
        '/education-qualifications',
        '/guarantor-details',
        '/family-details',
        '/job-details',
        '/financial-details',
    ]; // Routes where ProfileSidebar should be shown

    const [activeSection, setActiveSection] = useState('Personal Details'); // Track active section

    return (
        <>
            {!hideHeaderRoutes.includes(location.pathname) && <Header />} {/* Conditionally render Header */}
            <div style={{ display: 'flex' }}>
                {showSidebarRoutes.includes(location.pathname) && (
                    <div style={{ width: '250px' }}>
                        <ProfileSidebar
                            activeSection={activeSection} // Pass active section
                            onSectionClick={setActiveSection} // Update active section
                        />
                    </div>
                )}
                <div style={{ flex: 1 }}>
                    <Routes>
                        <Route path="/" element={<Login />} /> {/* Set Login as the default route */}
                        <Route path="/register" element={<Register />} /> {/*Please comment this line to block the register page usage*/}
                        <Route path="/login" element={<Login />} />
                        <Route path="/dashboard-admin" element={<DashboardAdmin />} />
                        <Route path="/dashboard-employee" element={<DashboardEmployee />} />


                        <Route path="/add" element={<AddEmployee />} /> {/* Add route for AddEmployee */}
                        <Route path="/employees" element={<EmployeesPage />} /> {/* Add route for AddEmployee */}



                        <Route path="/add-employee" element={<AddEmployee />} /> {/* Add route for AddEmployee */}
                        <Route path="/add-project" element={<AddProject />} /> {/* Add route for AddProject */}
                        <Route path="/projects" element={<ProjectsPage />} /> {/* Add route for AddProject */}
                        <Route path="/projects/:id" element={<ProjectDetailPage />} />
                        <Route path="/view-profile" element={<ViewProfile />} />
                        <Route path="/employees/:employeeId" element={<EmployeeDetailsPage />} /> {/* Add route for EmployeeDetails */}
                        <Route path="/contact-details" element={<ContactDetails />} /> {/* Add route for ContactDetails */}
                        <Route path="/profile-details" element={<ProfileDetails />} /> {/* Add route for ProfileDetails */}
                        <Route path="/next-of-kin-details" element={<NextOfKinDetails />} />
                        <Route path="/education-qualifications" element={<EducationQualifications />} />
                        <Route path="/guarantor-details" element={<GuarantorDetails />} />
                        <Route path="/family-details" element={<FamilyDetails />} />
                        <Route path="/job-details" element={<JobDetails />} />
                        <Route path="/financial-details" element={<FinancialDetails />} />
                        <Route path="/leave" element={<Leave />} />
                        <Route path="/my-leave" element={<MyLeavePage />} />
                        <Route path="/attendance-stats" element={<AttendanceStats />} />

                        <Route path="/leave-management" element={<LeaveManagement />} />
                        <Route path="/daily-report" element={<DailyReport />} /> {/* Add route for DailyReport */}
                        <Route path="/attendance" element={<AttendanceDashboard />} />
                        {/* <Route path="/employee-payroll" element={<EmployeePayroll />} /> */}
                        <Route path="/admin-payroll" element={<AdminPayroll />} />
                        <Route path="/add-payroll" element={<UpdatePayroll />} />
                        <Route path="/today-attendance" element={<TodayStatusComponent />} />
                        <Route path="/all-attendance-history" element={<AllAttendanceStatsComponent />} />
                        <Route path="/forgot-password" element={<ForgotPasswordEmail />} />
                        <Route path="/reset-password/:token" element={<ResetPassword />} />

                        <Route path="/employee/projects" element={<EmployeeProjects />} />
                        <Route path="/employee/projects/:projectId" element={<EmployeeTasks />} />
                        <Route path="*" element={<NotFound />} />



                    </Routes>
                </div>
            </div>
        </>
    );
}

function AppWrapper() {
    return (
        <Router>
            <App />
        </Router>
    );
}

export default AppWrapper;
