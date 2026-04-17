import { useAuth } from '../../context/AuthContext';
import DashboardHeader from '../../components/DashboardHeader';
import LockedOverlay from '../../components/LockedOverlay';

export default function FreelancerEarnings() {
  const { user } = useAuth();
  const isPrecrate = !user?.tier || user.tier === 'precrate';

  if (isPrecrate) {
    return (
      <>
        <DashboardHeader title="Earnings" />
        <LockedOverlay
          title="Earnings Locked"
          message="Your earnings dashboard unlocks once you reach the Crate tier. Complete your learning modules and deliver your first project to advance."
          unlockAt="Crate"
        />
      </>
    );
  }

  return (
    <>
      <DashboardHeader title="Earnings" />
      <div className="p-6 md:p-8 max-w-6xl mx-auto">
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Earnings page — coming soon.
        </p>
      </div>
    </>
  );
}
