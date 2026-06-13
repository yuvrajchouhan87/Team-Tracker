import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import TaskChat from '../components/TaskChat';
import { MessageCircle, ShieldCheck, User, X, AlertCircle, Shield } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

const roleConfig = {
    SuperAdmin: {
        label: 'SuperAdmin',
        badgeBg: 'rgba(239, 68, 68, 0.12)',
        badgeColor: '#ef4444',
        avatarBg: 'bg-red-100 dark:bg-red-900/30',
        avatarText: 'text-red-600 dark:text-red-400',
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

const Chat = () => {
    const { user } = useContext(AuthContext);
    const { socket } = useSocket();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTask, setSelectedTask] = useState(null);

    if ((user.role === 'Developer' || user.role === 'Intern') && user.permissions?.chat?.view === false) {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh] animate-fade-in text-center px-4">
                <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-6">
                    <Shield className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                </div>
                <h1 className="text-3xl font-black mb-3" style={{ color: 'var(--text-primary)' }}>Communication Restricted</h1>
                <p className="max-w-md text-lg font-medium mb-8" style={{ color: 'var(--text-muted)' }}>
                    Your access to the Chat module has been temporarily restricted by the SuperAdmin. 
                    Please reach out to your project manager for more information.
                </p>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl flex items-start gap-3 text-left max-w-sm">
                    <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                        Restricting chat access helps maintain a distraction-free environment during critical focus periods.
                    </p>
                </div>
            </div>
        );
    }

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const { data } = await axios.get('https://team-tracker-dbzf.onrender.com/api/tasks');
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

    // Real-time unread count updates
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
                await axios.put(`https://team-tracker-dbzf.onrender.com/api/messages/${task._id}/read`);
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

    if (loading) return (
        <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 rounded-full border-4 border-red-500 border-t-transparent animate-spin" />
        </div>
    );

    const selectedPartner = selectedTask ? getOtherUser(selectedTask) : null;
    const partnerConfig = selectedPartner ? (roleConfig[selectedPartner.role] || roleConfig.Manager) : null;
    const PartnerIcon = partnerConfig?.icon || User;

    return (
        <div className="flex justify-center h-full animate-fade-in overflow-hidden">
            <div 
                className="flex w-full max-w-6xl bg-card border rounded-2xl overflow-hidden my-4 mx-4 shadow-sm"
                style={{ 
                    height: 'calc(100vh - 10rem)',
                    borderColor: 'var(--border-color)',
                    background: 'var(--bg-card)'
                }}
            >
                {/* ─── Left Panel: Task / Conversation List ─── */}
                <div
                    className={`flex-shrink-0 flex-col md:flex ${
                        selectedTask ? 'hidden md:flex' : 'flex'
                    }`}
                    style={{
                        width: '320px',
                        background: 'var(--bg-card)',
                        borderRight: '1px solid var(--border-color)',
                    }}
                >
                    {/* Header */}
                    <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <div className="flex items-center gap-2 mb-1">
                            <MessageCircle className="w-5 h-5 text-red-500" />
                            <h2 className="text-base font-black" style={{ color: 'var(--text-primary)' }}>Messages</h2>
                        </div>
                        <p className="font-light" style={{ color: '#000', fontSize: '0.82em', opacity: 0.8 }}>
                            {tasks.length} conversation{tasks.length !== 1 ? 's' : ''}
                        </p>
                    </div>

                    {/* Task List */}
                    <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
                        {tasks.length === 0 ? (
                            <div className="text-center py-12">
                                <MessageCircle className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
                                <p style={{ color: 'var(--text-muted)' }} className="text-sm font-medium">No chats yet</p>
                                <p style={{ color: 'var(--text-muted)' }} className="text-xs mt-1">Active tasks will appear here</p>
                            </div>
                        ) : (
                            tasks.map((task) => {
                                const partner = getOtherUser(task);
                                const pConfig = roleConfig[partner?.role] || roleConfig.Manager;
                                const PIcon = pConfig.icon;
                                const isSelected = selectedTask?._id === task._id;

                                return (
                                    <button
                                        key={task._id}
                                        onClick={() => handleSelectTask(task)}
                                        className="w-full flex items-start text-left p-3 rounded-xl transition-all relative"
                                        style={isSelected ? {
                                            background: 'rgba(239, 68, 68, 0.08)',
                                            borderLeft: '3px solid #ef4444',
                                        } : {
                                            borderLeft: '3px solid transparent',
                                        }}
                                    >
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mr-3 ${pConfig.avatarBg}`}>
                                            <PIcon className={`w-5 h-5 ${pConfig.avatarText}`} />
                                        </div>
 
                                        <div className="flex-1 min-w-0 pr-6">
                                            <p className="text-sm font-semibold truncate" style={{ color: isSelected ? '#ef4444' : 'var(--text-primary)' }}>
                                                {task.title}
                                            </p>
                                            <p className="text-xs truncate mt-0.5 font-semibold"
                                                style={{ color: pConfig.badgeColor }}>
                                                {pConfig.label}: {partner?.name || 'Unknown'}
                                            </p>
                                        </div>

                                        {/* Unread Badge */}
                                        {task.unreadCount > 0 && (
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-black shadow-lg shadow-red-200 dark:shadow-none animate-bounce">
                                                {task.unreadCount}
                                            </div>
                                        )}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* ─── Right Panel: Chat Window ─── */}
                <div
                    className={`flex-1 flex-col overflow-hidden md:flex ${
                        selectedTask ? 'flex' : 'hidden md:flex'
                    }`}
                >
                    {selectedTask ? (
                        <>
                            {/* Chat Header */}
                            <div
                                className="flex items-center justify-between px-5 py-3"
                                style={{ borderBottom: '1px solid var(--border-color)' }}
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${partnerConfig?.avatarBg}`}>
                                        <PartnerIcon className={`w-4 h-4 ${partnerConfig?.avatarText}`} />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                                                {selectedPartner?.name || 'Unknown'}
                                            </span>
                                            <span
                                                className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                                                style={{ background: partnerConfig?.badgeBg, color: partnerConfig?.badgeColor }}
                                            >
                                                {partnerConfig?.label}
                                            </span>
                                        </div>
                                        <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                                            Task: {selectedTask.title}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setSelectedTask(null)}
                                    className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all text-muted-foreground hover:text-foreground"
                                    title="Close chat"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Inline Chat */}
                            <div className="flex-1 flex flex-col overflow-hidden">
                                <TaskChat
                                    task={selectedTask}
                                    currentUser={user}
                                    otherUser={getOtherUser(selectedTask)}
                                    onClose={() => setSelectedTask(null)}
                                    inline={true}
                                />
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center">
                            <div className="w-20 h-20 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-4">
                                <MessageCircle className="w-10 h-10 text-red-400" />
                            </div>
                            <h3 className="text-xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>Your Messages</h3>
                            <p className="font-light text-center max-w-xs px-6" style={{ color: '#000', fontSize: '0.82em', opacity: 0.8 }}>
                                Select a conversation from the left to start chatting about your projects.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Chat;
