import { useSearchParams } from 'react-router-dom';
import DashboardHeader from '../../components/DashboardHeader';
import MessagingUI from '../../components/MessagingUI';

export default function InitiatorMessages() {
  const [params] = useSearchParams();
  const initialConvId = params.get('conv') || null;
  return (
    <>
      <DashboardHeader title="Messages" />
      <div className="p-6 md:p-8 max-w-6xl mx-auto">
        <MessagingUI initialConvId={initialConvId} />
      </div>
    </>
  );
}
