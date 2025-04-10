
import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  adminOnly?: boolean;
  children: ReactNode;
}

const ProtectedRoute = ({ adminOnly = false, children }: ProtectedRouteProps) => {
  const { user, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // User is not logged in, redirect to login
        navigate('/login');
      } else if (adminOnly && !isAdmin) {
        // User is logged in but not an admin, and this is an admin-only route
        navigate('/');
      }
    }
  }, [user, isAdmin, isLoading, navigate, adminOnly]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user is not logged in or if it's an admin route and user is not admin, don't show content
  // This is a fallback while the redirect happens
  if (!user || (adminOnly && !isAdmin)) {
    return null;
  }

  // If all checks pass, show the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
