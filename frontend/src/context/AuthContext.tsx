import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { loginApi, demoLoginApi, registerApi, getProfileApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  role: Role;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  demoLogin: (role: Role) => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: Role) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('farm2market_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('farm2market_token'));
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const role: Role = (user?.role as Role) || 'FARMER';

  useEffect(() => {
    if (token && !user) {
      getProfileApi()
        .then((res) => {
          if (res?.success && res.user) {
            setUser(res.user);
            localStorage.setItem('farm2market_user', JSON.stringify(res.user));
          }
        })
        .catch(() => {
          logout();
        });
    }
  }, [token]);

  const login = async (email: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await loginApi(email, pass);
      if (res.success && res.token) {
        setToken(res.token);
        setUser(res.user);
        localStorage.setItem('farm2market_token', res.token);
        localStorage.setItem('farm2market_user', JSON.stringify(res.user));
        return true;
      }
      return false;
    } catch (e) {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const demoLogin = async (targetRole: Role): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await demoLoginApi(targetRole);
      if (res.success && res.token) {
        setToken(res.token);
        setUser(res.user);
        localStorage.setItem('farm2market_token', res.token);
        localStorage.setItem('farm2market_user', JSON.stringify(res.user));
        return true;
      }
      return false;
    } catch (e) {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: any): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await registerApi(userData);
      if (res.success && res.token) {
        setToken(res.token);
        setUser(res.user);
        localStorage.setItem('farm2market_token', res.token);
        localStorage.setItem('farm2market_user', JSON.stringify(res.user));
        return true;
      }
      return false;
    } catch (e) {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('farm2market_token');
    localStorage.removeItem('farm2market_user');
  };

  const switchRole = async (targetRole: Role): Promise<boolean> => {
    return demoLogin(targetRole);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        demoLogin,
        register,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
