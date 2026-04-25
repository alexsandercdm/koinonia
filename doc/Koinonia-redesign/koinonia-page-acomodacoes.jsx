/* ─── CHÁCARA FORM DRAWER ─────────────────────────────────── */
function ChacacaFormDrawer({ open, onClose }) {
  const [form, setForm] = React.useState({ nome: '', endereco: '', cidade: '', capacidade: '' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const footer = (
    <>
      <Btn variant="secondary" onClick={onClose}>Cancelar</Btn>
      <Btn variant="primary" icon="check" onClick={onClose}>Salvar chácara</Btn>
    </>
  );

  return (
    <Drawer open={open} onClose={onClose} title="Nova Chácara / Local" width={480} footer={footer}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <SectionTitle>Informações do local</SectionTitle>
        <FormField label="Nome do local" required>
          <Input value={form.nome} onChange={e => set('nome', e.target.value)} placeholder="Ex.: Chácara Paz e Amor" />
        </FormField>
        <FormField label="Endereço completo">
          <Input value={form.endereco} onChange={e => set('endereco', e.target.value)} placeholder="Estrada do Retiro, 1200 — Zona Rural" icon="location_on" />
        </FormField>
        <FormField label="Cidade / Estado">
          <Input value={form.cidade} onChange={e => set('cidade', e.target.value)} placeholder="Juiz de Fora, MG" />
        </FormField>
        <FormField label="Capacidade total (pessoas)" hint="Capacidade máxima do local, independente dos quartos.">
          <Input value={form.capacidade} onChange={e => set('capacidade', e.target.value)} placeholder="Ex.: 120" type="number" />
        </FormField>
        <div style={{ marginTop: 8, padding: 14, background: C.goldLight, borderRadius: 8, display: 'flex', gap: 10 }}>
          <Icon name="info" size={16} style={{ color: C.gold, flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 12, color: C.gold, lineHeight: 1.6 }}>
            Após criar a chácara, você poderá adicionar quartos e camas individualmente.
          </p>
        </div>
      </div>
    </Drawer>
  );
}

/* ─── QUARTO FORM DRAWER ─────────────────────────────────────── */
function QuartoFormDrawer({ open, onClose, chacacaNome }) {
  const [form, setForm] = React.useState({ nome: '', genero: '', capacidade: '' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const footer = (
    <>
      <Btn variant="secondary" onClick={onClose}>Cancelar</Btn>
      <Btn variant="primary" icon="check" onClick={onClose}>Salvar quarto</Btn>
    </>
  );

  return (
    <Drawer open={open} onClose={onClose} title="Novo Quarto" width={440} footer={footer}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {chacacaNome && (
          <div style={{ padding: '8px 12px', background: C.surfaceRaised, borderRadius: 7, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="apartment" size={15} style={{ color: C.textTer }} />
            <span style={{ fontSize: 12, color: C.textSec }}>Vinculado a: <strong style={{ color: C.text }}>{chacacaNome}</strong></span>
          </div>
        )}
        <SectionTitle>Dados do quarto</SectionTitle>
        <FormField label="Nome / Identificação" required>
          <Input value={form.nome} onChange={e => set('nome', e.target.value)} placeholder="Ex.: Quarto 01, Ala Feminina..." />
        </FormField>
        <FormField label="Gênero" required>
          <div style={{ display: 'flex', gap: 8 }}>
            {[{ v: 'M', l: 'Masculino', icon: 'male' }, { v: 'F', l: 'Feminino', icon: 'female' }].map(g => (
              <button key={g.v} type="button" onClick={() => set('genero', g.v)}
                style={{
                  flex: 1, height: 44, borderRadius: 7, fontSize: 14, fontWeight: 500,
                  border: `1px solid ${form.genero === g.v ? (g.v === 'F' ? C.goldMuted : '#B8D4E8') : C.border}`,
                  background: form.genero === g.v ? (g.v === 'F' ? C.goldLight : C.infoLight) : 'transparent',
                  color: form.genero === g.v ? (g.v === 'F' ? C.gold : C.info) : C.textSec,
                  cursor: 'pointer', transition: 'all 0.12s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                <Icon name={g.icon} size={16} />
                {g.l}
              </button>
            ))}
          </div>
        </FormField>
        <FormField label="Capacidade (nº de camas)" required>
          <Input value={form.capacidade} onChange={e => set('capacidade', e.target.value)} placeholder="Ex.: 4" type="number" />
        </FormField>
      </div>
    </Drawer>
  );
}

/* ─── ESTRUTURA PANEL ─────────────────────────────────────────── */
function EstruturaPanel() {
  const [chacaras, setChacaras] = React.useState(CHACARAS);
  const [expanded, setExpanded] = React.useState({ 1: true });
  const [chacacaDrawer, setChacacaDrawer] = React.useState(false);
  const [quartoDrawer, setQuartoDrawer]   = React.useState(null); // chácara id

  const toggleExpand = (id) => setExpanded(e => ({ ...e, [id]: !e[id] }));

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <Btn variant="primary" icon="add" onClick={() => setChacacaDrawer(true)}>Nova chácara</Btn>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {chacaras.map(ch => (
          <Card key={ch.id} style={{ padding: 0, overflow: 'hidden' }}>
            {/* Chácara header */}
            <div
              onClick={() => toggleExpand(ch.id)}
              style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', transition: 'background 0.1s' }}
              onMouseEnter={e => e.currentTarget.style.background = C.surfaceRaised}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: C.goldLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name="villa" size={18} style={{ color: C.gold }} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{ch.nome}</div>
                  <div style={{ fontSize: 12, color: C.textSec }}>{ch.cidade} · Cap. {ch.capacidade} pessoas</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 12, color: C.textTer }}>{ch.quartos.length} quartos</span>
                <button onClick={e => { e.stopPropagation(); setQuartoDrawer(ch.id); }}
                  style={{ padding: '5px 10px', borderRadius: 6, fontSize: 12, fontWeight: 500, border: `1px solid ${C.border}`, background: 'transparent', color: C.textSec, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Icon name="add" size={14} /> Quarto
                </button>
                <button style={{ padding: '5px 10px', borderRadius: 6, fontSize: 12, border: `1px solid ${C.border}`, background: 'transparent', color: C.textSec, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }} onClick={e => e.stopPropagation()}>
                  <Icon name="edit" size={14} />
                </button>
                <Icon name={expanded[ch.id] ? 'expand_less' : 'expand_more'} size={18} style={{ color: C.textTer }} />
              </div>
            </div>

            {/* Quartos list */}
            {expanded[ch.id] && (
              <div style={{ borderTop: `1px solid ${C.border}`, padding: '12px 20px 16px', display: 'flex', flexDirection: 'column', gap: 8, background: C.surfaceRaised }}>
                <p style={{ fontSize: 11, fontWeight: 500, color: C.textTer, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>Quartos</p>
                {ch.quartos.map(q => {
                  const isF = q.genero === 'F';
                  return (
                    <div key={q.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8, background: C.surface, border: `1px solid ${C.border}` }}>
                      <div style={{ width: 28, height: 28, borderRadius: 6, background: isF ? C.goldLight : C.infoLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon name={isF ? 'female' : 'male'} size={15} style={{ color: isF ? C.gold : C.info }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: 13, fontWeight: 500, color: C.text }}>{q.nome}</span>
                        <span style={{ fontSize: 11, color: C.textTer, marginLeft: 8 }}>{isF ? 'Feminino' : 'Masculino'} · {q.camas} camas</span>
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button style={{ fontSize: 11, color: C.gold, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>Editar</button>
                        <button style={{ fontSize: 11, color: C.danger, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>Remover</button>
                      </div>
                    </div>
                  );
                })}
                <button onClick={() => setQuartoDrawer(ch.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', borderRadius: 8, background: 'transparent', border: `1px dashed ${C.border}`, color: C.textTer, cursor: 'pointer', fontSize: 12, transition: 'all 0.12s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = C.goldMuted; e.currentTarget.style.color = C.gold; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textTer; }}
                >
                  <Icon name="add" size={15} /> Adicionar quarto
                </button>
              </div>
            )}
          </Card>
        ))}

        {/* Add new chácara placeholder */}
        <button onClick={() => setChacacaDrawer(true)}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '16px', borderRadius: 10, background: 'transparent', border: `1px dashed ${C.border}`, color: C.textTer, cursor: 'pointer', fontSize: 13, transition: 'all 0.12s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = C.goldMuted; e.currentTarget.style.color = C.gold; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textTer; }}
        >
          <Icon name="add_home" size={18} /> Adicionar nova chácara
        </button>
      </div>

      <ChacacaFormDrawer open={chacacaDrawer} onClose={() => setChacacaDrawer(false)} />
      <QuartoFormDrawer
        open={!!quartoDrawer}
        onClose={() => setQuartoDrawer(null)}
        chacacaNome={quartoDrawer ? chacaras.find(c => c.id === quartoDrawer)?.nome : null}
      />
    </>
  );
}

/* ─── ACOMODAÇÕES PAGE ───────────────────────────────────────── */
function AcomodacoesPage() {
  const [generoF, setGeneroF] = React.useState('todos');
  const [tab, setTab]         = React.useState('mapa');

  const quartosFiltrados = QUARTOS.filter(q => generoF === 'todos' || q.genero === generoF);
  const totalCamas = QUARTOS.flatMap(q => q.camas).length;
  const ocupadas   = QUARTOS.flatMap(q => q.camas).filter(c => c.ocupante).length;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* Summary */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 24 }}>
        <Card style={{ flex: 1, padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: C.text }}>Ocupação geral</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{ocupadas} / {totalCamas}</span>
          </div>
          <div style={{ height: 6, borderRadius: 99, background: '#F0EDE8', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(ocupadas/totalCamas)*100}%`, background: C.gold, borderRadius: 99 }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            <span style={{ fontSize: 11, color: C.textTer }}>{totalCamas - ocupadas} vagas disponíveis</span>
            <span style={{ fontSize: 11, color: C.gold }}>{Math.round((ocupadas/totalCamas)*100)}%</span>
          </div>
        </Card>
        {[
          { label: 'Quartos femininos',  count: QUARTOS.filter(q=>q.genero==='F').length, icon:'female', color:C.gold,    colorLight:C.goldLight },
          { label: 'Quartos masculinos', count: QUARTOS.filter(q=>q.genero==='M').length, icon:'male',   color:C.info,    colorLight:C.infoLight },
        ].map(m => (
          <Card key={m.label} style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, minWidth: 180 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: m.colorLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={m.icon} size={18} style={{ color: m.color }} />
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 600, color: C.text, lineHeight: 1 }}>{m.count}</div>
              <div style={{ fontSize: 11, color: C.textSec, marginTop: 2 }}>{m.label}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Tabs + gender filter */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}` }}>
          {[{ key:'mapa', label:'Mapa visual' }, { key:'estrutura', label:'Estrutura' }].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{ padding: '8px 18px', fontSize: 13.5, fontWeight: tab===t.key ? 600 : 400, color: tab===t.key ? C.text : C.textSec, border: 'none', background: 'transparent', cursor: 'pointer', borderBottom: tab===t.key ? `2px solid ${C.gold}` : '2px solid transparent', marginBottom: -1, transition: 'all 0.12s' }}>
              {t.label}
            </button>
          ))}
        </div>
        {tab === 'mapa' && (
          <FilterTabs
            options={[{ key:'todos', label:'Todos' }, { key:'F', label:'Feminino' }, { key:'M', label:'Masculino' }]}
            value={generoF} onChange={setGeneroF}
          />
        )}
      </div>

      {/* Mapa visual */}
      {tab === 'mapa' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
          {quartosFiltrados.map(q => {
            const isF = q.genero === 'F';
            const ocupadasQ = q.camas.filter(c => c.ocupante).length;
            return (
              <Card key={q.id} style={{ padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{q.nome}</div>
                    <div style={{ fontSize: 11, color: isF ? C.gold : C.info, marginTop: 2, display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Icon name={isF ? 'female' : 'male'} size={13} />
                      {isF ? 'Feminino' : 'Masculino'}
                    </div>
                  </div>
                  <span style={{ fontSize: 11, color: C.textTer }}>{ocupadasQ}/{q.camas.length}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {q.camas.map(c => (
                    <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 6, background: c.ocupante ? (isF ? C.goldLight : C.infoLight) : '#F7F4EF', border: `1px solid ${c.ocupante ? (isF ? C.goldMuted : '#B8D4E8') : C.border}` }}>
                      <Icon name="bed" size={14} style={{ color: c.ocupante ? (isF ? C.gold : C.info) : C.textTer }} />
                      <span style={{ fontSize: 12, color: c.ocupante ? C.text : C.textTer, flex: 1 }}>{c.ocupante || 'Livre'}</span>
                      {!c.ocupante && <Icon name="add" size={14} style={{ color: C.textTer, cursor: 'pointer' }} />}
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Estrutura */}
      {tab === 'estrutura' && <EstruturaPanel />}
    </div>
  );
}

Object.assign(window, { AcomodacoesPage });
