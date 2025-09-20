
import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import type { User, UserRole, FlaggedContent, SeverityThreshold } from '../types';

interface AuthContextType {
  user: User | null;
  flaggedContent: FlaggedContent[];
  alertThreshold: SeverityThreshold;
  login: (email: string, role: UserRole) => void;
  logout: () => void;
  addFlaggedContent: (content: Omit<FlaggedContent, 'id' | 'timestamp'>) => void;
  setAlertThreshold: (threshold: SeverityThreshold) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [flaggedContent, setFlaggedContent] = useState<FlaggedContent[]>([]);
  const [alertThreshold, setAlertThreshold] = useState<SeverityThreshold>('Medium');

  const login = useCallback((email: string, role: UserRole) => {
    const mockUser: User = {
      id: role === 'Child' ? 'child123' : 'parent123',
      email,
      role,
      name: role === 'Child' ? 'Alex' : 'Dr. Riley',
    };
    setUser(mockUser);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setFlaggedContent([]);
  }, []);

  const addFlaggedContent = useCallback((newContent: Omit<FlaggedContent, 'id' | 'timestamp'>) => {
    const contentItem: FlaggedContent = {
        ...newContent,
        id: `flag-${Date.now()}`,
        timestamp: Date.now()
    };
    setFlaggedContent(prev => [contentItem, ...prev]);
  }, []);
  
  useEffect(() => {
    if (user?.role === 'Parent') {
        const now = Date.now();
        const oneWeek = 7 * 24 * 60 * 60 * 1000;
        const mockContent: FlaggedContent[] = [
            { id: '1', text: 'You are so dumb.', sourceApp: 'WhatsApp', severity: 'Medium', timestamp: now - 100000 },
            { id: '2', text: "I'm going to find you after school.", sourceApp: 'Instagram', severity: 'High', timestamp: now - 500000 },
            { id: '3', text: 'Nobody likes you.', sourceApp: 'Messenger', severity: 'Medium', timestamp: now - (oneWeek * 1) },
            { id: '4', text: 'That outfit is ugly.', sourceApp: 'TikTok', severity: 'Medium', timestamp: now - (oneWeek * 2) },
            { id: '5', text: 'GET LOST!', sourceApp: 'Telegram', severity: 'High', timestamp: now - (oneWeek * 3) },
        ];
        setFlaggedContent(mockContent);
    }
  }, [user]);


  return (
    <AuthContext.Provider value={{ user, login, logout, flaggedContent, addFlaggedContent, alertThreshold, setAlertThreshold }}>
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
