import React from 'react';
import { CheckCircle2, XCircle, ShieldAlert, ArrowRight } from 'lucide-react';

const LoginStatusModal = ({ status, onConfirm, onClose }) => {
    const isSuccess = status === 'success';

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-scale-in">
                <div className="p-8 flex flex-col items-center text-center">
                    {isSuccess ? (
                        <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-6 animate-bounce-subtle">
                            <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
                        </div>
                    ) : (
                        <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-6">
                            <ShieldAlert className="w-10 h-10 text-red-600 dark:text-red-400" />
                        </div>
                    )}

                    <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">
                        {isSuccess ? 'Access Granted' : 'Access Restricted'}
                    </h2>
                    
                    <p className="text-slate-500 dark:text-slate-400 font-medium mb-8">
                        {isSuccess 
                            ? 'Your dashboard access is enabled. Welcome back to Team Tracker!' 
                            : 'Your dashboard access is currently disabled. Please contact the SuperAdmin for permission.'}
                    </p>

                    {isSuccess ? (
                        <button
                            onClick={onConfirm}
                            className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2 group shadow-lg shadow-orange-200 dark:shadow-none"
                        >
                            Go to Dashboard
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    ) : (
                        <button
                            onClick={onClose}
                            className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                        >
                            Back to Login
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LoginStatusModal;
