import DashboardHeader from '../../components/layout/DashboardHeader';
import MessagingUI from '../../components/features/MessagingUI';

export default function ClientMessages() {
  return (
    <>
      <DashboardHeader title="Messages" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <MessagingUI />
      </div>
    </>
  );
}
