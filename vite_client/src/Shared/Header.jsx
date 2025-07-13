import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { FaBell, FaEnvelope, FaUserCircle, FaBars, FaTimes, FaHome, FaMoneyBill, FaCalendarAlt, FaCog, FaSignOutAlt } from "react-icons/fa";
import { FaPeopleGroup } from "react-icons/fa6";
import { IoIosArrowBack } from "react-icons/io";
import { CgProfile } from "react-icons/cg";
import { VscProject } from "react-icons/vsc";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../context/Auth/authSlice";
import { IoBookmarks } from "react-icons/io5";
import { toast } from 'react-toastify';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

const Header = () => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [logoutModalOpen, setLogoutModalOpen] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();

    // Get user data from Redux store
    const { username, email } = useSelector((state) => state.auth.user || {});

    // Check screen size for responsive behavior
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1024);
            if (window.innerWidth >= 1024) {
                setMobileMenuOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleLogout = async () => {
        try {
            await dispatch(logoutUser(email)).unwrap();
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            localStorage.removeItem('email');
            toast.success('Logged out successfully');
            navigate('/login');
        } catch (error) {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            localStorage.removeItem('email');
            window.location.href = '/login';
        } finally {
            setLogoutModalOpen(false);
        }
    };

    const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
    const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
    const openLogoutModal = () => setLogoutModalOpen(true);
    const closeLogoutModal = () => setLogoutModalOpen(false);

    // Determine user type for navigation
    const isAdmin = email?.endsWith('@gmail.com');
    const isEmployee = email?.endsWith('@paarsiv.com');

    // Navigation items based on user role
    const adminNavItems = [
        { path: "/dashboard-admin", name: "Dashboard", icon: <FaHome /> },
        { path: "/leave-management", name: "Leave Management", icon: <FaCalendarAlt /> },
        { path: "/projects", name: "Projects", icon: <VscProject /> },
        { path: "/employees", name: "Employees", icon: <FaPeopleGroup /> },
        { path: "/today-attendance", name: "Attendance", icon: <IoBookmarks /> },
        { path: "/admin-payroll", name: "Payroll", icon: <FaMoneyBill /> },
        { path: "/admin-settings", name: "Settings", icon: <FaCog /> }
    ];

    const employeeNavItems = [
        { path: "/dashboard-employee", name: "Dashboard", icon: <FaHome /> },
        { path: "/attendance-stats", name: "Attendance", icon: <IoBookmarks /> },
        { path: "/employee/projects", name: "Projects", icon: <IoBookmarks /> },
        { path: "/my-leave", name: "Leave", icon: <FaCalendarAlt /> },
        { path: "/employee-payroll", name: "Payroll", icon: <FaMoneyBill /> },
        { path: "/profile-details", name: "Profile", icon: <CgProfile /> },
    ];

    const navItems = isAdmin ? adminNavItems : isEmployee ? employeeNavItems : [];

    // Highlight active route
    const isActive = (path) => location.pathname === path;

    // Logout Confirmation Modal
    const LogoutConfirmationModal = () => (
        <Transition appear show={logoutModalOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={closeLogoutModal}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-25" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <Dialog.Title
                                    as="h3"
                                    className="text-lg font-medium leading-6 text-gray-900"
                                >
                                    Confirm Logout
                                </Dialog.Title>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-500">
                                        Are you sure you want to logout?
                                    </p>
                                </div>

                                <div className="mt-4 flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                        onClick={closeLogoutModal}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className="inline-flex justify-center rounded-md border border-transparent bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                        onClick={handleLogout}
                                    >
                                        Logout
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );

    // Desktop Sidebar - Now non-minimizable
    const DesktopSidebar = () => (
        <div className="fixed top-0 left-0 h-full bg-gray-800 text-white w-64 flex flex-col z-40">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <h3 className="font-extrabold text-4xl">
                    <span className="text-green-500">p</span>
                    <span className="text-white">a</span>
                    <span className="text-white">a</span>
                    <span className="text-white">r</span>
                    <span className="text-green-500">s</span>
                    <span className="text-white">i</span>
                    <span className="text-white">v</span>
                </h3>
            </div>

            <nav className="mt-6 flex-1">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center p-4 transition-colors duration-200 ${isActive(item.path) ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
                    >
                        <span className="text-lg">{item.icon}</span>
                        <span className="ml-3">{item.name}</span>
                    </Link>
                ))}
            </nav>

            {/* Logout button at bottom */}
            <div className="p-4 border-t border-gray-700">
                <button
                    onClick={openLogoutModal}
                    className="flex items-center text-white hover:text-red-400 transition-colors duration-200 w-full"
                >
                    <FaSignOutAlt className="text-lg" />
                    <span className="ml-3">Logout</span>
                </button>
            </div>
        </div>
    );

    // Mobile Header
    const MobileHeader = () => (
        <header className="fixed top-0 left-0 right-0 bg-gray-700 text-white shadow-md z-30">
            <div className="flex justify-between items-center p-4">
                <button onClick={toggleMobileMenu} className="text-white focus:outline-none">
                    <FaBars />
                </button>

                <div className="flex items-center gap-4">
                    <div className="relative text-xl text-white cursor-pointer hover:text-blue-300 transition-colors">
                        <FaBell />
                    </div>

                    <div className="relative text-xl text-white cursor-pointer hover:text-blue-300 transition-colors">
                        <FaEnvelope />
                    </div>

                    <div className="relative">
                        <FaUserCircle
                            className="text-2xl text-white cursor-pointer hover:text-blue-300 transition-colors"
                            onClick={toggleDropdown}
                        />
                        {dropdownOpen && (
                            <div className="absolute top-full right-0 bg-white text-black rounded-lg shadow-lg p-2 z-50 w-48">
                                <div className="px-4 py-2 border-b border-gray-200">
                                    <p className="text-sm font-semibold text-gray-700">Welcome,</p>
                                    <p className="text-sm font-bold text-gray-900 truncate">{username}</p>
                                </div>
                                <button
                                    className="flex items-center w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50 rounded transition-colors"
                                    onClick={openLogoutModal}
                                >
                                    <FaSignOutAlt className="mr-2" />
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="bg-gray-800 text-white shadow-lg animate-slideDown">
                    <div className="px-4 py-3 border-b border-gray-700 flex justify-between items-center">
                        <h3 className="font-extrabold text-2xl">
                            <span className="text-green-500">p</span>
                            <span className="text-white">a</span>
                            <span className="text-white">a</span>
                            <span className="text-white">r</span>
                            <span className="text-green-500">s</span>
                            <span className="text-white">i</span>
                            <span className="text-white">v</span>
                        </h3>
                        <button onClick={toggleMobileMenu} className="text-white">
                            <FaTimes />
                        </button>
                    </div>
                    <nav className="flex flex-col">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center p-4 transition-colors duration-200 ${isActive(item.path) ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <span className="text-lg mr-3">{item.icon}</span>
                                <span>{item.name}</span>
                            </Link>
                        ))}
                    </nav>
                </div>
            )}
        </header>
    );

    return (
        <>
            {isMobile ? <MobileHeader /> : <DesktopSidebar />}

            {/* Add margin to main content for desktop sidebar */}
            {!isMobile && <div className="ml-64"></div>}

            {/* Add padding top for mobile header */}
            {isMobile && <div className="pt-16"></div>}

            {/* Logout Confirmation Modal */}
            <LogoutConfirmationModal />
        </>
    );
};

export default Header;