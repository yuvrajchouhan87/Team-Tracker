import { useContext, useState } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { Clock, Play, Square, User, Calendar, AlertTriangle, MessageCircle } from 'lucide-react';
import TaskChat from './TaskChat';

const priorityConfig = {
    High:   { bg: 'bg-red-100 dark:bg-red-900/30',    text: 'text-red-600 dark:text-red-400',    dot: 'bg-red-500',   icon: AlertTriangle },
    Medium: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-500', icon: null },
    Low:    { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400', dot: 'bg-green-500', icon: null },
};

const statusConfig = {
    Pending:    { bar: 'bg-amber-400', label: 'text-amber-600 dark:text-amber-400' },
    'In Progress': { bar: 'bg-orange-500',  label: 'text-orange-600 dark:text-orange-400' },
    Completed:  { bar: 'bg-green-500', label: 'text-green-600 dark:text-green-400' },
};

const TaskCard = ({ task, onUpdate }) => {
    const { user } = useContext(AuthContext);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [currentLogId, setCurrentLogId] = useState(null);
    const [showChat, setShowChat] = useState(false);

    const pConfig = priorityConfig[task.priority] || priorityConfig.Medium;
    const sConfig = statusConfig[task.status] || statusConfig.Pending;

    const isOverdue = new Date(task.deadline) < new Date() && task.status !== 'Completed';

    const handleStatusChange = async (e) => {
        try {
            await axios.put(`https://team-tracker-dbzf.onrender.com/api/tasks/${task._id}`, { status: e.target.value });
            onUpdate();
        } catch (error) {
            console.error('Error updating status', error);
        }
    };

    const startTimer = async () => {
        try {
            const res = await axios.post('https://team-tracker-dbzf.onrender.com/api/timelogs/start', { taskId: task._id });
            setIsTimerRunning(true);
            setCurrentLogId(res.data._id);
        } catch (error) {
            alert(error.response?.data?.message || 'Error starting timer');
        }
    };

    const stopTimer = async () => {
        try {
            await axios.put(`https://team-tracker-dbzf.onrender.com/api/timelogs/stop/${currentLogId}`);
            setIsTimerRunning(false);
            setCurrentLogId(null);
            onUpdate();
        } catch (error) {
            console.error('Error stopping timer', error);
        }
    };

    const otherUser = user.role === 'Manager' ? task.assignedTo : task.createdBy;
    const canChat = otherUser && (otherUser._id || otherUser.id);

    return (
        <div className="card p-5 flex flex-col gap-4 group relative">
            {/* Status Bar */}
            <div className="h-1 w-full rounded-full overflow-hidden" style={{ background: 'var(--border-color)' }}>
                <div className={`h-full rounded-full transition-all ${sConfig.bar} ${
                    task.status === 'Completed' ? 'w-full' :
                    task.status === 'In Progress' ? 'w-1/2' : 'w-1/6'
                }`} />
            </div>

            {/* Header */}
            <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-sm leading-snug" style={{ color: 'var(--text-primary)' }}>
                    {task.title}
                </h3>
                <span className={`flex-shrink-0 flex items-center gap-1 px-2 py-0.5 text-xs font-bold rounded-full ${pConfig.bg} ${pConfig.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${pConfig.dot}`} />
                    {task.priority}
                </span>
            </div>

            {/* Description */}
            <p className="text-xs leading-relaxed line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                {task.description}
            </p>

            {/* Meta */}
            <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-secondary)' }}>
                <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-500' : ''}`}>
                    <Calendar className="w-3.5 h-3.5" />
                    {isOverdue ? '⚠ Overdue · ' : ''}{new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
                {user.role === 'Manager' || user.role === 'SuperAdmin' ? (
                    <div className="flex items-center gap-1" title={`Assigned to: ${task.assignedTo?.name || 'Unassigned'}`}>
                        <User className="w-3.5 h-3.5" />
                        <span className="truncate max-w-[100px]">{task.assignedTo?.name || 'Unassigned'}</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-1" title={`Assigned by: ${task.createdBy?.role || 'Manager'}`}>
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800/50">
                            <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">By:</span>
                            <span className="truncate max-w-[80px] font-semibold text-orange-700 dark:text-orange-300">{task.createdBy?.role || 'Manager'}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t gap-2" style={{ borderColor: 'var(--border-color)' }}>
                {user.role === 'SuperAdmin' ? (
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-lg ${sConfig.label}`}
                        style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
                        {task.status}
                    </span>
                ) : (
                    <select
                        value={task.status}
                        onChange={handleStatusChange}
                        className="text-xs rounded-lg px-2 py-1.5 font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
                        style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                    >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                    </select>
                )}

                <div className="flex items-center gap-2">
                {user.role === 'Developer' && task.status !== 'Completed' && (
                    !isTimerRunning ? (
                        <button onClick={startTimer}
                            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-green-500 hover:bg-green-600 text-white transition-all hover:shadow-md">
                            <Play className="w-3 h-3 fill-white" /> Start
                        </button>
                    ) : (
                        <button onClick={stopTimer}
                            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-all animate-pulse">
                            <Square className="w-3 h-3 fill-white" /> Stop
                        </button>
                    )
                )}



                {task.status === 'Completed' && (
                    <span className="text-xs font-semibold text-green-600 dark:text-green-400 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500" /> Done
                    </span>
                )}
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
