import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile } from '../types';
import { getStoredUser, saveUserToStorage } from '../services/storage';

interface UserContextType {
  user: UserProfile;
  updateUser: (updates: Partial<UserProfile>) => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(getStoredUser());
  const [isLoading, setIsLoading] = useState(true);

  // Load initial state
  useEffect(() => {
    const loaded = getStoredUser();
    setUser(loaded);
    setIsLoading(false);
  }, []);

  const updateUser = (updates: Partial<UserProfile>) => {
    setUser(prev => {
      const newUser = { ...prev, ...updates };
      saveUserToStorage(newUser); // Persist immediately
      return newUser;
    });
  };

  return (
    <UserContext.Provider value={{ user, updateUser, isLoading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};