import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import AIChatbot from '../components/AIChatbot';
import { Sparkles, Bot, Zap, ShieldAlert, Cpu } from 'lucide-react';

const API_BASE = 'https://team-tracker-dbzf.onrender.com';

const AIChatPage = () => {
    const { user } = useContext(AuthContext);
    const [dashboardData, setDashboardData] = useState(null);

    if (user?.role !== 'SuperAdmin' && user?.permissions?.aiChat?.view === false) {
        return (
            <div className="flex flex-col items-center justify-center h-[65vh] animate-fade-in text-center px-4">
                <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
                    <ShieldAlert className="w-7 h-7" />
                </div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">AI Assistant Restricted</h1>
                <p className="max-w-md text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                    Access to the AI intelligence workspace has been restricted for your profile by your organization administrator.
                </p>
            </div>
        );
    }

    const fetchContext = async () => {
        try {
            const [usersRes, tasksRes] = await Promise.all([
                axios.get(`${API_BASE}/api/auth/users`),
                axios.get(`${API_BASE}/api/tasks`)
            ]);
            setDashboardData({
                users: usersRes.data,
                tasks: tasksRes.data
            });
        } catch (error) {
            console.error('Error fetching AI context:', error);
        }
    };

    useEffect(() => {
        fetchContext();
    }, []);

    return (
        <div className="space-y-6 animate-fade-in pb-8 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                        <Bot className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                            AI Workspace Assistant
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            RAG-powered workspace analysis, instant task management, and team insights.
                        </p>
                    </div>
                </div>

                <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full text-[11px] font-medium">
                    <Cpu className="w-3.5 h-3.5 text-indigo-500" />
                    <span>GPT-OSS 20B</span>
                </div>
            </div>

            {/* Chatbot Interface */}
            <div>
                <AIChatbot isFullPage={true} dashboardData={dashboardData} onActionComplete={fetchContext} />
                
                {/* Capabilities Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="card p-4">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2.5">
                            <Sparkles className="w-4 h-4" />
                        </div>
                        <h2 className="font-bold text-xs text-slate-900 dark:text-white mb-1">Instant Insights</h2>
                        <p className="text-[11px] text-slate-400 leading-relaxed">Ask for completion velocity, workload imbalances, or priority bottlenecks.</p>
                    </div>
                    <div className="card p-4">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2.5">
                            <Zap className="w-4 h-4" />
                        </div>
                        <h2 className="font-bold text-xs text-slate-900 dark:text-white mb-1">Live CRM Actions</h2>
                        <p className="text-[11px] text-slate-400 leading-relaxed">Dispatch tasks, approve pending team registrations, and update statuses directly.</p>
                    </div>
                    <div className="card p-4">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2.5">
                            <Bot className="w-4 h-4" />
                        </div>
                        <h2 className="font-bold text-xs text-slate-900 dark:text-white mb-1">Ground Truth Context</h2>
                        <p className="text-[11px] text-slate-400 leading-relaxed">Responses are augmented in real-time with your organization's live MongoDB snapshot.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIChatPage;
