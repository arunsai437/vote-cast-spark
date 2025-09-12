export interface User {
  id: string;
  email: string;
  name: string;
  isVerified: boolean;
  role: 'admin' | 'voter';
  createdAt: Date;
  phone?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface VoteRecord {
  userId: string;
  pollId: string;
  option: string;
  timestamp: Date;
  ipAddress: string;
}

export interface SecurityLog {
  id: string;
  type: 'login' | 'vote' | 'suspicious_activity' | 'rate_limit';
  userId?: string;
  message: string;
  timestamp: Date;
  metadata?: any;
}