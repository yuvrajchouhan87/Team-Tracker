import { useContext, useState } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { Clock, Play, Square, User, Calendar, AlertTriangle, CheckCircle2 } from 'lucide-react';
import TaskChat from './TaskChat';

const API_BASE = 'https://team-tracker-dbzf.onrender.com';

const priorityConfig = {
    High:   { bg: 'bg-rose-50 dark:bg-rose-950/40',    text: 'text-rose-600 dark:text-rose-400',    border: 'border-rose-200 dark:border-rose-800/40' },
    Medium: { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800/40' },
    Low:    { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800/40' },
};

const statusConfig = {
    Pending:    { bar: 'bg-slate-300 dark:bg-slate-700', badge: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
    'In Progress': { bar: 'bg-blue-500',  badge: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400' },
    Completed:  { bar: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' },
};

const TaskCard = ({ task, onUpdate }) => {
    const { user } = useContext(AuthContext);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [currentLogId, setCurrentLogId] = useState(null);
    const [showChat, setShowChat] = useState(false);

    const pConfig = priorityConfig[task.priority] || priorityConfig.Medium;
    const sConfig = statusConfig[task.status] || statusConfig.Pending;

    const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== 'Completed';

    const handleStatusChange = async (e) => {
        try {
            await axios.put(`${API_BASE}/api/tasks/${task._id}`, { status: e.target.value });
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Error updating status', error);
        }
    };

    const startTimer = async () => {
        try {
            const res = await axios.post(`${API_BASE}/api/timelogs/start`, { taskId: task._id });
            setIsTimerRunning(true);
            setCurrentLogId(res.data._id);
        } catch (error) {
            alert(error.response?.data?.message || 'Error starting timer');
        }
    };

    const stopTimer = async () => {
        try {
            await axios.put(`${API_BASE}/api/timelogs/stop/${currentLogId}`);
            setIsTimerRunning(false);
            setCurrentLogId(null);
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Error stopping timer', error);
        }
    };

    const otherUser = user?.role === 'Manager' ? task.assignedTo : task.createdBy;
    const canChat = otherUser && (otherUser._id || otherUser.id);

    return (
        <div className="card card-hover p-4 flex flex-col justify-between gap-3 relative">
            <div>
                {/* Header: Priority & Progress indicator */}
                <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${pConfig.bg} ${pConfig.text} ${pConfig.border}`}>
                        {task.priority === 'High' && <AlertTriangle className="w-2.5 h-2.5 mr-1" />}
                        {task.priority} Priority
                    </span>
                    
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${sConfig.badge}`}>
                        {task.status}
                    </span>
                </div>

                {/* Title */}
                <h3 className="font-bold text-xs leading-snug text-slate-900 dark:text-white line-clamp-1 mb-1">
                    {task.title}
                </h3>

                {/* Description */}
                <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                    {task.description || 'No description provided.'}
                </p>
            </div>

            {/* Footer Details */}
            <div className="space-y-3 pt-2.5 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                    {/* Due Date */}
                    <div className={`flex items-center gap-1.5 ${isOverdue ? 'text-rose-500 font-semibold' : ''}`}>
                        <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>
                            {task.deadline 
                                ? `${isOverdue ? 'Overdue · ' : ''}${new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` 
                                : 'No deadline'}
                        </span>
                    </div>

                    {/* Member */}
                    <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-medium truncate max-w-[120px]" title={task.assignedTo?.name || 'Unassigned'}>
                        <User className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{task.assignedTo?.name || 'Unassigned'}</span>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between gap-2 pt-1">
                    {user?.role === 'SuperAdmin' ? (
                        <span className="text-[11px] font-medium text-slate-500">
                            Status: <strong className="text-slate-800 dark:text-slate-200">{task.status}</strong>
                        </span>
                    ) : (
                        <select
                            value={task.status}
                            onChange={handleStatusChange}
                            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-[11px] font-medium text-slate-800 dark:text-slate-200 px-2 py-1 outline-none focus:border-indigo-500"
                        >
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                        </select>
                    )}

                    <div className="flex items-center gap-2">
                        {user?.role === 'Developer' && task.status !== 'Completed' && (
                            !isTimerRunning ? (
                                <button 
                                    onClick={startTimer}
                                    className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                                >
                                    <Play className="w-2.5 h-2.5 fill-white" /> Start
                                </button>
                            ) : (
                                <button 
                                    onClick={stopTimer}
                                    className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white transition-colors animate-pulse"
                                >
                                    <Square className="w-2.5 h-2.5 fill-white" /> Stop
                                </button>
                            )
                        )}

                        {task.status === 'Completed' && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {showChat && canChat && (
                <TaskChat
                    task={task}
                    currentUser={user}
                    otherUser={otherUser}
                    onClose={() => setShowChat(false)}
                />
            )}
        </div>
    );
};

export default TaskCard;
