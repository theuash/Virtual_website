import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function HeroCanvas() {
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;
    const stars = [];
    const W = () => (canvas.width = window.innerWidth);
    const H = () => (canvas.height = window.innerHeight);

    const resize = () => { W(); H(); initStars(); };
    window.addEventListener('resize', resize);
    resize();

    function initStars() {
      stars.length = 0;
      for (let i = 0; i < 220; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: Math.random() * 1.5 + 0.3,
          speed: Math.random() * 0.4 + 0.1,
          opacity: Math.random() * 0.7 + 0.3,
          twinkle: Math.random() * Math.PI * 2,
          twinkleSpeed: Math.random() * 0.02 + 0.005,
          hue: Math.random() > 0.7 ? 260 : 220, // violet or blue tint
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Radial violet glow at top
      const grad = ctx.createRadialGradient(
        canvas.width / 2, canvas.height * 0.25,
        0,
        canvas.width / 2, canvas.height * 0.25,
        canvas.width * 0.55
      );
      grad.addColorStop(0, 'rgba(124,58,237,0.18)');
      grad.addColorStop(0.5, 'rgba(79,142,247,0.06)');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw stars
      stars.forEach((s) => {
        s.twinkle += s.twinkleSpeed;
        const op = s.opacity * (0.6 + 0.4 * Math.sin(s.twinkle));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${s.hue}, 80%, 85%, ${op})`;
        ctx.fill();

        s.y -= s.speed * 0.15;
        if (s.y < -2) {
          s.y = canvas.height + 2;
          s.x = Math.random() * canvas.width;
        }
      });

      // Nebula particles
      for (let i = 0; i < 3; i++) {
        const x = (canvas.width * (0.3 + i * 0.2));
        const y = canvas.height * 0.6;
        const grad2 = ctx.createRadialGradient(x, y, 0, x, y, 80);
        grad2.addColorStop(0, `rgba(124,58,237,0.04)`);
        grad2.addColorStop(1, 'transparent');
        ctx.fillStyle = grad2;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

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
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}
