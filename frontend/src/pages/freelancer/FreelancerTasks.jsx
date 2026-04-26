import { useAuth } from '../../context/AuthContext';
import DashboardHeader from '../../components/DashboardHeader';
import LockedOverlay from '../../components/LockedOverlay';
import CrateProjects from './CrateProjects';

export default function FreelancerTasks() {
  const { user } = useAuth();
  const tier = user?.tier || 'precrate';
  const isPrecrate = tier === 'precrate';

  if (isPrecrate) {
    return (
      <>
        <DashboardHeader title="Projects" />
        <LockedOverlay
          title="Projects Locked"
          message="Project assignments unlock once you reach the Crate tier. Finish your onboarding modules and get approved by your supervisor to advance."
          unlockAt="Crate"
        />
      </>
    );
  }

  // Crate and above get the full project board
  return <CrateProjects />;
}
