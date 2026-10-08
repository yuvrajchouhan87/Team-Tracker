import { useContext, useState, useRef, useEffect } from 'react';
import AuthContext from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LogOut, Sun, Moon, User, ChevronDown, Search, Bell, Menu, MessageSquare, UserCheck } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Breadcrumbs from './Breadcrumbs';

const API_BASE = 'https://team-tracker-dbzf.onrender.com';
const resolveAvatar = (avatarUrl) => {
    if (!avatarUrl) return '';
    if (avatarUrl.startsWith('http')) return avatarUrl;
    return `${API_BASE}${avatarUrl}`;
};

const TopHeader = () => {
    const { user, logout, searchQuery, setSearchQuery, setIsChatOpen, setIsSidebarOpen } = useContext(AuthContext);
    const { darkMode, toggleTheme } = useTheme();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);
    const [unreadChats, setUnreadChats] = useState(0);
    const dropdownRef = useRef(null);
    const notificationRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAllCounts = async () => {
            if (!user) return;
            try {
                if (user.role === 'SuperAdmin') {
                    const { data: users } = await axios.get(`${API_BASE}/api/auth/users`);
                    const pending = users.filter(u => u.status === 'Pending' && u.role !== 'SuperAdmin');
                    setPendingCount(pending.length);
                }

                const { data: tasks } = await axios.get(`${API_BASE}/api/tasks`);
                const totalUnread = tasks.reduce((sum, task) => sum + (task.unreadCount || 0), 0);
                setUnreadChats(totalUnread);
            } catch (error) {
                console.error('Error fetching notification counts', error);
            }
        };

        fetchAllCounts();
        const interval = setInterval(fetchAllCounts, 10000);
        return () => clearInterval(interval);
    }, [user]);

    const totalNotifications = pendingCount + unreadChats;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setIsNotificationsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="h-16 flex items-center justify-between px-4 lg:px-8 z-30 sticky top-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => setIsSidebarOpen(true)}
                    className="lg:hidden p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg transition-colors"
                    aria-label="Open sidebar"
                >
                    <Menu className="w-5 h-5" />
                </button>

                <div className="hidden sm:block">
                    <Breadcrumbs />
                </div>
            </div>
            
            <div className="flex items-center gap-3 sm:gap-4">
                {/* Global Search Bar */}
                <div className="relative hidden md:flex items-center w-64 lg:w-72">
                    <Search className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input 
                        type="text"
                        placeholder="Search tasks, members..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800/60 pl-9 pr-3 py-1.5 rounded-lg text-xs font-normal border border-slate-200 dark:border-slate-700/60 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                </div>
                
                {/* Theme Toggle Button */}
                <button
                    onClick={toggleTheme}
                    className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    aria-label="Toggle theme"
                >
                    {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
                </button>

                {/* Notifications Bell */}
                <div className="relative" ref={notificationRef}>
                    <button 
                        onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                        className="relative p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        aria-label="Notifications"
                    >
                        <Bell className="w-4 h-4" />
                        {totalNotifications > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full ring-2 ring-white dark:ring-slate-900" />
                        )}
                    </button>

                    {/* Notification Dropdown */}
                    {isNotificationsOpen && (
                        <div className="absolute top-12 right-0 w-80 py-2 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 z-50 animate-dropdown">
                            <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <h3 className="text-xs font-bold text-slate-900 dark:text-white">Notifications</h3>
                                {totalNotifications > 0 && (
                                    <span className="text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full">
                                        {totalNotifications} new
                                    </span>
                                )}
                            </div>

                            <div className="py-1">
                                {user?.role === 'SuperAdmin' && (
                                    <NavLink
                                        to="/permission-requests/pending"
                                        onClick={() => setIsNotificationsOpen(false)}
                                        className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <UserCheck className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-semibold text-slate-900 dark:text-white">Access Requests</p>
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                                {pendingCount} registration{pendingCount !== 1 ? 's' : ''} awaiting approval
                                            </p>
                                        </div>
                                    </NavLink>
                                )}

                                <button
                                    onClick={() => {
                                        setIsNotificationsOpen(false);
                                        if (user?.role === 'SuperAdmin' || user?.role === 'Manager') {
                                            setIsChatOpen(true);
                                        } else {
                                            navigate('/chat');
                                        }
                                    }}
                                    className="w-full flex items-start gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <MessageSquare className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-slate-900 dark:text-white">Workspace Messages</p>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                            {unreadChats > 0 ? `${unreadChats} unread message${unreadChats !== 1 ? 's' : ''}` : 'All caught up'}
                                        </p>
                                    </div>
                                </button>

                                {totalNotifications === 0 && (
                                    <div className="py-6 text-center">
                                        <p className="text-xs text-slate-400">No new notifications</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Profile Avatar & Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-2 pl-2 focus:outline-none"
                        aria-label="User profile options"
                    >
                        <div className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                            {user?.avatarUrl ? (
                                <img src={resolveAvatar(user.avatarUrl)} alt="avatar" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-indigo-600 dark:text-indigo-400 font-bold text-xs">{user?.name?.charAt(0)?.toUpperCase()}</span>
                            )}
                        </div>
                        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isProfileOpen && (
                        <div className="absolute top-12 right-0 w-52 py-1.5 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 z-50 animate-scale-in">
                            <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.name}</p>
                                <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                            </div>
                            <NavLink
                                to="/profile"
                                onClick={() => setIsProfileOpen(false)}
                                className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                                <User className="w-3.5 h-3.5 text-slate-400" />
                                Account Profile
                            </NavLink>
                            <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                            <button
                                onClick={logout}
                                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors text-left"
                            >
                                <LogOut className="w-3.5 h-3.5" />
                                Sign Out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default TopHeader;
