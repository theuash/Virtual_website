import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import authArt from '../../assets/auth/login_art.jpg';
import logo from '../../assets/logo.png';
import { getRoleRedirect } from '../../utils/roleGuards';

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

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loading, requestLoginOTP, verifyLoginOTP, completeAuth, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [otp, setOtp] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [pendingPhone, setPendingPhone] = useState('');

  const { scrollY } = useScroll();
  const blurOverlayOpacity = useTransform(scrollY, [0, 150], [0, 0.85]);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const handleGoogleLogin = useGoogleLogin({
    flow: 'implicit',
    scope: 'openid email profile',
    prompt: 'select_account',
    onSuccess: async (codeResponse) => {
      setError('');
      try {
        const token = codeResponse.access_token || codeResponse.credential;
        if (!token) {
          throw new Error('Google returned no usable token');
        }
        const response = await loginWithGoogle(token);
        const user = completeAuth(response);
        navigate(getRoleRedirect(user.role, user));
      } catch (err) {
        setError(err?.message || 'Google login failed. Please try again.');
      }
    },
    onError: () => {
      setError('Google login failed. Please try again.');
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await login(email, password);
      if (response?.requiresTwoFactor) {
        setPendingEmail(response.email || email.trim().toLowerCase());
        setPendingPhone(response.phone || '');
        setIsVerifying(true);
        return;
      }
      const user = completeAuth(response);
      navigate(getRoleRedirect(user.role, user));
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await verifyLoginOTP(pendingEmail, otp);
      const user = completeAuth(response);
      navigate(getRoleRedirect(user.role, user));
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Invalid verification code.');
    }
  };

  const handleRequestOtp = async () => {
    setError('');
    const targetEmail = (pendingEmail || email).trim().toLowerCase();

    if (!targetEmail) {
      setError('Complete the password step first so we know where to resend the code.');
      return;
    }

    try {
      const response = await requestLoginOTP(targetEmail);
      setPendingEmail(targetEmail);
      setPendingPhone(response?.phone || pendingPhone);
      setIsVerifying(true);
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to send login code right now.');
    }
  };

  return (
    <div className="min-h-screen flex select-none" style={{ background: 'var(--bg-primary)' }}>

      {/* ── Left Art Panel (fixed, desktop only) ── */}
      <div className="hidden lg:block fixed top-0 left-0 w-[60%] h-full z-0 bg-black border-r border-white/5 overflow-hidden">
        <motion.img
          src={authArt}
          className="w-full h-full object-cover"
          alt="Nexus Authentication"
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5 }}
        />

        {/* Theme-aware blur overlay */}
        <motion.div
          style={{ opacity: blurOverlayOpacity, background: 'var(--bg-primary)' }}
          className="absolute inset-0 backdrop-blur-xl z-10 transition-colors duration-300"
        />

        {/* Scroll-reveal content — bottom-anchored */}
        <div className="absolute inset-0 z-20 flex flex-col justify-end p-12 xl:p-20 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            className="flex flex-col items-start gap-6"
          >
            <img src={logo} className="w-16 h-16" style={{ filter: 'var(--logo-filter)' }} alt="Virtual Logo" />
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5">
                <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                <span className="text-[9px] uppercase font-black tracking-[0.3em]" style={{ color: 'var(--text-secondary)' }}>
                  Secure Gateway Protocol
                </span>
              </div>
              <h1 className="text-5xl xl:text-6xl font-black tracking-tighter leading-[0.9]" style={{ color: 'var(--text-primary)' }}>
                Access <br />
                <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(to right, var(--text-primary), var(--accent))' }}>
                  The Nexus.
                </span>
              </h1>
              <p className="max-w-sm text-sm font-light leading-relaxed opacity-60" style={{ color: 'var(--text-secondary)' }}>
                Re-establish your connection to the global production matrix.
              </p>
            </div>
          </motion.div>
        </div>

        <div className="absolute top-8 left-8 z-20 text-[9px] font-black tracking-[0.3em] opacity-20 text-white">
          CORE_OPERATIONS_HUB
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div
        className="w-full min-h-screen flex items-center justify-center px-6 py-16 z-10"
        style={{ background: 'var(--bg-primary)', marginLeft: 'clamp(0px, 60vw, 60%)' }}
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="w-full"
          style={{ maxWidth: 420 }}
        >
          {/* Back link */}
          <button
            onClick={() => isVerifying ? setIsVerifying(false) : navigate('/')}
            className="inline-flex items-center gap-2 mb-10 text-[10px] uppercase font-black tracking-[0.2em] hover:gap-3 transition-all duration-300"
            style={{ color: 'var(--text-secondary)' }}
          >
            <ArrowLeft size={12} strokeWidth={3} /> {isVerifying ? 'Back to Login' : 'Return to Home'}
          </button>

          {/* Heading */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full border border-border bg-secondary/30">
              <div className="w-1.5 h-1.5 rounded-full bg-accent" />
              <span className="text-[9px] uppercase font-black tracking-[0.25em]" style={{ color: 'var(--text-secondary)' }}>
                {isVerifying ? 'Security Verification' : 'Session Access'}
              </span>
            </div>
            <h2 className="text-3xl font-black tracking-tight mb-2" style={{ color: 'var(--text-primary)' }}>
              {isVerifying ? 'Two-Step Security' : 'Log In'}
            </h2>
            <p className="text-sm font-light opacity-50" style={{ color: 'var(--text-secondary)' }}>
              {isVerifying
                ? `Enter the 6-digit code sent to ${pendingPhone || 'your phone'}.`
                : 'Authorize your session with your credentials.'}
            </p>
          </div>

          {/* Error */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
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
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-black tracking-[0.15em]" style={{ color: 'var(--text-secondary)' }}>
                  Security Code
                </label>
                <div className="relative">
                  <ShieldCheck
                    size={15}
                    strokeWidth={1.5}
                    className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10"
                    style={{ color: 'var(--text-secondary)' }}
                  />
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
                </div>
              </div>

              <div className="text-center">
                <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest mb-4" style={{ color: 'var(--text-secondary)' }}>
                  Secure phone handshake required
                </p>
                <button type="button" onClick={handleRequestOtp} className="text-[10px] font-black uppercase tracking-widest hover:opacity-70 transition-opacity" style={{ color: 'var(--accent)' }}>
                  Request New Code
                </button>
              </div>

              <button type="submit" disabled={loading}
                className="btn-primary w-full py-4 text-[11px] font-black uppercase tracking-[0.25em] rounded-xl transition-all active:scale-[0.98]">
                {loading ? 'Authorizing...' : 'Verify & Enter'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Google Login Button */}
              <button
                type="button"
                onClick={() => handleGoogleLogin()}
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
                <span className="text-[11px] font-black uppercase tracking-widest">Continue with Google</span>
              </button>

              {/* Divider */}
              <div className="relative py-2">
                <div style={{ background: 'var(--border)' }} className="absolute inset-0 h-px" />
                <p className="relative text-center text-[9px] font-black uppercase tracking-widest px-2" style={{ color: 'var(--text-secondary)', background: 'var(--bg-primary)' }}>
                  Or with Email
                </p>
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-black tracking-[0.15em]" style={{ color: 'var(--text-secondary)' }}>
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    size={15}
                    strokeWidth={1.5}
                    className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: 'var(--text-secondary)' }}
                  />
                  <input
                    type="email"
                    className="w-full text-sm rounded-xl border outline-none transition-all"
                    style={inputStyle}
                    placeholder="you@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-black tracking-[0.15em]" style={{ color: 'var(--text-secondary)' }}>
                  Password
                </label>
                <div className="relative">
                  <Lock
                    size={15}
                    strokeWidth={1.5}
                    className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: 'var(--text-secondary)' }}
                  />
                  <input
                    type="password"
                    className="w-full text-sm rounded-xl border outline-none transition-all"
                    style={inputStyle}
                    placeholder="••••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {/* Remember + Forgot */}
              <div className="flex justify-between items-center px-1">
                <label className="flex items-center gap-2 cursor-pointer text-[11px] font-semibold" style={{ color: 'var(--text-secondary)' }}>
                  <input type="checkbox" className="w-4 h-4 rounded accent-blue-600 cursor-pointer" />
                  Maintain Session
                </label>
                <a href="#" className="text-[11px] font-bold hover:opacity-70 transition-opacity" style={{ color: 'var(--accent)' }}>
                  Reset Protocol?
                </a>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-[11px] font-black uppercase tracking-[0.25em] rounded-xl transition-all active:scale-[0.98]"
              >
                {loading ? 'Checking Password...' : 'Continue'}
              </button>
            </form>
          )}

          {/* Footer */}
          {!isVerifying && (
            <div className="mt-10 pt-8 flex flex-col items-center gap-3 text-center" style={{ borderTop: '1px solid var(--border)' }}>
              <p className="text-[11px] font-semibold opacity-40" style={{ color: 'var(--text-secondary)' }}>
                New to the platform?
              </p>
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.15em] hover:gap-3 transition-all group"
                style={{ color: 'var(--accent)' }}
              >
                Create Account <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
