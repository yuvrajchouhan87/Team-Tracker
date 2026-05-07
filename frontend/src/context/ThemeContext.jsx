import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [darkMode, setDarkMode] = useState(() => {
        try {
            const savedTheme = localStorage.getItem('productivity-theme');
            if (savedTheme) return savedTheme === 'dark';
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        } catch (e) {
            return false;
        }
    });

    useEffect(() => {
        const html = document.documentElement;
        if (darkMode) {
            html.classList.add('dark');
            localStorage.setItem('productivity-theme', 'dark');
        } else {
            html.classList.remove('dark');
            localStorage.setItem('productivity-theme', 'light');
        }
    }, [darkMode]);

    const toggleTheme = () => {
        setDarkMode(prev => !prev);
    };

    return (
        <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used within a ThemeProvider');
    return context;
};
