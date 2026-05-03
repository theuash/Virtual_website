import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardHeader from '../../components/DashboardHeader';
import MessagingUI from '../../components/MessagingUI';
import api from '../../services/api';

export default function FreelancerMessages() {
  const [params] = useSearchParams();
  const { user } = useAuth();
  const [defaultConvId, setDefaultConvId] = useState(params.get('conv') || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Only auto-create default conversation for precrate and crate tiers
    const tier = user?.tier;
    if (!tier || !['precrate', 'crate'].includes(tier)) return;
    // If a specific conv was passed via URL, use that
    if (params.get('conv')) return;

    setLoading(true);
    api.get('/messaging/default-conversation')
      .then(res => {
        const conv = res.data?.data;
        if (conv?._id) setDefaultConvId(conv._id);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.tier]);

  return (
    <>
      <DashboardHeader title="Messages" />
      <div className="flex-1 flex flex-col overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
          </div>
        ) : (
          <MessagingUI initialConvId={defaultConvId} />
        )}
      </div>
    </>
  );
}
