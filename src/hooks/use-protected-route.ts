import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';

interface UseProtectedRouteConfig {
  redirectTo?: string;
  roles?: string[];
}

export const useProtectedRoute = (config?: UseProtectedRouteConfig) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { redirectTo = '/login', roles } = config || {};

  useEffect(() => {
    if (!loading) {
      // Check if user is authenticated
      if (!user) {
        // Store the attempted URL for redirection after login
        const returnUrl = encodeURIComponent(pathname);
        router.push(`${redirectTo}?returnUrl=${returnUrl}`);
        return;
      }

      // Check role-based access if roles are specified
      if (roles && roles.length > 0) {
        const userRole = user.email?.endsWith('@admin.com') ? 'admin' : 'user';
        if (!roles.includes(userRole)) {
          router.push('/unauthorized');
          return;
        }
      }
    }
  }, [loading, user, router, pathname, redirectTo, roles]);

  return { loading, user };
};