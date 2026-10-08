import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import Team from './pages/Team';
import AssignTask from './pages/AssignTask';
import PermissionRequests from './pages/PermissionRequests';
import Chat from './pages/Chat';
import AIChatPage from './pages/AIChatPage';
import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';
import ChatModal from './components/ChatModal';
import { useContext } from 'react';
import AuthContext from './context/AuthContext';

const PrivateRoute = ({ children, roles, permission }) => {
  const { user, loading, isSidebarOpen, setIsSidebarOpen } = useContext(AuthContext);

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-9 h-9 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
        <p style={{ color: 'var(--text-muted)' }} className="text-xs font-medium">Loading workspace...</p>
      </div>
    </div>
  );

  if (!user) return <Navigate to="/login" />;
  
  // Check Role
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;

  // Check Permission
  if (permission) {
    const { module, action } = permission;
    if (user.role !== 'SuperAdmin' && (!user.permissions?.[module]?.[action])) {
      return <Navigate to="/" />;
    }
  }


  return (
    <div className="flex h-screen overflow-hidden relative" style={{ background: 'var(--bg-primary)' }}>
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm animate-fade-in"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopHeader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 lg:p-10">
          {children}
        </main>
      </div>
      <ChatModal />
    </div>
  );
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return null;
  if (user) return <Navigate to="/" />;

  return children;
};

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
            <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/tasks" element={<PrivateRoute permission={{ module: 'tasks', action: 'view' }}><Tasks /></PrivateRoute>} />
            <Route path="/admin" element={<PrivateRoute roles={['SuperAdmin']}><AdminDashboard /></PrivateRoute>} />
            <Route path="/permission-requests/:status?" element={<PrivateRoute roles={['SuperAdmin']}><PermissionRequests /></PrivateRoute>} />
            <Route path="/team" element={<PrivateRoute roles={['SuperAdmin']}><Team /></PrivateRoute>} />
            <Route path="/assign-task" element={<PrivateRoute roles={['SuperAdmin', 'Manager']} permission={{ module: 'tasks', action: 'create' }}><AssignTask /></PrivateRoute>} />
            <Route path="/chat" element={<PrivateRoute roles={['Developer', 'Intern']} permission={{ module: 'chat', action: 'view' }}><Chat /></PrivateRoute>} />
            <Route path="/ai-chat" element={<PrivateRoute permission={{ module: 'aiChat', action: 'view' }}><AIChatPage /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          </Routes>
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
