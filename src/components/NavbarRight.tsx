
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const NavbarRight: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();

  return (
    <div className="flex items-center gap-4">
      {user ? (
        <>
          <span className="text-sm hidden md:inline">
            Hi, {user.name || user.email}
          </span>
          {isAdmin && (
            <Button asChild variant="outline" size="sm">
              <Link to="/admin">Admin Dashboard</Link>
            </Button>
          )}
          <Button onClick={logout} variant="ghost" size="sm">
            Logout
          </Button>
        </>
      ) : (
        <>
          <Button asChild variant="outline" size="sm">
            <Link to="/login">Login</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/signup">Sign up</Link>
          </Button>
        </>
      )}
    </div>
  );
};

export default NavbarRight;
