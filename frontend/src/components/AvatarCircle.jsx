/**
 * AvatarCircle
 * - Circle with an organic blob SVG background (75-85% coverage)
 * - Bottom half of image clipped inside circle, top overflows freely
 * - Blob shape is seeded from the initial letter so it's consistent per user
 */

const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001';

export function resolveAvatar(avatar) {
  if (!avatar) return null;
  return avatar.startsWith('http') ? avatar : `${BASE_URL}${avatar}`;
}

// Generate a smooth organic blob SVG path
// Uses 5 control points arranged in a circle with randomized radii
function generateBlobPath(seed, size) {
  // Simple seeded pseudo-random from a string
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  }
  const rand = (min, max, offset = 0) => {
    h = (Math.imul(h, 1664525) + 1013904223) | 0;
    const t = ((h >>> 0) / 0xffffffff);
    return min + (max - min) * ((t + offset) % 1);
  };

  const cx = size / 2;
  const cy = size / 2;
  const points = 5;
  const minR = size * 0.45;
  const maxR = size * 0.34;

  // Generate radii for each point
  const radii = Array.from({ length: points }, (_, i) => rand(minR, maxR, i * 0.17));

  // Convert to cartesian coords
  const pts = radii.map((r, i) => {
    const angle = (i / points) * Math.PI * 2 - Math.PI / 2;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  });

  // Build smooth cubic bezier path
  const n = pts.length;
  let d = '';
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];

    if (i === 0) d += `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} `;

    // Catmull-Rom → cubic bezier
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += `C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)} `;
  }
  d += 'Z';
  return d;
}

// Accent-based blob color — uses CSS variable accent with opacity
const BLOB_COLORS = [
  'rgba(14, 246, 242, 0.59)',  // purple (default accent)
  'rgba(110, 44, 242, 0.14)',
  'rgba(25, 247, 217, 0.77)',
  'rgba(24, 28, 253, 0.6)',
];

function getBlobColor(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  return BLOB_COLORS[Math.abs(h) % BLOB_COLORS.length];
}

export default function AvatarCircle({ src, initial = '?', size = 40 }) {
  const seed = initial + size;
  const blobPath = generateBlobPath(seed, size);
  const blobColor = getBlobColor(seed);

  const imgH = Math.round(size * 1.2);
  const imgW = Math.round(size * 1.1);

  return (
    <div
      style={{
        width: size,
        height: size,
        position: 'relative',
        flexShrink: 0,
        overflow: 'visible',
      }}
    >
      {/* Circle border + background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          border: '2px solid var(--border)',
          background: '#4d03866b',
          overflow: 'hidden',
          zIndex: 1,
        }}
      >
        {/* Organic blob background */}
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ position: 'absolute', inset: 0 }}
        >
          <path d={blobPath} fill={blobColor} />
        </svg>

        {/* Fallback initial */}
        {!src && (
          <span style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: size * 0.38, fontWeight: 900,
            color: 'var(--accent)', userSelect: 'none', zIndex: 2,
          }}>
            {initial}
          </span>
        )}

        {/* Image inside circle — bottom portion clipped */}
        {src && (
          <img
            src={src}
            alt="avatar"
            style={{
              position: 'absolute',
              width: imgW,
              height: imgH,
              objectFit: 'cover',
              objectPosition: 'center top',
              bottom: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 2,
              pointerEvents: 'none',
            }}
          />
        )}
      </div>

      {/* Top overflow — same image, clips below circle midpoint */}
      
    </div>
  );
}
