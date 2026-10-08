import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, Layers, CheckCircle2, ArrowRight } from 'lucide-react';
import LoginStatusModal from '../components/LoginStatusModal';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loginStatus, setLoginStatus] = useState(null);
    const { login, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const userData = await login(email, password);
            if (userData.role === 'SuperAdmin' || userData.role === 'Manager') {
                navigate('/');
            } else if (userData.permissions?.tasks?.view !== false) {
                setLoginStatus('success');
            } else {
                setLoginStatus('restricted');
                logout();
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirmSuccess = () => {
        setLoginStatus(null);
        navigate('/');
    };

    return (
        <div className="min-h-screen w-full flex bg-slate-50 dark:bg-slate-950 animate-fade-in">
            {/* Left Showcase Banner (Desktop) */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 text-white p-12 flex-col justify-between overflow-hidden border-r border-slate-800">
                {/* Background ambient accents */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

                {/* Brand */}
                <div className="flex items-center gap-3 relative z-10">
                    <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                        <Layers className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="font-bold text-base tracking-tight leading-none block">Team Tracker</span>
                        <span className="text-[11px] text-slate-400 block mt-0.5 font-medium">Enterprise Team Intelligence</span>
                    </div>
                </div>

                {/* Core Copy & Productivity Highlight */}
                <div className="max-w-md relative z-10 space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs text-indigo-300 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                        Next-Gen Workflow Platform
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight leading-tight text-white">
                        Manage your team. <br />
                        <span className="text-indigo-400">Move work forward.</span>
                    </h1>
                    <p className="text-sm text-slate-300 leading-relaxed font-normal">
                        Plan tasks, track progress in real-time, and keep your entire team synchronized with enterprise governance and AI-assisted workflows.
                    </p>

                    <div className="pt-4 border-t border-slate-800/80 space-y-2.5">
                        {[
                            'Role-based permissions & governance',
                            'Real-time task synchronization & internal chat',
                            'Live workload analytics & AI automation',
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-300">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                <span>{item}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer note */}
                <div className="relative z-10 flex items-center justify-between text-xs text-slate-500">
                    <span>© 2026 Team Tracker Inc.</span>
                    <span>Enterprise Security Compliant</span>
                </div>
            </div>

            {/* Right Authentication Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
                <div className="w-full max-w-md">
                    {/* Mobile Brand indicator */}
                    <div className="lg:hidden flex items-center gap-2.5 mb-8">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                            <Layers className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-base text-slate-900 dark:text-white">Team Tracker</span>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-sm animate-scale-in">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Welcome back</h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Enter your credentials to access your workspace</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                    Work Email
                                </label>
                                <div className="relative flex items-center">
                                    <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        placeholder="name@company.com"
                                        className="input-base input-icon-left text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                        Password
                                    </label>
                                    <Link to="#" className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="relative flex items-center">
                                    <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400">
                                        <Lock className="w-4 h-4" />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        placeholder="••••••••••••"
                                        className="input-base input-icon-left input-icon-right text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3.5 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                                        aria-label="Toggle password visibility"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center pt-1">
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={e => setRememberMe(e.target.checked)}
                                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-700"
                                    />
                                    <span className="text-xs text-slate-600 dark:text-slate-400">Remember this device</span>
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="btn-primary w-full py-2.5 mt-2 text-xs font-semibold"
                            >
                                {isLoading ? (
                                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                                ) : (
                                    <>
                                        Sign In
                                        <ArrowRight className="w-4 h-4 ml-1" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                New team member?{' '}
                                <Link to="/register" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                                    Create an account
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {loginStatus && (
                <LoginStatusModal 
                    status={loginStatus} 
                    onConfirm={handleConfirmSuccess}
                    onClose={() => setLoginStatus(null)}
                />
            )}
        </div>
    );
};

export default Login;
