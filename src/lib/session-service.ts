import { User } from 'firebase/auth';
import { persistenceService } from './persistence-service';

interface SessionData {
  user: User | null;
  token: string | null;
  lastActivity: number;
}

class SessionService {
  private static instance: SessionService;
  private readonly SESSION_KEY = 'session';
  private readonly TOKEN_KEY = 'auth_token';
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

  private constructor() {
    // Initialize session tracking
    this.trackActivity();
  }

  public static getInstance(): SessionService {
    if (!SessionService.instance) {
      SessionService.instance = new SessionService();
    }
    return SessionService.instance;
  }

  private trackActivity(): void {
    if (typeof window !== 'undefined') {
      // Update last activity on user interaction
      ['mousedown', 'keydown', 'mousemove', 'touchstart'].forEach(event => {
        window.addEventListener(event, () => this.updateLastActivity());
      });

      // Check session status periodically
      setInterval(() => this.checkSession(), 60000); // Check every minute
    }
  }

  private updateLastActivity(): void {
    const session = this.getSession();
    if (session) {
      this.setSession({
        ...session,
        lastActivity: Date.now()
      });
    }
  }

  private checkSession(): void {
    const session = this.getSession();
    if (session) {
      const inactiveTime = Date.now() - session.lastActivity;
      if (inactiveTime > this.SESSION_TIMEOUT) {
        this.clearSession();
        // Reload page to ensure clean state
        window.location.reload();
      }
    }
  }

  public getSession(): SessionData | null {
    return persistenceService.get<SessionData>(this.SESSION_KEY, {
      type: 'session'
    });
  }

  public setSession(data: SessionData): void {
    persistenceService.set(this.SESSION_KEY, data, {
      type: 'session'
    });
  }

  public getAuthToken(): string | null {
    return persistenceService.get<string>(this.TOKEN_KEY, {
      type: 'local'
    });
  }

  public setAuthToken(token: string): void {
    persistenceService.set(this.TOKEN_KEY, token, {
      type: 'local'
    });
  }

  public getUser(): User | null {
    const session = this.getSession();
    return session?.user || null;
  }

  public setUser(user: User | null): void {
    const session = this.getSession() || {
      user: null,
      token: this.getAuthToken(),
      lastActivity: Date.now()
    };

    this.setSession({
      ...session,
      user
    });
  }

  public isAuthenticated(): boolean {
    return !!this.getAuthToken() && !!this.getUser();
  }

  public clearSession(): void {
    persistenceService.remove(this.SESSION_KEY, { type: 'session' });
    persistenceService.remove(this.TOKEN_KEY, { type: 'local' });
  }

  public refreshSession(token: string, user: User): void {
    this.setAuthToken(token);
    this.setSession({
      user,
      token,
      lastActivity: Date.now()
    });
  }

  public getUserRole(): string {
    const user = this.getUser();
    return user?.email?.endsWith('@admin.com') ? 'admin' : 'user';
  }

  public hasRole(requiredRoles: string[]): boolean {
    const userRole = this.getUserRole();
    return requiredRoles.includes(userRole);
  }
}

// Export singleton instance
export const sessionService = SessionService.getInstance();