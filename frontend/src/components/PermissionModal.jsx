import React, { useState, useEffect } from 'react';
import { X, Shield, LayoutDashboard, MessageSquare, Bot, User, CheckCircle2, Clock } from 'lucide-react';
import axios from 'axios';

const API_BASE = 'https://team-tracker-dbzf.onrender.com';

const PermissionModal = ({ user, onClose, onUpdate }) => {
    const [permissions, setPermissions] = useState(user.permissions || {});
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        if (user.permissions) {
            setPermissions(user.permissions);
        } else {
            setPermissions({
                tasks: { create: true, edit: true, delete: true, view: true },
                chat: { create: true, edit: true, delete: true, view: true },
                aiChat: { create: true, edit: true, delete: true, view: true },
                timeLogs: { create: true, edit: true, delete: true, view: true }
            });
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [user]);

    const toggleModule = (moduleId) => {
        const isCurrentlyEnabled = permissions[moduleId]?.view !== false;
        const newState = !isCurrentlyEnabled;
        
        setPermissions(prev => ({
            ...prev,
            [moduleId]: {
                create: newState,
                edit: newState,
                delete: newState,
                view: newState
            }
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const { data } = await axios.put(`${API_BASE}/api/auth/users/${user._id}/permissions`, { permissions });
            onUpdate(user._id, data.permissions);
            setSuccess(true);
            setTimeout(() => {
                onClose();
            }, 1000);
        } catch (error) {
            console.error('Error updating permissions', error);
            alert('Failed to update permissions');
        } finally {
            setSaving(false);
        }
    };

    const isModuleEnabled = (moduleId) => {
        return permissions[moduleId]?.view !== false;
    };

    const modules = [
        { id: 'tasks', label: 'Tasks & Dashboard', desc: 'Allow view and interaction with assigned tasks', icon: LayoutDashboard },
        { id: 'chat', label: 'Internal Messages', desc: 'Enable task conversations with team leads', icon: MessageSquare },
        { id: 'aiChat', label: 'AI Assistant', desc: 'Permit usage of the AI intelligence workspace', icon: Bot },
        { id: 'timeLogs', label: 'Time Tracking', desc: 'Log work hours and task time duration', icon: Clock }
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 modal-backdrop animate-fade-in">
            <div className="card bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-modal">
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 text-xs overflow-hidden">
                            {user.avatarUrl ? (
                                <img src={`${API_BASE}${user.avatarUrl}`} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-5 h-5 text-slate-400" />
                            )}
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Access Permissions</h2>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                Governing access for <strong className="text-slate-700 dark:text-slate-300">@{user.name}</strong>
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md"
                        aria-label="Close modal"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Modules List */}
                <div className="p-6 space-y-3">
                    {modules.map((mod) => {
                        const Icon = mod.icon;
                        const enabled = isModuleEnabled(mod.id);
                        return (
                            <div 
                                key={mod.id}
                                onClick={() => toggleModule(mod.id)}
                                className={`cursor-pointer flex items-center justify-between p-3 rounded-xl border transition-all ${
                                    enabled 
                                        ? 'bg-slate-50 dark:bg-slate-800/40 border-indigo-200 dark:border-indigo-900/60' 
                                        : 'bg-transparent border-slate-200 dark:border-slate-800 opacity-60'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                        enabled 
                                            ? 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400' 
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                                    }`}>
                                        <Icon className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-900 dark:text-white">{mod.label}</p>
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400">{mod.desc}</p>
                                    </div>
                                </div>

                                {/* Modern Switch */}
                                <div className={`w-9 h-5 rounded-full transition-colors relative flex items-center p-0.5 ${
                                    enabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                                }`}>
                                    <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                                        enabled ? 'translate-x-4' : 'translate-x-0'
                                    }`} />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                    <button 
                        onClick={onClose}
                        className="btn-secondary py-2 px-3 text-xs"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSave}
                        disabled={saving || success}
                        className="btn-primary py-2 px-4 text-xs font-semibold"
                    >
                        {saving ? (
                            <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        ) : success ? (
                            <>
                                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                                Saved
                            </>
                        ) : (
                            <>
                                <Shield className="w-3.5 h-3.5 mr-1" />
                                Apply Changes
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PermissionModal;
