import DashboardHeader from '../../components/DashboardHeader';
import MessagingUI from '../../components/MessagingUI';

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
