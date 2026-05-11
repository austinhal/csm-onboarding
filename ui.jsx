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

// Logo placeholder mark — original geometric glyph (no brand IP)
function BrandMark({ size = 28, color = T.primary, light = false }) {
  const c = light ? '#ffffff' : color;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <svg width={size} height={size} viewBox="0 0 32 32">
        <circle cx="16" cy="16" r="14" fill="none" stroke={c} strokeWidth="1.5" />
        <path d="M 9 17 L 14 22 L 23 11" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="4" y1="13" x2="28" y2="13" stroke={c} strokeWidth="0.8" opacity="0.5" />
        <line x1="4" y1="19" x2="28" y2="19" stroke={c} strokeWidth="0.8" opacity="0.5" />
      </svg>
      <span style={{
        fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: size * 0.6,
        color: c, letterSpacing: '-0.015em',
      }}>Onward</span>
    </div>
  );
}

Object.assign(window, { ProgressRing, StatusPill, StatusDot, RingMotif, AccentBar, BrandMark });
