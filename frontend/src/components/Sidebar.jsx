import { useContext, useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
    LayoutDashboard, 
    CheckSquare, 
    ClipboardList, 
    Users, 
    ChevronDown, 
    UserPlus, 
    MessageSquare, 
    Sparkles, 
    X,
    Layers,
    Shield
} from 'lucide-react';

const API_BASE = 'https://team-tracker-dbzf.onrender.com';

const Sidebar = () => {
    const { user, isChatOpen, setIsChatOpen, isSidebarOpen, setIsSidebarOpen } = useContext(AuthContext);
    const location = useLocation();
    
    const isPermissionRoute = location.pathname.startsWith('/permission-requests');
    const [isPermOpen, setIsPermOpen] = useState(isPermissionRoute);
    
    useEffect(() => {
        if (isPermissionRoute) setIsPermOpen(true);
    }, [isPermissionRoute]);

    const navItems = [
        { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
        ...(user?.role === 'SuperAdmin' ? [
            {
                icon: UserPlus,
                label: 'Access Requests',
                subItems: [
                    { to: '/permission-requests/pending', label: 'Pending' },
                    { to: '/permission-requests/approved', label: 'Approved' },
                    { to: '/permission-requests/rejected', label: 'Rejected' },
                ]
            },
            { to: '/team', icon: Users, label: 'Team Members' },
            { to: '/assign-task', icon: ClipboardList, label: 'Assign Task' },
        ] : []),
        ...(user?.role === 'Developer' || user?.role === 'Intern' 
            ? (user.permissions?.tasks?.view !== false ? [{ to: '/tasks', icon: CheckSquare, label: 'Tasks' }] : [])
            : [{ to: '/tasks', icon: CheckSquare, label: 'Tasks' }]
        ),
        ...(user?.role === 'Manager' ? [
            { to: '/assign-task', icon: ClipboardList, label: 'Assign Task' },
        ] : []),
        ...((user?.role === 'SuperAdmin' || user?.role === 'Manager') ? [
            { 
                icon: MessageSquare, 
                label: 'Messages', 
                onClick: () => setIsChatOpen(true),
                active: isChatOpen
            },
        ] : []),
        ...((user?.role === 'Developer' || user?.role === 'Intern') 
            ? (user.permissions?.chat?.view !== false ? [{ to: '/chat', icon: MessageSquare, label: 'Messages' }] : [])
            : []
        ),
        ...((user?.role === 'SuperAdmin' || (user?.role && user.permissions?.aiChat?.view !== false)) 
            ? [{ to: '/ai-chat', icon: Sparkles, label: 'AI Assistant' }] 
            : []
        ),
    ];

    const linkBase = 'flex items-center gap-3 px-3 py-2 mx-2 rounded-lg text-xs font-medium transition-all duration-150';

    return (
        <aside
            className={`flex flex-col w-64 h-full flex-shrink-0 transition-transform duration-200 z-50 lg:z-0 fixed lg:static inset-y-0 left-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 ${
                isSidebarOpen ? 'translate-x-0 shadow-xl lg:shadow-none' : '-translate-x-full lg:translate-x-0'
            }`}
        >
            {/* Brand Header */}
            <div className="h-16 px-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20">
                        <Layers className="w-4 h-4" />
                    </div>
                    <div>
                        <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white leading-none block">
                            Team Tracker
                        </span>
                        <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 mt-0.5 block">
                            Enterprise Workspace
                        </span>
                    </div>
                </div>
                
                <button 
                    onClick={() => setIsSidebarOpen(false)}
                    className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md transition-colors"
                    aria-label="Close menu"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* User Context Tag */}
            <div className="px-4 py-3 mx-2 mt-3 mb-1 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                        {user?.name || 'Workspace'}
                    </span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
                    {user?.role || 'Guest'}
                </span>
            </div>

            {/* Navigation List */}
            <div className="px-3 pt-3 pb-1">
                <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Navigation
                </p>
            </div>
            <nav className="flex-1 py-1 space-y-0.5 overflow-y-auto no-scrollbar">
                {navItems.map((item, index) => {
                    if (item.subItems) {
                        return (
                            <div key={index} className="space-y-0.5">
                                <button
                                    onClick={() => setIsPermOpen(prev => !prev)}
                                    className={`${linkBase} w-[calc(100%-1rem)] text-left ${
                                        isPermissionRoute 
                                            ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/60 dark:bg-indigo-950/30' 
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                                    }`}
                                >
                                    <item.icon className={`w-4 h-4 flex-shrink-0 ${isPermissionRoute ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                                    <span className="flex-1 truncate">{item.label}</span>
                                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isPermOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isPermOpen && (
                                    <div className="ml-4 pl-3 border-l border-slate-100 dark:border-slate-800 space-y-0.5 my-1">
                                        {item.subItems.map(sub => (
                                            <NavLink
                                                key={sub.to}
                                                to={sub.to}
                                                onClick={() => setIsSidebarOpen(false)}
                                                className={({ isActive }) =>
                                                    `flex items-center px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                                                        isActive 
                                                            ? 'text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50/80 dark:bg-indigo-950/40' 
                                                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                                                    }`
                                                }
                                            >
                                                {sub.label}
                                            </NavLink>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    }

                    if (item.onClick) {
                        const isActive = item.active;
                        return (
                            <button
                                key={index}
                                onClick={() => {
                                    item.onClick();
                                    setIsSidebarOpen(false);
                                }}
                                className={`${linkBase} w-[calc(100%-1rem)] text-left ${
                                    isActive
                                        ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                                }`}
                            >
                                <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                                <span className="flex-1 truncate">{item.label}</span>
                                {!isActive && user && (user.role === 'SuperAdmin' || user.role === 'Manager') && item.label === 'Messages' && (
                                    <UnreadTotalBadge />
                                )}
                            </button>
                        );
                    }

                    return (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.to === '/'}
                            onClick={() => setIsSidebarOpen(false)}
                            className={({ isActive }) =>
                                `${linkBase} ${
                                    isActive
                                        ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold shadow-sm'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                                    <span className="flex-1 truncate">{item.label}</span>
                                    {!isActive && user && (user.role === 'SuperAdmin' || user.role === 'Manager') && item.label === 'Messages' && (
                                        <UnreadTotalBadge />
                                    )}
                                </>
                            )}
                        </NavLink>
                    );
                })}
            </nav>

            {/* Bottom Footer Info */}
            <div className="p-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 px-2">
                    <span className="font-medium">Version</span>
                    <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">v2.4</span>
                </div>
            </div>
        </aside>
    );
};

const UnreadTotalBadge = () => {
    const [total, setTotal] = useState(0);
    useEffect(() => {
        const fetchCounts = async () => {
            try {
                const { data } = await axios.get(`${API_BASE}/api/tasks`);
                const count = data.reduce((acc, t) => acc + (t.unreadCount || 0), 0);
                setTotal(count);
            } catch (e) {}
        };
        fetchCounts();
        const interval = setInterval(fetchCounts, 10000);
        return () => clearInterval(interval);
    }, []);

    if (total === 0) return null;
    return (
        <span className="min-w-[18px] h-4.5 px-1.5 flex items-center justify-center bg-indigo-600 text-white text-[10px] font-bold rounded-full">
            {total}
        </span>
    );
};

export default Sidebar;
