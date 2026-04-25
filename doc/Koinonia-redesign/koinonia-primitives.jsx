/* ─── TOKENS ─────────────────────────────────────────────── */
const C = {
  bg: '#F7F4EF', surface: '#FFFFFF', surfaceRaised: '#FDFCFA',
  border: '#E8E3D9', borderStrong: '#CFC8BB',
  text: '#1A1612', textSec: '#7A7060', textTer: '#B0A898',
  gold: '#C4923A', goldLight: '#F5ECD9', goldMuted: '#EDD8AD',
  success: '#3D7A52', successLight: '#E8F4ED',
  warning: '#B07030', warningLight: '#FBF0E2',
  danger: '#9B3A2E', dangerLight: '#FBECEC',
  info: '#2E628B', infoLight: '#E8F2FA',
};

function fmt(n) {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/* ─── ICON ─────────────────────────────────────────────────── */
function Icon({ name, size = 20, fill = false, style = {} }) {
  return (
    <span
      className={'ms' + (fill ? ' ms-fill' : '')}
      style={{ fontSize: size, ...style }}
    >{name}</span>
  );
}

/* ─── BADGE ────────────────────────────────────────────────── */
function Badge({ children, color = 'gold' }) {
  const maps = {
    gold:    { bg: C.goldLight,    text: C.gold },
    success: { bg: C.successLight, text: C.success },
    warning: { bg: C.warningLight, text: C.warning },
    danger:  { bg: C.dangerLight,  text: C.danger },
    info:    { bg: C.infoLight,    text: C.info },
    neutral: { bg: '#F0EDE8',      text: C.textSec },
  };
  const s = maps[color] || maps.neutral;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', padding: '2px 8px',
      borderRadius: 99, fontSize: 11, fontWeight: 500, letterSpacing: '0.02em',
      background: s.bg, color: s.text,
    }}>{children}</span>
  );
}

/* ─── BTN ──────────────────────────────────────────────────── */
function Btn({ children, variant = 'primary', size = 'md', onClick, style = {}, disabled = false, icon, type = 'button' }) {
  const sizes = {
    sm: { padding: '6px 12px', fontSize: 13 },
    md: { padding: '8px 16px', fontSize: 14 },
    lg: { padding: '11px 22px', fontSize: 15 },
  };
  const variants = {
    primary:   { bg: C.text,        color: '#fff',    border: 'none',                   hoverBg: '#2E2820' },
    secondary: { bg: 'transparent', color: C.text,    border: `1px solid ${C.border}`,  hoverBg: C.surfaceRaised },
    gold:      { bg: C.gold,        color: '#fff',    border: 'none',                   hoverBg: '#A87B2F' },
    ghost:     { bg: 'transparent', color: C.textSec, border: 'none',                   hoverBg: '#F0EDE8' },
    danger:    { bg: C.dangerLight, color: C.danger,  border: `1px solid #F0CACA`,      hoverBg: '#F5DADA' },
  };
  const v = variants[variant];
  const s = sizes[size];
  const [hov, setHov] = React.useState(false);
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        borderRadius: 7, fontWeight: 500, lineHeight: 1,
        background: disabled ? '#E8E3D9' : (hov ? v.hoverBg : v.bg),
        color: disabled ? C.textTer : v.color,
        border: v.border || 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.12s ease', ...s, ...style,
      }}
    >
      {icon && <Icon name={icon} size={15} />}
      {children}
    </button>
  );
}

/* ─── INPUT ────────────────────────────────────────────────── */
function Input({ value, onChange, placeholder, type = 'text', icon, style = {}, onKeyDown }) {
  const [focus, setFocus] = React.useState(false);
  return (
    <div style={{ position: 'relative' }}>
      {icon && (
        <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: focus ? C.gold : C.textTer, transition: 'color 0.15s', pointerEvents: 'none' }}>
          <Icon name={icon} size={17} />
        </span>
      )}
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} onKeyDown={onKeyDown}
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        style={{
          width: '100%', height: 38, padding: icon ? '0 12px 0 36px' : '0 12px',
          border: `1px solid ${focus ? C.goldMuted : C.border}`,
          borderRadius: 7, fontSize: 14, background: C.surface,
          color: C.text, outline: 'none', transition: 'border 0.15s, box-shadow 0.15s',
          boxShadow: focus ? `0 0 0 3px ${C.goldLight}` : 'none', ...style,
        }}
      />
    </div>
  );
}

