import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const AdminRoute: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50 text-slate-900">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-purple-600 border-t-transparent shadow-sm"></div>
        </div>
      </div>
    );
  }

  return user?.role === 'Admin' ? <Outlet /> : <Navigate to="/dashboard" replace />;
};

