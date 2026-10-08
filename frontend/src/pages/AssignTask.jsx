import { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import axios from 'axios';
import { ClipboardList, Plus, CheckCircle2, ArrowRight } from 'lucide-react';
import { createPortal } from 'react-dom';

const API_BASE = 'https://team-tracker-dbzf.onrender.com';

const AssignTask = () => {
    const { user: currentUser } = useContext(AuthContext);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('Medium');
    const [deadline, setDeadline] = useState('');
    const [assignedTo, setAssignedTo] = useState('');
    const [users, setUsers] = useState([]);
    const [errorMsg, setErrorMsg] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [assignedUserName, setAssignedUserName] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await axios.get(`${API_BASE}/api/auth/users`);
                let approved = res.data.filter(u => u.status === 'Approved' && u.role !== 'SuperAdmin');
                if (currentUser?.role === 'Manager') {
                    approved = approved.filter(u => u.role === 'Developer' || u.role === 'Intern');
                }
                setUsers(approved);
            } catch (err) {
                console.error('Failed to fetch users', err);
            }
        };
        fetchUsers();
    }, [currentUser?.role]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMsg('');
        try {
            await axios.post(`${API_BASE}/api/tasks`, {
                title, description, priority, deadline, assignedTo
            });
            const userObj = users.find(u => u._id === assignedTo);
            setAssignedUserName(userObj ? userObj.name : 'the team member');
            setShowSuccessModal(true);
            setTitle(''); setDescription(''); setPriority('Medium'); setDeadline(''); setAssignedTo('');
        } catch (err) {
            setErrorMsg(err.response?.data?.message || 'Failed to assign task.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in max-w-3xl">
            {/* Header */}
            <div className="pb-2 border-b border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                        <ClipboardList className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                            Dispatch New Task
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Assign responsibilities, set milestones, and designate priority.
                        </p>
                    </div>
                </div>
            </div>

            {/* Form Card */}
            <div className="card p-6 sm:p-8">
                {errorMsg && (
                    <div className="mb-5 p-3 rounded-lg text-xs font-semibold bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50">
                        {errorMsg}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                            Task Title <span className="text-rose-500">*</span>
                        </label>
                        <input
                            required
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="input-base"
                            placeholder="e.g. Implement authentication refresh flow"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                            Description & Deliverables <span className="text-rose-500">*</span>
                        </label>
                        <textarea
                            required
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            className="input-base resize-none"
                            rows="4"
                            placeholder="Detail requirements, edge-cases, and links..."
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                Priority Level
                            </label>
                            <select
                                value={priority}
                                onChange={e => setPriority(e.target.value)}
                                className="input-base"
                            >
                                <option value="Low">Low Priority</option>
                                <option value="Medium">Medium Priority</option>
                                <option value="High">High Priority</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                Due Date <span className="text-rose-500">*</span>
                            </label>
                            <input
                                required
                                type="date"
                                value={deadline}
                                onChange={e => setDeadline(e.target.value)}
                                className="input-base"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                            Assignee <span className="text-rose-500">*</span>
                        </label>
                        <select
                            required
                            value={assignedTo}
                            onChange={e => setAssignedTo(e.target.value)}
                            className="input-base"
                        >
                            <option value="">Select team member...</option>
                            {users.map(u => (
                                <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                            ))}
                        </select>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn-primary py-2.5 px-5 text-xs font-semibold"
                        >
                            {isSubmitting ? (
                                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                            ) : (
                                <>
                                    <Plus className="w-4 h-4 mr-1" />
                                    Assign Task
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Success Modal */}
            {showSuccessModal && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 modal-backdrop animate-fade-in">
                    <div className="card bg-white dark:bg-slate-900 max-w-sm w-full p-7 text-center animate-scale-in">
                        <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="w-7 h-7" />
                        </div>
                        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">Task Assigned</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                            The assignment has been routed to <strong className="text-indigo-600 dark:text-indigo-400">{assignedUserName}</strong>.
                        </p>
                        <button
                            onClick={() => setShowSuccessModal(false)}
                            className="btn-primary w-full py-2.5 text-xs font-semibold"
                        >
                            Done
                        </button>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default AssignTask;
