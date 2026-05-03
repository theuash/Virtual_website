import { useAuth } from '../../../context/AuthContext';
import DashboardHeader from '../../../components/layout/DashboardHeader';
import LockedOverlay from '../../../components/ui/LockedOverlay';
import CrateEarnings from '../projects/CrateEarnings';

export default function FreelancerEarnings() {
  const { user } = useAuth();
  const tier = user?.tier || 'precrate';
  const isPrecrate = tier === 'precrate';

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

  // Crate and above get the full wallet
  return <CrateEarnings />;
}
