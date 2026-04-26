import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRoleRedirect } from '../utils/roleGuards';
import { useState, useEffect } from 'react';

// Full-screen spinner shown while the token check is in progress
function Spinner() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
    </div>
  );
}

/**
 * Renders children only when the user is NOT authenticated.
 * - While loading: shows a spinner (prevents flash of wrong page)
 * - Already logged in: redirects to the user's role dashboard
 * - Not logged in: renders children
 */
export default function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  // On initial mount (checking stored token), show spinner to avoid flash
  // But once the page has rendered once, keep rendering children during
  // subsequent loading states (e.g. API calls) so state isn't lost
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  useEffect(() => {
    if (!loading) setInitialCheckDone(true);
  }, [loading]);

  if (!initialCheckDone && loading) return <Spinner />;
  if (user) return <Navigate to={getRoleRedirect(user.role, user)} replace />;
  return children;
}
