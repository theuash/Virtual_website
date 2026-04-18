import DashboardHeader from '../../components/DashboardHeader';
import MessagingUI from '../../components/MessagingUI';

export default function ClientMessages() {
  return (
    <>
      <DashboardHeader title="Messages" />
      <div className="p-6 md:p-8 max-w-6xl mx-auto">
        <MessagingUI />
      </div>
    </>
  );
}
