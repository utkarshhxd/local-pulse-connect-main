import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, LoginCredentials, SignupCredentials } from '@/types';
import { authService } from '@/services/db';
import { toast } from '@/hooks/use-toast';

type AuthContextType = {
  user: Omit<User, 'password'> | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (credentials: SignupCredentials) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Omit<User, 'password'> | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const loggedInUser = await authService.login(credentials.email, credentials.password);
      setUser(loggedInUser);
      localStorage.setItem('user', JSON.stringify(loggedInUser));
      toast(`Welcome back, ${loggedInUser.name || loggedInUser.email}!`, {
        description: 'Login successful',
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An unknown error occurred', {
        description: 'Login failed',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (credentials: SignupCredentials) => {
    setIsLoading(true);
    try {
      const newUser = await authService.signup(
        credentials.email, 
        credentials.password,
        credentials.name,
        credentials.phone
      );
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      toast('Your account has been created!', {
        description: 'Registration successful',
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An unknown error occurred', {
        description: 'Registration failed',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    toast('You have been successfully logged out.', {
      description: 'Logged out',
    });
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
