import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { Mail, Lock, User, Eye, EyeOff, CheckCircle2, Layers, ArrowRight } from 'lucide-react';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await register(name, email, password);
            setShowSuccessModal(true);
        } catch (error) {
            alert(error.response?.data?.message || 'Registration failed.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-slate-50 dark:bg-slate-950 animate-fade-in">
            {/* Left Showcase Banner */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 text-white p-12 flex-col justify-between overflow-hidden border-r border-slate-800">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex items-center gap-3 relative z-10">
                    <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                        <Layers className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="font-bold text-base tracking-tight leading-none block">Team Tracker</span>
                        <span className="text-[11px] text-slate-400 block mt-0.5 font-medium">Enterprise Team Intelligence</span>
                    </div>
                </div>

                <div className="max-w-md relative z-10 space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs text-indigo-300 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                        Join Your Organization
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight leading-tight text-white">
                        Build together. <br />
                        <span className="text-indigo-400">Achieve more.</span>
                    </h1>
                    <p className="text-sm text-slate-300 leading-relaxed font-normal">
                        Create an account to join your team. Your administrator will approve your profile and grant you role-based access.
                    </p>
                </div>

                <div className="relative z-10 flex items-center justify-between text-xs text-slate-500">
                    <span>© 2026 Team Tracker Inc.</span>
                    <span>Single Sign-On & Governance</span>
                </div>
            </div>

            {/* Right Registration Card */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
                <div className="w-full max-w-md">
                    <div className="lg:hidden flex items-center gap-2.5 mb-8">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                            <Layers className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-base text-slate-900 dark:text-white">Team Tracker</span>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Create an account</h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Submit your details for workspace approval</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                    Full Name
                                </label>
                                <div className="relative flex items-center">
                                    <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        placeholder="Alex Johnson"
                                        className="input-base input-icon-left text-sm"
                                    />
                                </div>
                            </div>

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
                                        placeholder="alex@company.com"
                                        className="input-base input-icon-left text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                    Password
                                </label>
                                <div className="relative flex items-center">
                                    <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400">
                                        <Lock className="w-4 h-4" />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        placeholder="Create a secure password"
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

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="btn-primary w-full py-2.5 mt-2 text-xs font-semibold"
                            >
                                {isLoading ? (
                                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                                ) : (
                                    <>
                                        Register Request
                                        <ArrowRight className="w-4 h-4 ml-1" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Already registered?{' '}
                                <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 modal-backdrop animate-fade-in">
                    <div className="card bg-white dark:bg-slate-900 rounded-2xl p-8 max-w-sm w-full text-center animate-modal">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center mx-auto mb-4 text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-7 h-7" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Request Submitted</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                            Your account is pending SuperAdmin review. Once approved and assigned a role, you will be able to log in.
                        </p>
                        <button 
                            onClick={() => navigate('/login')}
                            className="btn-primary w-full py-2.5 text-xs font-semibold"
                        >
                            Back to Sign In
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Register;
