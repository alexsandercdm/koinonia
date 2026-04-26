/* ─── EVENT SELECTOR SCREEN ─────────────────────────────────── */
function EventSelectorScreen({ onSelect, userName = 'Admin' }) {
  const [hovered, setHovered] = React.useState(null);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={{ height: 56, background: C.surface, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: C.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="diversity_3" size={15} style={{ color: '#fff' }} />
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, color: C.text }}>Koinonia</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: C.goldLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: C.gold }}>A</span>
          </div>
          <span style={{ fontSize: 13, color: C.textSec }}>{userName}</span>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: 680 }}>
          {/* Heading */}
          <div style={{ marginBottom: 36 }}>
            <p style={{ fontSize: 13, color: C.gold, fontWeight: 500, marginBottom: 6 }}>{greeting}, {userName}</p>
            <h2 style={{ fontSize: 28, fontWeight: 600, color: C.text, letterSpacing: '-0.02em', marginBottom: 8 }}>
              Selecione o evento
            </h2>
            <p style={{ fontSize: 14, color: C.textSec }}>
              Todos os dados do painel serão filtrados pelo evento escolhido.
            </p>
          </div>

          {/* Event cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
            {EVENTOS.map(ev => {
              const st = EVENTO_STATUS[ev.status];
              const pct = Math.round((ev.inscritos / ev.capacidade) * 100);
              const isActive = ev.status === 'EM_ANDAMENTO';
              const isHov = hovered === ev.id;

              return (
                <button key={ev.id}
                  onClick={() => onSelect(ev)}
                  onMouseEnter={() => setHovered(ev.id)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer',
                    background: C.surface,
                    borderRadius: 12,
                    border: `1px solid ${isActive ? C.goldMuted : (isHov ? C.borderStrong : C.border)}`,
                    boxShadow: isHov ? '0 4px 16px rgba(0,0,0,0.08)' : '0 1px 3px rgba(0,0,0,0.04)',
                    transition: 'all 0.15s',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                    {/* Status stripe */}
                    <div style={{ width: 4, alignSelf: 'stretch', background: isActive ? C.gold : C.border, flexShrink: 0 }} />

                    {/* Main content */}
                    <div style={{ flex: 1, padding: '18px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 12 }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                            <Badge color={st.color}>{st.label}</Badge>
                            {isActive && (
                              <span style={{ fontSize: 11, color: C.success, display: 'flex', alignItems: 'center', gap: 4 }}>
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.success, display: 'inline-block' }} />
                                Ao vivo
                              </span>
                            )}
                          </div>
                          <h3 style={{ fontSize: 16, fontWeight: 600, color: C.text, letterSpacing: '-0.01em', marginBottom: 3 }}>{ev.nome}</h3>
                          <div style={{ display: 'flex', gap: 14 }}>
                            <span style={{ fontSize: 12, color: C.textSec, display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Icon name="villa" size={13} style={{ color: C.textTer }} />{ev.chacara}
                            </span>
                            <span style={{ fontSize: 12, color: C.textSec, display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Icon name="calendar_today" size={13} style={{ color: C.textTer }} />{ev.data_inicio} → {ev.data_fim}
                            </span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, color: isHov ? C.gold : C.textTer, transition: 'color 0.15s' }}>
                          <span style={{ fontSize: 13, fontWeight: 500 }}>Entrar</span>
                          <Icon name="arrow_forward" size={16} />
                        </div>
                      </div>

                      {/* Progress */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                          <span style={{ fontSize: 11, color: C.textTer }}>Inscrições</span>
                          <span style={{ fontSize: 11, fontWeight: 500, color: C.text }}>{ev.inscritos} / {ev.capacidade}</span>
                        </div>
                        <div style={{ height: 4, borderRadius: 99, background: '#F0EDE8', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: isActive ? C.gold : C.borderStrong, borderRadius: 99, transition: 'width 0.4s ease' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Create new */}
          <button style={{
            width: '100%', padding: '14px', borderRadius: 12, cursor: 'pointer',
            background: 'transparent', border: `1px dashed ${C.border}`,
            color: C.textTer, fontSize: 13, fontWeight: 500,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            transition: 'all 0.12s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.goldMuted; e.currentTarget.style.color = C.gold; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textTer; }}
          >
            <Icon name="add" size={16} /> Criar novo evento
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── CHECK-IN OVERLAY ───────────────────────────────────────── */
function CheckinOverlay({ evento, participante, onClose }) {
  const [confirmed, setConfirmed] = React.useState(false);

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(26,22,18,0.75)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 200, padding: 24,
    }}>
      {/* Close */}
      <button onClick={onClose} style={{ position: 'absolute', top: 24, right: 24, width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', zIndex: 201 }}>
        <Icon name="close" size={20} />
      </button>

      {/* Phone frame */}
      <div style={{
        width: 375, background: C.bg, borderRadius: 44,
        border: `8px solid ${C.text}`,
        boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
        maxHeight: '90vh',
      }}>
        {/* Status bar */}
        <div style={{ height: 50, background: C.surface, display: 'flex', alignItems: 'flex-end', padding: '0 24px 8px', justifyContent: 'space-between', flexShrink: 0, position: 'relative' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>9:41</span>
          {/* Dynamic island */}
          <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', width: 110, height: 28, background: C.text, borderRadius: 20 }} />
          <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
            <Icon name="signal_cellular_alt" size={13} style={{ color: C.text }} />
            <Icon name="wifi" size={13} style={{ color: C.text }} />
            <Icon name="battery_5_bar" size={13} style={{ color: C.text }} />
          </div>
        </div>

        {/* Page content */}
        <div style={{ flex: 1, overflow: 'auto', background: C.surface }}>
          {/* Header */}
          <div style={{ padding: '16px 24px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: C.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="diversity_3" size={13} style={{ color: '#fff' }} />
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Koinonia</span>
          </div>

          <div style={{ padding: '20px 24px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Page title */}
            <div>
              <p style={{ fontSize: 11, color: C.textTer, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>Seu ingresso</p>
              <h2 style={{ fontSize: 20, fontWeight: 600, color: C.text, letterSpacing: '-0.02em', lineHeight: 1.2 }}>{evento.nome}</h2>
            </div>

            {/* Event info card */}
            <div style={{ padding: 14, background: C.bg, borderRadius: 12, border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { icon: 'villa',            text: evento.chacara },
                { icon: 'calendar_today',   text: `${evento.data_inicio} → ${evento.data_fim}` },
              ].map(item => (
                <div key={item.icon} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icon name={item.icon} size={14} style={{ color: C.textTer }} />
                  <span style={{ fontSize: 13, color: C.textSec }}>{item.text}</span>
                </div>
              ))}
            </div>

            {/* Participant */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: C.goldLight, borderRadius: 12, border: `1px solid ${C.goldMuted}` }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: C.gold, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>{participante.nome[0]}</span>
              </div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 600, color: C.text, lineHeight: 1.2 }}>{participante.nome}</p>
                <p style={{ fontSize: 12, color: C.gold, marginTop: 2 }}>{participante.papel === 'encontrista' ? 'Encontrista' : 'Servo'}</p>
              </div>
            </div>

            {/* QR Code or Confirmed */}
            {!confirmed ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <div style={{ padding: 16, background: '#fff', borderRadius: 12, border: `1px solid ${C.border}`, boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
                  <QRCodeSVG seed={`evento-${evento.id}-part-${participante.id}`} size={178} />
                </div>
                <p style={{ fontSize: 12, color: C.textSec, textAlign: 'center', lineHeight: 1.6 }}>
                  Apresente este QR code na entrada do evento para fazer seu check-in.
                </p>
                <p style={{ fontSize: 11, color: C.textTer, fontFamily: 'monospace', letterSpacing: '0.12em' }}>
                  KOI-{evento.id.toString().padStart(2,'0')}-{participante.id.toString().padStart(4,'0')}
                </p>
                {/* Simulate button (for prototype only) */}
                <button onClick={() => setConfirmed(true)}
                  style={{ width: '100%', height: 48, borderRadius: 12, background: C.text, color: '#fff', fontWeight: 600, fontSize: 15, border: 'none', cursor: 'pointer', marginTop: 4 }}>
                  Simular leitura do QR ↗
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: '8px 0' }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: C.successLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="check_circle" size={42} fill style={{ color: C.success }} />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 18, fontWeight: 600, color: C.success, marginBottom: 4 }}>Check-in confirmado!</p>
                  <p style={{ fontSize: 13, color: C.textSec }}>Bem-vindo ao retiro, {participante.nome.split(' ')[0]}!</p>
                </div>
                <div style={{ padding: '10px 20px', background: C.successLight, borderRadius: 8, border: `1px solid #C0DCC8` }}>
                  <p style={{ fontSize: 12, color: C.success, textAlign: 'center' }}>
                    Check-in registrado em {new Date().toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                  </p>
                </div>
                <button onClick={() => setConfirmed(false)}
                  style={{ fontSize: 13, color: C.textSec, background: 'none', border: 'none', cursor: 'pointer' }}>
                  ← Voltar ao QR code
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Home indicator */}
        <div style={{ height: 28, background: C.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <div style={{ width: 120, height: 4, borderRadius: 99, background: C.borderStrong }} />
        </div>
      </div>
    </div>
  );
}

/* ─── EVENTO FORM DRAWER ─────────────────────────────────────── */
function EventoFormDrawer({ open, onClose }) {
  const [form, setForm] = React.useState({
    nome: '', chacara_id: '', data_inicio: '', data_fim: '',
    capacidade: '', valor_encontrista: '', valor_servo: '',
    status: 'PLANEJAMENTO', descricao: '',
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const footer = (
    <>
      <Btn variant="secondary" onClick={onClose}>Cancelar</Btn>
      <Btn variant="primary" icon="check" onClick={onClose}>Criar evento</Btn>
    </>
  );

  return (
    <Drawer open={open} onClose={onClose} title="Novo Evento" width={520} footer={footer}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <SectionTitle>Identificação</SectionTitle>
        <FormField label="Nome do evento" required>
          <Input value={form.nome} onChange={e => set('nome', e.target.value)} placeholder="Ex.: Retiro Koinonia 2025" />
        </FormField>
        <FormField label="Descrição" hint="Opcional. Visível para os participantes.">
          <TextArea value={form.descricao} onChange={e => set('descricao', e.target.value)} placeholder="Breve descrição do evento..." rows={2} />
        </FormField>

        <div style={{ height: 1, background: C.border, margin: '4px 0' }} />
        <SectionTitle>Local e datas</SectionTitle>

        <FormField label="Chácara / Local" required>
          <SelectInput value={form.chacara_id} onChange={e => set('chacara_id', e.target.value)}
            placeholder="Selecionar local..."
            options={CHACARAS.map(c => ({ value: c.id, label: `${c.nome} — ${c.cidade}` }))}
          />
        </FormField>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <FormField label="Data de início" required>
            <Input value={form.data_inicio} onChange={e => set('data_inicio', e.target.value)} type="date" />
          </FormField>
          <FormField label="Data de término" required>
            <Input value={form.data_fim} onChange={e => set('data_fim', e.target.value)} type="date" />
          </FormField>
        </div>

        <div style={{ height: 1, background: C.border, margin: '4px 0' }} />
        <SectionTitle>Configurações</SectionTitle>

        <FormField label="Capacidade máxima (pessoas)" required>
          <Input value={form.capacidade} onChange={e => set('capacidade', e.target.value)} placeholder="Ex.: 90" type="number" />
        </FormField>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <FormField label="Valor — Encontrista (R$)">
            <Input value={form.valor_encontrista} onChange={e => set('valor_encontrista', e.target.value)} placeholder="380,00" type="number" icon="payments" />
          </FormField>
          <FormField label="Valor — Servo (R$)">
            <Input value={form.valor_servo} onChange={e => set('valor_servo', e.target.value)} placeholder="280,00" type="number" icon="payments" />
          </FormField>
        </div>
        <FormField label="Status inicial">
          <SelectInput value={form.status} onChange={e => set('status', e.target.value)}
            options={[
              { value: 'PLANEJAMENTO',  label: 'Planejamento' },
              { value: 'ABERTO',        label: 'Aberto para inscrições' },
              { value: 'EM_ANDAMENTO',  label: 'Em andamento' },
              { value: 'ENCERRADO',     label: 'Encerrado' },
            ]}
          />
        </FormField>
      </div>
    </Drawer>
  );
}

/* ─── EVENTOS PAGE ───────────────────────────────────────────── */
function EventosPage() {
  const [drawerOpen, setDrawerOpen]   = React.useState(false);
  const [checkin, setCheckin]         = React.useState(null); // { evento, participante }
  const [statusF, setStatusF]         = React.useState('todos');

  const filtered = statusF === 'todos' ? EVENTOS : EVENTOS.filter(e => e.status === statusF);

  const ST_OPTS = [
    { key: 'todos',        label: 'Todos'         },
    { key: 'EM_ANDAMENTO', label: 'Em andamento'  },
    { key: 'PLANEJAMENTO', label: 'Planejamento'  },
    { key: 'ENCERRADO',    label: 'Encerrado'     },
  ];

  const openCheckin = (evento) => {
    setCheckin({ evento, participante: PARTICIPANTES[0] });
  };

  return (
    <>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Toolbar */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, alignItems: 'center' }}>
          <FilterTabs options={ST_OPTS} value={statusF} onChange={setStatusF} />
          <Btn variant="primary" icon="add" onClick={() => setDrawerOpen(true)} style={{ marginLeft: 'auto' }}>
            Novo evento
          </Btn>
        </div>

        {/* Event cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.map(ev => {
            const st = EVENTO_STATUS[ev.status];
            const pct = Math.round((ev.inscritos / ev.capacidade) * 100);
            const isActive = ev.status === 'EM_ANDAMENTO';
            return (
              <Card key={ev.id} style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'stretch' }}>
                  {/* Left accent bar */}
                  <div style={{ width: 4, background: isActive ? C.gold : C.border, flexShrink: 0 }} />

                  {/* Content */}
                  <div style={{ flex: 1, padding: '20px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 16 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                          <Badge color={st.color}>{st.label}</Badge>
                          {isActive && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: C.success }}>
                              <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.success, display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
                              Ao vivo
                            </span>
                          )}
                        </div>
                        <h3 style={{ fontSize: 17, fontWeight: 600, color: C.text, letterSpacing: '-0.01em', marginBottom: 4 }}>{ev.nome}</h3>
                        <div style={{ display: 'flex', gap: 16 }}>
                          <span style={{ fontSize: 12, color: C.textSec, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Icon name="villa" size={13} style={{ color: C.textTer }} />
                            {ev.chacara}
                          </span>
                          <span style={{ fontSize: 12, color: C.textSec, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Icon name="calendar_today" size={13} style={{ color: C.textTer }} />
                            {ev.data_inicio} → {ev.data_fim}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                        <Btn variant="secondary" size="sm" icon="qr_code_2" onClick={() => openCheckin(ev)}>
                          Check-in QR
                        </Btn>
                        <Btn variant="secondary" size="sm" icon="edit">Editar</Btn>
                      </div>
                    </div>

                    {/* Progress + metrics */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: 20, alignItems: 'center' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                          <span style={{ fontSize: 12, color: C.textSec }}>Inscrições</span>
                          <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{ev.inscritos} / {ev.capacidade}</span>
                        </div>
                        <div style={{ height: 5, borderRadius: 99, background: '#F0EDE8', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: pct > 90 ? C.danger : C.gold, borderRadius: 99 }} />
                        </div>
                        <span style={{ fontSize: 11, color: C.textTer, marginTop: 3, display: 'block' }}>{100 - pct}% de vagas disponíveis</span>
                      </div>
                      <div style={{ textAlign: 'center', paddingLeft: 16, borderLeft: `1px solid ${C.border}` }}>
                        <p style={{ fontSize: 18, fontWeight: 600, color: C.text, lineHeight: 1 }}>{fmt(ev.valor_encontrista)}</p>
                        <p style={{ fontSize: 11, color: C.textTer, marginTop: 2 }}>Encontrista</p>
                      </div>
                      <div style={{ textAlign: 'center', paddingLeft: 16, borderLeft: `1px solid ${C.border}` }}>
                        <p style={{ fontSize: 18, fontWeight: 600, color: C.text, lineHeight: 1 }}>{fmt(ev.valor_servo)}</p>
                        <p style={{ fontSize: 11, color: C.textTer, marginTop: 2 }}>Servo</p>
                      </div>
                      <div style={{ paddingLeft: 16, borderLeft: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <button style={{ fontSize: 12, color: C.gold, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, textAlign: 'left' }}>Ver inscrições →</button>
                        <button style={{ fontSize: 12, color: C.info, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, textAlign: 'left' }}>Mapa de camas →</button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}

          {filtered.length === 0 && (
            <EmptyState icon="event" title="Nenhum evento encontrado" sub="Altere os filtros ou crie um novo evento." />
          )}
        </div>
      </div>

      <EventoFormDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      {checkin && (
        <CheckinOverlay evento={checkin.evento} participante={checkin.participante} onClose={() => setCheckin(null)} />
      )}
    </>
  );
}

Object.assign(window, { EventosPage, CheckinOverlay, EventSelectorScreen });
