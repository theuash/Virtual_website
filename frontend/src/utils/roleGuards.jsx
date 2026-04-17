import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLE_REDIRECTS = {
  client: '/client/dashboard',
  freelancer: '/freelancer/dashboard',
  admin: '/admin/dashboard',
};

export const RoleGuard = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={ROLE_REDIRECTS[user.role] || '/login'} replace />;
  }
  return children;
};

// For freelancers who haven't completed onboarding, redirect to onboarding first
export const getRoleRedirect = (role, user = null) => {
  if (role === 'freelancer' && user && !user.onboardingComplete) {
    return '/freelancer/onboarding';
  }
  return ROLE_REDIRECTS[role] || '/login';
};

export const SKILLS = [
  'video_editing',
  '3d_animation',
  'cgi',
  'script_writing',
  'graphic_designing',
];

export const SKILL_LABELS = {
  video_editing: 'Video Editing',
  '3d_animation': '3D Animation',
  cgi: 'CGI',
  script_writing: 'Script Writing',
  graphic_designing: 'Graphic Designing',
};

export const TIER_LABELS = {
  precrate: 'Precrate',
  crate: 'Crate',
  initiator: 'Project Initiator',
  supervisor: 'Momentum Supervisor',
};

export const STATUS_LABELS = {
  open: 'Open',
  in_progress: 'In Progress',
  under_review: 'Under Review',
  completed: 'Completed',
};

export const STATUS_BADGE_CLASS = {
  open: 'badge badge-open',
  in_progress: 'badge badge-progress',
  under_review: 'badge badge-review',
  completed: 'badge badge-completed',
};

export const formatCurrency = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(n);

export const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export const timeAgo = (d) => {
  const diff = (Date.now() - new Date(d)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};
