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
import { Bar, Pie, Doughnut } from 'react-chartjs-2';
import { useTheme } from '../context/ThemeContext';
import {
    TrendingUp, Calendar, User, ShieldCheck, ClipboardList, Users, Settings, Plus,
    BarChart3, CheckCircle2, Clock, AlertCircle
} from 'lucide-react';

const API_BASE = 'http://localhost:5000';


ChartJS.register(
    CategoryScale, LinearScale, BarElement, Title,
    Tooltip, Legend, ArcElement, PointElement, LineElement
);

const StatCard = ({ icon: Icon, label, value, color, subtitle }) => {
    const themeColors = {
        'stat-red': { icon: '#f97316', bg: '#fff7ed' },
        'stat-green': { icon: '#10b981', bg: '#f0fdf4' },
        'stat-blue': { icon: '#3b82f6', bg: '#eff6ff' },
        'stat-amber': { icon: '#f59e0b', bg: '#fffbeb' },
        'stat-purple': { icon: '#8b5cf6', bg: '#f5f3ff' },
    };
    
    const colors = themeColors[color] || { icon: '#64748b', bg: '#f8fafc' };

    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200 flex items-center gap-5 transition-all hover:shadow-md animate-fade-in" 
             style={{ animationDelay: '0.1s' }}>
            
            <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0" 
                 style={{ background: colors.bg }}>
                <Icon className="w-7 h-7" style={{ color: colors.icon }} strokeWidth={2} />
            </div>

            <div className="flex flex-col">
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    {label}
                </p>
                <p className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
                    {value}
                </p>
                {subtitle && (
                    <p className="text-[10px] font-bold mt-0.5" style={{ color: 'var(--text-secondary)' }}>
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
                    axios.get('http://localhost:5000/api/tasks'),
                    axios.get('http://localhost:5000/api/timelogs')
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

    if (loading) return (
        <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" />
                <p style={{ color: 'var(--text-secondary)' }}>Loading dashboard...</p>
            </div>
        </div>
    );

    const completedTasks = tasks.filter(t => t.status === 'Completed').length;
    const pendingTasks = tasks.filter(t => t.status === 'Pending').length;
    const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
    const totalTasks = tasks.length;
    const totalTimeSpent = timeLogs.reduce((acc, log) => acc + (log.duration || 0), 0);

    const highPriority = tasks.filter(t => t.priority === 'High').length;
    const medPriority = tasks.filter(t => t.priority === 'Medium').length;
    const lowPriority = tasks.filter(t => t.priority === 'Low').length;

    const chartTextColor = darkMode ? '#94a3b8' : '#64748b';
    const chartGridColor = darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
    const tooltipBg = darkMode ? '#1e293b' : '#ffffff';
    const tooltipBorder = darkMode ? '#334155' : '#e2e8f0';

    const commonTooltip = {
        backgroundColor: tooltipBg,
        titleColor: darkMode ? '#f1f5f9' : '#0f172a',
        bodyColor: chartTextColor,
        borderColor: tooltipBorder,
        borderWidth: 1,
        padding: 12,
        cornerRadius: 10,
    };

    const doughnutData = {
        labels: ['Completed', 'In Progress', 'Pending'],
        datasets: [{
            data: [completedTasks, inProgressTasks, pendingTasks],
            backgroundColor: ['#10b981', '#3b82f6', '#f97316'],
            hoverBackgroundColor: ['#059669', '#2563eb', '#ea580c'],
            borderWidth: 3,
            borderColor: darkMode ? '#131929' : '#ffffff',
            hoverOffset: 8,
        }],
    };

    const barData = {
        labels: ['High Priority', 'Medium Priority', 'Low Priority'],
        datasets: [{
            label: 'Tasks',
            data: [highPriority, medPriority, lowPriority],
            backgroundColor: [
                '#f97316',
                '#fbbf24',
                '#34d399',
            ],
            borderRadius: 6,
            borderSkipped: false,
        }],
    };

    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
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

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: chartTextColor,
                    padding: 16,
                    usePointStyle: true,
                    pointStyleWidth: 8,
                    font: { size: 12 },
                },
            },
            tooltip: { ...commonTooltip },
        },
    };



    return (
        <div className="space-y-6 animate-fade-in">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {(user.role === 'SuperAdmin' || user.role === 'Manager' || user.permissions?.tasks?.view !== false) && (
                    <StatCard icon={BarChart3} label={(user.role === 'Manager' || user.role === 'SuperAdmin') ? "Team Tasks" : "My Tasks"} value={totalTasks} color="stat-red" subtitle={(user.role === 'Manager' || user.role === 'SuperAdmin') ? "All team tasks" : "Assigned to you"} />
                )}
                <StatCard icon={CheckCircle2} label="Completed" value={completedTasks} color="stat-green" subtitle="Tasks finished" />
                <StatCard icon={TrendingUp} label="In Progress" value={inProgressTasks} color="stat-blue" subtitle="Actively working" />
                <StatCard icon={Clock} label="Hours Tracked" value={(totalTimeSpent / 60).toFixed(1)} color="stat-amber" subtitle="Total time logged" />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Bar Chart - Tasks by Priority */}
                <div className="card p-6 lg:col-span-3 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Tasks by Priority</h3>
                            <p className="font-light" style={{ color: '#000', fontSize: '0.82em', opacity: 0.8 }}>Distribution across priority levels</p>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                            <BarChart3 className="w-5 h-5 text-orange-500" />
                        </div>
                    </div>
                    <div style={{ height: '220px' }}>
                        <Bar data={barData} options={barOptions} />
                    </div>
                </div>

                {/* Doughnut Chart - Task Status */}
                <div className="card p-6 lg:col-span-2 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                    <div className="mb-4">
                        <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Task Status</h3>
                        <p className="font-light" style={{ color: '#000', fontSize: '0.82em', opacity: 0.8 }}>Overall distribution</p>
                    </div>
                    <div style={{ height: '220px' }}>
                        <Doughnut data={doughnutData} options={doughnutOptions} />
                    </div>
                </div>
            </div>


        </div>
    );
};

export default Dashboard;
