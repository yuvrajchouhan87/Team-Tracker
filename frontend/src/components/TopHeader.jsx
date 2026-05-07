import { useContext, useState, useRef, useEffect } from 'react';
import AuthContext from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LogOut, Sun, Moon, User, ChevronDown, Search, Bell, Home, MessageCircle, UserPlus, Menu } from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = 'http://localhost:5000';
const resolveAvatar = (avatarUrl) => {
    if (!avatarUrl) return '';
    if (avatarUrl.startsWith('http')) return avatarUrl;
    return `${API_BASE}${avatarUrl}`;
};

import Breadcrumbs from './Breadcrumbs';

const TopHeader = () => {
    const { user, logout, searchQuery, setSearchQuery, setIsChatOpen, setIsSidebarOpen } = useContext(AuthContext);
    const { darkMode, toggleTheme } = useTheme();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);
    const [unreadChats, setUnreadChats] = useState(0);
    const dropdownRef = useRef(null);
    const notificationRef = useRef(null);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAllCounts = async () => {
            if (!user) return;
            
            try {
                // Fetch Pending Users for SuperAdmin
                if (user.role === 'SuperAdmin') {
                    const { data: users } = await axios.get(`${API_BASE}/api/auth/users`);
                    const pending = users.filter(u => u.status === 'Pending' && u.role !== 'SuperAdmin');
                    setPendingCount(pending.length);
                }

                // Fetch Unread Chats for everyone
                const { data: tasks } = await axios.get(`${API_BASE}/api/tasks`);
                const totalUnread = tasks.reduce((sum, task) => sum + (task.unreadCount || 0), 0);
                setUnreadChats(totalUnread);

            } catch (error) {
                console.error('Error fetching notification counts', error);
            }
        };

        fetchAllCounts();
        const interval = setInterval(fetchAllCounts, 10000); // 10s refresh
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
        <header className="h-16 flex items-center justify-between px-4 lg:px-8 z-40 sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-200">
            <div className="flex items-center gap-4">
                {/* Mobile Menu Toggle */}
                <button 
                    onClick={() => setIsSidebarOpen(true)}
                    className="lg:hidden p-2 text-slate-500 hover:text-orange-500 transition-colors"
                >
                    <Menu className="w-6 h-6" />
                </button>

                {/* Breadcrumbs - Hidden on small mobile */}
                <div className="hidden sm:block">
                    <Breadcrumbs />
                </div>
            </div>
            
            <div className="flex items-center gap-6">
                {/* Search Bar - Hidden on small mobile */}
                <div className="relative hidden lg:flex items-center w-64 lg:w-80">
                    <input 
                        type="text"
                        placeholder="Search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-50 pl-4 pr-10 py-1.5 rounded-md text-sm border-none transition-all duration-200 outline-none placeholder:text-slate-400"
                        style={{ color: 'var(--text-primary)' }}
                    />
                    <Search className="absolute right-3 w-4 h-4 text-slate-500" />
                </div>
                
                <div className="flex items-center gap-4">
                    {/* Notification Icon */}
                    <div className="relative" ref={notificationRef}>
                        <button 
                            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                            className="relative p-2 text-slate-400 hover:text-orange-500 transition-colors"
                        >
                            <Bell className="w-5 h-5" />
                            {totalNotifications > 0 && (
                                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white font-black animate-pulse leading-none shadow-sm">
                                    {totalNotifications}
                                </span>
                            )}
                        </button>

                        {/* Notification Dropdown */}
                        {isNotificationsOpen && (
                            <div className="absolute top-12 right-0 w-64 py-2 bg-white rounded-lg shadow-xl border border-slate-100 z-50 animate-scale-in">
                                <div className="px-4 py-2 border-b border-slate-50">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Notifications</h3>
                                </div>
                                {user?.role === 'SuperAdmin' && (
                                    <NavLink
                                        to="/permission-requests/pending"
                                        onClick={() => setIsNotificationsOpen(false)}
                                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-800 hover:bg-slate-50 transition-colors"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                                            <UserPlus className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-slate-700">Pending Requests</p>
                                            <p className="text-xs text-slate-400">{pendingCount} user{pendingCount !== 1 ? 's' : ''} waiting</p>
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
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-800 hover:bg-slate-50 transition-colors text-left"
                                >
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                        <MessageCircle className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-slate-700">Internal Chats</p>
                                        <p className="text-xs text-slate-400">
                                            {unreadChats > 0 ? `${unreadChats} unread message${unreadChats !== 1 ? 's' : ''}` : 'No new messages'}
                                        </p>
                                    </div>
                                    {unreadChats > 0 && (
                                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                    )}
                                </button>

                                {totalNotifications === 0 && (
                                    <div className="px-4 py-8 text-center">
                                        <p className="text-sm text-slate-400">No new notifications</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Profile Button */}
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center pl-2 border-l border-slate-200"
                    >
                        <div className="w-8 h-8 rounded-full border-2 border-orange-100 flex items-center justify-center bg-orange-50 overflow-hidden">
                            {user?.avatarUrl ? (
                                <img src={resolveAvatar(user.avatarUrl)} alt="avatar" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-orange-600 font-bold text-xs">{user?.name?.charAt(0)?.toUpperCase()}</span>
                            )}
                        </div>
                        <ChevronDown className={`w-3 h-3 ml-2 text-slate-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                {/* Dropdown Menu */}
                {isProfileOpen && (
                    <div className="absolute top-16 right-8 w-48 py-2 bg-white rounded-lg shadow-xl border border-slate-100 z-50 animate-scale-in">
                        <NavLink
                            to="/profile"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
                        >
                            <User className="w-4 h-4" />
                            Profile
                        </NavLink>
                        <button
                            onClick={toggleTheme}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
                        >
                            {darkMode ? <Sun className="w-4 h-4 text-yellow-500" /> : <Moon className="w-4 h-4 text-orange-500" />}
                            Theme
                        </button>
                        <div className="my-1 border-t border-slate-100" />
                        <button
                            onClick={logout}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
};

export default TopHeader;
