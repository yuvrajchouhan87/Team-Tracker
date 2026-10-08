import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { createPortal } from 'react-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { 
    ShieldCheck, 
    UserPlus, 
    Trash2, 
    Plus, 
    Calendar, 
    AlertCircle, 
    CheckCircle2, 
    BarChart3, 
    PieChart,
    Layers,
    ArrowRight
} from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import TaskCard from '../components/TaskCard';
import AIChatbot from '../components/AIChatbot';
import { useTheme } from '../context/ThemeContext';

const API_BASE = 'https://team-tracker-dbzf.onrender.com';

ChartJS.register(
    CategoryScale, LinearScale, BarElement, Title,
    Tooltip, Legend, ArcElement
);

const AdminDashboard = () => {
    const { user, searchQuery } = useContext(AuthContext);
    const { darkMode } = useTheme();
    const [users, setUsers] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('Medium');
    const [deadline, setDeadline] = useState('');
    const [assignedTo, setAssignedTo] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [assignedUserName, setAssignedUserName] = useState('');

    const fetchData = async () => {
        try {
            const [usersRes, tasksRes] = await Promise.all([
                axios.get(`${API_BASE}/api/auth/users`),
                axios.get(`${API_BASE}/api/tasks`)
            ]);
            setUsers(usersRes.data);
            setTasks(tasksRes.data);
        } catch (error) {
            console.error('Error fetching admin data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDeleteTask = async (taskId) => {
        if (!window.confirm('Are you sure you want to delete this task?')) return;
        try {
            await axios.delete(`${API_BASE}/api/tasks/${taskId}`);
            fetchData();
        } catch (error) {
            alert('Failed to delete task');
        }
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_BASE}/api/tasks`, { title, description, priority, deadline, assignedTo });
            setTitle(''); setDescription(''); setPriority('Medium'); setDeadline(''); setAssignedTo('');
            fetchData();
            const userObj = allApprovedUsers.find(u => u._id === assignedTo);
            setAssignedUserName(userObj ? userObj.name : 'the team member');
            setShowSuccessModal(true);
        } catch (error) {
            alert('Error creating task');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-72">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
                    <p className="text-xs font-medium text-slate-400">Loading admin panel...</p>
                </div>
            </div>
        );
    }

    const pendingUsers = users.filter(u => u.status === 'Pending');
    const allApprovedUsers = users.filter(u => u.status === 'Approved' && u.role !== 'SuperAdmin')
        .filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.role.toLowerCase().includes(searchQuery.toLowerCase()));

    const filteredTasks = tasks.filter(t => 
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        t.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const highPriority = tasks.filter(t => t.priority === 'High').length;
    const medPriority = tasks.filter(t => t.priority === 'Medium').length;
    const lowPriority = tasks.filter(t => t.priority === 'Low').length;

    const completedTasks = tasks.filter(t => t.status === 'Completed').length;
    const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
    const pendingTasksCount = tasks.filter(t => t.status === 'Pending').length;

    const chartTextColor = darkMode ? '#94a3b8' : '#64748b';
    const chartGridColor = darkMode ? 'rgba(255, 255, 255, 0.04)' : 'rgba(15, 23, 42, 0.05)';
    const tooltipBg = darkMode ? '#0f172a' : '#ffffff';
    const tooltipBorder = darkMode ? '#1e293b' : '#e2e8f0';

    const commonTooltip = {
        backgroundColor: tooltipBg,
        titleColor: darkMode ? '#f8fafc' : '#0f172a',
        bodyColor: chartTextColor,
        borderColor: tooltipBorder,
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
    };

    const priorityChartData = {
        labels: ['High', 'Medium', 'Low'],
        datasets: [{
            label: 'Tasks',
            data: [highPriority, medPriority, lowPriority],
            backgroundColor: ['#ef4444', '#f59e0b', '#10b981'],
            borderRadius: 6,
        }]
    };

    const statusChartData = {
        labels: ['Completed', 'In Progress', 'Pending'],
        datasets: [{
            data: [completedTasks, inProgressTasks, pendingTasksCount],
            backgroundColor: ['#10b981', '#3b82f6', '#94a3b8'],
            borderWidth: 2,
            borderColor: darkMode ? '#111827' : '#ffffff',
            hoverOffset: 6
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 600,
            easing: 'easeOutQuart',
        },
        plugins: { legend: { display: false }, tooltip: { ...commonTooltip } },
        scales: {
            y: { beginAtZero: true, grid: { color: chartGridColor }, ticks: { stepSize: 1, color: chartTextColor } },
            x: { grid: { display: false }, ticks: { color: chartTextColor } }
        }
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 600,
            easing: 'easeOutQuart',
        },
        cutout: '72%',
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    padding: 14,
                    color: chartTextColor,
                    font: { size: 11, weight: '500' }
                }
            },
            tooltip: { ...commonTooltip }
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                        <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                            Administrator Console
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Manage user governance, task assignments, and workspace metrics.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Link
                        to="/permission-requests/pending"
                        className="btn-secondary text-xs"
                    >
                        <UserPlus className="w-3.5 h-3.5" />
                        Requests ({pendingUsers.length})
                    </Link>
                </div>
            </div>

            {/* Quick Metrics & Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <div className="lg:col-span-2 card p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Priority Distribution</h2>
                            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Severity across all active tasks</p>
                        </div>
                        <BarChart3 className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="h-44">
                        <Bar data={priorityChartData} options={chartOptions} />
                    </div>
                </div>

                <div className="card p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Execution Status</h2>
                            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Overall progress</p>
                        </div>
                        <PieChart className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="h-44">
                        <Doughnut data={statusChartData} options={doughnutOptions} />
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <div className="card p-4 flex-1 flex flex-col justify-between">
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Total Active Tasks</span>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">{tasks.length}</p>
                        <div className="flex items-center gap-1.5 mt-2">
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 tabular-nums">
                                {completedTasks} Done
                            </span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 tabular-nums">
                                {inProgressTasks} In Progress
                            </span>
                        </div>
                    </div>

                    <div className="card p-4 flex-1 flex flex-col justify-between bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/40">
                        <span className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-300">Pending Approvals</span>
                        <p className="text-2xl font-bold text-indigo-900 dark:text-white mt-1 tabular-nums">{pendingUsers.length}</p>
                        <Link 
                            to="/permission-requests" 
                            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 mt-2"
                        >
                            Review requests <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Quick Assign Form + Manage All Tasks + AI Assistant */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
                <div className="xl:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Quick Assign Form */}
                        <div className="card p-5">
                            <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                                <Plus className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                <div>
                                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">Quick Assign</h2>
                                    <p className="text-[11px] text-slate-400">Dispatch a task instantly</p>
                                </div>
                            </div>
                            <form onSubmit={handleCreateTask} className="space-y-3">
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Title</label>
                                    <input
                                        type="text" placeholder="Task title" required
                                        className="input-base text-xs py-2" value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Description</label>
                                    <textarea
                                        placeholder="Task details and expectations" required
                                        className="input-base text-xs py-2 resize-none" rows="3" value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Priority</label>
                                        <select
                                            className="input-base text-xs py-2" value={priority}
                                            onChange={(e) => setPriority(e.target.value)}
                                        >
                                            <option value="Low">Low</option>
                                            <option value="Medium">Medium</option>
                                            <option value="High">High</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Deadline</label>
                                        <input
                                            type="date" required
                                            className="input-base text-xs py-2" value={deadline}
                                            onChange={(e) => setDeadline(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Assignee</label>
                                    <select
                                        className="input-base text-xs py-2" value={assignedTo} required
                                        onChange={(e) => setAssignedTo(e.target.value)}
                                    >
                                        <option value="">Select team member...</option>
                                        {allApprovedUsers.map(u => (
                                            <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                                        ))}
                                    </select>
                                </div>
                                <button type="submit" className="btn-primary w-full py-2 text-xs font-semibold">
                                    <Plus className="w-3.5 h-3.5 mr-1" /> Create & Assign
                                </button>
                            </form>
                        </div>

                        {/* Manage All Tasks */}
                        <div className="card p-5">
                            <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                                <Layers className="w-4 h-4 text-slate-500" />
                                <div>
                                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">Active Queue</h2>
                                    <p className="text-[11px] text-slate-400">Review or purge active tasks</p>
                                </div>
                            </div>
                            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
                                {filteredTasks.length > 0 ? (
                                    filteredTasks.map(task => (
                                        <div key={task._id} className="relative group">
                                            <TaskCard task={task} onUpdate={fetchData} />
                                            <button
                                                onClick={() => handleDeleteTask(task._id)}
                                                className="absolute top-3 right-3 p-1.5 bg-rose-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-700 shadow-sm z-20 text-xs"
                                                title="Delete Task"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12">
                                        <AlertCircle className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                                        <p className="text-xs text-slate-400">No tasks in queue</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* AI Chatbot Assistant Sidecard */}
                <div className="xl:col-span-1">
                    <AIChatbot dashboardData={{ tasks, users }} onActionComplete={fetchData} />
                </div>
            </div>

            {/* Success Modal */}
            {showSuccessModal && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 modal-backdrop animate-fade-in">
                    <div className="card bg-white dark:bg-slate-900 max-w-sm w-full p-7 text-center animate-modal">
                        <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="w-7 h-7" />
                        </div>
                        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">Task Dispatched</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                            Successfully assigned to <span className="font-semibold text-indigo-600 dark:text-indigo-400">{assignedUserName}</span>.
                        </p>
                        <button
                            onClick={() => setShowSuccessModal(false)}
                            className="btn-primary w-full py-2.5 text-xs font-semibold"
                        >
                            Acknowledge
                        </button>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default AdminDashboard;
