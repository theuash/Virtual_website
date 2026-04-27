import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, X } from 'lucide-react';

const tourSteps = [
  {
    target: 'nav-dashboard',
    title: 'Your Command Center',
    description: 'This is your main dashboard where you can see your current status and progress.',
    position: 'right'
  },
  {
    target: 'nav-projects',
    title: 'Micro-Task Pipeline',
    description: 'Managed micro-tasks dispatched by Supervisors appear here. Complete them to earn XP.',
    position: 'right'
  },
  {
    target: 'nav-learning',
    title: 'The Learning Vault',
    description: 'Master elite software skills here. High proficiency is required for promotion.',
    position: 'right'
  },
  {
    target: 'tour-welcome-card',
    title: 'Quick Actions',
    description: 'Access your Career Matrix or view available projects instantly from here.',
    position: 'bottom'
  },
  {
    target: 'tour-stats-row',
    title: 'Revenue & Progress',
    description: 'Track your total earnings and learning milestones in real-time.',
    position: 'bottom'
  },
  {
    target: 'tour-rank-card',
    title: 'Rank Evolution',
    description: 'Monitor exactly what you need to achieve to promote to the next Crate level.',
    position: 'left'
  },
  {
    target: 'nav-career',
    title: 'Career Matrix',
    description: 'The roadmap for your growth from Pre-Crate to Momentum Supervisor.',
    position: 'right'
  }
];

