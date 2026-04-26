import { Routes, Route, Navigate } from 'react-router-dom';
import { RoleGuard } from './utils/roleGuards';
import PublicRoute from './components/PublicRoute';

// Landing
import LandingPage from './pages/landing/LandingPage';
import AboutPage from './pages/landing/AboutPage';
import PricingPage from './pages/landing/PricingPage';
import HowItWorksPage from './pages/landing/HowItWorksPage';
import RolesPage from './pages/landing/RolesPage';

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
import CrateMyTeam from './pages/freelancer/CrateMyTeam';
import { SidebarProvider } from './context/SidebarContext';

// Initiator
import InitiatorLayout from './pages/initiator/InitiatorLayout';
import InitiatorDashboard from './pages/initiator/InitiatorDashboard';
import InitiatorProjects from './pages/initiator/InitiatorProjects';
import InitiatorClients from './pages/initiator/InitiatorClients';
import InitiatorOpenProjects from './pages/initiator/InitiatorOpenProjects';
import InitiatorWork from './pages/initiator/InitiatorWork';
import InitiatorMessages from './pages/initiator/InitiatorMessages';
import InitiatorSettings from './pages/initiator/InitiatorSettings';
import InitiatorMeet from './pages/initiator/InitiatorMeet';
import InitiatorEarnings from './pages/initiator/InitiatorEarnings';

// Supervisor
import SupervisorLayout from './pages/supervisor/SupervisorLayout';
import SupervisorDashboard from './pages/supervisor/SupervisorDashboard';
import SupervisorMessages from './pages/supervisor/SupervisorMessages';
import SupervisorProjects from './pages/supervisor/SupervisorProjects';
import SupervisorDispatch from './pages/supervisor/SupervisorDispatch';
import SupervisorTeams from './pages/supervisor/SupervisorTeams';
import SupervisorPrecrates from './pages/supervisor/SupervisorPrecrates';
import SupervisorGroupProjects from './pages/supervisor/SupervisorGroupProjects';
import SupervisorClients from './pages/supervisor/SupervisorClients';
import SupervisorPayouts from './pages/supervisor/SupervisorPayouts';
import SupervisorEarnings from './pages/supervisor/SupervisorEarnings';
import SupervisorWallet from './pages/supervisor/SupervisorWallet';
import SupervisorSettings from './pages/supervisor/SupervisorSettings';
import SupervisorMeetings from './pages/supervisor/SupervisorMeetings';

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
      {/* Public - redirect to dashboard if already logged in */}
      <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/how-it-works" element={<HowItWorksPage />} />
      <Route path="/roles" element={<RolesPage />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
      <Route path="/meet/:meetingId" element={<MeetRoom />} />
      <Route path="/freelancer/onboarding" element={<RoleGuard allowedRoles={['freelancer']}><FreelancerOnboarding /></RoleGuard>} />

      {/* Client - protected */}
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

      {/* Freelancer - protected */}
      <Route path="/freelancer" element={<RoleGuard allowedRoles={['freelancer']}><SidebarProvider><FreelancerLayout /></SidebarProvider></RoleGuard>}>
        <Route index element={<Navigate to="/freelancer/dashboard" replace />} />
        <Route path="dashboard" element={<FreelancerDashboard />} />
        <Route path="tasks" element={<FreelancerTasks />} />
        <Route path="task/:id" element={<TaskDetail />} />
        <Route path="team" element={<CrateMyTeam />} />
        <Route path="learning" element={<FreelancerLearning />} />
        <Route path="meet" element={<FreelancerMeet />} />
        <Route path="earnings" element={<FreelancerEarnings />} />
        <Route path="progress" element={<FreelancerProgress />} />
        <Route path="messages" element={<FreelancerMessages />} />
        <Route path="settings" element={<FreelancerSettings />} />
      </Route>

      {/* Initiator - protected */}
      <Route path="/initiator" element={<RoleGuard allowedRoles={['freelancer']}><InitiatorLayout /></RoleGuard>}>
        <Route index element={<Navigate to="/initiator/dashboard" replace />} />
        <Route path="dashboard"     element={<InitiatorDashboard />} />
        <Route path="projects"      element={<InitiatorProjects />} />
        <Route path="clients"       element={<InitiatorClients />} />
        <Route path="open-projects" element={<InitiatorOpenProjects />} />
        <Route path="work"          element={<InitiatorWork />} />
        <Route path="meet"          element={<InitiatorMeet />} />
        <Route path="earnings"      element={<InitiatorEarnings />} />
        <Route path="messages"      element={<InitiatorMessages />} />
        <Route path="settings"      element={<InitiatorSettings />} />
      </Route>

      {/* Supervisor - protected */}
      <Route path="/supervisor" element={<RoleGuard allowedRoles={['momentum_supervisor']}><SupervisorLayout /></RoleGuard>}>
        <Route index element={<Navigate to="/supervisor/dashboard" replace />} />
        <Route path="dashboard"     element={<SupervisorDashboard />} />
        <Route path="messages"      element={<SupervisorMessages />} />
        <Route path="projects"      element={<SupervisorProjects />} />
        <Route path="dispatch/:id"  element={<SupervisorDispatch />} />
        <Route path="teams"         element={<SupervisorTeams />} />
        <Route path="precrates"     element={<SupervisorPrecrates />} />
        <Route path="group-projects" element={<SupervisorGroupProjects />} />
        <Route path="meetings"      element={<SupervisorMeetings />} />
        <Route path="clients"       element={<SupervisorClients />} />
        <Route path="payouts"       element={<SupervisorPayouts />} />
        <Route path="earnings"      element={<SupervisorEarnings />} />
        <Route path="wallet"        element={<SupervisorWallet />} />
        <Route path="settings"      element={<SupervisorSettings />} />
      </Route>

      {/* Admin - direct URL only */}
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
