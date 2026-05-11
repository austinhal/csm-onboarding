/* Shared UI primitives */
const { useState: useStateUI, useEffect: useEffectUI, useRef: useRefUI } = React;

function ProgressRing({ value, size = 72, stroke = 6, color, track = '#e6e2d8', showLabel = true, labelColor }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = c * Math.max(0, Math.min(1, value));
  return (
    <svg width={size} height={size} style={{ display: 'block' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
      <circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color || T.primary} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={`${dash} ${c - dash}`}
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition: 'stroke-dasharray 0.6s cubic-bezier(.2,.8,.2,1)' }}
      />
      {showLabel && (
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central"
              style={{ font: `400 ${Math.round(size * 0.28)}px Inter, sans-serif`, fill: labelColor || T.primary, letterSpacing: '-0.01em' }}>
          {Math.round(value * 100)}%
        </text>
      )}
    </svg>
  );
}

function StatusPill({ statusId, size = 'md' }) {
  const s = STATUS_BY_ID[statusId] || STATUS_BY_ID.not_started;
  const padding = size === 'sm' ? '3px 8px' : '4px 10px';
  const fs = size === 'sm' ? 10.5 : 11.5;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: s.bg, color: s.fg, padding, borderRadius: 999,
      fontSize: fs, fontWeight: 500, letterSpacing: '0.02em',
      fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap',
    }}>
      <span style={{ fontSize: fs + 1, lineHeight: 1 }}>{s.dot}</span>
      {s.label}
    </span>
  );
}

function StatusDot({ statusId, size = 10 }) {
  const s = STATUS_BY_ID[statusId] || STATUS_BY_ID.not_started;
  return <span style={{ color: s.fg, fontSize: size, lineHeight: 1 }}>{s.dot}</span>;
}

// Decorative concentric-ring motif. Whisper-opacity. Original, not Verisk's data device.
function RingMotif({ size = 280, color = T.primary, style = {} }) {
  const center = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
         style={{ position: 'absolute', pointerEvents: 'none', ...style }}>
      <g style={{ opacity: 0.1 }}>
        {[0.95, 0.78, 0.60, 0.42, 0.25].map((f, i) => (
          <circle key={i} cx={center} cy={center} r={size * f / 2}
                  fill="none" stroke={color} strokeWidth={i === 0 ? 1.2 : 0.8}
                  strokeDasharray={i % 2 === 0 ? 'none' : '2 4'} />
        ))}
        {/* radial tick marks */}
        {Array.from({ length: 24 }).map((_, i) => {
          const angle = (i / 24) * Math.PI * 2;
          const x1 = center + Math.cos(angle) * size * 0.48;
          const y1 = center + Math.sin(angle) * size * 0.48;
          const x2 = center + Math.cos(angle) * size * 0.50;
          const y2 = center + Math.sin(angle) * size * 0.50;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={0.8} />;
        })}
        {/* quarter arc accent */}
        <path d={`M ${center} ${center - size * 0.33} A ${size*0.33} ${size*0.33} 0 0 1 ${center + size*0.33} ${center}`}
              fill="none" stroke={color} strokeWidth={2} />
      </g>
    </svg>
  );
}

// 3-segment accent bar
function AccentBar({ height = 3 }) {
  return (
    <div style={{ display: 'flex', height, width: '100%' }}>
      <div style={{ flex: 6, background: T.primary }} />
      <div style={{ flex: 2, background: T.accent }} />
      <div style={{ flex: 2, background: '#c2582a' }} />
    </div>
  );
}

function BrandMark({ size = 28, light = false }) {
  const c0 = light ? '#ffffff' : '#00358E';
  const c1 = light ? 'rgba(255,255,255,0.75)' : '#2A7DE1';
  return (
    <svg width={size} height={Math.round(size * 44.9 / 45.8)} viewBox="0 0 45.8 44.9">
      <path fill={c0} d="M3.3,10.8C3.6,10.3,4.2,10,4.8,10h7.1c0.3,0,0.4,0.3,0.3,0.5l-1.9,4.3C10.2,14.9,10.1,15,10,15H1.8c-0.3,0-0.4-0.3-0.3-0.5C2,13.1,2.6,11.9,3.3,10.8z M9.6,5C9.3,5,9.1,4.5,9.4,4.3C13.2,1.6,17.9,0,23,0s9.7,1.6,13.5,4.4C36.8,4.6,36.6,5,36.3,5H9.6z M15.8,40.1c0.1-0.1,0.2-0.2,0.3-0.2L36.2,40c0.3,0,0.5,0.4,0.2,0.6c-3.8,2.7-8.5,4.3-13.5,4.3c-2.9,0-5.6-0.5-8.1-1.5c-0.2-0.1-0.3-0.3-0.2-0.5L15.8,40.1z M18.3,34.4l1.9-4.3c0.1-0.1,0.2-0.2,0.3-0.2L44,30c0.3,0,0.4,0.3,0.3,0.5c-0.5,1.3-1.1,2.5-1.8,3.7C42.2,34.7,41.6,35,41,35l-22.3-0.1C18.4,34.9,18.2,34.6,18.3,34.4z M45.7,20.3c0.1,0.7,0.1,1.4,0.1,2.2c0,0.7,0,1.5-0.1,2.2c0,0.2-0.2,0.3-0.4,0.3L23,24.9c-0.3,0-0.4-0.3-0.3-0.5l1.2-2.8c0.5-1,1.5-1.7,2.6-1.7h18.8C45.5,20,45.7,20.2,45.7,20.3z" />
      <path fill={c1} d="M44.3,14.5c-0.5-1.3-1.1-2.5-1.8-3.7C42.2,10.3,41.6,10,41,10H19.7c-1.1,0-2,0.6-2.5,1.6l-7.1,16.1c0,0.1-0.1,0.1-0.2,0.1c-0.1,0-0.1,0-0.2-0.1L7,21.5c-0.4-1-1.4-1.6-2.5-1.6h-4c-0.2,0-0.3,0.1-0.4,0.3C0,21,0,21.7,0,22.5c0,0.7,0,1.4,0.1,2.2c0,0.2,0.2,0.3,0.4,0.3h2.1c0.1,0,0.3,0.1,0.3,0.2c0.6,1.3,3.5,8,5.4,12.3c0.3,0.7,1,1.1,1.6,1.1c0.7,0,1.3-0.4,1.6-1.1l9.2-20.9c0.4-1,1.4-1.6,2.5-1.6H44C44.2,15,44.4,14.7,44.3,14.5z" />
    </svg>
  );
}

Object.assign(window, { ProgressRing, StatusPill, StatusDot, RingMotif, AccentBar, BrandMark });
