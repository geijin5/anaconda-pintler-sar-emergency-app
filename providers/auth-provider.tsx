import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';

interface User {
  id: string;
  username: string;
  role: 'admin' | 'user';
  name: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateCredentials: (newUsername: string, newPassword: string) => Promise<boolean>;
}

const STORAGE_KEYS = {
  USER: '@auth_user',
  TOKEN: '@auth_token',
  ADMIN_CREDENTIALS: '@admin_credentials',
};

// Default admin credentials - can be changed by admin
const DEFAULT_ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'SAR2024!',
};

export const [AuthProvider, useAuth] = createContextHook<AuthContextType>(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [adminCredentials, setAdminCredentials] = useState(DEFAULT_ADMIN_CREDENTIALS);

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  const loadStoredAuth = async () => {
    try {
      const [storedUser, storedToken, storedCredentials] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.USER),
        AsyncStorage.getItem(STORAGE_KEYS.TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.ADMIN_CREDENTIALS),
      ]);

      if (storedCredentials) {
        setAdminCredentials(JSON.parse(storedCredentials));
      }

      if (storedUser && storedToken) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check credentials
      if (username === adminCredentials.username && password === adminCredentials.password) {
        const token = 'mock_admin_token_' + Date.now();
        const userData = {
          id: '1',
          username: adminCredentials.username,
          role: 'admin' as const,
          name: 'SAR Administrator'
        };
        
        await Promise.all([
          AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData)),
          AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token),
        ]);

        setUser(userData);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }, [adminCredentials]);

  const logout = useCallback(async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.USER),
        AsyncStorage.removeItem(STORAGE_KEYS.TOKEN),
      ]);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  const updateCredentials = useCallback(async (newUsername: string, newPassword: string): Promise<boolean> => {
    try {
      const newCredentials = {
        username: newUsername,
        password: newPassword,
      };

      await AsyncStorage.setItem(STORAGE_KEYS.ADMIN_CREDENTIALS, JSON.stringify(newCredentials));
      setAdminCredentials(newCredentials);

      // Update user data if currently logged in
      if (user) {
        const updatedUser = {
          ...user,
          username: newUsername,
        };
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
        setUser(updatedUser);
      }

      return true;
    } catch (error) {
      console.error('Update credentials error:', error);
      return false;
    }
  }, [user]);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  return useMemo(() => ({
    user,
    isLoading,
    isAuthenticated,
    isAdmin,
    login,
    logout,
    updateCredentials,
  }), [user, isLoading, isAuthenticated, isAdmin, login, logout, updateCredentials]);
});