import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Check, Target, Monitor, MapPin, Clock, DollarSign, Calendar, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { COUNTRIES } from '../../components/CountrySelector';
import api from '../../services/api';

const OBJECTIVES = [
  { value: 'content_creation', label: 'Content Creation', icon: '🎬', desc: 'YouTube, Twitch, Reels, TikTok' },
  { value: 'personal', label: 'Personal', icon: '👤', desc: 'Personal projects & memories' },
  { value: 'business', label: 'Business', icon: '💼', desc: 'Corporate & brand content' },
  { value: 'agency', label: 'Agency', icon: '🏢', desc: 'Client deliverables at scale' },
  { value: 'other', label: 'Other', icon: '✨', desc: 'Something unique' },
];

const PLATFORMS = [
  { value: 'youtube', label: 'YouTube', icon: '▶️', color: '#FF0000' },
  { value: 'twitch', label: 'Twitch', icon: '🎮', color: '#9146FF' },
  { value: 'instagram', label: 'Instagram', icon: '📸', color: '#E4405F' },
  { value: 'tiktok', label: 'TikTok', icon: '🎵', color: '#000000' },
  { value: 'facebook', label: 'Facebook', icon: '👥', color: '#1877F2' },
  { value: 'twitter', label: 'X / Twitter', icon: '𝕏', color: '#1DA1F2' },
  { value: 'linkedin', label: 'LinkedIn', icon: '💼', color: '#0A66C2' },
  { value: 'snapchat', label: 'Snapchat', icon: '👻', color: '#FFFC00' },
];

const PLATFORM_HANDLE_LABELS = {
  youtube: 'YouTube Channel Name',
  twitch: 'Twitch Channel Name',
  instagram: 'Instagram Handle',
  tiktok: 'TikTok Username',
  facebook: 'Facebook Page Name',
  twitter: 'X / Twitter Handle',
  linkedin: 'LinkedIn Profile URL',
  snapchat: 'Snapchat Username',
};

