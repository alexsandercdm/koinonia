/* ─── EVENT CONTEXT PILL ─────────────────────────────────────── */
function EventPill({ event, onSwitch }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);

  React.useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!event) return null;
  const st = EVENTO_STATUS[event.status];

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '5px 10px 5px 9px', borderRadius: 8,
          border: `1px solid ${open ? C.goldMuted : C.border}`,
          background: open ? C.goldLight : C.surfaceRaised,
          cursor: 'pointer', transition: 'all 0.12s', color: C.text,
          boxShadow: open ? `0 0 0 3px ${C.goldLight}` : 'none',
        }}
      >
        <Icon name="calendar_month" size={15} style={{ color: C.gold }} />
        <span style={{ fontSize: 13, fontWeight: 500, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {event.nome}
        </span>
        <Badge color={st.color}>{st.label}</Badge>
        <Icon name={open ? 'expand_less' : 'expand_more'} size={16} style={{ color: C.textTer, marginLeft: 2 }} />
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0,
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 10, boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          minWidth: 320, zIndex: 50, overflow: 'hidden',
        }}>
          <div style={{ padding: '10px 14px 8px', borderBottom: `1px solid ${C.border}` }}>
            <p style={{ fontSize: 11, color: C.textTer, letterSpacing: '0.07em', textTransform: 'uppercase' }}>Trocar evento</p>
          </div>
          {EVENTOS.map(ev => {
            const s = EVENTO_STATUS[ev.status];
            const isActive = ev.id === event.id;
            return (
              <button key={ev.id}
                onClick={() => { onSwitch(ev); setOpen(false); }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px', border: 'none', cursor: 'pointer', textAlign: 'left',
                  background: isActive ? C.goldLight : 'transparent',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = C.surfaceRaised; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <span style={{ fontSize: 13, fontWeight: isActive ? 600 : 500, color: isActive ? C.gold : C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.nome}</span>
                    {isActive && <Icon name="check" size={14} style={{ color: C.gold, flexShrink: 0 }} />}
                  </div>
                  <span style={{ fontSize: 11, color: C.textTer }}>{ev.chacara} · {ev.data_inicio}</span>
                </div>
                <Badge color={s.color}>{s.label}</Badge>
              </button>
            );
          })}
          <div style={{ padding: '8px 14px 10px', borderTop: `1px solid ${C.border}` }}>
            <button style={{ fontSize: 12, color: C.gold, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Icon name="add" size={14} /> Novo evento
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── APP SHELL (updated) ────────────────────────────────────── */
function AppShell({ page, setPage, title, actions, children, selectedEvent, onSwitchEvent }) {
  return (
    <div style={{ display: 'flex', height: '100vh', background: C.bg, overflow: 'hidden' }}>
      <Sidebar page={page} setPage={setPage} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{
          height: 56, flexShrink: 0, background: C.surface,
          borderBottom: `1px solid ${C.border}`,
          display: 'flex', alignItems: 'center', gap: 16,
          padding: '0 24px',
        }}>
          {/* Page title */}
          <h1 style={{ fontSize: 15, fontWeight: 600, color: C.text, letterSpacing: '-0.01em', flexShrink: 0 }}>{title}</h1>

          {/* Divider */}
          {selectedEvent && <div style={{ width: 1, height: 18, background: C.border, flexShrink: 0 }} />}

          {/* Event context */}
          {selectedEvent && (
            <EventPill event={selectedEvent} onSwitch={onSwitchEvent} />
          )}

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Page actions */}
          <div style={{ display: 'flex', gap: 8 }}>{actions}</div>
        </header>
        <main style={{ flex: 1, overflow: 'auto', padding: 28 }}>{children}</main>
      </div>
    </div>
  );
}

Object.assign(window, { NAV, Sidebar, AppShell, EventPill });
