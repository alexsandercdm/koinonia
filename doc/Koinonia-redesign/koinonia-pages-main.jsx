/* ─── DASHBOARD ─────────────────────────────────────────────── */
const METRICS_DASH = [
  { label: 'Participantes', value: '84', sub: '+6 esta semana',   icon: 'group',                   color: C.info,    colorLight: C.infoLight    },
  { label: 'Inscrições',    value: '78', sub: '6 inadimplentes',  icon: 'assignment',               color: C.gold,    colorLight: C.goldLight    },
  { label: 'Acomodações',   value: '62 / 90', sub: '28 vagas livres', icon: 'bed',               color: C.success, colorLight: C.successLight },
  { label: 'Arrecadado',    value: 'R$ 23.400', sub: '68% da meta', icon: 'account_balance_wallet', color: C.warning, colorLight: C.warningLight },
];

const RECENT = [
  { nome: 'Ana Carolina Ferreira', papel: 'Encontrista', status: 'PAGO_TOTAL',   valor: 380 },
  { nome: 'Bruno Henrique Santos', papel: 'Servo',       status: 'PAGO_PARCIAL', valor: 200 },
  { nome: 'Camila Dias Oliveira',  papel: 'Encontrista', status: 'PENDENTE',     valor: 0   },
  { nome: 'Daniel Rocha Lima',     papel: 'Servo',       status: 'PAGO_TOTAL',   valor: 280 },
  { nome: 'Fernanda Mota Costa',   papel: 'Encontrista', status: 'LISTA_ESPERA', valor: 0   },
];

