import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { RoleGuard } from './utils/roleGuards';

// Landing
import LandingPage from './pages/landing/LandingPage';
import AboutPage from './pages/landing/AboutPage';

// Auth
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';

// Client
import ClientLayout from './pages/client/ClientLayout';
import ClientDashboard from './pages/client/ClientDashboard';
import PostProject from './pages/client/PostProject';
import ClientProjects from './pages/client/ClientProjects';
import ProjectDetail from './pages/client/ProjectDetail';
import ClientPayments from './pages/client/ClientPayments';
import ClientMessages from './pages/client/ClientMessages';
import ClientSettings from './pages/client/ClientSettings';

// Freelancer
import FreelancerLayout from './pages/freelancer/FreelancerLayout';
import FreelancerDashboard from './pages/freelancer/FreelancerDashboard';
import FreelancerTasks from './pages/freelancer/FreelancerTasks';
import TaskDetail from './pages/freelancer/TaskDetail';
import FreelancerEarnings from './pages/freelancer/FreelancerEarnings';
import FreelancerProgress from './pages/freelancer/FreelancerProgress';
import FreelancerMessages from './pages/freelancer/FreelancerMessages';
import FreelancerSettings from './pages/freelancer/FreelancerSettings';

// Admin
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminClients from './pages/admin/AdminClients';
import AdminFreelancers from './pages/admin/AdminFreelancers';
import AdminProjects from './pages/admin/AdminProjects';
import AdminDisputes from './pages/admin/AdminDisputes';
import AdminPromotions from './pages/admin/AdminPromotions';
import AdminSettings from './pages/admin/AdminSettings';

function App() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Client — protected */}
      <Route path="/client" element={<RoleGuard allowedRoles={['client']}><ClientLayout /></RoleGuard>}>
        <Route index element={<Navigate to="/client/dashboard" replace />} />
        <Route path="dashboard" element={<ClientDashboard />} />
        <Route path="post-project" element={<PostProject />} />
        <Route path="projects" element={<ClientProjects />} />
        <Route path="project/:id" element={<ProjectDetail />} />
        <Route path="payments" element={<ClientPayments />} />
        <Route path="messages" element={<ClientMessages />} />
        <Route path="settings" element={<ClientSettings />} />
      </Route>

      {/* Freelancer — protected */}
      <Route path="/freelancer" element={<RoleGuard allowedRoles={['freelancer']}><FreelancerLayout /></RoleGuard>}>
        <Route index element={<Navigate to="/freelancer/dashboard" replace />} />
        <Route path="dashboard" element={<FreelancerDashboard />} />
        <Route path="tasks" element={<FreelancerTasks />} />
        <Route path="task/:id" element={<TaskDetail />} />
        <Route path="earnings" element={<FreelancerEarnings />} />
        <Route path="progress" element={<FreelancerProgress />} />
        <Route path="messages" element={<FreelancerMessages />} />
        <Route path="settings" element={<FreelancerSettings />} />
      </Route>

      {/* Admin — direct URL only */}
      <Route path="/admin" element={<RoleGuard allowedRoles={['admin']}><AdminLayout /></RoleGuard>}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="clients" element={<AdminClients />} />
        <Route path="freelancers" element={<AdminFreelancers />} />
        <Route path="projects" element={<AdminProjects />} />
        <Route path="disputes" element={<AdminDisputes />} />
        <Route path="promotions" element={<AdminPromotions />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
