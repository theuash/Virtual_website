import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { SKILLS } from '../../utils/roleGuards';
import { Target, Briefcase } from 'lucide-react';

export default function SignupPage() {
  const [params] = useSearchParams();
  const roleParam = params.get('role');
  const navigate = useNavigate();
  const { signup, loading } = useAuth();

  const [role, setRole] = useState(null);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    company: '', skill: SKILLS[0], dob: '', portfolioUrl: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (roleParam === 'client' || roleParam === 'freelancer') {
      setRole(roleParam);
    }
  }, [roleParam]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    if (role === 'freelancer') {
      const birthYear = new Date(formData.dob).getFullYear();
      const currentYear = new Date().getFullYear();
      if (currentYear - birthYear < 16) {
        return setError('You must be at least 16 years old to work as a freelancer.');
      }
    }

    try {
      const user = await signup({ ...formData, role });
      navigate(user.role === 'client' ? '/client/dashboard' : '/freelancer/dashboard');
    } catch (err) {
      setError(err?.response?.data?.message || 'Error creating account. Please try again.');
    }
  };

  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-card max-w-3xl w-full p-12 py-16 animate-fade-in-up">
           <h1 className="text-4xl font-medium tracking-tight text-center mb-4">Select Operations Portal</h1>
           <p className="text-center text-text-muted font-light mb-12 max-w-lg mx-auto">
             Choose the infrastructure required for your specific needs.
           </p>
           
           <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
              <button 
                onClick={() => setRole('client')} 
                className="group relative p-10 bg-base border border-glass-border rounded-3xl text-center hover:border-electric-blue/40 transition-all duration-300"
              >
                <div className="w-16 h-16 mx-auto rounded-full bg-blue-900/10 text-electric-blue flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 border border-electric-blue/20">
                  <Target size={32} strokeWidth={1} />
                </div>
                <div className="text-xl font-medium text-white mb-2 tracking-wide">Client</div>
                <div className="text-xs text-text-muted font-light leading-relaxed px-4">
                  Deploy projects and scale your creative output with vetted talent.
                </div>
              </button>

              <button 
                onClick={() => setRole('freelancer')} 
                className="group relative p-10 bg-base border border-glass-border rounded-3xl text-center hover:border-violet-light/40 transition-all duration-300"
              >
                <div className="w-16 h-16 mx-auto rounded-full bg-violet-900/10 text-violet-light flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 border border-violet-bloom/20">
                  <Briefcase size={32} strokeWidth={1} />
                </div>
                <div className="text-xl font-medium text-white mb-2 tracking-wide">Talent</div>
                <div className="text-xs text-text-muted font-light leading-relaxed px-4">
                  Join the platform, climb the career matrix, and increase earning capacity.
                </div>
              </button>
           </div>
           
           <p className="text-center mt-12 text-sm text-text-muted font-light">
             Already authenticated? <Link to="/login" className="text-white hover:text-violet-300 font-medium transition-colors">Sign in</Link>
           </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-900/10 via-base to-base"></div>
      
      <div className="glass-card max-w-md w-full p-10 z-10 animate-fade-in-up border-glass-border">
        <Link to="/" className="inline-block text-xs uppercase tracking-widest text-text-muted hover:text-white mb-8 transition-colors font-medium">
          &larr; Return
        </Link>
        
        <h2 className="text-2xl font-medium tracking-tight mb-2 text-white">Initialize {role === 'client' ? 'Client' : 'Talent'} Profile</h2>
        <p className="text-text-muted mb-8 text-sm font-light">Complete the form below to enter the platform.</p>

        {error && <div className="bg-red-950/50 border border-red-500/20 text-red-400 p-3 rounded-lg mb-6 text-sm font-light">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-group relative">
            <input name="name" type="text" className="input" placeholder="Legal Name" required value={formData.name} onChange={handleChange} />
          </div>
          
          <div className="form-group relative">
             <input name="email" type="email" className="input" placeholder="Professional Email" required value={formData.email} onChange={handleChange} />
          </div>

          {role === 'client' && (
            <div className="form-group relative">
              <input name="company" type="text" className="input" placeholder="Company Designation (Optional)" value={formData.company} onChange={handleChange} />
            </div>
          )}

          {role === 'freelancer' && (
            <>
              <div className="form-group">
                <select name="skill" className="input appearance-none" required value={formData.skill} onChange={handleChange}>
                  {SKILLS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <input name="dob" type="date" className="input text-text-muted" required value={formData.dob} onChange={handleChange} title="Date of Birth" />
              </div>
              <div className="form-group">
                <input name="portfolioUrl" type="url" className="input" placeholder="Portfolio Endpoint URL (Optional)" value={formData.portfolioUrl} onChange={handleChange} />
              </div>
            </>
          )}

          <div className="form-group relative">
             <input name="password" type="password" className="input" placeholder="Security Token" required minLength={8} value={formData.password} onChange={handleChange} />
          </div>
          <div className="form-group relative">
             <input name="confirmPassword" type="password" className="input" placeholder="Verify Security Token" required minLength={8} value={formData.confirmPassword} onChange={handleChange} />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 mt-8 text-sm tracking-wide font-medium">
            {loading ? 'Initializing...' : 'Authorize Profile'}
          </button>
        </form>

        <p className="text-center mt-8 text-xs text-text-muted font-light">
          Already authenticated? <Link to="/login" className="text-white hover:text-violet-300 font-medium transition-colors">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
