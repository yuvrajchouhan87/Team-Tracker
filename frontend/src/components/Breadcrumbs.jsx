import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, ChevronRight } from 'lucide-react';

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const routeNameMap = {
    'tasks': 'Tasks',
    'admin': 'Admin Panel',
    'team': 'Team Members',
    'assign-task': 'Assign Task',
    'chat': 'Internal Chat',
    'profile': 'User Profile',
    'permission-requests': 'Permission Requests',
    'pending': 'Pending',
    'approved': 'Approved',
    'rejected': 'Rejected',
    'ai-chat': 'AI Chat',
  };

  const getLabel = (path) => {
    return routeNameMap[path] || path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ');
  };

  return (
    <nav className="flex items-center gap-1.5 text-slate-500 overflow-x-auto no-scrollbar py-1">
      <NavLink 
        to="/" 
        className="flex items-center hover:text-orange-500 transition-colors shrink-0"
      >
        <Home className="w-4 h-4" />
      </NavLink>

      {pathnames.length > 0 && (
        <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-50" />
      )}

      {pathnames.length === 0 ? (
        <span className="text-sm font-medium text-slate-800">Dashboard</span>
      ) : (
        pathnames.map((value, index) => {
          const last = index === pathnames.length - 1;
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          const label = getLabel(value);

          return (
            <React.Fragment key={to}>
              {last ? (
                <span className="text-sm font-bold text-slate-900 truncate max-w-[120px] md:max-w-none">
                  {label}
                </span>
              ) : (
                <div className="flex items-center gap-1.5 shrink-0">
                  <NavLink 
                    to={to} 
                    className="text-sm hover:text-orange-500 transition-colors"
                  >
                    {label}
                  </NavLink>
                  <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                </div>
              )}
            </React.Fragment>
          );
        })
      )}
    </nav>
  );
};

export default Breadcrumbs;