export default function GuidedTour({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [targetRect, setTargetRect] = useState(null);

  useEffect(() => {
    const hasSeen = localStorage.getItem('virtual_guided_tour_complete');
    if (!hasSeen) {
      setTimeout(() => setIsVisible(true), 2000);
    }
  }, []);

  useEffect(() => {
    if (isVisible) {
      updateTargetRect();
      window.addEventListener('resize', updateTargetRect);
      return () => window.removeEventListener('resize', updateTargetRect);
    }
  }, [isVisible, currentStep]);

  const updateTargetRect = () => {
    let targetId = tourSteps[currentStep].target;
    
    // On mobile, try to find the mobile-equivalent target (e.g. in bottom nav)
    if (window.innerWidth < 768) {
      const mobileTarget = document.getElementById(`${targetId}-mobile`);
      if (mobileTarget) targetId = `${targetId}-mobile`;
    }

    const target = document.getElementById(targetId);
    if (target) {
      setTargetRect(target.getBoundingClientRect());
    }
  };

  const next = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      finish();
    }
  };

  const prev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const finish = () => {
    setIsVisible(false);
    localStorage.setItem('virtual_guided_tour_complete', 'true');
    if (onComplete) onComplete();
  };

  if (!isVisible || !targetRect) return null;

  const step = tourSteps[currentStep];

  // Helper to get tooltip position with bounds checking
  const getTooltipStyle = () => {
    if (!targetRect) return {};
    const isMobile = window.innerWidth < 768;
    
    const gap = isMobile ? 30 : 60; 
    const tooltipWidth = isMobile ? window.innerWidth - 40 : 320;
    const tooltipHeight = 180; 
    const margin = isMobile ? 20 : 20;

    let top = 0;
    let left = 0;
    let transform = '';

    if (isMobile) {
      // On mobile, usually top or bottom of the screen is better
      left = 20;
      if (targetRect.top > window.innerHeight / 2) {
        // Target is in bottom half, show tooltip at top
        top = 80; // Safe area
      } else {
        // Target is in top half, show tooltip at bottom
        top = window.innerHeight - tooltipHeight - 60;
      }
      return { top, left, width: tooltipWidth };
    }

    if (step.position === 'right') {
      top = targetRect.top + targetRect.height / 2;
      left = targetRect.right + gap;
      transform = 'translateY(-50%)';
      
      if (left + tooltipWidth > window.innerWidth - margin) {
        left = targetRect.left - gap - tooltipWidth;
      }
    } else if (step.position === 'left') {
      top = targetRect.top + targetRect.height / 2;
      left = targetRect.left - gap - tooltipWidth;
      transform = 'translateY(-50%)';
      
      if (left < margin) {
        left = targetRect.right + gap;
      }
    } else if (step.position === 'bottom') {
      top = targetRect.bottom + gap;
      left = targetRect.left + targetRect.width / 2;
      transform = 'translateX(-50%)';
      
      if (top + tooltipHeight > window.innerHeight - margin) {
        top = targetRect.top - gap - tooltipHeight;
      }
    } else {
      top = targetRect.top - gap - tooltipHeight;
      left = targetRect.left + targetRect.width / 2;
      transform = 'translateX(-50%)';
    }

    top = Math.max(margin, Math.min(top, window.innerHeight - tooltipHeight - margin));
    left = Math.max(margin, Math.min(left, window.innerWidth - tooltipWidth - margin));

    return { top, left, transform, width: tooltipWidth };
  };

  // SVG Curved Arrow logic (Bigger)
  const getArrowPath = () => {
    if (window.innerWidth < 768) return ''; // No arrows on mobile to reduce clutter
    if (step.position === 'right') return `M-50,0 Q-20,-30 0,0`;
    if (step.position === 'left') return `M50,0 Q20,30 0,0`;
    if (step.position === 'bottom') return `M0,-50 Q-30,-20 0,0`;
    return `M0,50 Q30,20 0,0`;
  };

  return (
    <div className="fixed inset-0 z-[10000] pointer-events-none overflow-hidden uppercase font-black">
      {/* Background Mask */}
      <div className="absolute inset-0 bg-black/70 transition-opacity duration-500 ease-in-out" />
      
      {/* Cutout / Highlight */}
      <motion.div
        animate={{
          top: targetRect.top - 12,
          left: targetRect.left - 12,
          width: targetRect.width + 24,
          height: targetRect.height + 24,
        }}
        className="absolute rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.7)] border-[3px] border-[#8b5cf6] pointer-events-auto"
        transition={{ type: 'spring', stiffness: 250, damping: 25 }}
      >
        <div className="absolute -top-10 left-0 px-3 py-1 rounded-full bg-accent text-white text-[10px] font-black tracking-widest whitespace-nowrap">
          STEP {currentStep + 1}/{tourSteps.length}
        </div>
      </motion.div>

      {/* Tooltip */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          className="absolute p-6 sm:p-8 rounded-3xl border shadow-2xl pointer-events-auto"
          style={{ 
            ...getTooltipStyle(),
            background: 'var(--bg-card)', 
            borderColor: 'var(--accent)',
            boxShadow: '0 30px 60px rgba(0,0,0,0.5)'
          }}
        >
          {/* Curved Arrow SVG (Bigger) */}
          <div className="absolute" style={{ 
            top: step.position === 'bottom' ? '-50px' : '50%',
            left: step.position === 'right' ? '-50px' : step.position === 'left' ? '100%' : '50%',
            marginLeft: step.position === 'left' ? '0' : step.position === 'right' ? '-15px' : '-30px',
            marginTop: step.position === 'bottom' ? '0' : '-30px'
          }}>
            <svg width="80" height="80" viewBox="-80 -80 160 160" className="opacity-100 drop-shadow-lg">
              <path 
                d={getArrowPath()} 
                fill="none" 
                stroke="#8b5cf6" 
                strokeWidth="4" 
                strokeDasharray="8 4"
                strokeLinecap="round"
              />
              <path d="M-5,-5 L0,0 L5,-5" fill="none" stroke="#8b5cf6" strokeWidth="4" strokeLinecap="round" transform="translate(0,0)" />
              <circle cx={step.position === 'right' ? -50 : step.position === 'left' ? 50 : 0} cy={step.position === 'bottom' ? -50 : step.position === 'top' ? 50 : 0} r="5" fill="#8b5cf6" />
            </svg>
          </div>

          <h3 className="text-lg font-black tracking-tight mb-2" style={{ color: 'var(--text-primary)' }}>
            {step.title}
          </h3>
          <p className="text-sm opacity-70 mb-6 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {step.description}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {tourSteps.map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full" 
                  style={{ background: i === currentStep ? 'var(--accent)' : 'var(--border)' }} />
              ))}
            </div>
            
            <div className="flex gap-2">
              {currentStep > 0 && (
                <button onClick={prev} className="p-1.5 rounded-lg border hover:bg-white/5" style={{ borderColor: 'var(--border)' }}>
                  <ChevronLeft size={16} />
                </button>
              )}
              <button 
                onClick={next}
                className="px-4 py-1.5 rounded-lg font-bold text-xs bg-accent text-white hover:scale-105 transition-transform"
                style={{ background: 'var(--accent)' }}
              >
                {currentStep === tourSteps.length - 1 ? 'Finish' : 'Next'}
              </button>
            </div>
          </div>

          <button onClick={finish} className="absolute top-3 right-3 opacity-40 hover:opacity-100 transition-opacity">
            <X size={14} />
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
