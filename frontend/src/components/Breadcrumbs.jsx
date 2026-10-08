import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const routeNameMap = {
    'tasks': 'Tasks',
    'admin': 'Admin Panel',
    'team': 'Team Members',
    'assign-task': 'Assign Task',
    'chat': 'Messages',
    'profile': 'Profile',
    'permission-requests': 'Access Requests',
    'pending': 'Pending',
    'approved': 'Approved',
    'rejected': 'Rejected',
    'ai-chat': 'AI Assistant',
  };

  const getLabel = (path) => {
    return routeNameMap[path] || path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ');
  };

  return (
    <nav className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 overflow-x-auto no-scrollbar" aria-label="Breadcrumb">
      <NavLink 
        to="/" 
        className="font-medium hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shrink-0"
      >
        Workspace
      </NavLink>

      {pathnames.length > 0 && (
        <ChevronRight className="w-3 h-3 shrink-0 text-slate-300 dark:text-slate-600" />
      )}

      {pathnames.length === 0 ? (
        <span className="font-semibold text-slate-900 dark:text-white">Dashboard</span>
      ) : (
        pathnames.map((value, index) => {
          const last = index === pathnames.length - 1;
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          const label = getLabel(value);

          return (
            <React.Fragment key={to}>
              {last ? (
                <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[140px] sm:max-w-none">
                  {label}
                </span>
              ) : (
                <div className="flex items-center gap-1.5 shrink-0">
                  <NavLink 
                    to={to} 
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    {label}
                  </NavLink>
                  <ChevronRight className="w-3 h-3 text-slate-300 dark:text-slate-600" />
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
