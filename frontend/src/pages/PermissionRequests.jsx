import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, NavLink } from 'react-router-dom';
import { UserPlus, Users, CheckCircle2, XCircle, Mail, Clock, ShieldCheck, Check, X } from 'lucide-react';

const API_BASE = 'https://team-tracker-dbzf.onrender.com';

const PermissionRequests = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [roleSelections, setRoleSelections] = useState({});
    const { status: urlStatus } = useParams();
    const currentStatus = urlStatus ? urlStatus.charAt(0).toUpperCase() + urlStatus.slice(1).toLowerCase() : 'Pending';

    const fetchUsers = async () => {
        try {
            const { data } = await axios.get(`${API_BASE}/api/auth/users`);
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleApprove = async (userId, selectedRole) => {
        try {
            await axios.put(`${API_BASE}/api/auth/users/${userId}/approve`, { role: selectedRole });
            fetchUsers();
        } catch (error) {
            alert('Failed to approve user');
        }
    };

    const handleReject = async (userId, userName) => {
        if (!window.confirm(`Are you sure you want to reject "${userName}"?`)) return;
        try {
            await axios.put(`${API_BASE}/api/auth/users/${userId}/reject`);
            fetchUsers();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to reject user');
        }
    };

    const displayUsers = users.filter(u => u.status === currentStatus && u.role !== 'SuperAdmin');

    if (loading) {
        return (
            <div className="flex items-center justify-center h-72">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
                    <p className="text-xs font-medium text-slate-400">Loading access requests...</p>
                </div>
            </div>
        );
    }

    const statuses = ['Pending', 'Approved', 'Rejected'];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                        <UserPlus className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                            Access Requests & Approvals
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Authorize new registrations and assign startup workspace roles.
                        </p>
                    </div>
                </div>

                {/* Status Tabs */}
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-lg self-start sm:self-auto">
                    {statuses.map(s => {
                        const path = `/permission-requests/${s.toLowerCase()}`;
                        const active = currentStatus === s;
                        const count = users.filter(u => u.status === s && u.role !== 'SuperAdmin').length;
                        return (
                            <NavLink
                                key={s}
                                to={path}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                                    active
                                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-semibold'
                                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                <span>{s}</span>
                                <span className={`text-[10px] px-1.5 rounded-full font-mono ${
                                    active ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400' : 'bg-slate-200/60 dark:bg-slate-700/60 text-slate-500'
                                }`}>
                                    {count}
                                </span>
                            </NavLink>
                        );
                    })}
                </div>
            </div>

            {/* List */}
            {displayUsers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {displayUsers.map(u => (
                        <div key={u._id} className="card p-5 flex flex-col justify-between gap-4">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300 text-xs flex-shrink-0">
                                        {u.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-bold text-xs text-slate-900 dark:text-white truncate">{u.name}</h3>
                                        <p className="text-[11px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                                            <Mail className="w-3 h-3 flex-shrink-0" />
                                            {u.email}
                                        </p>
                                    </div>
                                </div>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                    currentStatus === 'Pending' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400' :
                                    currentStatus === 'Approved' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' :
                                    'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                                }`}>
                                    {currentStatus}
                                </span>
                            </div>

                            {currentStatus === 'Pending' ? (
                                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                                            Assign Initial Role
                                        </label>
                                        <select
                                            className="input-base text-xs py-1.5"
                                            value={roleSelections[u._id] || 'Developer'}
                                            onChange={(e) => setRoleSelections(prev => ({ ...prev, [u._id]: e.target.value }))}
                                        >
                                            <option value="Developer">Developer</option>
                                            <option value="Intern">Intern</option>
                                            <option value="Manager">Manager</option>
                                        </select>
                                    </div>

                                    <div className="flex items-center gap-2 pt-1">
                                        <button
                                            onClick={() => handleApprove(u._id, roleSelections[u._id] || 'Developer')}
                                            className="btn-primary flex-1 py-1.5 text-xs font-semibold"
                                        >
                                            <Check className="w-3.5 h-3.5 mr-1" /> Approve
                                        </button>
                                        <button
                                            onClick={() => handleReject(u._id, u.name)}
                                            className="btn-secondary flex-1 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400"
                                        >
                                            <X className="w-3.5 h-3.5 mr-1" /> Reject
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                                    <span>Assigned Role:</span>
                                    <span className="font-semibold text-slate-800 dark:text-slate-200">{u.role || 'None'}</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="card py-16 flex flex-col items-center justify-center text-center p-6">
                    <CheckCircle2 className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-2" />
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-1">No {currentStatus} Requests</h2>
                    <p className="text-xs text-slate-400 max-w-xs">
                        There are currently no access requests in this state.
                    </p>
                </div>
            )}
        </div>
    );
};

export default PermissionRequests;
