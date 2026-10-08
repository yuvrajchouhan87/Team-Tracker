import { useState, useEffect, useContext } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import TaskChat from './TaskChat';
import { MessageSquare, User, X, Search } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

const API_BASE = 'https://team-tracker-dbzf.onrender.com';

const roleBadge = {
    SuperAdmin: 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300',
    Manager: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300',
    Developer: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
    Intern: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
};

const ChatModal = () => {
    const { user, isChatOpen, setIsChatOpen, searchQuery } = useContext(AuthContext);
    const { socket } = useSocket();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTask, setSelectedTask] = useState(null);
    const [localSearch, setLocalSearch] = useState('');

    useEffect(() => {
        if (!isChatOpen) return;
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
    }, [isChatOpen, user?.role]);

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
                console.error('Error marking messages as read', error);
            }
        }
    };

    const getOtherUser = (task) => {
        if (!task) return null;
        return (user.role === 'Manager' || user.role === 'SuperAdmin')
            ? task.assignedTo
            : task.createdBy;
    };

    if (!isChatOpen) return null;

    const query = localSearch || searchQuery;
    const filteredTasks = tasks.filter(t => 
        t.title.toLowerCase().includes(query.toLowerCase()) ||
        getOtherUser(t)?.name?.toLowerCase().includes(query.toLowerCase())
    );

    const selectedPartner = selectedTask ? getOtherUser(selectedTask) : null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] modal-backdrop flex items-center justify-center p-4 animate-fade-in">
            <div className="card bg-white dark:bg-slate-900 w-full max-w-4xl h-[80vh] flex overflow-hidden animate-modal relative shadow-2xl">
                {/* Close Button */}
                <button 
                    onClick={() => setIsChatOpen(false)}
                    className="absolute top-3.5 right-3.5 z-20 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    aria-label="Close modal"
                >
                    <X className="w-4 h-4" />
                </button>

                {/* Left Side: Conversations */}
                <div className={`w-full md:w-80 flex-shrink-0 flex flex-col border-r border-slate-200 dark:border-slate-800 ${
                    selectedTask ? 'hidden md:flex' : 'flex'
                }`}>
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-3">
                        <div className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Workspace Messages</h2>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                            <input 
                                type="text"
                                placeholder="Search conversations..."
                                value={localSearch}
                                onChange={e => setLocalSearch(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-800/60 pl-8 pr-3 py-1.5 rounded-lg text-xs border border-slate-200 dark:border-slate-700/60 outline-none focus:border-indigo-500"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                        {loading ? (
                            <div className="flex justify-center py-10">
                                <div className="w-5 h-5 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
                            </div>
                        ) : filteredTasks.length > 0 ? (
                            filteredTasks.map(task => {
                                const partner = getOtherUser(task);
                                const isSelected = selectedTask?._id === task._id;
                                const badge = roleBadge[partner?.role] || 'bg-slate-100 text-slate-700';

                                return (
                                    <button 
                                        key={task._id}
                                        onClick={() => handleSelectTask(task)}
                                        className={`w-full p-2.5 rounded-xl flex items-start gap-2.5 transition-all text-left ${
                                            isSelected 
                                                ? 'bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60' 
                                                : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 border border-transparent'
                                        }`}
                                    >
                                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 text-xs flex-shrink-0">
                                            {partner?.name ? partner.name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center justify-between gap-1 mb-0.5">
                                                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{partner?.name || 'Unknown'}</p>
                                                {task.unreadCount > 0 && (
                                                    <span className="min-w-[16px] h-4 px-1 rounded-full bg-indigo-600 text-white text-[9px] font-bold flex items-center justify-center">
                                                        {task.unreadCount}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[11px] text-slate-400 truncate">{task.title}</p>
                                        </div>
                                    </button>
                                );
                            })
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-xs text-slate-400">No conversations</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: Chat Window */}
                <div className={`flex-1 flex flex-col ${!selectedTask ? 'hidden md:flex' : 'flex'}`}>
                    {selectedTask ? (
                        <div className="flex flex-col h-full overflow-hidden">
                            <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between pr-12">
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300 text-xs flex-shrink-0">
                                        {selectedPartner?.name ? selectedPartner.name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                                {selectedPartner?.name}
                                            </h3>
                                            <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${roleBadge[selectedPartner?.role] || 'bg-slate-100'}`}>
                                                {selectedPartner?.role}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-slate-400 truncate">
                                            Task: {selectedTask.title}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-hidden">
                                <TaskChat 
                                    task={selectedTask}
                                    currentUser={user}
                                    otherUser={selectedPartner}
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
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Select a Conversation</h2>
                            <p className="text-xs text-slate-400 max-w-xs">
                                Collaborate on active tasks with assignees and leads.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ChatModal;
