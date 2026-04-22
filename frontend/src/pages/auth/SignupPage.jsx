import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Briefcase, ArrowLeft, ArrowRight, User, Mail, Compass, Calendar, Link as LinkIcon, Lock, Phone, ShieldCheck } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import { SKILLS, SKILL_LABELS } from '../../utils/roleGuards';
import signupArt from '../../assets/auth/signup_art.jpg';
import logo from '../../assets/logo.png';
import { getRoleRedirect } from '../../utils/roleGuards';
import ThemeToggle from '../../components/ThemeToggle';

/* ── Shared input style helper ───────────────────────────────────────── */
const inputStyle = {
  paddingTop: '0.875rem',
  paddingBottom: '0.875rem',
  paddingLeft: '2.75rem',
  paddingRight: '1rem',
  background: 'var(--bg-secondary)',
  border: '1px solid var(--border)',
  color: 'var(--text-primary)',
};

const inputNoIconStyle = {
  ...inputStyle,
  paddingLeft: '1rem',
};

function Field({ label, icon: Icon, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] uppercase font-black tracking-[0.15em]" style={{ color: 'var(--text-secondary)' }}>
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon
            size={15}
            strokeWidth={1.5}
            className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10"
            style={{ color: 'var(--text-secondary)' }}
          />
        )}
        {children}
      </div>
    </div>
  );
}

