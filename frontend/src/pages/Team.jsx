import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { 
    Users, 
    UserCheck, 
    Shield, 
    Briefcase, 
    GraduationCap, 
    Trash2, 
    SlidersHorizontal,
    Mail,
    Search
} from 'lucide-react';
import AuthContext from '../context/AuthContext';
import PermissionModal from '../components/PermissionModal';

const API_BASE = 'https://team-tracker-dbzf.onrender.com';

const Team = () => {
    const { searchQuery } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showModal, setShowModal] = useState(false);

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

    const updatePermissionsLocally = (userId, newPermissions) => {
        setUsers(users.map(u => u._id === userId ? { ...u, permissions: newPermissions } : u));
    };

    const handleOpenPermission = (u) => {
        setSelectedUser(u);
        setShowModal(true);
    };

    const handleDeleteUser = async (u) => {
        if (!window.confirm(`Are you sure you want to permanently delete "${u.name}"? This will revoke all their workspace access.`)) return;
        try {
            await axios.delete(`${API_BASE}/api/auth/delete-user/${u._id}`);
            setUsers(users.filter(user => user._id !== u._id));
        } catch (error) {
            console.error('Error deleting user:', error);
            const msg = error.response?.data?.message || error.message || 'Failed to delete user';
            alert(`Error: ${msg}`);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const approvedUsers = users.filter(u => u.status === 'Approved' && u.role !== 'SuperAdmin');
    const developers = approvedUsers.filter(u => u.role === 'Developer');
    const interns = approvedUsers.filter(u => u.role === 'Intern');
    const managers = approvedUsers.filter(u => u.role === 'Manager');

    const filteredUsers = approvedUsers.filter(u => 
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-72">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
                    <p className="text-xs font-medium text-slate-400">Loading team members...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100 dark:border-slate-800/80">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Team Directory
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Manage roster, assign access permissions, and govern active roles.
                    </p>
                </div>
            </div>

            {/* Role Breakdown Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="card p-4 flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                        <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Developers</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-white tabular-nums">{developers.length}</p>
                    </div>
                </div>

                <div className="card p-4 flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                        <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Interns</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-white tabular-nums">{interns.length}</p>
                    </div>
                </div>

                <div className="card p-4 flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
                        <Shield className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Managers</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-white tabular-nums">{managers.length}</p>
                    </div>
                </div>
            </div>

            {/* Team Directory Table */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-semibold">
                                <th className="px-5 py-3.5">Team Member</th>
                                <th className="px-5 py-3.5">Role</th>
                                <th className="px-5 py-3.5">Email</th>
                                <th className="px-5 py-3.5">Access Control</th>
                                <th className="px-5 py-3.5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {filteredUsers.map((u) => (
                                <tr key={u._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 text-xs overflow-hidden">
                                                {u.avatarUrl ? (
                                                    <img src={`${API_BASE}${u.avatarUrl}`} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    u.name.charAt(0).toUpperCase()
                                                )}
                                            </div>
                                            <span className="font-semibold text-slate-900 dark:text-white">
                                                {u.name}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-semibold ${
                                            u.role === 'Manager' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300' :
                                            u.role === 'SuperAdmin' ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300' :
                                            u.role === 'Intern' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' :
                                            'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                                        }`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                                        {u.email}
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <button
                                            onClick={() => handleOpenPermission(u)}
                                            className="btn-secondary py-1 px-2.5 text-[11px] font-semibold"
                                        >
                                            <SlidersHorizontal className="w-3 h-3 text-slate-400" />
                                            Configure
                                        </button>
                                    </td>
                                    <td className="px-5 py-3.5 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold">
                                                <UserCheck className="w-3 h-3" />
                                                Active
                                            </span>
                                            <button
                                                onClick={() => handleDeleteUser(u)}
                                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                                                title="Delete user"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredUsers.length === 0 && (
                    <div className="text-center py-12">
                        <Users className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                        <p className="text-xs text-slate-400">No team members match your filter.</p>
                    </div>
                )}
            </div>

            {showModal && selectedUser && (
                <PermissionModal 
                    user={selectedUser} 
                    onClose={() => setShowModal(false)} 
                    onUpdate={updatePermissionsLocally}
                />
            )}
        </div>
    );
};

export default Team;
