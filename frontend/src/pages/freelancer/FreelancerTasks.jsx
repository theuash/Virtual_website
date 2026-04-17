import { useAuth } from '../../context/AuthContext';
import DashboardHeader from '../../components/DashboardHeader';
import LockedOverlay from '../../components/LockedOverlay';

export default function FreelancerTasks() {
  const { user } = useAuth();
  const isPrecrate = !user?.tier || user.tier === 'precrate';

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

  return (
    <>
      <DashboardHeader title="Projects" />
      <div className="p-6 md:p-8 max-w-6xl mx-auto">
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Projects page — coming soon.
        </p>
      </div>
    </>
  );
}
