/* ─── LOGIN ─────────────────────────────────────────────────── */
function LoginPage({ onLogin }) {
  const [email, setEmail]       = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPass, setShowPass] = React.useState(false);
  const [loading, setLoading]   = React.useState(false);

  const submit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); onLogin(); }, 900);
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'stretch' }}>
      {/* Left: editorial panel */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between', padding: '40px 56px',
        background: C.surface, borderRight: `1px solid ${C.border}`, minWidth: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: C.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="diversity_3" size={18} style={{ color: '#fff' }} />
          </div>
          <span style={{ fontSize: 17, fontWeight: 700, color: C.text }}>Koinonia</span>
        </div>

        <div style={{ maxWidth: 400 }}>
          <div style={{ width: 40, height: 2, background: C.gold, marginBottom: 36 }} />
          <h2 style={{ fontSize: 40, fontWeight: 300, color: C.text, lineHeight: 1.15, marginBottom: 20, letterSpacing: '-0.03em' }}>
            Gestão que libera<br />
            <em style={{ fontStyle: 'italic', fontWeight: 400 }}>para o essencial.</em>
          </h2>
          <p style={{ fontSize: 15, color: C.textSec, lineHeight: 1.75, maxWidth: 340 }}>
            Organize inscrições, acomodações e finanças do seu retiro — para que sua atenção fique onde importa.
          </p>

          <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { icon: 'group', text: 'Gestão completa de participantes' },
              { icon: 'bed',   text: 'Mapa visual de acomodações cama a cama' },
              { icon: 'payments', text: 'Controle financeiro e break-even' },
            ].map(f => (
              <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: C.goldLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name={f.icon} size={15} style={{ color: C.gold }} />
                </div>
                <span style={{ fontSize: 13, color: C.textSec }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p style={{ fontSize: 12, color: C.textTer }}>Sistema open-source para igrejas e ministérios</p>
      </div>

      {/* Right: form */}
      <div style={{ width: 460, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 56px' }}>
        <div style={{ width: '100%' }}>
          <p style={{ fontSize: 11, color: C.textTer, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>Acesso ao painel</p>
          <h3 style={{ fontSize: 24, fontWeight: 600, color: C.text, marginBottom: 36, letterSpacing: '-0.02em' }}>Bem-vindo de volta</h3>

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <FormField label="E-mail" required>
              <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" icon="mail" type="email" />
            </FormField>

            <FormField label="Senha" required>
              <div style={{ position: 'relative' }}>
                <Input value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" icon="lock" type={showPass ? 'text' : 'password'} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.textTer, display: 'flex' }}>
                  <Icon name={showPass ? 'visibility_off' : 'visibility'} size={17} />
                </button>
              </div>
            </FormField>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: -8 }}>
              <button type="button" style={{ fontSize: 13, color: C.gold, background: 'none', border: 'none', cursor: 'pointer' }}>Esqueceu a senha?</button>
            </div>

            <button type="submit" disabled={loading}
              style={{
                height: 44, borderRadius: 7, background: C.text,
                color: '#fff', fontWeight: 600, fontSize: 14,
                border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1, transition: 'opacity 0.15s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              {loading
                ? <><Icon name="progress_activity" size={16} style={{ animation: 'spin 0.8s linear infinite' }} />Entrando...</>
                : 'Entrar no painel'}
            </button>
          </form>

          <div style={{ marginTop: 28, paddingTop: 24, borderTop: `1px solid ${C.border}`, textAlign: 'center' }}>
            <span style={{ fontSize: 13, color: C.textSec }}>Ainda não tem acesso? </span>
            <button style={{ fontSize: 13, color: C.gold, fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}>Solicitar conta</button>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { LoginPage });
