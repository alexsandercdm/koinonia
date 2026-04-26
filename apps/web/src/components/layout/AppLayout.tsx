import { useState } from 'react'
import { CalendarDays, LogOut, Menu, X } from 'lucide-react'
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navigateTo = (path: string) => {
    navigate(path)
    setMobileMenuOpen(false)
  }

  const initials = user?.name?.[0]?.toUpperCase() ?? 'U'

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card lg:flex">
        <div className="flex items-center gap-3 p-6">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="material-symbols-outlined text-2xl">diversity_3</span>
          </div>
          <div>
            <h1 className="text-base font-bold leading-tight text-foreground">Koinonia</h1>
            <p className="text-[10px] font-semibold uppercase text-text-secondary">
              Gestão de Retiros
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-2">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <button
                key={item.path}
                onClick={() => navigateTo(item.path)}
                className={[
                  'relative flex h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-semibold transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-text-secondary hover:bg-accent hover:text-foreground',
                ].join(' ')}
              >
                {isActive ? <span className="absolute left-0 h-5 w-1 rounded-r-full bg-warm-gold" /> : null}
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

        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3 rounded-lg bg-surface-raised p-2">
            <div className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">{user?.name ?? 'Usuário'}</p>
              <p className="truncate text-xs text-text-secondary">{user?.email ?? ''}</p>
            </div>
            <button
              onClick={logout}
              className="inline-flex size-10 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-accent hover:text-foreground"
              title="Sair"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex min-h-16 shrink-0 items-center justify-between gap-3 border-b border-border bg-card/95 px-4 backdrop-blur lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
              className="inline-flex size-11 items-center justify-center rounded-lg border border-border text-foreground lg:hidden"
              onClick={() => setMobileMenuOpen((open) => !open)}
            >
              {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-semibold text-foreground">{title ?? 'Koinonia'}</h2>
              <div className="mt-1 hidden items-center gap-2 rounded-lg border border-border bg-surface-raised px-2.5 py-1 text-xs text-text-secondary sm:inline-flex">
                <CalendarDays className="size-3.5 text-warm-gold" />
                <span className="font-semibold text-foreground">Evento ativo</span>
                <span>Retiro Koinonia</span>
                <span className="text-warm-gold">Selecionar</span>
              </div>
            </div>
          </div>
          {actions && <div className="flex shrink-0 items-center gap-3">{actions}</div>}
        </header>

        {mobileMenuOpen ? (
          <div className="border-b border-border bg-card px-4 py-3 lg:hidden">
            <nav className="grid gap-2">
              {NAV_ITEMS.map((item) => {
                const isActive = location.pathname === item.path
                return (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => navigateTo(item.path)}
                    className={[
                      'flex h-12 items-center gap-3 rounded-lg px-3 text-left text-sm font-semibold transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-text-secondary hover:bg-accent hover:text-foreground',
                    ].join(' ')}
                  >
                    <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </nav>
            <button
              type="button"
              onClick={logout}
              className="mt-3 flex h-12 w-full items-center gap-3 rounded-lg border border-border px-3 text-left text-sm font-semibold text-text-secondary"
            >
              <LogOut className="size-4" />
              <span>Sair</span>
            </button>
          </div>
        ) : null}

        <div className="min-h-[calc(100vh-4rem)] overflow-y-auto">{children}</div>
      </main>
    </div>
  )
}
