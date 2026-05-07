import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Users, UserCheck, UserPlus, Search, Mail, Shield, Briefcase, GraduationCap, MessageCircle, ClipboardList, CheckCircle2, XCircle, Trash2 } from 'lucide-react';
import AuthContext from '../context/AuthContext';
import PermissionModal from '../components/PermissionModal';

const API_BASE = 'http://localhost:5000';

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
        if (!window.confirm(`Are you sure you want to permanently delete "${u.name}"? This action cannot be undone and the user will lose all access.`)) return;
        
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
    const employees = approvedUsers.filter(u => u.role === 'Developer');
    const interns = approvedUsers.filter(u => u.role === 'Intern');
    const managers = approvedUsers.filter(u => u.role === 'Manager');

    const filteredUsers = approvedUsers.filter(u => 
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return (
        <div className="flex items-center justify-center h-full">
            <div className="w-10 h-10 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" />
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>Team Management</h1>
                    <p className="font-light mt-0.5" style={{ color: '#000', fontSize: '0.82em', opacity: 0.8 }}>
                        Overview of all registered and approved team members.
                    </p>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="card p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <Briefcase className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Developers</p>
                        <p className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>{employees.length}</p>
                    </div>
                </div>
                <div className="card p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <GraduationCap className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Interns</p>
                        <p className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>{interns.length}</p>
                    </div>
                </div>
                <div className="card p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                        <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Managers</p>
                        <p className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>{managers.length}</p>
                    </div>
                </div>
            </div>



            {/* Team List */}
            <div className="card">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr style={{ background: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)' }}>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Member</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Role</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Email</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Permission</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-right" style={{ color: 'var(--text-muted)' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
                            {filteredUsers.map((u) => (
                                <tr key={u._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center font-bold text-red-600 dark:text-red-400">
                                                {u.avatarUrl ? (
                                                    <img src={`${API_BASE}${u.avatarUrl}`} alt="" className="w-full h-full rounded-full object-cover" />
                                                ) : (
                                                    u.name.charAt(0).toUpperCase()
                                                )}
                                            </div>
                                            <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{u.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                                        <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                                            u.role === 'Manager' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' :
                                            u.role === 'SuperAdmin' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                                            u.role === 'Intern' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                                            'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                                        }`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                                    <td className="px-6 py-4">
                                         <button
                                             onClick={() => handleOpenPermission(u)}
                                             className="group flex items-center gap-2.5 px-5 py-2.5 bg-slate-100 dark:bg-slate-800/50 hover:bg-orange-500 dark:hover:bg-orange-600 transition-all duration-300 rounded-[0.8rem] text-xs font-extrabold text-slate-700 dark:text-slate-200 hover:text-white shadow-sm hover:shadow-orange-500/20 hover:-translate-y-0.5"
                                         >
                                             <Shield className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
                                             Manage
                                         </button>
                                     </td>
                                    <td className="px-6 py-4 text-right text-sm">
                                        <div className="flex items-center justify-end gap-3">
                                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-bold">
                                                <UserCheck className="w-3 h-3" />
                                                Active
                                            </div>
                                            <button
                                                onClick={() => handleDeleteUser(u)}
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                                title="Delete User"
                                            >
                                                <Trash2 className="w-4 h-4" />
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
                        <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p style={{ color: 'var(--text-muted)' }}>No team members matching your search.</p>
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
