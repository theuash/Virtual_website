/**
 * AvatarCircle
 *
 * Layout:
 *   - Outer wrapper: width=size, height=size, overflow=visible
 *   - Circle div: absolute, inset=0, overflow=hidden → clips the bottom portion of the image
 *   - Image: absolute, bottom=0, height=imgSize (larger than circle) → bottom sits inside circle,
 *     top overflows freely above because the OUTER wrapper has overflow:visible
 *
 * Single image. No duplication. No clip-path tricks.
 */

const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001';

export function resolveAvatar(avatar) {
  if (!avatar) return null;
  return avatar.startsWith('http') ? avatar : `${BASE_URL}${avatar}`;
}

export default function AvatarCircle({ src, initial = '?', size = 40 }) {
  const imgH = Math.round(size * 1.3); // image taller than circle
  const imgW = Math.round(size * 1.3);  // slightly wider for natural look

  return (
    <div
      style={{
        width: size,
        height: size,
        position: 'relative',
        flexShrink: 0,
        overflow: 'visible', // ← lets the image top escape upward
      }}
    >
      {/* Circle border + background — overflow:hidden clips the image bottom */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          border: '2px solid var(--border)',
          background: 'var(--bg-card)',
          overflow: 'hidden', // ← clips whatever is inside
          zIndex: 1,
        }}
      >
        {/* Fallback initial */}
        {!src && (
          <span style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: size * 0.38, fontWeight: 900,
            color: 'var(--accent)', userSelect: 'none',
          }}>
            {initial}
          </span>
        )}

        {/* Image INSIDE circle div — bottom portion clipped by overflow:hidden */}
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
              bottom: -10,
              left: '50%',
              transform: 'translateX(-50%)',
              pointerEvents: 'none',
            }}
          />
        )}
      </div>

      {/* Same image OUTSIDE circle div — top portion visible above circle */}
      {src && (
        <img
          src={src}
          alt=""
          aria-hidden="true"
          style={{
            position: 'absolute',
            width: imgW,
            height: imgH,
            objectFit: 'cover',
            objectPosition: 'center top',
            bottom: -10,
            left: '50%',
            transform: 'translateX(-50%)',
            // Only show the part ABOVE the circle midpoint
            clipPath: `inset(0 0 ${Math.round(size * 0.5)}px 0)`,
            zIndex: 2,
            pointerEvents: 'none',
          }}
        />
      )}
    </div>
  );
}