/* ─── SELECT ───────────────────────────────────────────────── */
function SelectInput({ value, onChange, options = [], placeholder, style = {} }) {
  const [focus, setFocus] = React.useState(false);
  return (
    <select value={value} onChange={onChange}
      onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
      style={{
        width: '100%', height: 38, padding: '0 36px 0 12px',
        border: `1px solid ${focus ? C.goldMuted : C.border}`,
        borderRadius: 7, fontSize: 14, background: C.surface,
        color: value ? C.text : C.textTer, outline: 'none',
        transition: 'border 0.15s, box-shadow 0.15s',
        boxShadow: focus ? `0 0 0 3px ${C.goldLight}` : 'none',
        appearance: 'none', cursor: 'pointer',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24'%3E%3Cpath fill='%23B0A898' d='M7 10l5 5 5-5z'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', ...style,
      }}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

/* ─── TEXTAREA ─────────────────────────────────────────────── */
function TextArea({ value, onChange, placeholder, rows = 3, style = {} }) {
  const [focus, setFocus] = React.useState(false);
  return (
    <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows}
      onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
      style={{
        width: '100%', padding: '8px 12px',
        border: `1px solid ${focus ? C.goldMuted : C.border}`,
        borderRadius: 7, fontSize: 14, background: C.surface,
        color: C.text, outline: 'none', resize: 'vertical', lineHeight: 1.6,
        transition: 'border 0.15s, box-shadow 0.15s',
        boxShadow: focus ? `0 0 0 3px ${C.goldLight}` : 'none', ...style,
      }}
    />
  );
}

/* ─── FORM FIELD ───────────────────────────────────────────── */
function FormField({ label, children, required, hint, style = {} }) {
  return (
    <div style={style}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: C.textSec, marginBottom: 5 }}>
        {label}{required && <span style={{ color: C.danger, marginLeft: 2 }}>*</span>}
      </label>
      {children}
      {hint && <p style={{ fontSize: 11, color: C.textTer, marginTop: 4 }}>{hint}</p>}
    </div>
  );
}

/* ─── CARD ─────────────────────────────────────────────────── */
function Card({ children, style = {}, padding = 20, onClick }) {
  const [hov, setHov] = React.useState(false);
  return (
    <div onClick={onClick}
      onMouseEnter={() => onClick && setHov(true)}
      onMouseLeave={() => onClick && setHov(false)}
      style={{
        background: C.surface,
        border: `1px solid ${hov ? C.borderStrong : C.border}`,
        borderRadius: 10, padding,
        transition: 'border 0.15s, box-shadow 0.15s',
        boxShadow: hov ? '0 2px 12px rgba(0,0,0,0.07)' : '0 1px 3px rgba(0,0,0,0.04)',
        cursor: onClick ? 'pointer' : 'default', ...style,
      }}
    >{children}</div>
  );
}

/* ─── EMPTY STATE ──────────────────────────────────────────── */
function EmptyState({ icon, title, sub, action }) {
  return (
    <div style={{ textAlign: 'center', padding: '64px 24px' }}>
      <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#F0EDE8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
        <Icon name={icon} size={22} style={{ color: C.textTer }} />
      </div>
      <p style={{ fontSize: 15, fontWeight: 500, color: C.text, marginBottom: 4 }}>{title}</p>
      <p style={{ fontSize: 13, color: C.textSec, marginBottom: action ? 20 : 0 }}>{sub}</p>
      {action}
    </div>
  );
}

