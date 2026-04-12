import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GetStartedModal from './GetStartedModal';

export default function Header() {
  const [visible, setVisible] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setVisible(y > 1000);
      setScrolled(y > window.innerHeight * 0.8);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(-20px)',
          pointerEvents: visible ? 'all' : 'none',
          transition: 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.4s ease',
          background: 'rgba(10,10,15,0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: scrolled
            ? '0.5px solid rgba(124,58,237,0.3)'
            : '0.5px solid transparent',
          padding: '0 2rem',
          height: '80px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Logo */}
        <div
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <div style={{
            width: 40, height: 40, borderRadius: '10px',
            background: 'linear-gradient(135deg, #7c3aed, #4f8ef7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 16px rgba(124,58,237,0.5)',
          }}>
            <span style={{ color: '#fff', fontWeight: 800, fontSize: '1.1rem' }}>V</span>
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.4rem', color: '#f0f0ff', letterSpacing: '-0.02em' }}>
            Virtual
          </span>
        </div>

        {/* Nav */}
        <nav style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
          {[['How It Works', 'how-it-works'], ['Roles', 'roles'], ['Pricing', 'stats']].map(([label, id]) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              style={{
                background: 'none', border: 'none', color: '#8b8ba8',
                fontFamily: 'inherit', fontSize: '1rem', fontWeight: 500,
                cursor: 'pointer', transition: 'color 0.2s',
                padding: '0.5rem 0',
              }}
              onMouseEnter={e => e.target.style.color = '#f0f0ff'}
              onMouseLeave={e => e.target.style.color = '#8b8ba8'}
            >
              {label}
            </button>
          ))}
        </nav>

        {/* CTA */}
        <button id="header-get-started" className="btn-primary" style={{ padding: '0.75rem 1.75rem', fontSize: '1rem', fontWeight: '500' }} onClick={() => setModalOpen(true)}>
          Get Started
        </button>
      </header>

      <GetStartedModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
