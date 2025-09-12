import { User, AuthState, SecurityLog } from "@/types/auth";

// Mock users database
const MOCK_USERS: User[] = [
  {
    id: "1",
    email: "admin@voting.com",
    name: "Admin User",
    isVerified: true,
    role: 'admin',
    createdAt: new Date('2024-01-01'),
    phone: "9999999999"
  },
  {
    id: "2", 
    email: "voter1@example.com",
    name: "John Doe",
    isVerified: true,
    role: 'voter',
    createdAt: new Date('2024-01-15'),
    phone: "9876543210"
  },
  {
    id: "3",
    email: "voter2@example.com", 
    name: "Jane Smith",
    isVerified: false,
    role: 'voter',
    createdAt: new Date('2024-02-01'),
    phone: "9876543211"
  }
];

class MockAuthService {
  private currentUser: User | null = null;
  private securityLogs: SecurityLog[] = [];

  constructor() {
    // Check if user is already logged in (localStorage)
    const savedUser = localStorage.getItem('voting_user');
    if (savedUser) {
      this.currentUser = JSON.parse(savedUser);
    }
  }

  async login(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Rate limiting simulation
    const attempts = this.getLoginAttempts();
    if (attempts >= 3) {
      this.logSecurity('rate_limit', 'Too many login attempts');
      return { success: false, error: 'Too many attempts. Please try again later.' };
    }

    const user = MOCK_USERS.find(u => u.email === email);
    
    if (!user || password !== 'password123') {
      this.incrementLoginAttempts();
      this.logSecurity('login', `Failed login attempt for ${email}`);
      return { success: false, error: 'Invalid credentials' };
    }

    if (!user.isVerified) {
      return { success: false, error: 'Please verify your email before logging in' };
    }

    this.currentUser = user;
    localStorage.setItem('voting_user', JSON.stringify(user));
    localStorage.removeItem('login_attempts');
    this.logSecurity('login', `User ${user.email} logged in successfully`, user.id);
    
    return { success: true, user };
  }

  async register(email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (MOCK_USERS.find(u => u.email === email)) {
      return { success: false, error: 'User already exists' };
    }

    // In real app, would send verification email
    const newUser: User = {
      id: Date.now().toString(),
      email,
      name,
      isVerified: false,
      role: 'voter',
      createdAt: new Date()
    };

    MOCK_USERS.push(newUser);
    this.logSecurity('login', `New user registered: ${email}`, newUser.id);
    
    return { success: true };
  }

  logout(): void {
    if (this.currentUser) {
      this.logSecurity('login', `User ${this.currentUser.email} logged out`, this.currentUser.id);
    }
    this.currentUser = null;
    localStorage.removeItem('voting_user');
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null && this.currentUser.isVerified;
  }

  private getLoginAttempts(): number {
    const attempts = localStorage.getItem('login_attempts');
    return attempts ? parseInt(attempts) : 0;
  }

  private incrementLoginAttempts(): void {
    const current = this.getLoginAttempts();
    localStorage.setItem('login_attempts', (current + 1).toString());
  }

  private logSecurity(type: SecurityLog['type'], message: string, userId?: string, metadata?: any): void {
    const log: SecurityLog = {
      id: Date.now().toString(),
      type,
      userId,
      message,
      timestamp: new Date(),
      metadata
    };
    this.securityLogs.push(log);
    console.log('Security Log:', log);
  }

  async loginWithPhone(phone: string, otp: string): Promise<{ success: boolean; user?: User; error?: string }> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Rate limiting simulation
    const attempts = this.getLoginAttempts();
    if (attempts >= 3) {
      this.logSecurity('rate_limit', 'Too many login attempts');
      return { success: false, error: 'Too many attempts. Please try again later.' };
    }

    const user = MOCK_USERS.find(u => u.phone === phone);
    
    if (!user || otp !== '123456') {
      this.incrementLoginAttempts();
      this.logSecurity('login', `Failed login attempt for ${phone}`);
      return { success: false, error: 'Invalid phone number or OTP' };
    }

    if (!user.isVerified) {
      return { success: false, error: 'Please verify your phone number before logging in' };
    }

    this.currentUser = user;
    localStorage.setItem('voting_user', JSON.stringify(user));
    localStorage.removeItem('login_attempts');
    this.logSecurity('login', `User ${user.phone} logged in successfully`, user.id);
    
    return { success: true, user };
  }

  async registerWithPhone(phone: string, name: string, otp: string): Promise<{ success: boolean; error?: string }> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (MOCK_USERS.find(u => u.phone === phone)) {
      return { success: false, error: 'Phone number already registered' };
    }

    if (otp !== '123456') {
      return { success: false, error: 'Invalid OTP' };
    }

    // In real app, would verify OTP
    const newUser: User = {
      id: Date.now().toString(),
      email: `${phone}@phone.com`,
      name,
      isVerified: true,
      role: 'voter',
      createdAt: new Date(),
      phone
    };

    MOCK_USERS.push(newUser);
    this.logSecurity('login', `New user registered: ${phone}`, newUser.id);
    
    return { success: true };
  }

  getSecurityLogs(): SecurityLog[] {
    return this.securityLogs;
  }
}

export const mockAuthService = new MockAuthService();