export default function SignupPage() {
  const [params] = useSearchParams();
  const roleParam = params.get('role');
  const redirectTo = params.get('redirect') || null;
  const navigate = useNavigate();
  const { signup, loading, verifySignupOTP, requestSignupOTP, completeAuth, signupWithGoogle } = useAuth();

  const [role, setRole] = useState(null);
  const [formData, setFormData] = useState({
    name: '', email: '', countryCode: '+91', phone: '', password: '', confirmPassword: '',
    company: '',
  });
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [otp, setOtp] = useState('');
  const [pendingUser, setPendingUser] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (roleParam === 'client' || roleParam === 'freelancer') setRole(roleParam);
  }, [roleParam]);

  const handleGoogleSignup = useGoogleLogin({
    flow: 'implicit',
    scope: 'openid email profile',
    prompt: 'select_account',
    onSuccess: async (codeResponse) => {
      setError('');
      try {
        if (!role) {
          setError('Please select a role first.');
          return;
        }
        const token = codeResponse.access_token || codeResponse.credential;
        if (!token) {
          throw new Error('Google returned no usable token');
        }
        const response = await signupWithGoogle(token, role);
        const user = completeAuth(response);
        navigate(redirectTo || getRoleRedirect(user.role, user));
      } catch (err) {
        setError(err?.message || 'Google signup failed. Please try again.');
      }
    },
    onError: () => {
      setError('Google signup failed. Please try again.');
    },
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) return setError('Passwords do not match.');
    try {
      const fullPhone = `${formData.countryCode}${formData.phone}`;
      const response = await signup({ ...formData, phone: fullPhone, role });
      setPendingUser(response);
      setIsVerifying(true);
    } catch (err) {
      setError(err?.message || err?.response?.data?.message || 'Error creating account. Please try again.');
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // Reconstruct full signup data with combined phone number
      const signupDataForVerification = {
        ...formData,
        phone: `${formData.countryCode}${formData.phone}`,
        role,
      };
      const verifiedAuth = await verifySignupOTP(pendingUser.user.email, otp, signupDataForVerification);
      const user = completeAuth(verifiedAuth);
      navigate(redirectTo || getRoleRedirect(user.role, user));
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Invalid verification code.');
    }
  };

  const handleResendOtp = async () => {
    setError('');
    try {
      await requestSignupOTP(pendingUser.user.email);
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to resend code right now.');
    }
  };

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } } };
  const otpDestination = pendingUser?.phone || pendingUser?.user?.phone || formData.phone;

  /* ── Role Selection Screen ──────────────────────────────────────────── */
  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-primary)' }}>
        {/* Dot-grid backdrop */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(var(--text-primary) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        <motion.div variants={containerVariants} initial="hidden" animate="visible"
          className="relative z-10 w-full max-w-3xl px-4 py-12 text-center">

          {/* Back + theme toggle */}
          <motion.div variants={itemVariants} className="flex items-center justify-between mb-10">
            <button onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 text-[10px] uppercase font-black tracking-[0.2em] hover:gap-3 transition-all duration-300"
              style={{ color: 'var(--text-secondary)' }}>
              <ArrowLeft size={12} strokeWidth={3} /> Back to Home
            </button>
            <ThemeToggle variant="pill" />
          </motion.div>

          {/* Logo + heading */}
          <motion.div variants={itemVariants} className="flex flex-col items-center mb-10">
            <img src={logo} className="w-14 h-14 mb-6" style={{ filter: 'var(--logo-filter)' }} alt="Virtual Logo" />
            <div className="inline-flex items-center gap-2 mb-5 px-3 py-1 rounded-full border border-border bg-secondary/30">
              <div className="w-1.5 h-1.5 rounded-full bg-accent" style={{ backgroundColor: 'var(--accent)' }} />
              <span className="text-[9px] uppercase font-black tracking-[0.3em]" style={{ color: 'var(--text-secondary)' }}>
                Protocol Initialization
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3" style={{ color: 'var(--text-primary)' }}>
              Choose Your Path
            </h1>
            <p className="text-sm font-light max-w-md opacity-60" style={{ color: 'var(--text-secondary)' }}>
              Select the environment that matches your objective.
            </p>
          </motion.div>

          {/* Cards */}
          <div className="grid sm:grid-cols-2 gap-4 mb-10">
            <motion.button variants={itemVariants} whileHover={{ y: -4 }}
              onClick={() => setRole('client')}
              className="group p-8 rounded-3xl text-left border transition-all duration-300"
              style={{ border: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                style={{ background: 'rgba(37,99,235,0.08)', color: 'var(--accent)' }}>
                <Target size={24} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>Client Portal</h3>
              <p className="text-xs font-medium leading-relaxed opacity-50 mb-5" style={{ color: 'var(--text-secondary)' }}>
                Post projects, manage teams, and access elite creative talent worldwide.
              </p>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest group-hover:gap-3 transition-all" style={{ color: 'var(--accent)' }}>
                Get Started <ArrowRight size={12} />
              </div>
            </motion.button>

            <motion.button variants={itemVariants} whileHover={{ y: -4 }}
              onClick={() => setRole('freelancer')}
              className="group p-8 rounded-3xl text-left border transition-all duration-300"
              style={{ border: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                style={{ background: 'rgba(16,185,129,0.08)', color: '#10B981' }}>
                <Briefcase size={24} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>Talent Nexus</h3>
              <p className="text-xs font-medium leading-relaxed opacity-50 mb-5" style={{ color: 'var(--text-secondary)' }}>
                Find high-value projects, grow your portfolio, and get paid on time.
              </p>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest group-hover:gap-3 transition-all text-emerald-500">
                Join Now <ArrowRight size={12} />
              </div>
            </motion.button>
          </div>

          <motion.p variants={itemVariants} className="text-[11px] font-semibold" style={{ color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link to="/login" className="font-black hover:opacity-70 transition-opacity" style={{ color: 'var(--accent)' }}>
              Sign In
            </Link>
          </motion.p>
        </motion.div>
      </div>
    );
  }

  /* ── Signup Form Screen ─────────────────────────────────────────────── */
  const accentColor = role === 'client' ? 'var(--accent)' : '#10B981';

  return (
    <div className="min-h-screen flex select-none" style={{ background: 'var(--bg-primary)' }}>

      {/* ── Left Art Panel (fixed, desktop only) ── */}
      <div className="hidden lg:block fixed top-0 left-0 w-[60%] h-full z-0 bg-black border-r border-white/5 overflow-hidden">
        <motion.img
          src={signupArt}
          className="w-full h-full object-cover"
          alt="Nexus Onboarding"
          initial={{ scale: 1.08, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* Static gradient overlay */}
        <div className="absolute inset-0 z-10" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.1) 100%)' }} />

        {/* Staggered content */}
        <div className="absolute inset-0 z-20 flex flex-col justify-end p-12 xl:p-20 pb-20 overflow-hidden">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 mb-5 w-fit"
          >
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: accentColor }} />
            <span className="text-[9px] uppercase font-black tracking-[0.3em] text-white/60">
              Protocol Registry
            </span>
          </motion.div>

          {/* Heading reveals as logo moves up */}
          <div className="relative overflow-hidden mb-4">
            <motion.h1
              className="text-5xl xl:text-6xl font-black tracking-tighter leading-[0.95] capitalize text-white"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}
            >
              Begin Your <br />
              <span className="text-transparent bg-clip-text"
                style={{ backgroundImage: `linear-gradient(to right, #fff, ${accentColor})` }}>
                {role || 'New'} Era.
              </span>
            </motion.h1>
          </div>

          {/* Logo moves up */}
          <motion.img
            src={logo}
            className="absolute"
            style={{
              width: 56, height: 56,
              filter: 'brightness(0) invert(1)',
              bottom: '5rem',
              left: '3rem',
            }}
            initial={{ y: 0, opacity: 1 }}
            animate={{ y: -220, opacity: 1 }}
            transition={{ duration: 1.0, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            alt="Virtual Logo"
          />

          <motion.p
            className="max-w-sm text-sm font-light leading-relaxed text-white/50 mt-2"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            Initialize your profile and enter the production matrix.
          </motion.p>
        </div>

        <motion.div
          className="absolute bottom-6 left-8 right-8 z-20 flex justify-between text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          transition={{ duration: 1, delay: 1.4 }}
        >
          <span className="text-[9px] font-black uppercase tracking-[0.3em]">Registry: New_Identity</span>
          <span className="text-[9px] font-black uppercase tracking-[0.3em]">Role: {role?.toUpperCase() || '—'}</span>
        </motion.div>
      </div>

      {/* ── Right Form Panel ── */}
      <div
        className="w-full min-h-screen flex items-start justify-center px-6 py-16 z-10"
        style={{ background: 'var(--bg-primary)', marginLeft: 'clamp(0px, 60vw, 60%)' }}
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="w-full"
          style={{ maxWidth: 420 }}
        >
          {/* Back */}
          <button onClick={() => isVerifying ? setIsVerifying(false) : setRole(null)}
            className="inline-flex items-center gap-2 mb-10 text-[10px] uppercase font-black tracking-[0.2em] hover:gap-3 transition-all duration-300"
            style={{ color: 'var(--text-secondary)' }}
          >
            <ArrowLeft size={12} strokeWidth={3} /> {isVerifying ? 'Back to Setup' : 'Change Path'}
          </button>

          {/* Heading */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full border border-border bg-secondary/30">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accentColor }} />
              <span className="text-[9px] uppercase font-black tracking-[0.25em] capitalize" style={{ color: 'var(--text-secondary)' }}>
                {isVerifying ? 'Security Protocol' : `${role} Account`}
              </span>
            </div>
            <h2 className="text-3xl font-black tracking-tight mb-2" style={{ color: 'var(--text-primary)' }}>
              {isVerifying ? 'Two-Step Verification' : 'Create Account'}
            </h2>
            <p className="text-sm font-light opacity-50" style={{ color: 'var(--text-secondary)' }}>
              {isVerifying 
                ? `Enter the 6-digit code sent to ${otpDestination}` 
                : 'Fill in your details to get started.'}
            </p>
          </div>

          {/* Error */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-start gap-3 p-4 rounded-2xl mb-6 text-xs font-semibold"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mt-0.5" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {isVerifying ? (
            <form onSubmit={handleVerifyOTP} className="flex flex-col gap-6">
              <Field label="Verification Code" icon={ShieldCheck}>
                <input 
                  type="text"
                  maxLength={6}
                  className="w-full text-center text-2xl font-black tracking-[0.5em] rounded-xl border outline-none transition-all"
                  style={{ ...inputStyle, paddingLeft: '1rem' }}
                  placeholder="000000"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                />
              </Field>

              <div className="text-center">
                <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest mb-4" style={{ color: 'var(--text-secondary)' }}>
                  Didn&apos;t receive the phone code?
                </p>
                <button type="button" onClick={handleResendOtp} className="text-[10px] font-black uppercase tracking-widest hover:opacity-70 transition-opacity" style={{ color: 'var(--accent)' }}>
                  Resend Phone Code
                </button>
              </div>

              <button type="submit" disabled={loading}
                className="btn-primary w-full py-4 text-[11px] font-black uppercase tracking-[0.25em] rounded-xl transition-all active:scale-[0.98]">
                {loading ? 'Verifying...' : 'Authenticate & Access'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Google Signup Button */}
              <button
                type="button"
                onClick={() => handleGoogleSignup()}
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl border transition-all flex items-center justify-center gap-3 hover:opacity-80 active:scale-[0.98] mb-2"
                style={{ 
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="14" fontWeight="bold" fill="url(#grad1)" fontFamily="Arial, sans-serif">G</text>
                  <defs>
                    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#4285F4"/>
                      <stop offset="25%" stopColor="#EA4335"/>
                      <stop offset="50%" stopColor="#FBBC04"/>
                      <stop offset="75%" stopColor="#34A853"/>
                      <stop offset="100%" stopColor="#4285F4"/>
                    </linearGradient>
                  </defs>
                </svg>
                <span className="text-[11px] font-black uppercase tracking-widest">Sign up with Google</span>
              </button>

              {/* Divider */}
              <div className="relative py-2">
                <div style={{ background: 'var(--border)' }} className="absolute inset-0 h-px" />
                <p className="relative text-center text-[9px] font-black uppercase tracking-widest px-2" style={{ color: 'var(--text-secondary)', background: 'var(--bg-primary)' }}>
                  Or with Email
                </p>
              </div>

              {/* Full Name */}
              <Field label="Full Name" icon={User}>
                <input name="name" type="text"
                  className="w-full text-sm rounded-xl border outline-none transition-all"
                  style={inputStyle}
                  placeholder="e.g. Jane Doe" required value={formData.name} onChange={handleChange} />
              </Field>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Email */}
                <Field label="Email Address" icon={Mail}>
                  <input name="email" type="email"
                    className="w-full text-sm rounded-xl border outline-none transition-all"
                    style={inputStyle}
                    placeholder="you@example.com" required value={formData.email} onChange={handleChange} />
                </Field>

                {/* Phone */}
                <div className="col-span-1 md:col-span-2 flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-black tracking-[0.15em]" style={{ color: 'var(--text-secondary)' }}>
                    Phone Number
                  </label>
                  <div className="flex gap-2 w-full">
                    <select name="countryCode"
                      className="text-sm rounded-xl border outline-none transition-all cursor-pointer flex-shrink-0"
                      style={{ ...inputNoIconStyle, paddingLeft: '0.5rem', width: '120px' }}
                      required value={formData.countryCode} onChange={handleChange}>
                      <option value="+91">🇮🇳 +91</option>
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+44">🇬🇧 +44</option>
                      <option value="+61">🇦🇺 +61</option>
                      <option value="+86">🇨🇳 +86</option>
                      <option value="+81">🇯🇵 +81</option>
                      <option value="+33">🇫🇷 +33</option>
                      <option value="+49">🇩🇪 +49</option>
                      <option value="+39">🇮🇹 +39</option>
                      <option value="+34">🇪🇸 +34</option>
                      <option value="+31">🇳🇱 +31</option>
                      <option value="+47">🇳🇴 +47</option>
                      <option value="+46">🇸🇪 +46</option>
                      <option value="+41">🇨🇭 +41</option>
                    </select>
                    <input name="phone" type="tel"
                      className="flex-1 text-sm rounded-xl border outline-none transition-all"
                      style={inputNoIconStyle}
                      placeholder="9876543210" required value={formData.phone} onChange={handleChange} />
                  </div>
                </div>
              </div>

              {/* Client-only: Company */}
              {role === 'client' && (
                <Field label="Company (Optional)" icon={Compass}>
                  <input name="company" type="text"
                    className="w-full text-sm rounded-xl border outline-none transition-all"
                    style={inputStyle}
                    placeholder="Your Organization" value={formData.company} onChange={handleChange} />
                </Field>
              )}

              {/* Password row */}
              <div className="grid grid-cols-2 gap-3">
                <Field label="Password" icon={Lock}>
                  <input name="password" type="password"
                    className="w-full text-sm rounded-xl border outline-none transition-all"
                    style={inputStyle}
                    placeholder="Min 8 chars" required minLength={8} value={formData.password} onChange={handleChange} />
                </Field>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-black tracking-[0.15em]" style={{ color: 'var(--text-secondary)' }}>
                    Confirm
                  </label>
                  <input name="confirmPassword" type="password"
                    className="w-full text-sm rounded-xl border outline-none transition-all"
                    style={inputNoIconStyle}
                    placeholder="Repeat" required minLength={8} value={formData.confirmPassword} onChange={handleChange} />
                </div>
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading}
                className="btn-primary w-full py-4 text-[11px] font-black uppercase tracking-[0.25em] rounded-xl transition-all active:scale-[0.98] mt-2">
                {loading ? 'Initiating Verification...' : 'Send Phone Code'}
              </button>
            </form>
          )}

          {/* Footer */}
          {!isVerifying && (
            <p className="text-center mt-8 text-[11px] font-semibold" style={{ color: 'var(--text-secondary)' }}>
              Already have an account?{' '}
              <Link to="/login" className="font-black hover:opacity-70 transition-opacity" style={{ color: 'var(--accent)' }}>
                Sign In →
              </Link>
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
