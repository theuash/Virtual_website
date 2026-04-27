import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, CheckCircle2, Zap, BookOpen, FolderKanban, TrendingUp, Info } from 'lucide-react';

const steps = [
  {
    id: 'welcome',
    title: 'Welcome to Virtual',
    description: 'You are now part of an elite production network. This dashboard is your command center for projects, learning, and career growth.',
    icon: <Zap size={40} className="text-[#8b5cf6]" />,
  },
  {
    id: 'tiers',
    title: 'The Tier System',
    description: "Every freelancer starts as 'Pre-Crate'. Your goal is to complete modules and your first project to unlock the 'Crate' tier and full project access.",
    icon: <CheckCircle2 size={40} className="text-[#8b5cf6]" />,
  },
  {
    id: 'learning',
    title: 'Master Your Craft',
    description: 'Access the Learning Vault to master industry-leading software. Higher proficiency levels unlock more complex, higher-paying tasks.',
    icon: <BookOpen size={40} className="text-[#8b5cf6]" />,
  },
  {
    id: 'projects',
    title: 'Project Pipeline',
    description: 'Managed tasks will appear in your "Active Projects" section. Track deadlines, xp points, and estimation status for every delivery.',
    icon: <FolderKanban size={40} className="text-[#8b5cf6]" />,
  },
  {
    id: 'support',
    title: 'Expert Guidance',
    description: 'Every department is led by a Momentum Supervisor. They dispatch tasks, review quality, and provide direct mentorship on your journey.',
    icon: <Info size={40} className="text-[#8b5cf6]" />,
  },
  {
    id: 'career',
    title: 'Career Evolution',
    description: 'Track your path in the Career Matrix. Consistency and precision will eventually allow you to promote into Initiator or Supervisor roles.',
    icon: <TrendingUp size={40} className="text-[#8b5cf6]" />,
  }
];

export default function TutorialOverlay({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasSeen = localStorage.getItem('virtual_tutorial_complete');
    if (!hasSeen) {
      setTimeout(() => setIsVisible(true), 1000);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      finish();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const finish = () => {
    setIsVisible(false);
    localStorage.setItem('virtual_tutorial_complete', 'true');
    if (onComplete) onComplete();
  };

  if (!isVisible) return null;

  const step = steps[currentStep];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={finish}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Content Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md overflow-hidden rounded-3xl border shadow-2xl"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
          {/* Header */}
          <div className="px-6 pt-8 pb-4 text-center">
            <div className="mb-4 flex justify-center">
              <motion.div
                key={currentStep}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="p-4 rounded-2xl bg-accent/10 border border-accent/20"
              >
                {step.icon}
              </motion.div>
            </div>
            <h2 className="text-xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
              {step.title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed opacity-70" style={{ color: 'var(--text-secondary)' }}>
              {step.description}
            </p>
          </div>

          {/* Footer / Controls */}
          <div className="px-6 pb-8 pt-4">
            {/* Progress Dots */}
            <div className="flex justify-center gap-1.5 mb-6">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className="h-1 rounded-full transition-all"
                  style={{ 
                    width: i === currentStep ? '20px' : '6px',
                    background: i === currentStep ? 'var(--accent)' : 'var(--border)'
                  }}
                />
              ))}
            </div>

            <div className="flex items-center justify-between gap-3">
              <button
                onClick={finish}
                className="text-xs font-bold uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity"
                style={{ color: 'var(--text-primary)' }}
              >
                Skip Tour
              </button>

              <div className="flex gap-2">
                {currentStep > 0 && (
                  <button
                    onClick={handlePrev}
                    className="p-2 rounded-xl border flex items-center justify-center transition-all hover:bg-black/5 dark:hover:bg-white/5"
                    style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  >
                    <ChevronLeft size={20} />
                  </button>
                )}
                <button
                  onClick={handleNext}
                  className="px-6 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
                  style={{ background: 'var(--accent)', color: '#fff' }}
                >
                  {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
                  {currentStep !== steps.length - 1 && <ChevronRight size={18} />}
                </button>
              </div>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={finish}
            className="absolute top-4 right-4 p-2 rounded-full opacity-40 hover:opacity-100 transition-opacity"
            style={{ color: 'var(--text-primary)' }}
          >
            <X size={18} />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
