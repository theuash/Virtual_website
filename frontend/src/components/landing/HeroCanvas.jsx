import { useEffect, useRef } from 'react';

export default function HeroCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;
    const stars = [];
    
    // Get theme colors
    const getThemeColors = () => {
      const style = getComputedStyle(document.documentElement);
      return {
        accent: style.getPropertyValue('--accent').trim() || '#600A0A',
        bg: style.getPropertyValue('--bg-primary').trim() || '#0D1117'
      };
    };

    let colors = getThemeColors();

    const W = () => (canvas.width = window.innerWidth);
    const H = () => (canvas.height = window.innerHeight);

    const resize = () => { W(); H(); initStars(); };
    window.addEventListener('resize', resize);
    resize();

    function initStars() {
      stars.length = 0;
      for (let i = 0; i < 180; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: Math.random() * 1.2 + 0.2,
          speed: Math.random() * 0.3 + 0.05,
          opacity: Math.random() * 0.5 + 0.2,
          twinkle: Math.random() * Math.PI * 2,
          twinkleSpeed: Math.random() * 0.01 + 0.005,
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update colors periodically in case of toggle
      if (Math.random() < 0.01) {
        colors = getThemeColors();
      }

      // Subtle radial accent glow
      const grad = ctx.createRadialGradient(
        canvas.width / 2, canvas.height * 0.3,
        0,
        canvas.width / 2, canvas.height * 0.3,
        canvas.width * 0.6
      );
      grad.addColorStop(0, `${colors.accent}15`); // 15% opacity hex
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw stars
      stars.forEach((s) => {
        s.twinkle += s.twinkleSpeed;
        const op = s.opacity * (0.5 + 0.5 * Math.sin(s.twinkle));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${op * 0.4})`;
        ctx.fill();

        s.y -= s.speed * 0.1;
        if (s.y < -2) {
          s.y = canvas.height + 2;
          s.x = Math.random() * canvas.width;
        }
      });

      animId = requestAnimationFrame(draw);
    }

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="transition-opacity duration-1000"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.4
      }}
    />
  );
}
