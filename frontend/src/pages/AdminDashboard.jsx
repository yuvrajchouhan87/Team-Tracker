import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { createPortal } from 'react-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { ShieldCheck, UserPlus, Users, Trash2, Plus, Calendar, AlertCircle, CheckCircle2, XCircle, BarChart3, PieChart } from 'lucide-react';
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

ChartJS.register(
    CategoryScale, LinearScale, BarElement, Title,
    Tooltip, Legend, ArcElement
);

const AdminDashboard = () => {
    const { user, searchQuery } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('Medium');
    const [deadline, setDeadline] = useState('');
    const [assignedTo, setAssignedTo] = useState('');
    const [roleSelections, setRoleSelections] = useState({});
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [assignedUserName, setAssignedUserName] = useState('');

    const fetchData = async () => {
        try {
            const [usersRes, tasksRes] = await Promise.all([
                axios.get('http://localhost:5000/api/auth/users'),
                axios.get('http://localhost:5000/api/tasks')
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

    const handleApprove = async (userId, selectedRole) => {
        try {
            await axios.put(`http://localhost:5000/api/auth/users/${userId}/approve`, { role: selectedRole });
            fetchData();
        } catch (error) {
            alert('Failed to approve user');
        }
    };

    const handleReject = async (userId, userName) => {
        if (!window.confirm(`Are you sure you want to reject "${userName}"?`)) return;
        try {
            await axios.put(`http://localhost:5000/api/auth/users/${userId}/reject`);
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to reject user');
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (!window.confirm('Are you sure you want to delete this task?')) return;
        try {
            await axios.delete(`http://localhost:5000/api/tasks/${taskId}`);
            fetchData();
        } catch (error) {
            alert('Failed to delete task');
        }
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/tasks', { title, description, priority, deadline, assignedTo });
            setTitle(''); setDescription(''); setPriority('Medium'); setDeadline(''); setAssignedTo('');
            fetchData();
            const userObj = allApprovedUsers.find(u => u._id === assignedTo);
            setAssignedUserName(userObj ? userObj.name : 'the team member');
            setShowSuccessModal(true);
        } catch (error) {
            alert('Error creating task');
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-full">
            <div className="w-10 h-10 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" />
        </div>
    );

    const pendingUsers = users.filter(u => u.status === 'Pending');
    const allApprovedUsers = users.filter(u => u.status === 'Approved' && u.role !== 'SuperAdmin')
        .filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.role.toLowerCase().includes(searchQuery.toLowerCase()));

    const filteredTasks = tasks.filter(t => 
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        t.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Chart Data Calculations
    const highPriority = tasks.filter(t => t.priority === 'High').length;
    const medPriority = tasks.filter(t => t.priority === 'Medium').length;
    const lowPriority = tasks.filter(t => t.priority === 'Low').length;

    const completedTasks = tasks.filter(t => t.status === 'Completed').length;
    const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
    const pendingTasksCount = tasks.filter(t => t.status === 'Pending').length;

    const priorityChartData = {
        labels: ['High', 'Medium', 'Low'],
        datasets: [{
            label: 'Tasks',
            data: [highPriority, medPriority, lowPriority],
            backgroundColor: ['#ef4444', '#f59e0b', '#10b981'],
            borderRadius: 8,
        }]
    };

    const statusChartData = {
        labels: ['Completed', 'In Progress', 'Pending'],
        datasets: [{
            data: [completedTasks, inProgressTasks, pendingTasksCount],
            backgroundColor: ['#10b981', '#3b82f6', '#f97316'],
            borderWidth: 0,
            hoverOffset: 10
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
        },
        scales: {
            y: { beginAtZero: true, grid: { display: false }, ticks: { stepSize: 1 } },
            x: { grid: { display: false } }
        }
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    font: { size: 11, weight: 'bold' }
                }
            }
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                    <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>SuperAdmin Panel</h1>
                    <p className="font-light mt-0.5" style={{ color: '#000', fontSize: '0.82em', opacity: 0.8 }}>Manage user approvals, assign tasks, and maintain full control.</p>
                </div>
            </div>

            {/* Quick Stats & Graphs */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-2 card p-6 border border-slate-100">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Tasks by Priority</h3>
                            <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Urgency distribution across the team</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                            <BarChart3 className="w-5 h-5 text-red-500" />
                        </div>
                    </div>
                    <div className="h-[200px]">
                        <Bar data={priorityChartData} options={chartOptions} />
                    </div>
                </div>

                <div className="card p-6 border border-slate-100">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Work Status</h3>
                            <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Overall progress</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                            <PieChart className="w-5 h-5 text-orange-500" />
                        </div>
                    </div>
                    <div className="h-[200px]">
                        <Doughnut data={statusChartData} options={doughnutOptions} />
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <div className="flex-1 bg-white p-6 rounded-2xl border border-slate-100 flex flex-col justify-center">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Active Tasks</p>
                        <h4 className="text-3xl font-black text-slate-800">{tasks.length}</h4>
                        <div className="mt-4 flex items-center gap-2">
                            <span className="px-2 py-1 bg-green-100 text-green-600 text-[10px] font-bold rounded-full">+{completedTasks} Done</span>
                            <span className="px-2 py-1 bg-blue-100 text-blue-600 text-[10px] font-bold rounded-full">{inProgressTasks} Active</span>
                        </div>
                    </div>
                    <div className="flex-1 bg-orange-500 p-6 rounded-2xl flex flex-col justify-center text-white shadow-lg shadow-orange-100">
                        <p className="text-xs font-bold opacity-80 uppercase tracking-widest mb-1">Pending Approvals</p>
                        <h4 className="text-3xl font-black">{pendingUsers.length}</h4>
                        <Link to="/permission-requests" className="mt-4 text-[10px] font-bold underline underline-offset-4 hover:opacity-80 transition-opacity">
                            View All Requests →
                        </Link>
                    </div>
                </div>
            </div>

            {/* Link to Permission Requests - Compact version if pendings exist and not handled above */}
            {/* Removed the redundant alert card since it's now integrated into the stats */}

            
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
                <div className="xl:col-span-2 space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Quick Assign Form */}
                        <div className="card p-6 border border-orange-200">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                                    <Plus className="w-5 h-5 text-orange-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Quick Assign</h3>
                                    <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Create and assign a new task</p>
                                </div>
                            </div>
                            <form onSubmit={handleCreateTask} className="space-y-4">
                                <input
                                    type="text" placeholder="Task Title" required
                                    className="input-base text-sm" value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                                <textarea
                                    placeholder="Description" required
                                    className="input-base text-sm min-h-[100px] resize-none" value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <select
                                        className="input-base text-sm" value={priority}
                                        onChange={(e) => setPriority(e.target.value)}
                                    >
                                        <option value="Low">Low Priority</option>
                                        <option value="Medium">Medium Priority</option>
                                        <option value="High">High Priority</option>
                                    </select>
                                    <input
                                        type="date" required
                                        className="input-base text-sm" value={deadline}
                                        onChange={(e) => setDeadline(e.target.value)}
                                    />
                                </div>
                                <select
                                    className="input-base text-sm" value={assignedTo} required
                                    onChange={(e) => setAssignedTo(e.target.value)}
                                >
                                    <option value="">Assign To...</option>
                                    {allApprovedUsers.map(u => (
                                        <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                                    ))}
                                </select>
                                <button type="submit" className="btn-primary w-full py-2.5 text-sm font-bold flex items-center justify-center gap-2">
                                    <Plus className="w-4 h-4" /> Create Task
                                </button>
                            </form>
                        </div>

                        {/* Manage All Tasks */}
                        <div className="card p-6 border border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                    <Users className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Manage All Tasks</h3>
                                    <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Monitor and delete team tasks</p>
                                </div>
                            </div>
                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {filteredTasks.length > 0 ? (
                                    filteredTasks.map(task => (
                                        <div key={task._id} className="relative group">
                                            <TaskCard task={task} />
                                            <button
                                                onClick={() => handleDeleteTask(task._id)}
                                                className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 shadow-lg z-20"
                                                title="Delete Task"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-10 opacity-50">
                                        <AlertCircle className="w-10 h-10 mx-auto mb-2" />
                                        <p className="text-sm italic">No tasks created yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="xl:col-span-1">
                    <AIChatbot dashboardData={{ tasks, users }} onActionComplete={fetchData} />
                </div>
            </div>

            {/* Success Modal */}
            {showSuccessModal && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="card max-w-sm w-full p-8 text-center animate-scale-in">
                        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="w-10 h-10 text-green-500" />
                        </div>
                        <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Task Created!</h3>
                        <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
                            Your new task has been successfully created and assigned to <span className="font-bold text-orange-500">{assignedUserName}</span>.
                        </p>
                        <button
                            onClick={() => setShowSuccessModal(false)}
                            className="btn-primary w-full py-3 font-bold"
                        >
                            Got it!
                        </button>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default AdminDashboard;
