'use client';

'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode
} from 'react';
import { auth } from '../../firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  User,
  AuthError,
  UserCredential,
} from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { LoginFormData, SignupFormData } from '@/types';
import { sessionService } from '@/lib/session-service';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

interface AuthActions {
  signIn: (data: LoginFormData) => Promise<void>;
  signUp: (data: SignupFormData) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (displayName?: string, photoURL?: string) => Promise<void>;
  clearError: () => void;
}

interface AuthContextType extends AuthState, AuthActions {}

// Initialize with default values
const defaultAuthState: AuthState = {
  user: null,
  loading: true,
  error: null,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(defaultAuthState);
  const router = useRouter();

  const updateState = useCallback((updates: Partial<AuthState>) => {
    setState(current => ({ ...current, ...updates }));
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Get a fresh token
          const token = await user.getIdToken(true);
          // Update session with new token
          sessionService.refreshSession(token, user);
        } catch (error) {
          console.error('Error refreshing token:', error);
          sessionService.clearSession();
        }
      } else {
        sessionService.clearSession();
      }
      updateState({ user, loading: false });
    });

    // Initialize user from session if available
    const sessionUser = sessionService.getUser();
    if (sessionUser) {
      updateState({ user: sessionUser });
    }

    return () => unsubscribe();
  }, [updateState]);

  const handleError = useCallback((error: unknown) => {
    if (error instanceof Error) {
      const authError = error as AuthError;
      updateState({ error: getAuthErrorMessage(authError) });
    } else {
      updateState({ error: 'An unexpected error occurred' });
    }
  }, [updateState]);

  const signIn = useCallback(async ({ email, password }: LoginFormData) => {
    try {
      updateState({ error: null, loading: true });
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Get the auth token
      const token = await userCredential.user.getIdToken();
      // Store the session data
      sessionService.refreshSession(token, userCredential.user);
      router.push('/dashboard');
    } catch (error) {
      handleError(error);
    } finally {
      updateState({ loading: false });
    }
  }, [router, handleError, updateState]);

  const signUp = useCallback(async ({ email, password, displayName }: SignupFormData) => {
    try {
      updateState({ error: null, loading: true });
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      if (displayName) {
        await updateProfile(userCredential.user, { displayName });
      }

      // Create user profile in your backend if needed
      router.push('/dashboard');
    } catch (error) {
      handleError(error);
    } finally {
      updateState({ loading: false });
    }
  }, [router, handleError, updateState]);

  const logout = useCallback(async () => {
    try {
      updateState({ error: null });
      await signOut(auth);
      // Clear session data
      sessionService.clearSession();
      router.push('/login');
    } catch (error) {
      handleError(error);
    }
  }, [router, handleError, updateState]);

  const resetPassword = useCallback(async (email: string) => {
    try {
      updateState({ error: null, loading: true });
      await sendPasswordResetEmail(auth, email);
      // Show success message or redirect
    } catch (error) {
      handleError(error);
    } finally {
      updateState({ loading: false });
    }
  }, [handleError, updateState]);

  const updateUserProfile = useCallback(async (displayName?: string, photoURL?: string) => {
    try {
      updateState({ error: null, loading: true });
      
      if (!auth.currentUser) {
        throw new Error('No user is signed in');
      }

      await updateProfile(auth.currentUser, {
        displayName: displayName || auth.currentUser.displayName,
        photoURL: photoURL || auth.currentUser.photoURL,
      });

      // Update local user state
      updateState({ user: auth.currentUser });
    } catch (error) {
      handleError(error);
    } finally {
      updateState({ loading: false });
    }
  }, [handleError, updateState]);

  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  const value: AuthContextType = {
    user: state.user,
    loading: state.loading,
    error: state.error,
    signIn,
    signUp,
    logout,
    resetPassword,
    updateUserProfile,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

function getAuthErrorMessage(error: AuthError): string {
  switch (error.code) {
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/user-not-found':
      return 'No account found with this email.';
    case 'auth/email-already-in-use':
      return 'An account already exists with this email.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/invalid-email':
      return 'Invalid email address.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/operation-not-allowed':
      return 'Operation not allowed. Please contact support.';
    case 'auth/requires-recent-login':
      return 'This operation requires a recent login. Please sign in again.';
    case 'auth/popup-closed-by-user':
      return 'Authentication popup was closed before completing the sign in process.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    default:
      return error.message || 'An error occurred. Please try again.';
  }
}