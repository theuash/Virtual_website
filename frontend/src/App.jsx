import { Routes, Route, Navigate } from 'react-router-dom';
import { RoleGuard } from './utils/roleGuards';
import PublicRoute from './components/PublicRoute';

// Landing
import LandingPage from './pages/landing/LandingPage';
import AboutPage from './pages/landing/AboutPage';
import PricingPage from './pages/landing/PricingPage';

// Auth
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';

// Meet
import MeetRoom from './pages/MeetRoom';

// Client
import ClientLayout from './pages/client/ClientLayout';
import ClientDashboard from './pages/client/ClientDashboard';
import PostProject from './pages/client/PostProject';
import ClientProjects from './pages/client/ClientProjects';
import ProjectDetail from './pages/client/ProjectDetail';
import ClientPayments from './pages/client/ClientPayments';
import ClientMessages from './pages/client/ClientMessages';
import ClientSettings from './pages/client/ClientSettings';
import ClientWallet from './pages/client/ClientWallet';
import ClientMeet from './pages/client/ClientMeet';

// Freelancer
import FreelancerLayout from './pages/freelancer/FreelancerLayout';
import FreelancerDashboard from './pages/freelancer/FreelancerDashboard';
import FreelancerTasks from './pages/freelancer/FreelancerTasks';
import TaskDetail from './pages/freelancer/TaskDetail';
import FreelancerEarnings from './pages/freelancer/FreelancerEarnings';
import FreelancerProgress from './pages/freelancer/FreelancerProgress';
import FreelancerMessages from './pages/freelancer/FreelancerMessages';
import FreelancerSettings from './pages/freelancer/FreelancerSettings';
import FreelancerLearning from './pages/freelancer/FreelancerLearning';
import FreelancerMeet from './pages/freelancer/FreelancerMeet';
import FreelancerOnboarding from './pages/freelancer/FreelancerOnboarding';

// Supervisor
import SupervisorLayout from './pages/supervisor/SupervisorLayout';
import SupervisorDashboard from './pages/supervisor/SupervisorDashboard';
import SupervisorMessages from './pages/supervisor/SupervisorMessages';

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
  return (
    <Routes>
      {/* Public — redirect to dashboard if already logged in */}
      <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
      <Route path="/meet/:meetingId" element={<MeetRoom />} />
      <Route path="/freelancer/onboarding" element={<RoleGuard allowedRoles={['freelancer']}><FreelancerOnboarding /></RoleGuard>} />

      {/* Client — protected */}
      <Route path="/client" element={<RoleGuard allowedRoles={['client']}><ClientLayout /></RoleGuard>}>
        <Route index element={<Navigate to="/client/dashboard" replace />} />
        <Route path="dashboard" element={<ClientDashboard />} />
        <Route path="post-project" element={<PostProject />} />
        <Route path="projects" element={<ClientProjects />} />
        <Route path="project/:id" element={<ProjectDetail />} />
        <Route path="wallet" element={<ClientWallet />} />
        <Route path="payments" element={<ClientPayments />} />
        <Route path="messages" element={<ClientMessages />} />
        <Route path="meet" element={<ClientMeet />} />
        <Route path="settings" element={<ClientSettings />} />
      </Route>

      {/* Freelancer — protected */}
      <Route path="/freelancer" element={<RoleGuard allowedRoles={['freelancer']}><FreelancerLayout /></RoleGuard>}>
        <Route index element={<Navigate to="/freelancer/dashboard" replace />} />
        <Route path="dashboard" element={<FreelancerDashboard />} />
        <Route path="tasks" element={<FreelancerTasks />} />
        <Route path="task/:id" element={<TaskDetail />} />
        <Route path="learning" element={<FreelancerLearning />} />
        <Route path="meet" element={<FreelancerMeet />} />
        <Route path="earnings" element={<FreelancerEarnings />} />
        <Route path="progress" element={<FreelancerProgress />} />
        <Route path="messages" element={<FreelancerMessages />} />
        <Route path="settings" element={<FreelancerSettings />} />
      </Route>

      {/* Supervisor — protected */}
      <Route path="/supervisor" element={<RoleGuard allowedRoles={['momentum_supervisor']}><SupervisorLayout /></RoleGuard>}>
        <Route index element={<Navigate to="/supervisor/dashboard" replace />} />
        <Route path="dashboard"   element={<SupervisorDashboard />} />
        <Route path="messages"    element={<SupervisorMessages />} />
        <Route path="freelancers" element={<SupervisorDashboard />} />
        <Route path="settings"    element={<SupervisorDashboard />} />
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
