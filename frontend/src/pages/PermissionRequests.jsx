import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { UserPlus, Users, CheckCircle2, XCircle, ShieldCheck, Mail, Clock } from 'lucide-react';

const PermissionRequests = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [roleSelections, setRoleSelections] = useState({});
    const { status: urlStatus } = useParams();
    const currentStatus = urlStatus ? urlStatus.charAt(0).toUpperCase() + urlStatus.slice(1) : 'Pending';

    const fetchUsers = async () => {
        try {
            const { data } = await axios.get('https://team-tracker-dbzf.onrender.com/api/auth/users');
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
            await axios.put(`https://team-tracker-dbzf.onrender.com/api/auth/users/${userId}/approve`, { role: selectedRole });
            fetchUsers();
            alert('User approved successfully!');
        } catch (error) {
            alert('Failed to approve user');
        }
    };

    const handleReject = async (userId, userName) => {
        if (!window.confirm(`Are you sure you want to reject "${userName}"?`)) return;
        try {
            await axios.put(`https://team-tracker-dbzf.onrender.com/api/auth/users/${userId}/reject`);
            fetchUsers();
            alert('User request rejected.');
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to reject user');
        }
    };

    const displayUsers = users.filter(u => u.status === currentStatus && u.role !== 'SuperAdmin');

    if (loading) return (
        <div className="flex items-center justify-center h-full">
            <div className="w-10 h-10 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" />
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                    <UserPlus className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                    <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
                        {currentStatus === 'Pending' ? 'Permission Requests' : currentStatus === 'Approved' ? 'Approved Users' : 'Rejected Requests'}
                    </h1>
                    <p className="font-light mt-0.5" style={{ color: '#000', fontSize: '0.82em', opacity: 0.8 }}>
                        {currentStatus === 'Pending' ? 'Manage pending user registration requests and assign their startup roles.' : 
                         currentStatus === 'Approved' ? 'View previously approved users and their assigned roles.' : 
                         'View users who were denied access.'}
                    </p>
                </div>
            </div>

            {/* Pending Requests List */}
            <div className="card p-6 border border-amber-200 dark:border-amber-900/30">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-dashed" style={{ borderColor: 'var(--border-color)' }}>
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-orange-500" />
                        <span className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                            {displayUsers.length} {currentStatus}{displayUsers.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                </div>

                {displayUsers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {displayUsers.map(u => (
                            <div key={u._id} className="p-5 rounded-2xl flex flex-col gap-4 shadow-sm" 
                                 style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
                                
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-2 border-white dark:border-slate-700 shadow-inner">
                                            <Users className="w-6 h-6 text-slate-500 dark:text-slate-400" />
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="font-bold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{u.name}</h4>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <Mail size={12} className="text-gray-400" />
                                                <p className="text-xs truncate font-medium" style={{ color: 'var(--text-secondary)' }}>{u.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                                        currentStatus === 'Pending' ? 'bg-orange-100 text-orange-600 border-orange-200' :
                                        currentStatus === 'Approved' ? 'bg-green-100 text-green-600 border-green-200' :
                                        'bg-red-100 text-red-600 border-red-200'
                                    }`}>
                                        {currentStatus}
                                    </span>
                                </div>

                                {currentStatus === 'Pending' ? (
                                    <div className="space-y-3 pt-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
                                        <div>
                                            <label className="text-[10px] font-bold uppercase tracking-widest ml-1 mb-1 block" style={{ color: 'var(--text-secondary)' }}>Assign Initial Role</label>
                                            <select
                                                className="input-base text-xs py-2 px-3 w-full font-medium"
                                                value={roleSelections[u._id] || 'Developer'}
                                                onChange={(e) => setRoleSelections(prev => ({ ...prev, [u._id]: e.target.value }))}
                                                style={{ color: 'var(--text-primary)' }}
                                            >
                                                <option value="Developer">Developer</option>
                                                <option value="Intern">Intern</option>
                                                <option value="Manager">Manager</option>
                                            </select>
                                        </div>

                                        <div className="flex gap-2 pt-1">
                                            <button
                                                onClick={() => handleApprove(u._id, roleSelections[u._id] || 'Developer')}
                                                className="btn-primary flex-1 py-2 text-xs font-bold flex items-center justify-center gap-1.5 transition-transform active:scale-95"
                                            >
                                                <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                                            </button>
                                            <button
                                                onClick={() => handleReject(u._id, u.name)}
                                                className="flex-1 py-2 text-xs font-bold flex items-center justify-center gap-1.5 rounded-xl transition-all border group hover:bg-red-50 active:scale-95"
                                                style={{ background: 'rgba(239,68,68,0.05)', color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)' }}
                                            >
                                                <XCircle className="w-3.5 h-3.5" /> Reject
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="pt-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
                                        <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                                            Role: <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{u.role || 'None'}</span>
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/20 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="w-8 h-8 text-slate-400" />
                        </div>
                        <h4 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>No {currentStatus} Users</h4>
                        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs mx-auto mt-1">There are currently no users with {currentStatus.toLowerCase()} status.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PermissionRequests;
