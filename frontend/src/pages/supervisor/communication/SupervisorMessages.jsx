import DashboardHeader from '../../../components/layout/DashboardHeader';
import MessagingUI from '../../../components/features/MessagingUI';
import { useSearchParams } from 'react-router-dom';

export default function SupervisorMessages() {
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
