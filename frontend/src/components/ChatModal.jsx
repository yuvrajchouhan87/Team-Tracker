import { useState, useEffect, useContext } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import TaskChat from './TaskChat';
import { MessageCircle, ShieldCheck, User, X, Search } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

const roleConfig = {
    SuperAdmin: {
        label: 'SuperAdmin',
        badgeBg: 'rgba(249, 115, 22, 0.12)',
        badgeColor: '#f97316',
        avatarBg: 'bg-orange-100',
        avatarText: 'text-orange-600',
        icon: ShieldCheck,
    },
    Manager: {
        label: 'Manager',
        badgeBg: 'rgba(59, 130, 246, 0.12)',
        badgeColor: '#3b82f6',
        avatarBg: 'bg-blue-100 dark:bg-blue-900/30',
        avatarText: 'text-blue-600 dark:text-blue-400',
        icon: User,
    },
    Developer: {
        label: 'Developer',
        badgeBg: 'rgba(16, 185, 129, 0.12)',
        badgeColor: '#10b981',
        avatarBg: 'bg-green-100 dark:bg-green-900/30',
        avatarText: 'text-green-600 dark:text-green-400',
        icon: User,
    },
    Intern: {
        label: 'Intern',
        badgeBg: 'rgba(245, 158, 11, 0.12)',
        badgeColor: '#f59e0b',
        avatarBg: 'bg-amber-100 dark:bg-amber-900/30',
        avatarText: 'text-amber-600 dark:text-amber-400',
        icon: User,
    }
};

const ChatModal = () => {
    const { user, isChatOpen, setIsChatOpen, searchQuery } = useContext(AuthContext);
    const { socket } = useSocket();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTask, setSelectedTask] = useState(null);

    useEffect(() => {
        if (!isChatOpen) return;
        
        const fetchTasks = async () => {
            try {
                const { data } = await axios.get('http://localhost:5000/api/tasks');
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

    // Listen for new messages to update unread counts in real-time
    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (msg) => {
            const taskId = msg.task?._id || msg.task;
            
            // If the message is for a task that is NOT currently selected, increment its unread count
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
                // Mark as read in backend
                await axios.put(`http://localhost:5000/api/messages/${task._id}/read`);
                // Reset locally
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

    const filteredTasks = tasks.filter(t => 
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getOtherUser(t)?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const selectedPartner = selectedTask ? getOtherUser(selectedTask) : null;
    const partnerConfig = selectedPartner ? (roleConfig[selectedPartner.role] || roleConfig.Manager) : null;
    const PartnerIcon = partnerConfig?.icon || User;

    return createPortal(
        <div className="fixed inset-0 z-[9999] modal-backdrop flex items-center justify-center p-4 animate-fade-in">
            <div className="card w-full max-w-5xl h-[85vh] flex overflow-hidden animate-scale-in relative shadow-2xl" 
                 style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                
                {/* Close Button Top Right */}
                <button 
                    onClick={() => setIsChatOpen(false)}
                    className="absolute top-4 right-4 z-[60] w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                    <X className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                </button>

                {/* Left Side: Conversations */}
                <div className={`w-full md:w-80 flex flex-col border-r ${selectedTask ? 'hidden md:flex' : 'flex'}`}
                     style={{ borderColor: 'var(--border-color)' }}>
                    
                    <div className="p-6 border-b" style={{ borderColor: 'var(--border-color)' }}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>Messages</h2>
                            <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                                <MessageCircle className="w-4 h-4 text-orange-600" />
                            </div>
                        </div>

                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                            <input 
                                type="text"
                                placeholder="Search conversations..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="input-base text-xs pl-9 py-2"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                        {loading ? (
                            <div className="flex justify-center py-10">
                                <div className="w-6 h-6 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
                            </div>
                        ) : filteredTasks.length > 0 ? (
                            filteredTasks.map(task => {
                                const partner = getOtherUser(task);
                                const pConfig = roleConfig[partner?.role] || roleConfig.Manager;
                                const isSelected = selectedTask?._id === task._id;

                                return (
                                    <button 
                                        key={task._id}
                                        onClick={() => handleSelectTask(task)}
                                        className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all relative ${
                                            isSelected ? 'bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700' : 'hover:bg-slate-50 dark:hover:bg-slate-800/20'
                                        }`}
                                    >
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${pConfig.avatarBg}`}>
                                            <pConfig.icon className={`w-5 h-5 ${pConfig.avatarText}`} />
                                        </div>
                                        <div className="text-left min-w-0 flex-1">
                                            <p className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>{task.title}</p>
                                            <p className="text-xs font-semibold truncate" style={{ color: pConfig.badgeColor }}>
                                                {partner?.name || 'Unknown'}
                                            </p>
                                        </div>
                                        
                                        {/* Unread Badge */}
                                        {task.unreadCount > 0 && (
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-black shadow-lg shadow-red-200 dark:shadow-none animate-bounce leading-none">
                                                {task.unreadCount}
                                            </div>
                                        )}
                                    </button>
                                );
                            })
                        ) : (
                            <div className="text-center py-10 opacity-50">
                                <MessageCircle className="w-10 h-10 mx-auto mb-2" />
                                <p className="text-xs font-bold uppercase tracking-widest">No Chats</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: Chat Window */}
                <div className={`flex-1 flex flex-col ${!selectedTask ? 'hidden md:flex' : 'flex'}`}>
                    {selectedTask ? (
                        <div className="flex flex-col h-full overflow-hidden">
                            {/* Chat Header */}
                            <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-color)' }}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${partnerConfig.avatarBg}`}>
                                        <PartnerIcon className={`w-5 h-5 ${partnerConfig.avatarText}`} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                                            {selectedPartner?.name}
                                            <span className="text-[10px] px-2 py-0.5 rounded-full uppercase"
                                                  style={{ background: partnerConfig.badgeBg, color: partnerConfig.badgeColor }}>
                                                {selectedPartner?.role}
                                            </span>
                                        </h3>
                                        <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                                            Task: {selectedTask.title}
                                        </p>
                                    </div>
                                </div>
                                
                                <button className="md:hidden" onClick={() => setSelectedTask(null)}>
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Messaging Component */}
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
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/10 dark:bg-slate-900/10">
                            <div className="w-24 h-24 rounded-3xl bg-orange-50 flex items-center justify-center mb-6 shadow-sm border border-orange-100">
                                <MessageCircle className="w-12 h-12 text-orange-500" />
                            </div>
                            <h2 className="text-2xl font-black mb-3" style={{ color: 'var(--text-primary)' }}>Task Messaging</h2>
                            <p className="text-sm max-w-sm" style={{ color: 'var(--text-muted)' }}>
                                Select a conversation to start collaborating with your team about specific tasks and project updates.
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
