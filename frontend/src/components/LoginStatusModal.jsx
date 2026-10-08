import React from 'react';
import { CheckCircle2, ShieldAlert, ArrowRight } from 'lucide-react';

const LoginStatusModal = ({ status, onConfirm, onClose }) => {
    const isSuccess = status === 'success';

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center modal-backdrop p-4 animate-fade-in">
            <div className="card bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl shadow-xl overflow-hidden animate-modal p-7 text-center">
                {isSuccess ? (
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center mx-auto mb-4 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-7 h-7" />
                    </div>
                ) : (
                    <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center mx-auto mb-4 text-rose-600 dark:text-rose-400">
                        <ShieldAlert className="w-7 h-7" />
                    </div>
                )}

                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1.5">
                    {isSuccess ? 'Workspace Access Verified' : 'Access Restricted'}
                </h2>
                
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                    {isSuccess 
                        ? 'Your dashboard permissions have been confirmed. Proceed to your workspace.' 
                        : 'Your dashboard permissions are currently disabled. Please contact your SuperAdmin.'}
                </p>

                {isSuccess ? (
                    <button
                        onClick={onConfirm}
                        className="btn-primary w-full py-2.5 text-xs font-semibold"
                    >
                        <span>Open Dashboard</span>
                        <ArrowRight className="w-4 h-4 ml-1" />
                    </button>
                ) : (
                    <button
                        onClick={onClose}
                        className="btn-secondary w-full py-2.5 text-xs font-semibold"
                    >
                        Back to Login
                    </button>
                )}
            </div>
        </div>
    );
};

export default LoginStatusModal;
