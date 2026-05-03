import { useSearchParams } from 'react-router-dom';
import DashboardHeader from '../../components/DashboardHeader';
import MessagingUI from '../../components/MessagingUI';

export default function InitiatorMessages() {
  const [params] = useSearchParams();
  const initialConvId = params.get('conv') || null;
  return (
    <>
      <DashboardHeader title="Messages" />
      <div className="w-full max-w-7xl mx-auto md:p-4">
        <MessagingUI initialConvId={initialConvId} />
      </div>
    </>
  );
}
