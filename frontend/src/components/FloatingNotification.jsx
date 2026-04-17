import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const FloatingNotification = ({
  message,
  type = 'info',
  duration = 4000,
  show = false,
  onClose,
  actionText,
  onAction
}) => {
  useEffect(() => {
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-emerald-300" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-300" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-amber-300" />;
      default:
        return <Info className="w-5 h-5 text-slate-300" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-emerald-600/80 border-emerald-400';
      case 'error':
        return 'bg-red-600/80 border-red-400';
      case 'warning':
        return 'bg-amber-600/80 border-amber-400';
      default:
        return 'bg-slate-600/80 border-slate-400';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-emerald-100';
      case 'error':
        return 'text-red-100';
      case 'warning':
        return 'text-amber-100';
      default:
        return 'text-slate-100';
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998] pointer-events-none"
            onClick={() => onClose?.()}
          />

          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 30,
              duration: 0.4
            }}
            className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-[9999]"
          >
            <div className={`${getBackgroundColor()} border rounded-2xl px-6 py-4 shadow-2xl shadow-black/80 max-w-sm mx-auto flex items-center gap-3`}>
              {getIcon()}
              <div className={`flex-1 ${getTextColor()} text-sm font-medium`}>
                {message}
              </div>
              {actionText && onAction && (
                <button
                  onClick={() => {
                    onAction();
                    onClose?.();
                  }}
                  className="text-white/80 hover:text-white text-sm font-semibold underline underline-offset-2 transition-colors"
                >
                  {actionText}
                </button>
              )}
              <button
                onClick={() => onClose?.()}
                className="text-white/60 hover:text-white/80 transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default FloatingNotification;