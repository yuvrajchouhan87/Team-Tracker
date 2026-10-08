import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import TaskChat from '../components/TaskChat';
import { MessageSquare, ShieldAlert, User, X, Search } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

const API_BASE = 'https://team-tracker-dbzf.onrender.com';

const roleBadge = {
    SuperAdmin: 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300',
    Manager: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300',
    Developer: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
    Intern: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
};

const Chat = () => {
    const { user } = useContext(AuthContext);
    const { socket } = useSocket();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTask, setSelectedTask] = useState(null);
    const [search, setSearch] = useState('');

    if ((user?.role === 'Developer' || user?.role === 'Intern') && user.permissions?.chat?.view === false) {
        return (
            <div className="flex flex-col items-center justify-center h-[65vh] animate-fade-in text-center px-4">
                <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
                    <ShieldAlert className="w-7 h-7" />
                </div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Messaging Restricted</h1>
                <p className="max-w-md text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                    Access to the internal messaging module has been restricted for your profile by your project administrator.
                </p>
            </div>
        );
    }

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const { data } = await axios.get(`${API_BASE}/api/tasks`);
                const chatableTasks = data.filter(task => {
                    const partner = (user.role === 'Manager' || user.role === 'SuperAdmin')
                        ? task.assignedTo
                        : task.createdBy;
                    return partner && (partner._id || partner.id);
                });
                setTasks(chatableTasks);
            } catch (error) {
                console.error('Error fetching tasks', error);
            } finally {
                setLoading(false);
            }
        };
        fetchTasks();
    }, [user?.role]);

    useEffect(() => {
        if (!socket) return;
        const handleNewMessage = (msg) => {
            const taskId = msg.task?._id || msg.task;
            if (selectedTask?._id !== taskId && msg.sender?._id !== user?._id) {
                setTasks(prev => prev.map(t => 
                    t._id === taskId ? { ...t, unreadCount: (t.unreadCount || 0) + 1 } : t
                ));
            }
        };
        socket.on('newMessage', handleNewMessage);
        return () => socket.off('newMessage', handleNewMessage);
    }, [socket, selectedTask, user?._id]);

    const handleSelectTask = async (task) => {
        setSelectedTask(task);
        if (task.unreadCount > 0) {
            try {
                await axios.put(`${API_BASE}/api/messages/${task._id}/read`);
                setTasks(prev => prev.map(t => 
                    t._id === task._id ? { ...t, unreadCount: 0 } : t
                ));
            } catch (error) {
                console.error('Error marking as read', error);
            }
        }
    };

    const getOtherUser = (task) => {
        if (!task) return null;
        return (user.role === 'Manager' || user.role === 'SuperAdmin')
            ? task.assignedTo
            : task.createdBy;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-72">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
                    <p className="text-xs font-medium text-slate-400">Loading messages...</p>
                </div>
            </div>
        );
    }

    const filtered = tasks.filter(t => 
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        getOtherUser(t)?.name?.toLowerCase().includes(search.toLowerCase())
    );

    const partner = selectedTask ? getOtherUser(selectedTask) : null;

    return (
        <div className="h-[calc(100vh-8.5rem)] card overflow-hidden flex flex-col md:flex-row animate-fade-in">
            {/* Conversations List */}
            <div className={`w-full md:w-80 flex-shrink-0 flex flex-col border-r border-slate-200 dark:border-slate-800 ${
                selectedTask ? 'hidden md:flex' : 'flex'
            }`}>
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Workspace Chats</h2>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                            {tasks.length}
                        </span>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search chats..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800/60 pl-8 pr-3 py-1.5 rounded-lg text-xs border border-slate-200 dark:border-slate-700/60 outline-none focus:border-indigo-500"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                    {filtered.length > 0 ? (
                        filtered.map((task) => {
                            const p = getOtherUser(task);
                            const isSelected = selectedTask?._id === task._id;
                            const badgeCls = roleBadge[p?.role] || 'bg-slate-100 text-slate-700';

                            return (
                                <button
                                    key={task._id}
                                    onClick={() => handleSelectTask(task)}
                                    className={`w-full text-left p-3 rounded-xl transition-all flex items-start gap-3 ${
                                        isSelected 
                                            ? 'bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60' 
                                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 border border-transparent'
                                    }`}
                                >
                                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 text-xs flex-shrink-0">
                                        {p?.name ? p.name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between gap-1 mb-0.5">
                                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                                {p?.name || 'Unknown'}
                                            </p>
                                            {task.unreadCount > 0 && (
                                                <span className="min-w-[16px] h-4 px-1 rounded-full bg-indigo-600 text-white text-[9px] font-bold flex items-center justify-center">
                                                    {task.unreadCount}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-slate-400 truncate font-medium">
                                            {task.title}
                                        </p>
                                    </div>
                                </button>
                            );
                        })
                    ) : (
                        <div className="py-12 text-center">
                            <p className="text-xs text-slate-400">No active conversations</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Conversation Window */}
            <div className={`flex-1 flex flex-col ${selectedTask ? 'flex' : 'hidden md:flex'}`}>
                {selectedTask ? (
                    <div className="flex-1 flex flex-col h-full overflow-hidden">
                        {/* Conversation Header */}
                        <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300 text-xs flex-shrink-0">
                                    {partner?.name ? partner.name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                            {partner?.name || 'Workspace Colleague'}
                                        </h3>
                                        <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${roleBadge[partner?.role] || 'bg-slate-100'}`}>
                                            {partner?.role}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-400 truncate">
                                        Task: {selectedTask.title}
                                    </p>
                                </div>
                            </div>
                            
                            <button
                                onClick={() => setSelectedTask(null)}
                                className="md:hidden p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                aria-label="Back to conversations"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Inline Chat Body */}
                        <div className="flex-1 overflow-hidden">
                            <TaskChat
                                task={selectedTask}
                                currentUser={user}
                                otherUser={partner}
                                onClose={() => setSelectedTask(null)}
                                inline={true}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/40 dark:bg-slate-900/40">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
                            <MessageSquare className="w-6 h-6" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Select a Conversation</h3>
                        <p className="text-xs text-slate-400 max-w-xs">
                            Choose an active task from the sidebar to view chat logs and coordinate in real-time.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;