const SERVICE_DEPARTMENTS = [
  { id: 'video_editing', label: 'Video Editing', icon: '🎥' },
  { id: 'graphic_designing', label: 'Graphic Design', icon: '🎨' },
  { id: '3d_animation', label: '3D Animation', icon: '🧊' },
  { id: 'cgi', label: 'CGI / VFX', icon: '💥' },
  { id: 'script_writing', label: 'Script Writing', icon: '✍️' },
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const TIME_SLOTS = [
  '6AM - 9AM', '9AM - 12PM', '12PM - 3PM', '3PM - 6PM', '6PM - 9PM', '9PM - 12AM',
];

const BUDGET_RANGES_INR = [
  { label: 'Under ₹5,000', min: 0, max: 5000 },
  { label: '₹5,000 - ₹15,000', min: 5000, max: 15000 },
  { label: '₹15,000 - ₹50,000', min: 15000, max: 50000 },
  { label: '₹50,000 - ₹1,00,000', min: 50000, max: 100000 },
  { label: '₹1,00,000+', min: 100000, max: 500000 },
];

const BUDGET_RANGES_USD = [
  { label: 'Under $100', min: 0, max: 100 },
  { label: '$100 - $500', min: 100, max: 500 },
  { label: '$500 - $1,500', min: 500, max: 1500 },
  { label: '$1,500 - $5,000', min: 1500, max: 5000 },
  { label: '$5,000+', min: 5000, max: 50000 },
];

function getTimezoneForCountryCountry(countryCode, cityName) {
  const tzMap = {
    US: ['America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'America/Anchorage', 'Pacific/Honolulu'],
    IN: ['Asia/Kolkata'],
    GB: ['Europe/London'],
    CA: ['America/Toronto', 'America/Vancouver', 'America/Edmonton', 'America/Winnipeg'],
    AU: ['Australia/Sydney', 'Australia/Melbourne', 'Australia/Brisbane', 'Australia/Perth'],
    DE: ['Europe/Berlin'],
    FR: ['Europe/Paris'],
    NL: ['Europe/Amsterdam'],
    SE: ['Europe/Stockholm'],
    NO: ['Europe/Oslo'],
    DK: ['Europe/Copenhagen'],
    FI: ['Europe/Helsinki'],
    CH: ['Europe/Zurich'],
    AT: ['Europe/Vienna'],
    BE: ['Europe/Brussels'],
    ES: ['Europe/Madrid'],
    IT: ['Europe/Rome'],
    PT: ['Europe/Lisbon'],
    PL: ['Europe/Warsaw'],
    CZ: ['Europe/Prague'],
    HU: ['Europe/Budapest'],
    RO: ['Europe/Bucharest'],
    BG: ['Europe/Sofia'],
    HR: ['Europe/Zagreb'],
    SK: ['Europe/Bratislava'],
    SI: ['Europe/Ljubljana'],
    LT: ['Europe/Vilnius'],
    LV: ['Europe/Riga'],
    EE: ['Europe/Tallinn'],
    GR: ['Europe/Athens'],
    IE: ['Europe/Dublin'],
    NZ: ['Pacific/Auckland'],
    SG: ['Asia/Singapore'],
    HK: ['Asia/Hong_Kong'],
    JP: ['Asia/Tokyo'],
    KR: ['Asia/Seoul'],
    TW: ['Asia/Taipei'],
    CN: ['Asia/Shanghai'],
    PH: ['Asia/Manila'],
    ID: ['Asia/Jakarta'],
    MY: ['Asia/Kuala_Lumpur'],
    TH: ['Asia/Bangkok'],
    VN: ['Asia/Ho_Chi_Minh'],
    BD: ['Asia/Dhaka'],
    PK: ['Asia/Karachi'],
    LK: ['Asia/Colombo'],
    NP: ['Asia/Kathmandu'],
    AE: ['Asia/Dubai'],
    SA: ['Asia/Riyadh'],
    IL: ['Asia/Jerusalem'],
    TR: ['Europe/Istanbul'],
    EG: ['Africa/Cairo'],
    ZA: ['Africa/Johannesburg'],
    BR: ['America/Sao_Paulo', 'America/Manaus', 'America/Recife'],
    MX: ['America/Mexico_City', 'America/Cancun'],
    AR: ['America/Argentina/Buenos_Aires'],
    CO: ['America/Bogota'],
    CL: ['America/Santiago'],
    PE: ['America/Lima'],
    RU: ['Europe/Moscow', 'Asia/Vladivostok'],
    UA: ['Europe/Kyiv'],
    NG: ['Africa/Lagos'],
    KE: ['Africa/Nairobi'],
  };

  const zones = tzMap[countryCode];
  if (!zones || zones.length === 0) {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      return 'UTC';
    }
  }
  if (zones.length === 1) return zones[0];

  const cityLower = (cityName || '').toLowerCase();
  const cityZoneMap = {
    US: { 'new york': 'America/New_York', 'los angeles': 'America/Los_Angeles', 'chicago': 'America/Chicago', 'houston': 'America/Chicago', 'phoenix': 'America/Phoenix', 'san francisco': 'America/Los_Angeles', 'seattle': 'America/Los_Angeles', 'denver': 'America/Denver', 'miami': 'America/New_York', 'boston': 'America/New_York', 'dallas': 'America/Chicago', 'atlanta': 'America/New_York', 'honolulu': 'Pacific/Honolulu', 'anchorage': 'America/Anchorage' },
    CA: { 'toronto': 'America/Toronto', 'vancouver': 'America/Vancouver', 'montreal': 'America/Toronto', 'calgary': 'America/Edmonton', 'edmonton': 'America/Edmonton', 'winnipeg': 'America/Winnipeg', 'ottawa': 'America/Toronto' },
    AU: { 'sydney': 'Australia/Sydney', 'melbourne': 'Australia/Melbourne', 'brisbane': 'Australia/Brisbane', 'perth': 'Australia/Perth', 'adelaide': 'Australia/Adelaide', 'canberra': 'Australia/Sydney' },
    BR: { 'sao paulo': 'America/Sao_Paulo', 'rio': 'America/Sao_Paulo', 'brasilia': 'America/Sao_Paulo', 'manaus': 'America/Manaus', 'recife': 'America/Recife' },
    MX: { 'mexico city': 'America/Mexico_City', 'cancun': 'America/Cancun', 'guadalajara': 'America/Mexico_City' },
    RU: { 'moscow': 'Europe/Moscow', 'vladivostok': 'Asia/Vladivostok', 'st petersburg': 'Europe/Moscow' },
  };

  const cityMap = cityZoneMap[countryCode];
  if (cityMap) {
    for (const [city, tz] of Object.entries(cityMap)) {
      if (cityLower.includes(city)) return tz;
    }
  }
  return zones[0];
}

function formatTimezone(tz) {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'shortOffset' });
    const parts = formatter.formatToParts(now);
    const tzPart = parts.find(p => p.type === 'timeZoneName');
    return tzPart ? `${tzPart.value}` : tz;
  } catch {
    return tz;
  }
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

