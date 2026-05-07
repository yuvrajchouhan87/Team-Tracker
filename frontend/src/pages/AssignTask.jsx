import { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import axios from 'axios';
import { ClipboardList, Plus, CheckCircle2 } from 'lucide-react';
import { createPortal } from 'react-dom';

const AssignTask = () => {
    const { user: currentUser } = useContext(AuthContext);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('Medium');
    const [deadline, setDeadline] = useState('');
    const [assignedTo, setAssignedTo] = useState('');
    const [users, setUsers] = useState([]);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [assignedUserName, setAssignedUserName] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/auth/users');
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
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSuccessMsg('');
        setErrorMsg('');
        try {
            await axios.post('http://localhost:5000/api/tasks', {
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
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
                    <ClipboardList className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>Assign Task</h1>
                    <p className="font-light mt-0.5" style={{ color: '#000', fontSize: '0.82em', opacity: 0.8 }}>Create and assign a new task to a team member.</p>
                </div>
            </div>

            {/* Form Card */}
            <div className="card p-5 sm:p-8 max-w-2xl">

                {errorMsg && (
                    <div className="mb-5 p-3 rounded-xl text-sm font-medium"
                        style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                        ❌ {errorMsg}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>Task Title *</label>
                        <input
                            required type="text" value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="input-base py-2.5" placeholder="e.g. Prepare monthly report"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>Description *</label>
                        <textarea
                            required value={description}
                            onChange={e => setDescription(e.target.value)}
                            className="input-base py-2.5 resize-none" rows="3"
                            placeholder="Describe the task details..."
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>Priority</label>
                            <select value={priority} onChange={e => setPriority(e.target.value)} className="input-base py-2.5">
                                <option value="Low">🟢 Low</option>
                                <option value="Medium">🟡 Medium</option>
                                <option value="High">🔴 High</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>Deadline *</label>
                            <input required type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="input-base py-2.5" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>Assign To *</label>
                        <select required value={assignedTo} onChange={e => setAssignedTo(e.target.value)} className="input-base py-2.5">
                            <option value="">-- Select a team member --</option>
                            {users.map(u => (
                                <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                            ))}
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn-primary w-full py-3 flex items-center justify-center gap-2 mt-2"
                    >
                        {isSubmitting ? (
                            <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        ) : (
                            <><Plus className="w-4 h-4" /> Assign Task</>
                        )}
                    </button>
                </form>
            </div>

            {/* Success Modal */}
            {showSuccessModal && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="card max-w-sm w-full p-8 text-center animate-scale-in">
                        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="w-10 h-10 text-green-500" />
                        </div>
                        <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Task Assigned!</h3>
                        <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
                            The task has been successfully assigned to <span className="font-bold text-red-500">{assignedUserName}</span>.
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

export default AssignTask;
