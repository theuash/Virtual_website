import DashboardHeader from '../../components/DashboardHeader';
import MessagingUI from '../../components/MessagingUI';

export default function ClientMessages() {
  return (
    <>
      <DashboardHeader title="Messages" />
      <div className="w-full max-w-7xl mx-auto md:p-4">
        <MessagingUI />
      </div>
    </>
  );
}
