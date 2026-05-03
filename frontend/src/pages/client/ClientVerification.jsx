import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import DashboardHeader from '../../components/layout/DashboardHeader';
import { ShieldCheck, MapPin, Phone, Building, Clock, CheckCircle2, ChevronRight, AlertCircle, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

const COUNTRIES = [
  { code: 'IN', name: 'India', flag: '🇮🇳', phone: '+91' },
  { code: 'US', name: 'United States', flag: '🇺🇸', phone: '+1' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', phone: '+44' },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', phone: '+971' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', phone: '+65' },
];

export default function ClientVerification() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    country: user?.country || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      const freshData = res.data?.data || res.data;
      if (freshData) {
        setUser(prev => ({ ...prev, ...freshData }));
      }
    } catch (err) {
      console.error('Failed to refresh user', err);
    }
  };

  // Calculate time left if status is pending
  useEffect(() => {
    if (user?.verificationStatus === 'pending' && user?.verificationSubmittedAt) {
      const waitTime = 10 * 60 * 1000; // 10 mins
      const submittedAt = new Date(user.verificationSubmittedAt).getTime();
      const now = Date.now();
      const diff = waitTime - (now - submittedAt);
      
      if (diff > 0) setTimeLeft(Math.floor(diff / 1000));
      else setTimeLeft(0);

      const timer = setInterval(() => {
        setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/client/submit-verification', formData);
      toast.success('Verification submitted!');
      await refreshUser();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  const handleBypass = async () => {
    try {
      await api.post('/client/bypass-verification');
      toast.success('Access enabled while verification continues.');
      await refreshUser();
      navigate('/client/dashboard');
    } catch (err) {
      toast.error('Bypass failed');
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <DashboardHeader title="Account Verification" />
      <div className="p-6 md:p-12 max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          {user?.verificationStatus === 'verified' ? (
            <motion.div 
              key="verified"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} />
              </div>
              <h2 className="text-2xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>Verified Account</h2>
              <p className="text-sm opacity-60 mb-8" style={{ color: 'var(--text-secondary)' }}>You have full access to all platform features.</p>
              <button 
                onClick={() => navigate('/client/dashboard')}
                className="px-8 py-3 rounded-xl font-bold bg-accent text-white"
              >
                Back to Dashboard
              </button>
            </motion.div>
          ) : user?.verificationStatus === 'pending' ? (
            <motion.div 
              key="pending"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="p-8 rounded-3xl border text-center" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                <div className="w-16 h-16 bg-accent/10 text-accent rounded-full flex items-center justify-center mx-auto mb-6 relative">
                   <Clock size={32} className="animate-spin-slow" />
                   <div className="absolute inset-0 rounded-full border-4 border-accent/20 border-t-accent animate-spin" />
                </div>
                <h2 className="text-xl font-black mb-3" style={{ color: 'var(--text-primary)' }}>Waiting for Supervisor</h2>
                <p className="text-sm opacity-60 mb-6" style={{ color: 'var(--text-secondary)' }}>
                   A Momentum Supervisor has been assigned to your request. They are currently reviewing your location and contact details.
                </p>
                
                <div className="text-4xl font-black tracking-tighter mb-2" style={{ color: 'var(--accent)' }}>
                  {formatTime(timeLeft)}
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-8" style={{ color: 'var(--text-secondary)' }}>
                  Estimated Wait Time
                </p>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/5 text-left">
                    <ShieldCheck size={18} className="text-accent shrink-0" />
                    <div>
                      <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>Protocol Standard</p>
                      <p className="text-[10px] opacity-60 line-clamp-1" style={{ color: 'var(--text-secondary)' }}>Verifying {formData.phone} in {formData.country}</p>
                    </div>
                  </div>

                  {timeLeft === 0 && (
                     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <p className="text-xs mb-4 opacity-70" style={{ color: 'var(--text-secondary)' }}>
                          The maximum wait period has passed. You can bypass this check for now.
                        </p>
                        <button 
                          onClick={handleBypass}
                          className="w-full py-3 rounded-xl font-black uppercase tracking-widest text-xs border border-accent text-accent hover:bg-accent hover:text-white transition-all"
                        >
                          Bypass Verification for Now
                        </button>
                     </motion.div>
                  )}
                </div>
              </div>
              
              <div className="p-6 rounded-2xl bg-blue-500/5 border border-blue-500/20 flex gap-4">
                <AlertCircle size={20} className="text-blue-500 shrink-0" />
                <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  <span className="font-bold text-blue-500 block mb-1">What happens next?</span>
                  If the supervisor needs more clarity, they might open a chat request with you. Once verified, your status will update instantly in the dashboard.
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div>
                <h1 className="text-2xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>Identity Verification</h1>
                <p className="text-sm opacity-60" style={{ color: 'var(--text-secondary)' }}>Enter your primary residing details to proceed.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <label className="block">
                    <span className="text-[10px] font-black uppercase tracking-widest ml-1 mb-2 block opacity-40" style={{ color: 'var(--text-primary)' }}>Country of Residence</span>
                    <div className="relative group">
                      <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40 group-focus-within:text-accent transition-colors" />
                      <select 
                        required
                        className="w-full h-14 pl-12 pr-4 rounded-2xl border outline-none appearance-none font-bold text-sm bg-transparent transition-all focus:ring-4 focus:ring-accent/10"
                        style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                        value={formData.country}
                        onChange={(e) => setFormData({...formData, country: e.target.value})}
                      >
                        <option value="">Select Country</option>
                        {COUNTRIES.map(c => (
                          <option key={c.code} value={c.name}>{c.flag} {c.name}</option>
                        ))}
                      </select>
                    </div>
                  </label>

                  <label className="block">
                    <span className="text-[10px] font-black uppercase tracking-widest ml-1 mb-2 block opacity-40" style={{ color: 'var(--text-primary)' }}>Phone Number</span>
                    <div className="relative group">
                      <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40 group-focus-within:text-accent transition-colors" />
                      <input 
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        className="w-full h-14 pl-12 pr-4 rounded-2xl border outline-none font-bold text-sm bg-transparent transition-all focus:ring-4 focus:ring-accent/10"
                        style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                  </label>

                  <label className="block">
                    <span className="text-[10px] font-black uppercase tracking-widest ml-1 mb-2 block opacity-40" style={{ color: 'var(--text-primary)' }}>Detailed Address</span>
                    <div className="relative group">
                      <Building size={16} className="absolute left-4 top-6 opacity-40 group-focus-within:text-accent transition-colors" />
                      <textarea 
                        required
                        placeholder="Street, Building, City, State, Zip"
                        className="w-full h-32 pl-12 pr-4 py-5 rounded-3xl border outline-none font-bold text-sm bg-transparent transition-all focus:ring-4 focus:ring-accent/10 resize-none"
                        style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                      />
                    </div>
                  </label>
                </div>

                <div className="pt-4">
                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full h-14 rounded-2xl font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                    style={{ background: 'var(--accent)', color: '#fff' }}
                  >
                    {loading ? "Processing..." : (
                      <>
                        Verify Account <ChevronRight size={18} />
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-center mt-6 opacity-40 leading-relaxed max-w-sm mx-auto" style={{ color: 'var(--text-primary)' }}>
                    By proceeding, you agree to our terms of service regarding identity verification and data privacy protocols.
                  </p>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
