import { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            const parsedUser = JSON.parse(userInfo);
            if (parsedUser.token) {
                const decoded = jwtDecode(parsedUser.token);
                if (decoded.exp * 1000 > Date.now()) {
                    setUser(parsedUser);
                    axios.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.token}`;
                } else {
                    localStorage.removeItem('userInfo');
                }
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const { data } = await axios.post('http://localhost:5000/api/auth/login', { email, password });
        setUser(data);
        localStorage.setItem('userInfo', JSON.stringify(data));
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        return data;
    };

    const register = async (name, email, password) => {
        const { data } = await axios.post('http://localhost:5000/api/auth/register', { name, email, password });
        return data;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('userInfo');
        delete axios.defaults.headers.common['Authorization'];
    };

    const updateUser = (partial) => {
        setUser((prev) => {
            if (!prev) return prev;
            const next = { ...prev, ...partial };
            localStorage.setItem('userInfo', JSON.stringify(next));
            return next;
        });
    };

    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <AuthContext.Provider value={{ 
            user, login, register, logout, updateUser, loading, 
            isChatOpen, setIsChatOpen,
            isSidebarOpen, setIsSidebarOpen,
            searchQuery, setSearchQuery
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
