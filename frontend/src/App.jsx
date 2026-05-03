import { Routes, Route, Navigate } from 'react-router-dom';
import { RoleGuard } from './utils/roleGuards';
import PublicRoute from './components/routes/PublicRoute';
import { Toaster } from 'react-hot-toast';

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
import ClientLayout from './pages/client/core/ClientLayout';
import ClientDashboard from './pages/client/dashboard/ClientDashboard';
import PostProject from './pages/client/projects/PostProject';
import ClientProjects from './pages/client/projects/ClientProjects';
import ClientInfo from './pages/client/profile/ClientInfo';
import ClientProfile from './pages/client/profile/ClientProfile';
import ProjectDetail from './pages/client/projects/ProjectDetail';
import ClientPayments from './pages/client/wallet/ClientPayments';
import ClientMessages from './pages/client/communication/ClientMessages';
import ClientSettings from './pages/client/profile/ClientSettings';
import ClientWallet from './pages/client/wallet/ClientWallet';
import ClientMeet from './pages/client/communication/ClientMeet';
import ClientVerification from './pages/client/core/ClientVerification';
import ClientOnboarding from './pages/client/core/ClientOnboarding';

// Freelancer
import FreelancerLayout from './pages/freelancer/core/FreelancerLayout';
import FreelancerDashboard from './pages/freelancer/dashboard/FreelancerDashboard';
import FreelancerTasks from './pages/freelancer/projects/FreelancerTasks';
import TaskDetail from './pages/freelancer/projects/TaskDetail';
import FreelancerEarnings from './pages/freelancer/dashboard/FreelancerEarnings';
import FreelancerProgress from './pages/freelancer/dashboard/FreelancerProgress';
import FreelancerMessages from './pages/freelancer/communication/FreelancerMessages';
import FreelancerSettings from './pages/freelancer/profile/FreelancerSettings';
import FreelancerLearning from './pages/freelancer/dashboard/FreelancerLearning';
import FreelancerMeet from './pages/freelancer/communication/FreelancerMeet';
import FreelancerOnboarding from './pages/freelancer/core/FreelancerOnboarding';
import FreelancerInfo from './pages/freelancer/profile/FreelancerInfo';
import FreelancerProfile from './pages/freelancer/profile/FreelancerProfile';
import CrateMyTeam from './pages/freelancer/projects/CrateMyTeam';
import { SidebarProvider } from './context/SidebarContext';

// Initiator
import InitiatorLayout from './pages/initiator/core/InitiatorLayout';
import InitiatorDashboard from './pages/initiator/dashboard/InitiatorDashboard';
import InitiatorProjects from './pages/initiator/projects/InitiatorProjects';
import InitiatorClients from './pages/initiator/clients/InitiatorClients';
import InitiatorOpenProjects from './pages/initiator/projects/InitiatorOpenProjects';
import InitiatorWork from './pages/initiator/projects/InitiatorWork';
import InitiatorMessages from './pages/initiator/communication/InitiatorMessages';
import InitiatorInfo from './pages/initiator/profile/InitiatorInfo';
import InitiatorProfile from './pages/initiator/profile/InitiatorProfile';
import InitiatorSettings from './pages/initiator/profile/InitiatorSettings';
import InitiatorMeet from './pages/initiator/communication/InitiatorMeet';
import InitiatorEarnings from './pages/initiator/dashboard/InitiatorEarnings';

// Supervisor
import SupervisorLayout from './pages/supervisor/core/SupervisorLayout';
import SupervisorDashboard from './pages/supervisor/dashboard/SupervisorDashboard';
import SupervisorMessages from './pages/supervisor/communication/SupervisorMessages';
import SupervisorProjects from './pages/supervisor/projects/SupervisorProjects';
import SupervisorDispatch from './pages/supervisor/projects/SupervisorDispatch';
import SupervisorTeams from './pages/supervisor/teams/SupervisorTeams';
import SupervisorPrecrates from './pages/supervisor/projects/SupervisorPrecrates';
import SupervisorGroupProjects from './pages/supervisor/projects/SupervisorGroupProjects';
import SupervisorClients from './pages/supervisor/clients/SupervisorClients';
import SupervisorPayouts from './pages/supervisor/wallet/SupervisorPayouts';
import SupervisorEarnings from './pages/supervisor/dashboard/SupervisorEarnings';
import SupervisorWallet from './pages/supervisor/wallet/SupervisorWallet';
import SupervisorSettings from './pages/supervisor/profile/SupervisorSettings';
import SupervisorInfo from './pages/supervisor/profile/SupervisorInfo';
import SupervisorProfile from './pages/supervisor/profile/SupervisorProfile';
import SupervisorMeetings from './pages/supervisor/communication/SupervisorMeetings';
import SupervisorVerifications from './pages/supervisor/clients/SupervisorVerifications';

// Admin
import AdminLayout from './pages/admin/core/AdminLayout';
import AdminDashboard from './pages/admin/dashboard/AdminDashboard';
import AdminUsers from './pages/admin/users/AdminUsers';
import AdminClients from './pages/admin/users/AdminClients';
import AdminFreelancers from './pages/admin/users/AdminFreelancers';
import AdminProjects from './pages/admin/projects/AdminProjects';
import AdminDisputes from './pages/admin/projects/AdminDisputes';
import AdminPromotions from './pages/admin/marketing/AdminPromotions';
import AdminSettings from './pages/admin/profile/AdminSettings';
import AdminInfo from './pages/admin/profile/AdminInfo';
import AdminProfile from './pages/admin/profile/AdminProfile';

function App() {
  return (
    <>
      <Toaster position="top-right" />
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

      <Route path="/client/onboarding" element={<RoleGuard allowedRoles={['client']}><ClientOnboarding /></RoleGuard>} />

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
        <Route path="info" element={<ClientInfo />} />
        <Route path="profile" element={<ClientProfile />} />
        <Route path="verification" element={<ClientVerification />} />
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
        <Route path="info" element={<FreelancerInfo />} />
        <Route path="profile" element={<FreelancerProfile />} />
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
        <Route path="info"          element={<InitiatorInfo />} />
        <Route path="profile"       element={<InitiatorProfile />} />
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
        <Route path="info"          element={<SupervisorInfo />} />
        <Route path="profile"       element={<SupervisorProfile />} />
        <Route path="verification-portal" element={<SupervisorVerifications />} />
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
        <Route path="info" element={<AdminInfo />} />
        <Route path="profile" element={<AdminProfile />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  );
}

export default App;
