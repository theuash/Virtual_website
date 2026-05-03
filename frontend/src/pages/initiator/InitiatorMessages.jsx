import { useSearchParams } from 'react-router-dom';
import DashboardHeader from '../../components/DashboardHeader';
import MessagingUI from '../../components/MessagingUI';

export default function InitiatorMessages() {
  const [params] = useSearchParams();
  const initialConvId = params.get('conv') || null;
  return (
    <>
      <DashboardHeader title="Messages" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <MessagingUI initialConvId={initialConvId} />
      </div>
    </>
  );
}
