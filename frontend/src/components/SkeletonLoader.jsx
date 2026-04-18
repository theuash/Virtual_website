import { motion } from 'framer-motion';

/**
 * Reusable Skeleton Loader Component
 * Creates animated placeholder elements while content loads
 */

export function SkeletonBox({ width = 'w-full', height = 'h-4', className = '', delay = 0 }) {
  return (
    <motion.div
      className={`${width} ${height} rounded-lg ${className}`}
      style={{ background: 'var(--bg-card)' }}
      animate={{ opacity: [0.5, 0.8, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity, delay }}
    />
  );
}

export function SkeletonCard({ lines = 3, delay = 0 }) {
  return (
    <motion.div
      className="p-4 rounded-2xl border"
      style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
      animate={{ opacity: [0.6, 0.9, 0.6] }}
      transition={{ duration: 1.5, repeat: Infinity, delay }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <SkeletonBox width="w-1/2" height="h-5" delay={delay} />
        <SkeletonBox width="w-16" height="h-6" className="rounded-full" delay={delay + 0.1} />
      </div>

      {/* Content lines */}
      <div className="space-y-2">
        {[...Array(lines)].map((_, i) => (
          <SkeletonBox
            key={i}
            width={i === lines - 1 ? 'w-3/4' : 'w-full'}
            height="h-3"
            delay={delay + i * 0.05}
          />
        ))}
      </div>
    </motion.div>
  );
}

export function SkeletonGrid({ count = 3, columns = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' }) {
  return (
    <div className={`grid ${columns} gap-4`}>
      {[...Array(count)].map((_, i) => (
        <SkeletonCard key={i} lines={4} delay={i * 0.1} />
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5, columns = 4 }) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {[...Array(columns)].map((_, i) => (
          <SkeletonBox key={`header-${i}`} height="h-4" delay={i * 0.05} />
        ))}
      </div>

      {/* Rows */}
      {[...Array(rows)].map((_, rowIdx) => (
        <div key={`row-${rowIdx}`} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {[...Array(columns)].map((_, colIdx) => (
            <SkeletonBox
              key={`cell-${rowIdx}-${colIdx}`}
              height="h-3"
              delay={(rowIdx * columns + colIdx) * 0.03}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonForm({ fields = 3 }) {
  return (
    <div className="space-y-4">
      {[...Array(fields)].map((_, i) => (
        <div key={i} className="space-y-2">
          <SkeletonBox width="w-24" height="h-3" delay={i * 0.1} />
          <SkeletonBox height="h-10" delay={i * 0.1 + 0.05} />
        </div>
      ))}
    </div>
  );
}

export function SkeletonProjectCard() {
  return (
    <motion.div
      className="rounded-2xl border overflow-hidden"
      style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
      animate={{ opacity: [0.6, 0.9, 0.6] }}
      transition={{ duration: 1.5, repeat: Infinity }}
    >
      {/* Header */}
      <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-start justify-between gap-3 mb-2">
          <SkeletonBox width="w-2/3" height="h-5" />
          <SkeletonBox width="w-20" height="h-6" className="rounded-full" />
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <SkeletonBox width="w-1/3" height="h-3" delay={i * 0.05} />
            <SkeletonBox width="w-1/4" height="h-3" delay={i * 0.05 + 0.02} />
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-3 border-t flex justify-between" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
        <SkeletonBox width="w-1/4" height="h-3" />
        <SkeletonBox width="w-16" height="h-8" className="rounded-lg" />
      </div>
    </motion.div>
  );
}

export function SkeletonDashboard() {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="p-5 rounded-xl border"
            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
            animate={{ opacity: [0.6, 0.9, 0.6] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
          >
            <div className="flex items-center justify-between mb-4">
              <SkeletonBox width="w-10" height="h-10" className="rounded-lg" delay={i * 0.1} />
              <SkeletonBox width="w-16" height="h-3" delay={i * 0.1 + 0.05} />
            </div>
            <SkeletonBox width="w-1/2" height="h-6" delay={i * 0.1 + 0.1} />
          </motion.div>
        ))}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {[...Array(4)].map((_, i) => (
            <SkeletonCard key={i} lines={3} delay={i * 0.1} />
          ))}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <motion.div
              key={i}
              className="p-4 rounded-xl border"
              style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
              animate={{ opacity: [0.6, 0.9, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: (i + 4) * 0.1 }}
            >
              <SkeletonBox width="w-1/2" height="h-4" delay={(i + 4) * 0.1} />
              <SkeletonBox width="w-full" height="h-3" className="mt-3" delay={(i + 4) * 0.1 + 0.05} />
              <SkeletonBox width="w-3/4" height="h-3" className="mt-2" delay={(i + 4) * 0.1 + 0.1} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SkeletonBox;
