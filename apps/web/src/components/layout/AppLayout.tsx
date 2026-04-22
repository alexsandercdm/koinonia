import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthContext } from '../../contexts/auth-context'

const NAV_ITEMS = [
  { icon: 'dashboard', label: 'Dashboard', path: '/dashboard' },
  { icon: 'group', label: 'Pessoas', path: '/participantes' },
  { icon: 'assignment', label: 'Inscrições', path: '/inscricoes' },
  { icon: 'bed', label: 'Acomodações', path: '/acomodacoes' },
  { icon: 'account_balance_wallet', label: 'Financeiro', path: '/financeiro' },
]

interface AppLayoutProps {
  children: React.ReactNode
  title?: string
  actions?: React.ReactNode
}

export function AppLayout({ children, title, actions }: AppLayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthContext()

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background-dark">
      {/* Sidebar */}
      <aside className="w-64 bg-surface-dark border-r border-border-dark flex flex-col shrink-0">
        <div className="p-6 flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-2xl">diversity_3</span>
          </div>
          <div>
            <h1 className="text-base font-bold text-white leading-tight">Koinonia</h1>
            <p className="text-[10px] text-primary/70 uppercase tracking-widest font-medium">
              Gestão de Retiros
            </p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={[
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium text-left',
                  isActive
                    ? 'bg-primary/20 text-white border-l-4 border-primary'
                    : 'text-slate-400 hover:bg-primary/10 hover:text-white',
                ].join(' ')}
              >
                <span
                  className="material-symbols-outlined text-[20px]"
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="p-4 border-t border-border-dark">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-white/5">
            <div className="size-8 rounded-full bg-primary/30 flex items-center justify-center text-white text-sm font-bold">
              {user?.name?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name ?? 'Usuário'}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email ?? ''}</p>
            </div>
            <button
              onClick={logout}
              className="text-slate-400 hover:text-white transition-colors"
              title="Sair"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {(title || actions) && (
          <header className="h-16 border-b border-border-dark bg-surface-dark/50 backdrop-blur-sm px-8 flex items-center justify-between shrink-0">
            {title && (
              <h2 className="text-xl font-bold tracking-tight text-white">{title}</h2>
            )}
            {actions && <div className="flex items-center gap-3">{actions}</div>}
          </header>
        )}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </main>
    </div>
  )
}