function DashboardPage({ setPage }) {
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* Event banner */}
      <Card style={{ marginBottom: 24, padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '28px 32px', borderLeft: `3px solid ${C.gold}`, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: C.gold, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Evento em andamento</p>
            <h2 style={{ fontSize: 22, fontWeight: 600, color: C.text, letterSpacing: '-0.02em', marginBottom: 4 }}>Retiro Koinonia 2025</h2>
            <p style={{ fontSize: 13, color: C.textSec }}>Chácara Paz e Amor · Juiz de Fora, MG · 18–20 jan 2025</p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <Btn variant="secondary" size="sm" onClick={() => setPage('acomodacoes')} icon="bed">Mapa</Btn>
            <Btn variant="primary"   size="sm" onClick={() => setPage('inscricoes')}  icon="assignment">Inscrições</Btn>
          </div>
        </div>
        <div style={{ height: 3, background: '#F0EDE8', position: 'relative' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: '68%', background: C.gold, borderRadius: '0 99px 99px 0' }} />
        </div>
        <div style={{ padding: '8px 32px', display: 'flex', justifyContent: 'flex-end' }}>
          <span style={{ fontSize: 11, color: C.textTer }}>68% da meta financeira atingida</span>
        </div>
      </Card>

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
        {METRICS_DASH.map(m => (
          <Card key={m.label} style={{ padding: 20 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: m.colorLight, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
              <Icon name={m.icon} size={18} style={{ color: m.color }} />
            </div>
            <div style={{ fontSize: 24, fontWeight: 600, color: C.text, letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 4 }}>{m.value}</div>
            <div style={{ fontSize: 12, color: C.textSec, marginBottom: 2 }}>{m.label}</div>
            <div style={{ fontSize: 11, color: C.textTer }}>{m.sub}</div>
          </Card>
        ))}
      </div>

      {/* Bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 14 }}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Inscrições recentes</h3>
            <button onClick={() => setPage('inscricoes')} style={{ fontSize: 12, color: C.gold, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>Ver todas</button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Participante','Papel','Status','Valor'].map(h => (
                  <th key={h} style={{ fontSize: 11, fontWeight: 500, color: C.textTer, textAlign: 'left', paddingBottom: 10, letterSpacing: '0.04em', textTransform: 'uppercase', borderBottom: `1px solid ${C.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RECENT.map((r, i) => {
                const st = STATUS_MAP[r.status];
                return (
                  <tr key={i}>
                    <td style={{ padding: '11px 0', borderBottom: i < RECENT.length-1 ? `1px solid ${C.border}` : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: C.goldLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: C.gold }}>{r.nome[0]}</span>
                        </div>
                        <span style={{ fontSize: 13, color: C.text, fontWeight: 500 }}>{r.nome}</span>
                      </div>
                    </td>
                    <td style={{ padding: '11px 8px', borderBottom: i < RECENT.length-1 ? `1px solid ${C.border}` : 'none', fontSize: 12, color: C.textSec }}>{r.papel}</td>
                    <td style={{ padding: '11px 8px', borderBottom: i < RECENT.length-1 ? `1px solid ${C.border}` : 'none' }}><Badge color={st.color}>{st.label}</Badge></td>
                    <td style={{ padding: '11px 0', borderBottom: i < RECENT.length-1 ? `1px solid ${C.border}` : 'none', fontSize: 13, color: r.valor ? C.text : C.textTer, textAlign: 'right' }}>{r.valor ? fmt(r.valor) : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>

        <Card>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 14 }}>Acesso rápido</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {NAV.slice(1).map(item => (
              <button key={item.page} onClick={() => setPage(item.page)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 7, background: 'transparent', border: `1px solid ${C.border}`, color: C.text, fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 0.12s', textAlign: 'left' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.goldMuted; e.currentTarget.style.background = C.goldLight; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border;    e.currentTarget.style.background = 'transparent'; }}
              >
                <Icon name={item.icon} size={16} style={{ color: C.textSec }} />
                {item.label}
                <Icon name="chevron_right" size={15} style={{ color: C.textTer, marginLeft: 'auto' }} />
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ─── CADASTRO PARTICIPANTE DRAWER ──────────────────────────── */
function CadastroParticipanteDrawer({ open, onClose }) {
  const [step, setStep] = React.useState(0);
  const [form, setForm] = React.useState({
    nome: '', email: '', telefone: '', cpf: '', nascimento: '', genero: '',
    emerg_nome: '', emerg_relacao: '', emerg_telefone: '',
    alergias: '', condicoes: '', restricoes: '', observacoes: '',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const STEPS = ['Dados pessoais', 'Contato de emergência', 'Saúde'];

  const handleClose = () => { onClose(); setTimeout(() => { setStep(0); }, 300); };

  const footer = (
    <>
      <Btn variant="secondary" onClick={step === 0 ? handleClose : () => setStep(s => s - 1)}>
        {step === 0 ? 'Cancelar' : 'Voltar'}
      </Btn>
      <Btn variant="primary" onClick={step < 2 ? () => setStep(s => s + 1) : handleClose} icon={step < 2 ? 'arrow_forward' : 'check'}>
        {step < 2 ? 'Próxima etapa' : 'Salvar participante'}
      </Btn>
    </>
  );

  return (
    <Drawer open={open} onClose={handleClose} title="Novo Participante" width={520} footer={footer}>
      {/* Step indicator */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 28, borderBottom: `1px solid ${C.border}` }}>
        {STEPS.map((s, i) => (
          <button key={i} onClick={() => setStep(i)}
            style={{
              flex: 1, padding: '8px 4px', fontSize: 12.5, fontWeight: step === i ? 600 : 400,
              color: step === i ? C.text : (i < step ? C.gold : C.textTer),
              border: 'none', background: 'transparent', cursor: 'pointer',
              borderBottom: step === i ? `2px solid ${C.gold}` : (i < step ? `2px solid ${C.goldMuted}` : '2px solid transparent'),
              marginBottom: -1, transition: 'all 0.12s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            <span style={{
              width: 18, height: 18, borderRadius: '50%', fontSize: 10, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: i < step ? C.gold : (step === i ? C.text : '#F0EDE8'),
              color: i <= step ? '#fff' : C.textTer,
            }}>{i < step ? '✓' : i + 1}</span>
            {s}
          </button>
        ))}
      </div>

      {/* Step 0: Dados pessoais */}
      {step === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <SectionTitle>Identificação</SectionTitle>
          <FormField label="Nome completo" required>
            <Input value={form.nome} onChange={e => set('nome', e.target.value)} placeholder="Ex.: Ana Carolina Ferreira" />
          </FormField>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormField label="E-mail" required>
              <Input value={form.email} onChange={e => set('email', e.target.value)} placeholder="ana@email.com" icon="mail" type="email" />
            </FormField>
            <FormField label="Telefone">
              <Input value={form.telefone} onChange={e => set('telefone', e.target.value)} placeholder="(32) 99999-0000" icon="phone" />
            </FormField>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormField label="CPF">
              <Input value={form.cpf} onChange={e => set('cpf', e.target.value)} placeholder="000.000.000-00" />
            </FormField>
            <FormField label="Data de nascimento">
              <Input value={form.nascimento} onChange={e => set('nascimento', e.target.value)} type="date" />
            </FormField>
          </div>
          <FormField label="Gênero" required>
            <div style={{ display: 'flex', gap: 8 }}>
              {[{ v: 'M', l: 'Masculino' }, { v: 'F', l: 'Feminino' }].map(g => (
                <button key={g.v} type="button" onClick={() => set('genero', g.v)}
                  style={{
                    flex: 1, height: 38, borderRadius: 7, fontSize: 14, fontWeight: 500,
                    border: `1px solid ${form.genero === g.v ? C.goldMuted : C.border}`,
                    background: form.genero === g.v ? C.goldLight : 'transparent',
                    color: form.genero === g.v ? C.gold : C.textSec,
                    cursor: 'pointer', transition: 'all 0.12s',
                  }}
                >{g.l}</button>
              ))}
            </div>
          </FormField>
        </div>
      )}

      {/* Step 1: Emergência */}
      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <SectionTitle>Contato de emergência</SectionTitle>
          <p style={{ fontSize: 13, color: C.textSec, marginBottom: 4 }}>Pessoa a ser contatada em caso de emergência durante o retiro.</p>
          <FormField label="Nome do contato">
            <Input value={form.emerg_nome} onChange={e => set('emerg_nome', e.target.value)} placeholder="Ex.: Maria Ferreira" />
          </FormField>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormField label="Relação / Parentesco">
              <SelectInput value={form.emerg_relacao} onChange={e => set('emerg_relacao', e.target.value)}
                placeholder="Selecionar..."
                options={[
                  { value: 'mae', label: 'Mãe' }, { value: 'pai', label: 'Pai' },
                  { value: 'conjuge', label: 'Cônjuge' }, { value: 'irmao', label: 'Irmão/Irmã' },
                  { value: 'amigo', label: 'Amigo(a)' }, { value: 'outro', label: 'Outro' },
                ]}
              />
            </FormField>
            <FormField label="Telefone do contato">
              <Input value={form.emerg_telefone} onChange={e => set('emerg_telefone', e.target.value)} placeholder="(32) 99999-0000" icon="phone" />
            </FormField>
          </div>
          <div style={{ marginTop: 8, padding: 14, background: C.infoLight, borderRadius: 8, display: 'flex', gap: 10 }}>
            <Icon name="info" size={16} style={{ color: C.info, flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 12, color: C.info, lineHeight: 1.6 }}>
              Esta informação é opcional mas fortemente recomendada para a segurança do participante.
            </p>
          </div>
        </div>
      )}

      {/* Step 2: Saúde */}
      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <SectionTitle>Informações de saúde</SectionTitle>
          <p style={{ fontSize: 13, color: C.textSec, marginBottom: 4 }}>Essas informações ajudam a equipe a cuidar bem do participante durante o retiro.</p>
          <FormField label="Alergias" hint="Liste substâncias ou alimentos que causam reação alérgica.">
            <TextArea value={form.alergias} onChange={e => set('alergias', e.target.value)} placeholder="Ex.: Amendoim, látex, penicilina..." rows={2} />
          </FormField>
          <FormField label="Condições médicas" hint="Doenças crônicas, deficiências ou condições relevantes.">
            <TextArea value={form.condicoes} onChange={e => set('condicoes', e.target.value)} placeholder="Ex.: Hipertensão, diabetes, asma..." rows={2} />
          </FormField>
          <FormField label="Restrições alimentares">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
              {['Vegetariano','Vegano','Sem glúten','Sem lactose','Halal','Kosher'].map(r => {
                const sel = form.restricoes.includes(r);
                return (
                  <button key={r} type="button"
                    onClick={() => set('restricoes', sel ? form.restricoes.replace(r,'').trim() : [form.restricoes, r].filter(Boolean).join(', '))}
                    style={{
                      padding: '5px 12px', borderRadius: 99, fontSize: 12.5, fontWeight: 500,
                      border: `1px solid ${sel ? C.goldMuted : C.border}`,
                      background: sel ? C.goldLight : 'transparent',
                      color: sel ? C.gold : C.textSec, cursor: 'pointer', transition: 'all 0.12s',
                    }}
                  >{sel && '✓ '}{r}</button>
                );
              })}
            </div>
          </FormField>
          <FormField label="Observações gerais">
            <TextArea value={form.observacoes} onChange={e => set('observacoes', e.target.value)} placeholder="Qualquer informação adicional relevante..." rows={3} />
          </FormField>
        </div>
      )}
    </Drawer>
  );
}

/* ─── PARTICIPANTES PAGE ─────────────────────────────────────── */
function ParticipantesPage() {
  const [search, setSearch]       = React.useState('');
  const [filter, setFilter]       = React.useState('todos');
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const FILTERS = [
    { key: 'todos',       label: 'Todos'       },
    { key: 'encontrista', label: 'Encontristas' },
    { key: 'servo',       label: 'Servos'       },
    { key: 'M',           label: 'Masculino'    },
    { key: 'F',           label: 'Feminino'     },
  ];

  const filtered = PARTICIPANTES.filter(p => {
    if (search && !p.nome.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === 'encontrista' && p.papel !== 'encontrista') return false;
    if (filter === 'servo'       && p.papel !== 'servo')       return false;
    if (filter === 'M'           && p.genero !== 'M')          return false;
    if (filter === 'F'           && p.genero !== 'F')          return false;
    return true;
  });

  const hasRestriction = p => !!(p.alergias || p.condicoes_medicas);

  return (
    <>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Toolbar */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, maxWidth: 340 }}>
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nome…" icon="search" />
          </div>
          <FilterTabs options={FILTERS} value={filter} onChange={setFilter} />
          <Btn variant="primary" icon="person_add" onClick={() => setDrawerOpen(true)} style={{ marginLeft: 'auto' }}>
            Novo participante
          </Btn>
        </div>

        <p style={{ fontSize: 12, color: C.textTer, marginBottom: 14 }}>{filtered.length} participante{filtered.length !== 1 ? 's' : ''}</p>

        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: C.surfaceRaised }}>
                {['Participante','Gênero','Papel','Contato','Restrições',''].map(h => (
                  <th key={h} style={{ padding: '10px 16px', fontSize: 11, fontWeight: 500, color: C.textTer, textAlign: 'left', borderBottom: `1px solid ${C.border}`, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={p.id}
                  style={{ borderBottom: i < filtered.length-1 ? `1px solid ${C.border}` : 'none', transition: 'background 0.1s' }}
                  onMouseEnter={e => e.currentTarget.style.background = C.surfaceRaised}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '13px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: p.genero === 'F' ? C.goldLight : C.infoLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: p.genero === 'F' ? C.gold : C.info }}>{p.nome[0]}</span>
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 500, color: C.text }}>{p.nome}</div>
                        <div style={{ fontSize: 11, color: C.textTer }}>{p.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '13px 16px', fontSize: 13, color: C.textSec }}>{p.genero === 'M' ? 'Masculino' : 'Feminino'}</td>
                  <td style={{ padding: '13px 16px' }}>
                    <Badge color={p.papel === 'encontrista' ? 'gold' : 'neutral'}>
                      {p.papel === 'encontrista' ? 'Encontrista' : 'Servo'}
                    </Badge>
                  </td>
                  <td style={{ padding: '13px 16px', fontSize: 12, color: C.textSec }}>{p.telefone || <span style={{ color: C.textTer }}>—</span>}</td>
                  <td style={{ padding: '13px 16px' }}>
                    {hasRestriction(p) ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: C.warning }}>
                        <Icon name="warning" size={14} />
                        <span style={{ fontSize: 12 }}>{p.alergias || p.condicoes_medicas}</span>
                      </div>
                    ) : <span style={{ fontSize: 12, color: C.textTer }}>—</span>}
                  </td>
                  <td style={{ padding: '13px 16px', textAlign: 'right' }}>
                    <button style={{ fontSize: 12, color: C.gold, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>Ver ficha</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      <CadastroParticipanteDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}

/* ─── INSCRIÇÕES PAGE ────────────────────────────────────────── */
function InscricoesPage() {
  const [statusF, setStatusF] = React.useState('todos');
  const [papelF,  setPapelF]  = React.useState('todos');
  const [search,  setSearch]  = React.useState('');

  const total        = INSCRICOES.length;
  const inadimplentes = INSCRICOES.filter(i => i.status === 'PENDENTE' || i.status === 'PAGO_PARCIAL').length;
  const pagos        = INSCRICOES.filter(i => i.status === 'PAGO_TOTAL').length;
  const arrecadado   = INSCRICOES.reduce((s, i) => s + i.valor_pago, 0);

  const SMETRICS = [
    { label: 'Total inscritos',  value: total,           icon: 'group',       color: C.info,    colorLight: C.infoLight    },
    { label: 'Inadimplentes',    value: inadimplentes,   icon: 'warning',     color: C.danger,  colorLight: C.dangerLight  },
    { label: 'Pagamento total',  value: pagos,           icon: 'check_circle',color: C.success, colorLight: C.successLight },
    { label: 'Arrecadado',       value: fmt(arrecadado), icon: 'payments',    color: C.gold,    colorLight: C.goldLight    },
  ];

  const filtered = INSCRICOES.filter(i => {
    if (search && !i.nome.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusF === 'inadimplentes' && i.status !== 'PENDENTE' && i.status !== 'PAGO_PARCIAL') return false;
    if (papelF !== 'todos' && i.papel !== papelF) return false;
    return true;
  });

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
        {SMETRICS.map(m => (
          <Card key={m.label} style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 38, height: 38, borderRadius: 9, background: m.colorLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name={m.icon} size={18} style={{ color: m.color }} />
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 600, color: C.text, lineHeight: 1, letterSpacing: '-0.02em' }}>{m.value}</div>
              <div style={{ fontSize: 11, color: C.textSec, marginTop: 2 }}>{m.label}</div>
            </div>
          </Card>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200, maxWidth: 300 }}>
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nome…" icon="search" />
        </div>
        <FilterTabs
          options={[{ key: 'todos', label: 'Todos' }, { key: 'inadimplentes', label: 'Inadimplentes' }]}
          value={statusF} onChange={setStatusF}
        />
        <FilterTabs
          options={[{ key: 'todos', label: 'Todos' }, { key: 'encontrista', label: 'Encontristas' }, { key: 'servo', label: 'Servos' }]}
          value={papelF} onChange={setPapelF}
        />
        <Btn variant="primary" icon="person_add" style={{ marginLeft: 'auto' }}>Nova inscrição</Btn>
      </div>

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: C.surfaceRaised }}>
              {['Participante','Papel','Status','Valor total','Pago','Débito',''].map(h => (
                <th key={h} style={{ padding: '10px 16px', fontSize: 11, fontWeight: 500, color: C.textTer, textAlign: h === 'Valor total' || h === 'Pago' || h === 'Débito' ? 'right' : 'left', borderBottom: `1px solid ${C.border}`, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((i, idx) => {
              const st = STATUS_MAP[i.status];
              const debito = i.valor_total - i.valor_pago;
              return (
                <tr key={i.id}
                  style={{ borderBottom: idx < filtered.length-1 ? `1px solid ${C.border}` : 'none', transition: 'background 0.1s' }}
                  onMouseEnter={e => e.currentTarget.style.background = C.surfaceRaised}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <div style={{ width: 30, height: 30, borderRadius: '50%', background: i.genero === 'F' ? C.goldLight : C.infoLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: i.genero === 'F' ? C.gold : C.info }}>{i.nome[0]}</span>
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 500, color: C.text }}>{i.nome}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: C.textSec }}>{i.papel === 'encontrista' ? 'Encontrista' : 'Servo'}</td>
                  <td style={{ padding: '12px 16px' }}><Badge color={st.color}>{st.label}</Badge></td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: C.text, textAlign: 'right' }}>{fmt(i.valor_total)}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: i.valor_pago > 0 ? C.success : C.textTer, textAlign: 'right' }}>{i.valor_pago > 0 ? fmt(i.valor_pago) : '—'}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: debito > 0 ? 500 : 400, color: debito > 0 ? C.danger : C.textTer, textAlign: 'right' }}>{debito > 0 ? fmt(debito) : '—'}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <button style={{ fontSize: 12, color: C.gold, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>Detalhar</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

/* ─── FINANCEIRO PAGE ────────────────────────────────────────── */
function FinanceiroPage() {
  const totalPrevisto   = 34200;
  const totalArrecadado = 23400;
  const totalDespesas   = 8200;
  const saldo = totalArrecadado - totalDespesas;
  const pct   = Math.round((totalArrecadado / totalPrevisto) * 100);

  const DESPESAS = [
    { cat: 'Alimentação', valor: 4800, pct: 58 },
    { cat: 'Hospedagem',  valor: 1800, pct: 22 },
    { cat: 'Material',    valor: 900,  pct: 11 },
    { cat: 'Transporte',  valor: 400,  pct: 5  },
    { cat: 'Outros',      valor: 300,  pct: 4  },
  ];

  const PAGAMENTOS = [
    { nome: 'Ana Carolina F.', data: '15/01', valor: 380, metodo: 'PIX'          },
    { nome: 'Daniel Rocha L.',  data: '14/01', valor: 280, metodo: 'PIX'          },
    { nome: 'Gabriel Silva N.', data: '14/01', valor: 380, metodo: 'Transferência' },
    { nome: 'Helena Costa B.',  data: '13/01', valor: 280, metodo: 'PIX'          },
    { nome: 'Bruno H. Santos',  data: '12/01', valor: 140, metodo: 'Dinheiro'     },
  ];

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Receita prevista', value: fmt(totalPrevisto),   icon: 'trending_up',       color: C.textSec, colorLight: '#F0EDE8'     },
          { label: 'Arrecadado',       value: fmt(totalArrecadado), icon: 'payments',           color: C.success, colorLight: C.successLight },
          { label: 'Despesas',         value: fmt(totalDespesas),   icon: 'receipt_long',       color: C.danger,  colorLight: C.dangerLight  },
          { label: 'Saldo líquido',    value: fmt(saldo),           icon: 'account_balance',    color: C.gold,    colorLight: C.goldLight    },
        ].map(m => (
          <Card key={m.label} style={{ padding: 20 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: m.colorLight, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
              <Icon name={m.icon} size={18} style={{ color: m.color }} />
            </div>
            <div style={{ fontSize: 20, fontWeight: 600, color: C.text, lineHeight: 1, letterSpacing: '-0.02em', marginBottom: 4 }}>{m.value}</div>
            <div style={{ fontSize: 12, color: C.textSec }}>{m.label}</div>
          </Card>
        ))}
      </div>

      <Card style={{ marginBottom: 24, padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 14 }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 500, color: C.text, marginBottom: 2 }}>Progresso da meta financeira</p>
            <p style={{ fontSize: 12, color: C.textSec }}>Break-even atingido quando chegar a 100%</p>
          </div>
          <span style={{ fontSize: 28, fontWeight: 700, color: C.gold, letterSpacing: '-0.03em' }}>{pct}%</span>
        </div>
        <div style={{ height: 8, borderRadius: 99, background: '#F0EDE8', overflow: 'hidden', marginBottom: 8 }}>
          <div style={{ height: '100%', width: `${pct}%`, background: C.gold, borderRadius: 99 }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11, color: C.textTer }}>Arrecadado: {fmt(totalArrecadado)}</span>
          <span style={{ fontSize: 11, color: C.textTer }}>Meta: {fmt(totalPrevisto)}</span>
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Card>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 18 }}>Despesas por categoria</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {DESPESAS.map(d => (
              <div key={d.cat}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 13, color: C.text }}>{d.cat}</span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: C.text }}>{fmt(d.valor)}</span>
                </div>
                <div style={{ height: 4, borderRadius: 99, background: '#F0EDE8', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${d.pct}%`, background: C.gold, borderRadius: 99 }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Últimos pagamentos</h3>
            <Btn variant="secondary" size="sm" icon="add">Registrar</Btn>
          </div>
          {PAGAMENTOS.map((p, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: i < PAGAMENTOS.length-1 ? `1px solid ${C.border}` : 'none' }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: C.goldLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: C.gold }}>{p.nome[0]}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: C.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.nome}</div>
                <div style={{ fontSize: 11, color: C.textTer }}>{p.data} · {p.metodo}</div>
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: C.success, flexShrink: 0 }}>+{fmt(p.valor)}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

Object.assign(window, { DashboardPage, CadastroParticipanteDrawer, ParticipantesPage, InscricoesPage, FinanceiroPage });
