import { useContext, useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LayoutDashboard, CheckSquare, Zap, User, ClipboardList, Users, ChevronDown, UserPlus, MessageCircle, Sparkles, X } from 'lucide-react';

const API_BASE = 'https://team-tracker-dbzf.onrender.com';
const resolveAvatar = (avatarUrl) => {
    if (!avatarUrl) return '';
    if (avatarUrl.startsWith('http')) return avatarUrl;
    return `${API_BASE}${avatarUrl}`;
};
const Sidebar = () => {
    const { user, logout, isChatOpen, setIsChatOpen, isSidebarOpen, setIsSidebarOpen } = useContext(AuthContext);
    const { darkMode, toggleTheme } = useTheme();
    const location = useLocation();
    
    // Check if any sub-item is active for the dropdown
    const isPermissionRoute = location.pathname.startsWith('/permission-requests');
    const [isPermOpen, setIsPermOpen] = useState(isPermissionRoute);
    
    // Update local open state if route changes externally
    useEffect(() => {
        if (isPermissionRoute) setIsPermOpen(true);
    }, [isPermissionRoute]);

    const navItems = [
        { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
        ...(user?.role === 'SuperAdmin' ? [
            {
                icon: UserPlus,
                label: 'Permission Requests',
                subItems: [
                    { to: '/permission-requests/pending', label: 'Pending Requests' },
                    { to: '/permission-requests/approved', label: 'Approved Requests' },
                    { to: '/permission-requests/rejected', label: 'Rejected Requests' },
                ]
            },
            { to: '/team', icon: Users, label: 'Team' },
            { to: '/assign-task', icon: ClipboardList, label: 'Assign Task' },
        ] : []),
        ...(user?.role === 'Developer' || user?.role === 'Intern' 
            ? (user.permissions?.tasks?.view !== false ? [{ to: '/tasks', icon: CheckSquare, label: 'Tasks' }] : [])
            : [{ to: '/tasks', icon: CheckSquare, label: 'Tasks' }]
        ),
        ...(user?.role === 'Manager' ? [
            { to: '/assign-task', icon: ClipboardList, label: 'Assign Task' },
        ] : []),
        // Chat for Admin/Manager as a Modal Toggle
        ...((user?.role === 'SuperAdmin' || user?.role === 'Manager') ? [
            { 
                icon: MessageCircle, 
                label: 'Chat', 
                onClick: () => setIsChatOpen(true),
                active: isChatOpen
            },
        ] : []),
        // Only Developers and Interns can see the Chat as a separate page
        ...((user?.role === 'Developer' || user?.role === 'Intern') 
            ? (user.permissions?.chat?.view !== false ? [{ to: '/chat', icon: MessageCircle, label: 'Chat' }] : [])
            : []
        ),
        ...((user?.role === 'SuperAdmin' || (user?.role && user.permissions?.aiChat?.view !== false)) 
            ? [{ to: '/ai-chat', icon: Sparkles, label: 'Chat with AI' }] 
            : []
        ),
    ];

    // Shared active style helpers
    const activeStyle = { 
        background: '#fff7ed', 
        color: '#f97316',
        borderLeft: '4px solid #f97316',
        borderRadius: '0 8px 8px 0'
    };
    const inactiveStyle = { color: '#334155' };
    const linkClass = 'flex items-center gap-3 px-6 py-3 text-sm font-semibold transition-all duration-200';

    return (
        <aside
            className={`flex flex-col w-64 h-full flex-shrink-0 transition-all duration-300 shadow-sm fixed lg:static inset-y-0 left-0 z-50 lg:z-0 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
            style={{
                background: '#ffffff',
                borderRight: '1px solid #e2e8f0',
            }}
        >
            {/* Logo & Close Button */}
            <div className="px-6 py-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white shadow-md shadow-orange-100/50 border border-slate-100 overflow-hidden relative">
                        <img src="/src/assets/logo.png" alt="Logo" className="w-full h-full object-cover scale-[2.2] absolute" />
                    </div>
                    <div>
                        <span className="font-bold text-base leading-tight block text-slate-800">
                            Team Tracker
                        </span>
                    </div>
                </div>
                
                {/* Mobile Close Button */}
                <button 
                    onClick={() => setIsSidebarOpen(false)}
                    className="lg:hidden p-2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-2 space-y-1 overflow-y-auto">

                {navItems.map((item, index) => {

                    /* ── Dropdown item (Permission Requests) ── */
                    if (item.subItems) {
                        return (
                            <div key={index} className="space-y-0.5">
                                {/* Parent toggle button — same height & padding as a NavLink */}
                                <button
                                    onClick={() => setIsPermOpen(prev => !prev)}
                                    className={`${linkClass} w-full text-left`}
                                    style={isPermissionRoute ? activeStyle : inactiveStyle}
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <item.icon className={`w-5 h-5 ${isPermissionRoute ? 'text-orange-500' : 'text-slate-400'}`} />
                                        <span className="transition-colors truncate">{item.label}</span>
                                    </div>
                                    <ChevronDown className={`w-4 h-4 transition-transform flex-shrink-0 ${isPermOpen ? 'rotate-180' : ''} ${isPermissionRoute ? 'text-orange-500' : 'text-slate-400'}`} />
                                </button>

                                {/* Sub-items */}
                                {isPermOpen && (
                                    <div className="animate-fade-in bg-slate-50/50">
                                        {item.subItems.map(sub => (
                                            <NavLink
                                                key={sub.to}
                                                to={sub.to}
                                                onClick={() => setIsSidebarOpen(false)}
                                                className={({ isActive }) =>
                                                    `${linkClass} pl-14 py-2`
                                                }
                                                style={({ isActive }) => isActive ? activeStyle : { color: '#334155' }}
                                            >
                                                {sub.label}
                                            </NavLink>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    }

                    /* ── Modal Toggle Button (For Admin/Manager Chat) ── */
                    if (item.onClick) {
                        const isActive = item.active;
                        return (
                            <button
                                key={index}
                                onClick={() => {
                                    item.onClick();
                                    setIsSidebarOpen(false);
                                }}
                                className={linkClass + " w-full text-left"}
                                style={isActive ? activeStyle : inactiveStyle}
                            >
                                <item.icon className={`w-5 h-5 ${isActive ? 'text-orange-500' : 'text-slate-400'}`} />
                                <span className="flex-1">{item.label}</span>
                                {!isActive && user && (user.role === 'SuperAdmin' || user.role === 'Manager') && item.label === 'Chat' && (
                                    <UnreadTotalBadge />
                                )}
                            </button>
                        );
                    }

                    /* ── Regular NavLink ── */
                    return (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.to === '/'}
                            onClick={() => setIsSidebarOpen(false)}
                            className={() => linkClass}
                            style={({ isActive }) => isActive ? activeStyle : inactiveStyle}
                        >
                            {({ isActive }) => (
                                <>
                                    <item.icon className={`w-5 h-5 ${isActive ? 'text-orange-500' : 'text-slate-400'}`} />
                                    <span className="flex-1">{item.label}</span>
                                    {!isActive && user && (user.role === 'SuperAdmin' || user.role === 'Manager') && item.label === 'Chat' && (
                                        <UnreadTotalBadge />
                                    )}
                                </>
                            )}
                        </NavLink>
                    );
                })}
            </nav>

            {/* Bottom Version Tag */}
            <div className="p-4" style={{ borderTop: '1px solid var(--border-color)' }}>
                <p className="text-[10px] text-center font-bold uppercase tracking-wider opacity-30" style={{ color: 'var(--text-muted)' }}>
                    Team Tracker v1.0
                </p>
            </div>
        </aside>
    );
};

/* ── Global Unread Badge Component ── */
const UnreadTotalBadge = () => {
    const [total, setTotal] = useState(0);
    useEffect(() => {
        const fetchCounts = async () => {
            try {
                const { data } = await axios.get('https://team-tracker-dbzf.onrender.com/api/tasks');
                const count = data.reduce((acc, t) => acc + (t.unreadCount || 0), 0);
                setTotal(count);
            } catch (e) {}
        };
        fetchCounts();
        const interval = setInterval(fetchCounts, 10000); // Check every 10s as a fallback
        return () => clearInterval(interval);
    }, []);

    if (total === 0) return null;
    return (
        <span className="ml-auto min-w-[20px] h-5 flex items-center justify-center bg-red-500 text-white text-[10px] font-black rounded-full shadow-lg shadow-red-200 dark:shadow-none animate-pulse leading-none">
            {total}
        </span>
    );
};

export default Sidebar;
