import { useState, useEffect, useContext } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import TaskCard from '../components/TaskCard';
import { Plus, Search, Filter, ClipboardList, AlertCircle, Shield } from 'lucide-react';

const Tasks = () => {
    const { user, searchQuery } = useContext(AuthContext);
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('All');

    if ((user.role === 'Developer' || user.role === 'Intern') && user.permissions?.tasks?.view === false) {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh] animate-fade-in text-center px-4">
                <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-6">
                    <Shield className="w-10 h-10 text-red-600 dark:text-red-400" />
                </div>
                <h1 className="text-3xl font-black mb-3" style={{ color: 'var(--text-primary)' }}>Access Denied</h1>
                <p className="max-w-md text-lg font-medium mb-8" style={{ color: 'var(--text-muted)' }}>
                    Your access to the Task module has been revoked by the SuperAdmin. 
                    Please contact your administrator if you believe this is an error.
                </p>
                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800 rounded-xl flex items-start gap-3 text-left max-w-sm">
                    <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-orange-700 dark:text-orange-300">
                        Restrictions like these help maintain project focus and security during specific phases.
                    </p>
                </div>
            </div>
        );
    }



    const fetchTasks = async () => {
        try {
            const { data } = await axios.get('https://team-tracker-dbzf.onrender.com/api/tasks');
            setTasks(data);
        } catch (error) {
            console.error('Error fetching tasks', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const { data } = await axios.get('https://team-tracker-dbzf.onrender.com/api/auth/users');
            setUsers(data.filter(u => u.status === 'Approved' && u.role !== 'SuperAdmin'));
        } catch (error) {
            console.error('Error fetching users', error);
        }
    };

    useEffect(() => {
        fetchTasks();
        if (user.role === 'Manager' || user.role === 'SuperAdmin') fetchUsers();
    }, [user.role]);



    const filteredTasks = tasks.filter(t => {
        const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterStatus === 'All' || t.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    if (loading) return (
        <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 rounded-full border-4 border-red-500 border-t-transparent animate-spin" />
        </div>
    );

    const statuses = ['All', 'Pending', 'In Progress', 'Completed'];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>Task Management</h1>
                    <p className="font-light mt-0.5" style={{ color: '#000', fontSize: '0.82em', opacity: 0.8 }}>
                        {tasks.length} total · {tasks.filter(t => t.status === 'In Progress').length} in progress
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="card p-3 sm:p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex gap-2 flex-wrap justify-center sm:justify-start">
                    {statuses.map(s => (
                        <button
                            key={s}
                            onClick={() => setFilterStatus(s)}
                            className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                            style={filterStatus === s
                                ? { background: '#f97316', color: 'white' }
                                : { background: 'var(--bg-primary)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }
                            }
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Task Grid */}
            {filteredTasks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
                    {filteredTasks.map((task, i) => (
                        <div key={task._id} className="animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                            <TaskCard task={task} onUpdate={fetchTasks} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="card flex flex-col items-center justify-center py-20">
                    <ClipboardList className="w-14 h-14 mb-4" style={{ color: 'var(--text-muted)' }} />
                    <h3 className="font-bold text-lg mb-1" style={{ color: 'var(--text-primary)' }}>No tasks found</h3>
                    <p style={{ color: 'var(--text-muted)' }} className="text-sm">
                        {searchQuery || filterStatus !== 'All' ? 'Try adjusting your filters.' : 'Get started by creating your first task.'}
                    </p>
                </div>
            )}


        </div>
    );
};

export default Tasks;
