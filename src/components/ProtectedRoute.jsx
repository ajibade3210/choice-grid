import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export const ProtectedRoute = ({ children, isAuthLoading, user }) => {
  const location = useLocation();

  // If session is being validated, render neutral zinc skeleton spinner
  if (isAuthLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center gap-3 bg-white dark:bg-zinc-950 transition-colors">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-900 dark:text-zinc-100" />
        <p className="text-xs font-medium tracking-wide uppercase text-zinc-500 dark:text-zinc-400">
          Loading Choice Grid...
        </p>
      </div>
    );
  }

  // If not authenticated, redirect to /login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
