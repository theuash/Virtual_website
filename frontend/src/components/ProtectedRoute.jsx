import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Full-screen spinner shown while the token check is in progress
function Spinner() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
    </div>
  );
}

/**
 * Renders children only when the user is authenticated.
 * - While loading: shows a spinner (prevents flash of wrong page)
 * - Not logged in: redirects to /
 * - Logged in: renders children
 */
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/" replace />;
  return children;
}
