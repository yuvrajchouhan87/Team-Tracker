import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import AIChatbot from '../components/AIChatbot';
import { Sparkles, Bot, Zap, Shield, AlertCircle } from 'lucide-react';

const AIChatPage = () => {
    const { user } = useContext(AuthContext);
    const [dashboardData, setDashboardData] = useState(null);

    if (user?.role !== 'SuperAdmin' && user?.permissions?.aiChat?.view === false) {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh] animate-fade-in text-center px-4">
                <div className="w-20 h-20 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-6">
                    <Shield className="w-10 h-10 text-purple-600 dark:text-purple-400" />
                </div>
                <h1 className="text-3xl font-black mb-3" style={{ color: 'var(--text-primary)' }}>AI Access Denied</h1>
                <p className="max-w-md text-lg font-medium mb-8" style={{ color: 'var(--text-muted)' }}>
                    Your access to the AI Chat module has been restricted. 
                    Please contact your administrator if you need this feature enabled.
                </p>
                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800 rounded-xl flex items-start gap-3 text-left max-w-sm">
                    <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-orange-700 dark:text-orange-300">
                        Managers can control AI features to maintain focus on specific project priorities.
                    </p>
                </div>
            </div>
        );
    }

    const fetchContext = async () => {
        try {
            const [usersRes, tasksRes] = await Promise.all([
                axios.get('http://localhost:5000/api/auth/users'),
                axios.get('http://localhost:5000/api/tasks')
            ]);
            setDashboardData({
                users: usersRes.data,
                tasks: tasksRes.data
            });
        } catch (error) {
            console.error("Error fetching AI context:", error);
        }
    };

    useEffect(() => {
        fetchContext();
    }, []);

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                        <Bot className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>Chat with AI</h1>
                        <p className="font-light mt-0.5" style={{ color: '#000', fontSize: '0.82em', opacity: 0.8 }}>Get instant answers and productivity tips.</p>
                    </div>
                </div>
                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 rounded-full">
                    <Zap className="w-4 h-4 text-orange-500 fill-orange-500" />
                    <span className="text-xs font-bold text-orange-600 dark:text-orange-400">Powered by Team Tracker AI</span>
                </div>
            </div>

            {/* Chat Container */}
            <div className="max-w-4xl mx-auto">
                <AIChatbot isFullPage={true} dashboardData={dashboardData} onActionComplete={fetchContext} />
                
                {/* Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                    <div className="card p-4 border-slate-200 dark:border-slate-800">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-3">
                            <Sparkles className="w-4 h-4 text-blue-600" />
                        </div>
                        <h4 className="font-bold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>Instant Help</h4>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Ask anything about your tasks or team performance.</p>
                    </div>
                    <div className="card p-4 border-slate-200 dark:border-slate-800">
                        <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-3">
                            <Zap className="w-4 h-4 text-green-600" />
                        </div>
                        <h4 className="font-bold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>Smart Tips</h4>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Get personalized suggestions to improve your workflow.</p>
                    </div>
                    <div className="card p-4 border-slate-200 dark:border-slate-800">
                        <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-3">
                            <Bot className="w-4 h-4 text-orange-600" />
                        </div>
                        <h4 className="font-bold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>24/7 Support</h4>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Our AI is always available to assist with your queries.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIChatPage;
