import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { RoleGuard } from './utils/roleGuards';
import PublicRoute from './components/PublicRoute';
import PageTransition from './components/PageTransition';

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
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public — redirect to dashboard if already logged in */}
        <Route path="/" element={<PublicRoute><PageTransition><LandingPage /></PageTransition></PublicRoute>} />
        <Route path="/about" element={<PageTransition><AboutPage /></PageTransition>} />
        <Route path="/pricing" element={<PageTransition><PricingPage /></PageTransition>} />
        <Route path="/login" element={<PublicRoute><PageTransition><LoginPage /></PageTransition></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><PageTransition><SignupPage /></PageTransition></PublicRoute>} />
        <Route path="/meet/:meetingId" element={<PageTransition><MeetRoom /></PageTransition>} />
        <Route path="/freelancer/onboarding" element={<RoleGuard allowedRoles={['freelancer']}><PageTransition><FreelancerOnboarding /></PageTransition></RoleGuard>} />

        {/* Client — protected */}
        <Route path="/client" element={<RoleGuard allowedRoles={['client']}><ClientLayout /></RoleGuard>}>
          <Route index element={<Navigate to="/client/dashboard" replace />} />
          <Route path="dashboard" element={<PageTransition><ClientDashboard /></PageTransition>} />
          <Route path="post-project" element={<PageTransition><PostProject /></PageTransition>} />
          <Route path="projects" element={<PageTransition><ClientProjects /></PageTransition>} />
          <Route path="project/:id" element={<PageTransition><ProjectDetail /></PageTransition>} />
          <Route path="wallet" element={<PageTransition><ClientWallet /></PageTransition>} />
          <Route path="payments" element={<PageTransition><ClientPayments /></PageTransition>} />
          <Route path="messages" element={<PageTransition><ClientMessages /></PageTransition>} />
          <Route path="meet" element={<PageTransition><ClientMeet /></PageTransition>} />
          <Route path="settings" element={<PageTransition><ClientSettings /></PageTransition>} />
        </Route>

        {/* Freelancer — protected */}
        <Route path="/freelancer" element={<RoleGuard allowedRoles={['freelancer']}><FreelancerLayout /></RoleGuard>}>
          <Route index element={<Navigate to="/freelancer/dashboard" replace />} />
          <Route path="dashboard" element={<PageTransition><FreelancerDashboard /></PageTransition>} />
          <Route path="tasks" element={<PageTransition><FreelancerTasks /></PageTransition>} />
          <Route path="task/:id" element={<PageTransition><TaskDetail /></PageTransition>} />
          <Route path="learning" element={<PageTransition><FreelancerLearning /></PageTransition>} />
          <Route path="meet" element={<PageTransition><FreelancerMeet /></PageTransition>} />
          <Route path="earnings" element={<PageTransition><FreelancerEarnings /></PageTransition>} />
          <Route path="progress" element={<PageTransition><FreelancerProgress /></PageTransition>} />
          <Route path="messages" element={<PageTransition><FreelancerMessages /></PageTransition>} />
          <Route path="settings" element={<PageTransition><FreelancerSettings /></PageTransition>} />
        </Route>

        {/* Supervisor — protected */}
        <Route path="/supervisor" element={<RoleGuard allowedRoles={['momentum_supervisor']}><SupervisorLayout /></RoleGuard>}>
          <Route index element={<Navigate to="/supervisor/dashboard" replace />} />
          <Route path="dashboard"   element={<PageTransition><SupervisorDashboard /></PageTransition>} />
          <Route path="messages"    element={<PageTransition><SupervisorMessages /></PageTransition>} />
          <Route path="freelancers" element={<PageTransition><SupervisorDashboard /></PageTransition>} />
          <Route path="settings"    element={<PageTransition><SupervisorDashboard /></PageTransition>} />
        </Route>

        {/* Admin — direct URL only */}
        <Route path="/admin" element={<RoleGuard allowedRoles={['admin']}><AdminLayout /></RoleGuard>}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<PageTransition><AdminDashboard /></PageTransition>} />
          <Route path="users" element={<PageTransition><AdminUsers /></PageTransition>} />
          <Route path="clients" element={<PageTransition><AdminClients /></PageTransition>} />
          <Route path="freelancers" element={<PageTransition><AdminFreelancers /></PageTransition>} />
          <Route path="projects" element={<PageTransition><AdminProjects /></PageTransition>} />
          <Route path="disputes" element={<PageTransition><AdminDisputes /></PageTransition>} />
          <Route path="promotions" element={<PageTransition><AdminPromotions /></PageTransition>} />
          <Route path="settings" element={<PageTransition><AdminSettings /></PageTransition>} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default App;