export default function ClientOnboarding() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [direction, setDirection] = useState(1);

  const [objective, setObjective] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [platformHandles, setPlatformHandles] = useState({});
  const [selectedCountry, setSelectedCountry] = useState('');
  const [city, setCity] = useState('');
  const [detectedTimezone, setDetectedTimezone] = useState('');
  const [selectedServices, setSelectedServices] = useState([]);
  const [budgetRange, setBudgetRange] = useState(null);
  const [selectedDays, setSelectedDays] = useState([]);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState([]);

  useEffect(() => {
    if (user?.onboardingComplete) {
      navigate('/client/dashboard', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (selectedCountry && city) {
      const tz = getTimezoneForCountryCountry(selectedCountry, city);
      setDetectedTimezone(tz);
    }
  }, [selectedCountry, city]);

  const isIndia = selectedCountry === 'IN';
  const currencySymbol = isIndia ? '₹' : '$';
  const budgetRanges = isIndia ? BUDGET_RANGES_INR : BUDGET_RANGES_USD;
  const totalSteps = 7;

  const togglePlatform = (value) => {
    setSelectedPlatforms(prev =>
      prev.includes(value) ? prev.filter(p => p !== value) : [...prev, value]
    );
  };

  const toggleService = (value) => {
    setSelectedServices(prev =>
      prev.includes(value) ? prev.filter(s => s !== value) : [...prev, value]
    );
  };

  const toggleDay = (day) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const toggleTimeSlot = (slot) => {
    setSelectedTimeSlots(prev =>
      prev.includes(slot) ? prev.filter(s => s !== slot) : [...prev, slot]
    );
  };

  const nextStep = () => {
    if (step < totalSteps - 1) {
      setDirection(1);
      setStep(s => s + 1);
    }
  };

  const prevStep = () => {
    if (step > 0) {
      setDirection(-1);
      setStep(s => s - 1);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 0: return !!objective;
      case 1: return selectedPlatforms.length > 0;
      case 2: return selectedPlatforms.every(p => platformHandles[p]?.trim());
      case 3: return !!selectedCountry && !!city.trim();
      case 4: return selectedServices.length > 0;
      case 5: return !!budgetRange;
      case 6: return selectedDays.length > 0 && selectedTimeSlots.length > 0;
      default: return false;
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const budget = budgetRanges[budgetRange];
      const body = {
        objective,
        platforms: selectedPlatforms,
        platformHandles,
        country: selectedCountry,
        city: city.trim(),
        timezone: detectedTimezone,
        servicesNeeded: selectedServices,
        budgetMin: budget.min,
        budgetMax: budget.max,
        budgetCurrency: isIndia ? 'INR' : 'USD',
        availableDays: selectedDays,
        availableTimeSlots: selectedTimeSlots,
      };
      const { data } = await api.post('/client/onboarding', body);
      const updatedUser = data?.data ?? data;
      if (updatedUser) {
        const stored = JSON.parse(localStorage.getItem('virtual_user') || '{}');
        const merged = { ...stored, ...updatedUser, onboardingComplete: true };
        localStorage.setItem('virtual_user', JSON.stringify(merged));
        setUser(merged);
      }
      navigate('/client/dashboard');
    } catch (err) {
      console.error('Onboarding failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const stepTitles = [
    'What drives you?',
    'Where do you create?',
    'Claim your identity',
    'Where in the world?',
    'What do you need?',
    'Set your budget',
    'When are you available?',
  ];

  const stepIcons = [Target, Monitor, Sparkles, MapPin, DollarSign, Clock, Calendar];

  const slideVariants = {
    enter: (dir) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
            <motion.p variants={itemVariants} className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Select the primary purpose for using Virtual. This helps us tailor your experience.
            </motion.p>
            <div className="grid gap-3">
              {OBJECTIVES.map((obj) => (
                <motion.button
                  key={obj.value}
                  variants={itemVariants}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setObjective(obj.value)}
                  className="flex items-center gap-4 p-4 rounded-2xl border text-left transition-all"
                  style={{
                    borderColor: objective === obj.value ? 'var(--accent)' : 'var(--border)',
                    background: objective === obj.value ? 'rgba(37,99,235,0.08)' : 'var(--bg-secondary)',
                  }}
                >
                  <span className="text-2xl">{obj.icon}</span>
                  <div className="flex-1">
                    <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{obj.label}</div>
                    <div className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>{obj.desc}</div>
                  </div>
                  {objective === obj.value && (
                    <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'var(--accent)' }}>
                      <Check size={12} color="#fff" strokeWidth={3} />
                    </div>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        );

      case 1:
        return (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
            <motion.p variants={itemVariants} className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Select all platforms where you publish content. You can choose multiple.
            </motion.p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {PLATFORMS.map((platform) => {
                const isSelected = selectedPlatforms.includes(platform.value);
                return (
                  <motion.button
                    key={platform.value}
                    variants={itemVariants}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => togglePlatform(platform.value)}
                    className="flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all"
                    style={{
                      borderColor: isSelected ? platform.color : 'var(--border)',
                      background: isSelected ? `${platform.color}12` : 'var(--bg-secondary)',
                    }}
                  >
                    <span className="text-2xl">{platform.icon}</span>
                    <span className="text-[11px] font-bold" style={{ color: 'var(--text-primary)' }}>{platform.label}</span>
                    {isSelected && (
                      <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: platform.color }}>
                        <Check size={10} color="#fff" strokeWidth={3} />
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
            {selectedPlatforms.length > 0 && (
              <motion.div variants={itemVariants} className="text-xs font-medium px-3 py-2 rounded-xl" style={{ background: 'var(--accent)11', color: 'var(--accent)' }}>
                {selectedPlatforms.length} platform{selectedPlatforms.length > 1 ? 's' : ''} selected
              </motion.div>
            )}
          </motion.div>
        );

      case 2:
        return (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-5">
            <motion.p variants={itemVariants} className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Tell us the name of your channels on each platform. This helps us understand your brand.
            </motion.p>
            {selectedPlatforms.map((platform) => (
              <motion.div key={platform} variants={itemVariants} className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-black tracking-[0.15em]" style={{ color: 'var(--text-secondary)' }}>
                  {PLATFORM_HANDLE_LABELS[platform]}
                </label>
                <input
                  type="text"
                  className="w-full text-sm rounded-xl border outline-none transition-all"
                  style={{
                    paddingTop: '0.75rem',
                    paddingBottom: '0.75rem',
                    paddingLeft: '1rem',
                    paddingRight: '1rem',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                  }}
                  placeholder={`e.g. ${platform === 'youtube' ? 'MyAwesomeChannel' : '@myhandle'}`}
                  value={platformHandles[platform] || ''}
                  onChange={(e) => setPlatformHandles(prev => ({ ...prev, [platform]: e.target.value }))}
                />
              </motion.div>
            ))}
          </motion.div>
        );

      case 3:
        return (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-5">
            <motion.p variants={itemVariants} className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Let us know where you're based so we can set your timezone and currency.
            </motion.p>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase font-black tracking-[0.15em]" style={{ color: 'var(--text-secondary)' }}>
                Country
              </label>
              <select
                className="w-full text-sm rounded-xl border outline-none transition-all cursor-pointer"
                style={{
                  paddingTop: '0.75rem',
                  paddingBottom: '0.75rem',
                  paddingLeft: '1rem',
                  paddingRight: '1rem',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  color: selectedCountry ? 'var(--text-primary)' : 'var(--text-secondary)',
                }}
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
              >
                <option value="" disabled>Select your country</option>
                {COUNTRIES.map(c => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase font-black tracking-[0.15em]" style={{ color: 'var(--text-secondary)' }}>
                City
              </label>
              <input
                type="text"
                className="w-full text-sm rounded-xl border outline-none transition-all"
                style={{
                  paddingTop: '0.75rem',
                  paddingBottom: '0.75rem',
                  paddingLeft: '1rem',
                  paddingRight: '1rem',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                }}
                placeholder="e.g. Mumbai, New York, London"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>

            {detectedTimezone && (
              <motion.div
                variants={itemVariants}
                className="flex items-center gap-3 p-4 rounded-2xl border"
                style={{ background: 'rgba(16,185,129,0.06)', borderColor: 'rgba(16,185,129,0.2)' }}
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.15)' }}>
                  <Clock size={16} color="#10B981" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-black tracking-[0.15em]" style={{ color: '#10B981' }}>Detected Timezone</div>
                  <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                    {formatTimezone(detectedTimezone)}
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        );

      case 4:
        return (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
            <motion.p variants={itemVariants} className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Select the creative services you're looking for. We only show what we offer.
            </motion.p>
            <div className="grid gap-3">
              {SERVICE_DEPARTMENTS.map((dept) => {
                const isSelected = selectedServices.includes(dept.id);
                return (
                  <motion.button
                    key={dept.id}
                    variants={itemVariants}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toggleService(dept.id)}
                    className="flex items-center gap-4 p-4 rounded-2xl border text-left transition-all"
                    style={{
                      borderColor: isSelected ? 'var(--accent)' : 'var(--border)',
                      background: isSelected ? 'rgba(37,99,235,0.08)' : 'var(--bg-secondary)',
                    }}
                  >
                    <span className="text-2xl">{dept.icon}</span>
                    <div className="flex-1">
                      <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{dept.label}</div>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'var(--accent)' }}>
                        <Check size={12} color="#fff" strokeWidth={3} />
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        );

      case 5:
        return (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
            <motion.p variants={itemVariants} className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              What's your estimated budget range for creative projects?
              {isIndia && (
                <span className="block mt-1 text-[11px] opacity-60">
                  Currency shown in INR. International clients are billed in USD.
                </span>
              )}
            </motion.p>
            <div className="grid gap-3">
              {budgetRanges.map((range, idx) => {
                const isSelected = budgetRange === idx;
                return (
                  <motion.button
                    key={idx}
                    variants={itemVariants}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setBudgetRange(idx)}
                    className="flex items-center gap-4 p-4 rounded-2xl border text-left transition-all"
                    style={{
                      borderColor: isSelected ? 'var(--accent)' : 'var(--border)',
                      background: isSelected ? 'rgba(37,99,235,0.08)' : 'var(--bg-secondary)',
                    }}
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: isSelected ? 'var(--accent)' : 'var(--bg-card)' }}>
                      <DollarSign size={14} color={isSelected ? '#fff' : 'var(--text-secondary)'} />
                    </div>
                    <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{range.label}</span>
                    {isSelected && (
                      <div className="ml-auto w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'var(--accent)' }}>
                        <Check size={12} color="#fff" strokeWidth={3} />
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        );

      case 6:
        return (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
            <motion.p variants={itemVariants} className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              When are you typically available for meetings and project discussions?
            </motion.p>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase font-black tracking-[0.15em]" style={{ color: 'var(--text-secondary)' }}>
                Available Days
              </label>
              <div className="flex flex-wrap gap-2">
                {DAYS.map((day) => {
                  const isSelected = selectedDays.includes(day);
                  return (
                    <motion.button
                      key={day}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleDay(day)}
                      className="px-4 py-2 rounded-full text-xs font-bold border transition-all"
                      style={{
                        borderColor: isSelected ? 'var(--accent)' : 'var(--border)',
                        background: isSelected ? 'var(--accent)' : 'transparent',
                        color: isSelected ? '#fff' : 'var(--text-primary)',
                      }}
                    >
                      {day.slice(0, 3)}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase font-black tracking-[0.15em]" style={{ color: 'var(--text-secondary)' }}>
                Preferred Time Slots ({detectedTimezone ? formatTimezone(detectedTimezone) : 'your timezone'})
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {TIME_SLOTS.map((slot) => {
                  const isSelected = selectedTimeSlots.includes(slot);
                  return (
                    <motion.button
                      key={slot}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => toggleTimeSlot(slot)}
                      className="px-3 py-2.5 rounded-xl text-xs font-bold border transition-all text-center"
                      style={{
                        borderColor: isSelected ? 'var(--accent)' : 'var(--border)',
                        background: isSelected ? 'rgba(37,99,235,0.08)' : 'var(--bg-secondary)',
                        color: isSelected ? 'var(--accent)' : 'var(--text-primary)',
                      }}
                    >
                      {slot}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  const StepIcon = stepIcons[step];

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-primary)' }}>
      {/* Dot grid */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(var(--text-primary) 1px, transparent 1px)', backgroundSize: '32px 32px' }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-xl"
      >
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'var(--accent)15', color: 'var(--accent)' }}>
              <StepIcon size={20} />
            </div>
            <div>
              <div className="text-[9px] uppercase font-black tracking-[0.3em]" style={{ color: 'var(--text-secondary)' }}>
                Step {step + 1} of {totalSteps}
              </div>
              <h2 className="text-xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
                {stepTitles[step]}
              </h2>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'var(--accent)' }}
              initial={{ width: `${((step) / totalSteps) * 100}%` }}
              animate={{ width: `${((step + 1) / totalSteps) * 100}%` }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </div>

        {/* Step content */}
        <div className="p-6 sm:p-8 rounded-3xl border mb-6" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={prevStep}
            disabled={step === 0}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-70"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
          >
            <ArrowLeft size={14} /> Back
          </button>

          {step === totalSteps - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={!canProceed() || submitting}
              className="btn-primary inline-flex items-center gap-2 px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#fff', borderTopColor: 'transparent' }} />
                  Finalizing...
                </>
              ) : (
                <>Complete <Check size={14} strokeWidth={3} /></>
              )}
            </button>
          ) : (
            <button
              onClick={nextStep}
              disabled={!canProceed()}
              className="btn-primary inline-flex items-center gap-2 px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              Next <ArrowRight size={14} />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
