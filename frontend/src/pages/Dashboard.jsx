import { useContext, useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import axios from 'axios';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { useTheme } from '../context/ThemeContext';
import {
    CheckCircle2,
    Clock,
    Layers,
    TrendingUp,
    AlertCircle,
    ArrowUpRight,
    Calendar,
    User,
    CheckSquare
} from 'lucide-react';

const API_BASE = 'https://team-tracker-dbzf.onrender.com';

ChartJS.register(
    CategoryScale, LinearScale, BarElement, Title,
    Tooltip, Legend, ArcElement, PointElement, LineElement
);

const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
};

const MetricCard = ({ icon: Icon, label, value, subtitle, iconColor, iconBg, className = '' }) => {
    return (
        <div className={`card card-hover p-5 flex flex-col justify-between animate-fade-in ${className}`}>
            <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {label}
                </span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBg} ${iconColor}`}>
                    <Icon className="w-4 h-4" />
                </div>
            </div>
            <div>
                <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
                    {value}
                </p>
                {subtitle && (
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-1">
                        {subtitle}
                    </p>
                )}
            </div>
        </div>
    );
};

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const { darkMode } = useTheme();
    const [tasks, setTasks] = useState([]);
    const [timeLogs, setTimeLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [tasksRes, timeLogsRes] = await Promise.all([
                    axios.get(`${API_BASE}/api/tasks`),
                    axios.get(`${API_BASE}/api/timelogs`)
                ]);
                setTasks(tasksRes.data);
                setTimeLogs(timeLogsRes.data);
            } catch (error) {
                console.error('Error fetching dashboard data', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-72">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
                    <p className="text-xs font-medium text-slate-400">Loading metrics...</p>
                </div>
            </div>
        );
    }

    const completedTasks = tasks.filter(t => t.status === 'Completed').length;
    const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
    const pendingTasks = tasks.filter(t => t.status === 'Pending').length;
    const totalTasks = tasks.length;
    const totalMinutes = timeLogs.reduce((acc, log) => acc + (log.duration || 0), 0);
    const hoursLogged = (totalMinutes / 60).toFixed(1);

    const highPriority = tasks.filter(t => t.priority === 'High').length;
    const medPriority = tasks.filter(t => t.priority === 'Medium').length;
    const lowPriority = tasks.filter(t => t.priority === 'Low').length;

    // Chart Design System Tokens
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
        titleFont: { size: 12, weight: 'bold' },
        bodyFont: { size: 11 },
    };

    const barData = {
        labels: ['High', 'Medium', 'Low'],
        datasets: [{
            label: 'Tasks',
            data: [highPriority, medPriority, lowPriority],
            backgroundColor: [
                '#ef4444', // Red for high
                '#f59e0b', // Amber for medium
                '#10b981', // Emerald for low
            ],
            borderRadius: 6,
            borderSkipped: false,
        }],
    };

    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 600,
            easing: 'easeOutQuart',
        },
        plugins: {
            legend: { display: false },
            tooltip: { ...commonTooltip },
        },
        scales: {
            x: {
                ticks: { color: chartTextColor, font: { size: 11 } },
                grid: { display: false },
                border: { display: false },
            },
            y: {
                ticks: { color: chartTextColor, font: { size: 11 }, stepSize: 1 },
                grid: { color: chartGridColor },
                border: { display: false },
            },
        },
    };

    const doughnutData = {
        labels: ['Completed', 'In Progress', 'Pending'],
        datasets: [{
            data: [completedTasks, inProgressTasks, pendingTasks],
            backgroundColor: ['#10b981', '#3b82f6', '#94a3b8'],
            borderWidth: 2,
            borderColor: darkMode ? '#111827' : '#ffffff',
            hoverOffset: 4,
        }],
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
                    color: chartTextColor,
                    padding: 14,
                    usePointStyle: true,
                    pointStyleWidth: 8,
                    font: { size: 11, weight: '500' },
                },
            },
            tooltip: { ...commonTooltip },
        },
    };

    // Sort real tasks by creation date descending to show as Recent Activity
    const recentTasks = [...tasks].slice(0, 5);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Top SaaS Header Greeting */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100 dark:border-slate-800/80">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                        {getGreeting()}, {user?.name || 'there'}
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-normal">
                        Here's what's happening with your team today.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <NavLink
                        to="/tasks"
                        className="btn-secondary text-xs"
                    >
                        <CheckSquare className="w-3.5 h-3.5" />
                        View Tasks
                    </NavLink>
                </div>
            </div>

            {/* Premium KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {(user.role === 'SuperAdmin' || user.role === 'Manager' || user.permissions?.tasks?.view !== false) && (
                    <MetricCard
                        icon={Layers}
                        label={(user.role === 'Manager' || user.role === 'SuperAdmin') ? 'Team Tasks' : 'My Tasks'}
                        value={totalTasks}
                        subtitle={(user.role === 'Manager' || user.role === 'SuperAdmin') ? 'Active team scope' : 'Assigned to your queue'}
                        iconColor="text-indigo-600 dark:text-indigo-400"
                        iconBg="bg-indigo-50 dark:bg-indigo-950/60"
                        className="stagger-1"
                    />
                )}
                <MetricCard
                    icon={CheckCircle2}
                    label="Completed"
                    value={completedTasks}
                    subtitle={totalTasks > 0 ? `${Math.round((completedTasks / totalTasks) * 100)}% resolution rate` : '0% finished'}
                    iconColor="text-emerald-600 dark:text-emerald-400"
                    iconBg="bg-emerald-50 dark:bg-emerald-950/60"
                    className="stagger-2"
                />
                <MetricCard
                    icon={TrendingUp}
                    label="In Progress"
                    value={inProgressTasks}
                    subtitle="Currently underway"
                    iconColor="text-blue-600 dark:text-blue-400"
                    iconBg="bg-blue-50 dark:bg-blue-950/60"
                    className="stagger-3"
                />
                <MetricCard
                    icon={Clock}
                    label="Hours Tracked"
                    value={`${hoursLogged}h`}
                    subtitle="Logged by team members"
                    iconColor="text-amber-600 dark:text-amber-400"
                    iconBg="bg-amber-50 dark:bg-amber-950/60"
                    className="stagger-4"
                />
            </div>

            {/* Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                {/* Priority Breakdown Bar Chart */}
                <div className="card p-5 lg:col-span-3">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                                Tasks by Priority
                            </h2>
                            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                                Distribution of workload by urgency
                            </p>
                        </div>
                    </div>
                    <div className="h-56">
                        <Bar data={barData} options={barOptions} />
                    </div>
                </div>

                {/* Status Doughnut Chart */}
                <div className="card p-5 lg:col-span-2">
                    <div className="mb-4">
                        <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                            Task Status
                        </h2>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                            Overall execution breakdown
                        </p>
                    </div>
                    <div className="h-56">
                        <Doughnut data={doughnutData} options={doughnutOptions} />
                    </div>
                </div>
            </div>

            {/* Recent Tasks Activity Stream */}
            <div className="card p-5">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                            Recent Tasks
                        </h2>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                            Latest active assignments across the workspace
                        </p>
                    </div>
                    <NavLink
                        to="/tasks"
                        className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                    >
                        View all <ArrowUpRight className="w-3.5 h-3.5" />
                    </NavLink>
                </div>

                {recentTasks.length > 0 ? (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {recentTasks.map((task) => (
                            <div key={task._id} className="py-3 flex items-center justify-between gap-4">
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                                            {task.title}
                                        </p>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                            task.priority === 'High' ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400' :
                                            task.priority === 'Medium' ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400' :
                                            'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                                        }`}>
                                            {task.priority}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 mt-1 text-[11px] text-slate-400">
                                        <span className="flex items-center gap-1 truncate">
                                            <User className="w-3 h-3" />
                                            {task.assignedTo?.name || 'Unassigned'}
                                        </span>
                                        {task.deadline && (
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                Due {new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                                        task.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' :
                                        task.status === 'In Progress' ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400' :
                                        'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                    }`}>
                                        {task.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-8 text-center">
                        <AlertCircle className="w-6 h-6 text-slate-300 dark:text-slate-600 mx-auto mb-1.5" />
                        <p className="text-xs text-slate-400">No tasks created yet</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
