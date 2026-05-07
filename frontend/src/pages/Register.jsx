import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { Mail, Lock, User, Eye, EyeOff, CheckCircle, ArrowRight } from 'lucide-react';

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

    const bgPattern = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill-rule='evenodd'%3E%3Cg id='hexagons' fill='%2394a3b8' fill-opacity='0.08' fill-rule='nonzero'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.25v12.7l10.99 6.34 11-6.35V17.25L14 10.92 3 17.25zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.31zM15 0v7.5L27.99 15H28v-2.31L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31L17 42.65V49h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;

    return (
        <div className="min-h-screen flex items-center justify-center bg-white relative overflow-hidden" 
             style={{ backgroundImage: bgPattern }}>
            
            <div className="w-full max-w-md px-4 sm:px-6 z-10">
                <div className="bg-white rounded-2xl p-6 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 flex flex-col items-center">
                    
                    {/* Header Section */}
                    <div className="flex flex-col items-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-800">Create Account</h2>
                        <p className="text-gray-400 text-sm mt-1 text-center">Join our team tracking system today</p>
                    </div>

                    <form onSubmit={handleSubmit} className="w-full space-y-5">
                        {/* Name Field */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 ml-1">Full Name</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-[#f97316]">
                                    <User size={18} />
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="Enter your name"
                                    className="w-full bg-[#f8fafc] border border-gray-100 rounded-lg py-3.5 pl-12 pr-4 text-sm text-gray-900 outline-none focus:border-[#f97316]/30 focus:bg-white transition-all shadow-sm"
                                />
                            </div>
                        </div>

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

                        {/* Register Button */}
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
                                "Create Account"
                            )}
                            <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-[-20deg]" />
                        </button>
                    </form>

                    {/* Footer / Login Link */}
                    <p className="mt-8 text-xs text-gray-400 font-medium">
                        Already have an account? <Link to="/login" className="text-blue-500 font-bold hover:underline">Sign in</Link>
                    </p>
                </div>
            </div>

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-[0_20px_50px_rgba(0,0,0,0.15)] text-center transform scale-100 animate-in zoom-in duration-300">
                        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5">
                            <CheckCircle className="w-8 h-8 text-green-500" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2 text-gray-800">Registration Successful!</h3>
                        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                            Your account has been created and is pending SuperAdmin approval. You will be able to log in once a SuperAdmin assigns your role.
                        </p>
                        <button 
                            onClick={() => navigate('/login')}
                            className="w-full py-3 rounded-xl font-bold text-white transition-all shadow-lg active:scale-95"
                            style={{ background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)' }}
                        >
                            Go to Login
                        </button>
                    </div>
                </div>
            )}

            {/* Bottom Credits style Matching Login */}
            <div className="absolute bottom-6 right-8 text-right opacity-30 select-none pointer-events-none hidden md:block">
                <p className="text-[10px] font-medium text-gray-400">Activate Windows</p>
                <p className="text-[8px] text-gray-400">Go to Settings to activate Windows.</p>
            </div>
        </div>
    );
};

export default Register;
