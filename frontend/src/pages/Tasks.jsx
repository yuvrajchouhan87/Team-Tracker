import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import TaskCard from '../components/TaskCard';
import { ClipboardList, AlertCircle, ShieldAlert, CheckSquare } from 'lucide-react';

const API_BASE = 'https://team-tracker-dbzf.onrender.com';

const Tasks = () => {
    const { user, searchQuery } = useContext(AuthContext);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('All');

    if ((user.role === 'Developer' || user.role === 'Intern') && user.permissions?.tasks?.view === false) {
        return (
            <div className="flex flex-col items-center justify-center h-[65vh] animate-fade-in text-center px-4">
                <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
                    <ShieldAlert className="w-7 h-7" />
                </div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Access Restricted</h1>
                <p className="max-w-md text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                    Your access to the Task module has been revoked by your workspace administrator. 
                    Contact your administrator if you believe this is an error.
                </p>
            </div>
        );
    }

    const fetchTasks = async () => {
        try {
            const { data } = await axios.get(`${API_BASE}/api/tasks`);
            setTasks(data);
        } catch (error) {
            console.error('Error fetching tasks', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, [user?.role]);

    const filteredTasks = tasks.filter(t => {
        const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterStatus === 'All' || t.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-72">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
                    <p className="text-xs font-medium text-slate-400">Loading tasks...</p>
                </div>
            </div>
        );
    }

    const statuses = ['All', 'Pending', 'In Progress', 'Completed'];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100 dark:border-slate-800/80">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Task Management
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {tasks.length} total assignments · {tasks.filter(t => t.status === 'In Progress').length} in progress
                    </p>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-lg self-start sm:self-auto">
                    {statuses.map(s => {
                        const count = s === 'All' ? tasks.length : tasks.filter(t => t.status === s).length;
                        const active = filterStatus === s;
                        return (
                            <button
                                key={s}
                                onClick={() => setFilterStatus(s)}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                                    active
                                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-semibold'
                                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                <span>{s}</span>
                                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                                    active ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400' : 'bg-slate-200/60 dark:bg-slate-700/60 text-slate-500'
                                }`}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Task Grid */}
            {filteredTasks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredTasks.map((task) => (
                        <TaskCard key={task._id} task={task} onUpdate={fetchTasks} />
                    ))}
                </div>
            ) : (
                <div className="card py-16 flex flex-col items-center justify-center text-center p-6">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-slate-400 flex items-center justify-center mb-3">
                        <ClipboardList className="w-6 h-6" />
                    </div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-1">No tasks found</h2>
                    <p className="text-xs text-slate-400 max-w-xs">
                        {searchQuery || filterStatus !== 'All' 
                            ? 'No assignments match your search query or selected filter.' 
                            : 'All caught up! No tasks are currently assigned.'}
                    </p>
                </div>
            )}
        </div>
    );
};

export default Tasks;
