import React, { useState, useEffect } from 'react';
import { X, Shield, Check, Info, LayoutDashboard, MessageCircle, Bot, User, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000';

const PermissionModal = ({ user, onClose, onUpdate }) => {
    const [permissions, setPermissions] = useState(user.permissions || {});
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        // Prevent body scroll when modal is open
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
            }, 1200);
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

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Solid White Backdrop */}
            <div 
                className="fixed inset-0 bg-white dark:bg-slate-950 transition-opacity duration-300"
                onClick={onClose}
            />
            
            {/* Modal Container */}
            <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-200 dark:border-slate-800 overflow-hidden animate-scale-in">
                
                {/* Header */}
                <div className="relative px-6 pt-6 pb-4">
                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                                    {user.avatarUrl ? (
                                        <img src={`${API_BASE}${user.avatarUrl}`} alt="" className="w-full h-full rounded-xl object-cover" />
                                    ) : (
                                        <User className="w-6 h-6" />
                                    )}
                                </div>
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight leading-none">Permissions</h2>
                                <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mt-1">Configuring <span className="text-orange-600 dark:text-orange-400">@{user.name}</span></p>
                            </div>
                        </div>
                        <button 
                            onClick={onClose}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all duration-200 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 group"
                        >
                            <X className="w-5 h-5 transition-transform group-hover:rotate-90" />
                        </button>
                    </div>
                </div>

                {/* Permissions Content */}
                <div className="px-6 py-2 space-y-3">
                    <div className="grid gap-3">
                        {[
                            { id: 'tasks', label: 'Dashboard', desc: 'Tasks & metrics', icon: LayoutDashboard, color: 'blue', 
                              activeBg: 'bg-blue-100 dark:bg-blue-900/30', activeText: 'text-blue-600 dark:text-blue-400', activeShadow: 'shadow-blue-500/10' },
                            { id: 'chat', label: 'Messaging', desc: 'Team communication', icon: MessageCircle, color: 'green',
                              activeBg: 'bg-green-100 dark:bg-green-900/30', activeText: 'text-green-600 dark:text-green-400', activeShadow: 'shadow-green-500/10' },
                            { id: 'aiChat', label: 'AI Assistant', desc: 'Smart automation', icon: Bot, color: 'purple',
                              activeBg: 'bg-purple-100 dark:bg-purple-900/30', activeText: 'text-purple-600 dark:text-purple-400', activeShadow: 'shadow-purple-500/10' }
                        ].map((module) => {
                            const Icon = module.icon;
                            const enabled = isModuleEnabled(module.id);
                            
                            return (
                                <div 
                                    key={module.id}
                                    onClick={() => toggleModule(module.id)}
                                    className={`group cursor-pointer flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all duration-300 ${
                                        enabled 
                                            ? 'bg-slate-50 dark:bg-slate-800/40 border-orange-500/10 dark:border-orange-500/5 shadow-sm' 
                                            : 'bg-transparent border-slate-100 dark:border-slate-800 opacity-60'
                                    }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                                            enabled 
                                                ? `${module.activeBg} ${module.activeText} scale-105 shadow-md ${module.activeShadow}` 
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                                        }`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className={`font-bold text-sm transition-colors ${enabled ? 'text-slate-800 dark:text-white' : 'text-slate-50'}`}>
                                                {module.label}
                                            </h3>
                                            <p className="text-[10px] text-slate-500 dark:text-slate-500 leading-tight">
                                                {module.desc}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {/* Compact Toggle Switch */}
                                    <div className={`relative w-10 h-6 rounded-full transition-all duration-500 ${enabled ? 'bg-orange-500' : 'bg-slate-200 dark:bg-slate-700'}`}>
                                        <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-500 transform ${enabled ? 'translate-x-4' : 'translate-x-0'}`} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-4 p-3 rounded-xl bg-orange-50 dark:bg-orange-500/5 border border-orange-100 dark:border-orange-500/10 flex gap-3 items-start">
                        <Info className="w-3.5 h-3.5 text-orange-600 flex-shrink-0 mt-0.5" />
                        <p className="text-[10px] text-orange-800 dark:text-orange-300/70 leading-normal font-medium">
                            Changes apply immediately upon saving.
                        </p>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 flex items-center justify-end gap-3">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSave}
                        disabled={saving || success}
                        className={`min-w-[130px] relative px-6 py-2 rounded-xl text-xs font-bold shadow-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                            success 
                                ? 'bg-green-500 text-white' 
                                : 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/10'
                        } disabled:opacity-70`}
                    >
                        {saving ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : success ? (
                            <>
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Saved!</span>
                            </>
                        ) : (
                            <>
                                <Shield className="w-4 h-4" />
                                <span>Save Changes</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PermissionModal;
