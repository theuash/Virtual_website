import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import DashboardHeader from '../../components/layout/DashboardHeader';
import api from '../../services/api';
import { 
  User, Shield, Bell, Moon, Sun, 
  Camera, Key, Mail, Phone, Briefcase,
  Check, AlertTriangle, Globe
} from 'lucide-react';
import { COUNTRIES } from '../../components/common/CountrySelector';
import { useCurrency } from '../../context/CurrencyContext';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { requestNotificationPermission } from '../../services/notificationService';

export default function SupervisorSettings() {
  const { user, setUser } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { setIsIndia } = useCurrency();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(Notification.permission === 'granted');

  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    department: user?.department || '',
    bio: user?.bio || '',
    country: user?.country || 'IN',
  });

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.patch('/profile/update', profileForm);
      const updatedUser = res.data?.data || res.data;
      setUser(prev => ({ ...prev, ...updatedUser }));
      if (updatedUser.country) setIsIndia(updatedUser.country === "IN");
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePushToggle = async () => {
    if (pushEnabled) {
      toast.error('Browser push permissions must be revoked in site settings.');
      return;
    }
    const granted = await requestNotificationPermission();
    if (granted) {
      setPushEnabled(true);
      toast.success('Push notifications enabled!');
    } else {
      toast.error('Permission denied or dismissed.');
    }
  };

  const tabs = [
    { id: 'profile',  label: 'Profile',  icon: <User size={16} /> },
    { id: 'security', label: 'Security', icon: <Shield size={16} /> },
    { id: 'app',      label: 'System',   icon: <SettingsIcon size={16} /> },
  ];

  return (
    <>
      <DashboardHeader title="Supervisor Settings" />
      <div className="p-6 md:p-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          <div className="lg:col-span-1 space-y-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  activeTab === tab.id 
                    ? 'bg-accent text-white shadow-lg shadow-accent/20 scale-[1.02]' 
                    : 'text-text-secondary hover:bg-white/5 opacity-60 hover:opacity-100'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          <div className="lg:col-span-3">
             <AnimatePresence mode="wait">
                {activeTab === 'profile' && (
                  <motion.div key="profile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                    <div className="p-8 rounded-3xl border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                      <div className="flex items-start justify-between mb-8">
                        <div>
                          <h2 className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>Supervisor Profile</h2>
                          <p className="text-xs opacity-60 mt-1" style={{ color: 'var(--text-secondary)' }}>Manage your administrative presence.</p>
                        </div>
                        <div className="w-20 h-20 rounded-2xl bg-accent/10 border-2 border-accent/20 flex items-center justify-center overflow-hidden">
                           <span className="text-2xl font-black text-accent">{user?.fullName?.charAt(0)}</span>
                        </div>
                      </div>

                      <form onSubmit={handleProfileUpdate} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <InputGroup label="Full Name" icon={<User size={16} />} value={profileForm.fullName} onChange={v => setProfileForm({...profileForm, fullName: v})} />
                           <InputGroup label="Department" icon={<Briefcase size={16} />} value={profileForm.department} disabled />
                           <InputGroup label="Phone Number" icon={<Phone size={16} />} value={profileForm.phone} onChange={v => setProfileForm({...profileForm, phone: v})} />
                           <label className="block opacity-50">
                              <span className="text-[10px] font-black uppercase tracking-widest ml-1 mb-2 block">Email Address</span>
                              <div className="relative">
                                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40" />
                                <input disabled value={user?.email} className="w-full h-14 pl-12 rounded-2xl border outline-none font-bold text-sm bg-transparent cursor-not-allowed" style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
                              </div>
                           </label>
                           <label className="block">
                             <span className="text-[10px] font-black uppercase tracking-widest ml-1 mb-2 block opacity-40" style={{ color: 'var(--text-primary)' }}>Country</span>
                             <div className="relative group">
                               <div className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40 group-focus-within:text-accent transition-colors"><Globe size={16} /></div>
                               <select value={profileForm.country} onChange={(e) => setProfileForm({...profileForm, country: e.target.value})}
                                 className="w-full h-14 pl-12 pr-4 rounded-2xl border outline-none font-bold text-sm bg-transparent transition-all focus:ring-4 focus:ring-accent/10"
                                 style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)', appearance: 'none' }}
                               >
                                 {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                               </select>
                             </div>
                           </label>
                        </div>
                        <label className="block">
                          <span className="text-[10px] font-black uppercase tracking-widest ml-1 mb-2 block opacity-40">Bio / Professional Summary</span>
                          <textarea 
                            className="w-full p-4 rounded-2xl border bg-transparent text-sm font-medium h-32 outline-none focus:ring-4 focus:ring-accent/10 transition-all"
                            style={{ borderColor: 'var(--border)', color: 'var(--text_primary)' }}
                            value={profileForm.bio}
                            onChange={(e) => setProfileForm({...profileForm, bio: e.target.value})}
                          />
                        </label>
                        <div className="pt-4">
                          <button type="submit" disabled={loading} className="px-8 py-3.5 rounded-2xl bg-accent text-white font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
                            {loading ? 'Saving...' : 'Update Records'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'security' && (
                  <motion.div key="security" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                    <div className="p-8 rounded-3xl border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                       <h2 className="text-xl font-black mb-1" style={{ color: 'var(--text-primary)' }}>Administrative Security</h2>
                       <p className="text-xs opacity-60 mb-8" style={{ color: 'var(--text-secondary)' }}>Update your secure access credentials.</p>
                       <form className="space-y-6">
                          <InputGroup label="Current Password" icon={<Key size={16} />} type="password" placeholder="••••••••" />
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <InputGroup label="New Password" icon={<Key size={16} />} type="password" placeholder="••••••••" />
                             <InputGroup label="Confirm Password" icon={<Key size={16} />} type="password" placeholder="••••••••" />
                          </div>
                          <button className="px-8 py-3.5 rounded-2xl bg-accent text-white font-black uppercase tracking-widest text-xs hover:scale-105 transition-all">
                            Update Shield
                          </button>
                       </form>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'app' && (
                   <motion.div key="app" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                    <div className="p-8 rounded-3xl border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                       <h2 className="text-xl font-black mb-8" style={{ color: 'var(--text-primary)' }}>System Preferences</h2>
                       <div className="space-y-6">
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                                  {isDark ? <Moon size={18} /> : <Sun size={18} />}
                               </div>
                               <div>
                                  <h3 className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>Interface Theme</h3>
                                  <p className="text-[10px] opacity-40" style={{ color: 'var(--text-secondary)' }}>Cinematic Dark or Clean Light.</p>
                               </div>
                            </div>
                            <button onClick={toggleTheme} className="w-14 h-8 rounded-full bg-accent/20 relative p-1 transition-all">
                               <div className={`w-6 h-6 rounded-full bg-accent transition-all ${isDark ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                         </div>

                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                                  <Bell size={18} />
                               </div>
                               <div>
                                  <h3 className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>Browser Notifications</h3>
                                  <p className="text-[10px] opacity-40" style={{ color: 'var(--text-secondary)' }}>Get alerts for new dispatches and reviews.</p>
                               </div>
                            </div>
                            <button onClick={handlePushToggle} className={`w-14 h-8 rounded-full relative p-1 transition-all ${pushEnabled ? 'bg-accent' : 'bg-accent/20'}`}>
                               <div className={`w-6 h-6 rounded-full bg-white shadow-sm transition-all ${pushEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                         </div>
                       </div>
                    </div>
                  </motion.div>
                )}
             </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
}

function InputGroup({ label, icon, value, onChange, type = "text", placeholder, disabled }) {
  return (
    <label className={`block ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <span className="text-[10px] font-black uppercase tracking-widest ml-1 mb-2 block opacity-40" style={{ color: 'var(--text-primary)' }}>{label}</span>
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40 group-focus-within:text-accent transition-colors">{icon}</div>
        <input type={type} placeholder={placeholder} disabled={disabled} value={value} onChange={(e) => onChange && onChange(e.target.value)}
          className="w-full h-14 pl-12 pr-4 rounded-2xl border outline-none font-bold text-sm bg-transparent transition-all focus:ring-4 focus:ring-accent/10"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
        />
      </div>
    </label>
  );
}

function SettingsIcon({ className, size }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  );
}
