import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

import LoginStatusModal from '../components/LoginStatusModal';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loginStatus, setLoginStatus] = useState(null); // 'success', 'restricted', or null
    const { login, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const userData = await login(email, password);
            
            // Check if user has dashboard permission
            // Admins and Managers always have access
            if (userData.role === 'SuperAdmin' || userData.role === 'Manager') {
                navigate('/');
            } else if (userData.permissions?.tasks?.view !== false) {
                setLoginStatus('success');
            } else {
                setLoginStatus('restricted');
                // We logout because they shouldn't be authenticated if restricted
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


    const bgPattern = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill-rule='evenodd'%3E%3Cg id='hexagons' fill='%2394a3b8' fill-opacity='0.08' fill-rule='nonzero'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.25v12.7l10.99 6.34 11-6.35V17.25L14 10.92 3 17.25zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.31zM15 0v7.5L27.99 15H28v-2.31L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31L17 42.65V49h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;

    return (
        <div className="min-h-screen flex items-center justify-center bg-white relative overflow-hidden" 
             style={{ backgroundImage: bgPattern }}>
            
            <div className="w-full max-w-md px-4 sm:px-6 z-10">
                <div className="bg-white rounded-2xl p-6 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 flex flex-col items-center">
                    
                    {/* Logo Section */}
                    <div className="flex flex-col items-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-800">Sign In</h2>
                        <p className="text-gray-400 text-sm mt-1 text-center">Please enter your details to access the dashboard</p>
                    </div>

                    <form onSubmit={handleSubmit} className="w-full space-y-5">
                        {/* Email Field */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 ml-1">Email Address</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-[#f97316]">
                                    <Mail size={18} />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="Enter Email Address"
                                    className="w-full bg-[#f8fafc] border border-gray-100 rounded-lg py-3.5 pl-12 pr-4 text-sm text-gray-900 outline-none focus:border-[#f97316]/30 focus:bg-white transition-all shadow-sm"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 ml-1">Password</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-[#f97316]">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="Enter Password"
                                    className="w-full bg-[#f8fafc] border border-gray-100 rounded-lg py-3.5 pl-12 pr-12 text-sm text-gray-900 outline-none focus:border-[#f97316]/30 focus:bg-white transition-all shadow-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between pt-1">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <div 
                                    onClick={() => setRememberMe(!rememberMe)}
                                    className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${
                                        rememberMe ? 'bg-[#f97316] border-[#f97316]' : 'border-gray-200 bg-white group-hover:border-[#f97316]/50'
                                    }`}
                                >
                                    {rememberMe && (
                                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none" className="text-white">
                                            <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    )}
                                </div>
                                <span className="text-xs font-semibold text-gray-500 select-none">Remember Me</span>
                            </label>
                            <Link to="#" className="text-xs font-bold text-blue-500 hover:text-blue-600 transition-colors">
                                Forgot Password?
                            </Link>
                        </div>

                        {/* Login Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 rounded-lg text-white font-bold text-sm tracking-wide transition-all active:scale-[0.98] disabled:opacity-70 mt-4 h-12 flex items-center justify-center overflow-hidden relative group"
                            style={{
                                background: 'linear-gradient(90deg, #f97316 0%, #ea580c 100%)',
                                boxShadow: '0 4px 15px rgba(249, 115, 22, 0.3)'
                            }}
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                            ) : (
                                "Login"
                            )}
                            <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-[-20deg]" />
                        </button>
                    </form>

                    {/* Footer / Register Link (kept existing functionality if desired, but image doesn't show it) */}
                    <p className="mt-8 text-xs text-gray-400 font-medium">
                        Don't have an account? <Link to="/register" className="text-blue-500 font-bold hover:underline">Register now</Link>
                    </p>
                </div>
            </div>

            {/* Bottom Credits / Activate Windows style (optional touch matching image) */}
            <div className="absolute bottom-6 right-8 text-right opacity-30 select-none pointer-events-none hidden md:block">
                <p className="text-[10px] font-medium text-gray-400">Activate Windows</p>
                <p className="text-[8px] text-gray-400">Go to Settings to activate Windows.</p>
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
