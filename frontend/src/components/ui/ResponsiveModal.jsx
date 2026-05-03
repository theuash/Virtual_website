import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

/**
 * Responsive Modal Component
 * 
 * Provides a reusable modal with responsive sizing:
 * - Mobile (320px-768px): Max width 90% of viewport or 500px (whichever smaller)
 * - Desktop (769px+): Max width 500px
 * 
 * Features:
 * - Minimum padding 12px around modal content
 * - Max height 90vh with overflow-y-auto for scrolling
 * - Scroll lock (prevents background scroll when modal open)
 * - Backdrop opacity at least 0.5
 * - Responsive button layout (stacked on mobile if needed)
 */
export default function ResponsiveModal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md', // 'sm', 'md', 'lg'
  showCloseButton = true,
  backdropOpacity = 0.6,
  onBackdropClick = true,
}) {
  // Lock scroll when modal is open
  if (isOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = 'unset';
  }

  const sizeClasses = {
    sm: 'max-w-xs sm:max-w-sm',
    md: 'max-w-sm sm:max-w-md',
    lg: 'max-w-md sm:max-w-lg',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-0"
          style={{ background: `rgba(0,0,0,${backdropOpacity})` }}
          onClick={onBackdropClick ? onClose : undefined}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            className={`w-full ${sizeClasses[size]} max-h-[90vh] rounded-2xl border overflow-hidden flex flex-col`}
            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            {title && (
              <div
                className="flex items-center justify-between px-4 sm:px-5 md:px-6 py-3 sm:py-4 border-b"
                style={{ borderColor: 'var(--border)' }}
              >
                <h2
                  className="text-sm sm:text-base font-bold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {title}
                </h2>
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg hover:opacity-70 transition-opacity h-11 w-11 flex items-center justify-center min-h-[44px] min-w-[44px]"
                    style={{ color: 'var(--text-secondary)' }}
                    aria-label="Close modal"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-5 md:px-6 py-4 sm:py-5 md:py-6">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div
                className="px-4 sm:px-5 md:px-6 py-3 sm:py-4 border-t flex flex-col sm:flex-row gap-2 sm:gap-3"
                style={{ borderColor: 'var(--border)' }}
              >
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