/* ─── DRAWER ───────────────────────────────────────────────── */
function Drawer({ open, onClose, title, children, width = 500, footer }) {
  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(26,22,18,0.28)',
        opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none',
        transition: 'opacity 0.2s', zIndex: 100,
      }} />
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width,
        background: C.surface, borderLeft: `1px solid ${C.border}`,
        transform: open ? 'translateX(0)' : `translateX(${width}px)`,
        transition: 'transform 0.25s cubic-bezier(0.4,0,0.2,1)',
        zIndex: 101, display: 'flex', flexDirection: 'column',
        boxShadow: '-8px 0 40px rgba(0,0,0,0.1)',
      }}>
        <div style={{ padding: '18px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: C.text }}>{title}</h2>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 6, background: '#F0EDE8', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.textSec }}>
            <Icon name="close" size={18} />
          </button>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>{children}</div>
        {footer && (
          <div style={{ padding: '16px 24px', borderTop: `1px solid ${C.border}`, display: 'flex', gap: 8, justifyContent: 'flex-end', flexShrink: 0 }}>
            {footer}
          </div>
        )}
      </div>
    </>
  );
}

/* ─── SECTION TITLE ────────────────────────────────────────── */
function SectionTitle({ children, style = {} }) {
  return (
    <p style={{ fontSize: 11, fontWeight: 600, color: C.textTer, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12, ...style }}>
      {children}
    </p>
  );
}

/* ─── QR CODE SVG ──────────────────────────────────────────── */
function QRCodeSVG({ seed = 'koinonia', size = 160 }) {
  const G = 21;
  const cell = size / G;
  const hash = seed.split('').reduce((a, c, i) => (a * 31 + c.charCodeAt(0)) | 0, 7);

  const isFinder = (r, c) =>
    (r < 7 && c < 7) || (r < 7 && c >= G - 7) || (r >= G - 7 && c < 7);

  const finderFill = (r, c) => {
    const nr = r >= G - 7 ? r - (G - 7) : r;
    const nc = c >= G - 7 ? c - (G - 7) : c;
    return (nr === 0 || nr === 6 || nc === 0 || nc === 6) ||
      (nr >= 2 && nr <= 4 && nc >= 2 && nc <= 4);
  };

  const cells = [];
  for (let r = 0; r < G; r++) {
    for (let c = 0; c < G; c++) {
      let filled;
      if (isFinder(r, c)) filled = finderFill(r, c);
      else if (r === 7 || c === 7 || (r === G - 8 && c < 8) || (c === G - 8 && r < 8)) filled = false;
      else {
        const v = Math.abs(r * 37 + c * 23 + hash + r * c * 3) % 11;
        filled = v < 5;
      }
      if (filled) cells.push([r, c]);
    }
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect width={size} height={size} fill="white" rx="8" />
      {cells.map(([r, c]) => (
        <rect key={`${r}-${c}`} x={c * cell + 0.5} y={r * cell + 0.5}
          width={cell - 1} height={cell - 1} fill={C.text} rx="1" />
      ))}
    </svg>
  );
}

/* ─── FILTER TABS ──────────────────────────────────────────── */
function FilterTabs({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 4, padding: '3px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8 }}>
      {options.map(o => (
        <button key={o.key} onClick={() => onChange(o.key)}
          style={{
            padding: '5px 12px', borderRadius: 6, fontSize: 12.5,
            fontWeight: value === o.key ? 600 : 400,
            background: value === o.key ? C.text : 'transparent',
            color: value === o.key ? '#fff' : C.textSec,
            border: 'none', cursor: 'pointer', transition: 'all 0.12s',
          }}>{o.label}</button>
      ))}
    </div>
  );
}

/* ─── EXPORT ───────────────────────────────────────────────── */
Object.assign(window, {
  C, fmt, Icon, Badge, Btn, Input, SelectInput, TextArea,
  FormField, Card, EmptyState, Drawer, SectionTitle, QRCodeSVG, FilterTabs,
});
