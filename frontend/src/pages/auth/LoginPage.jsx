import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const user = await login(email, password);
      // Determine route based on role
      if (user.role === 'client') navigate('/client/dashboard');
      else if (user.role === 'freelancer') navigate('/freelancer/dashboard');
      else if (user.role === 'admin') navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-electric-blue/10 via-base to-base"></div>
      
      <div className="glass-card max-w-md w-full p-8 z-10 animate-fade-in-up shadow-glow-blue">
        <Link to="/" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-text-muted hover:text-white mb-8 transition-colors font-medium">
          <ArrowLeft size={14} /> Return
        </Link>
        
        <h2 className="text-3xl font-bold mb-2">Welcome Back</h2>
        <p className="text-text-muted mb-8">Sign in to your Virtual account.</p>

        {error && <div className="bg-red-900/20 border border-red-500/30 text-red-400 p-3 rounded mb-4 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-group">
            <input 
              type="email" 
              className="input" 
              placeholder="Email Address" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>
          <div className="form-group">
            <input 
              type="password" 
              className="input" 
              placeholder="Password" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>

          <div className="flex justify-between items-center text-sm">
            <label className="flex items-center gap-2 cursor-pointer text-text-muted hover:text-white transition-colors">
              <input type="checkbox" className="accent-violet-bloom" /> Remember me
            </label>
            <a href="#" className="text-electric-blue hover:underline">Forgot Password?</a>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-4 text-lg">
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center mt-8 text-sm text-text-muted border-t border-glass-border pt-6">
          Don't have an account? <Link to="/signup" className="text-electric-blue hover:underline font-semibold">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
