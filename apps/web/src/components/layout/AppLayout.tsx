import { useEffect, useMemo, useState } from 'react'
import { LogOut, Menu, X } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthContext } from '../../contexts/auth-context'
import { useOrgContext } from '../../contexts/org-context'
import { Badge } from '../ui/badge'
import { useEventos } from '../../hooks/use-eventos'
import { OrgSwitcher } from './OrgSwitcher'
import type { EventoListItem } from '@koinonia/shared'

const NAV_ITEMS = [
  { icon: 'dashboard', label: 'Dashboard', path: '/dashboard' },
  { icon: 'event', label: 'Eventos', path: '/eventos' },
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

const SELECTED_EVENT_KEY = 'koinonia:selectedEventoId'

const STATUS_META: Record<string, { label: string; variant: React.ComponentProps<typeof Badge>['variant'] }> = {
  rascunho: { label: 'Rascunho', variant: 'neutral' },
  aberto: { label: 'Aberto', variant: 'success' },
  encerrado: { label: 'Encerrado', variant: 'warning' },
  realizado: { label: 'Realizado', variant: 'info' },
  cancelado: { label: 'Cancelado', variant: 'danger' },
}

function formatDateRange(evento: EventoListItem) {
  const start = new Date(`${evento.data_inicio}T00:00:00`)
  const end = new Date(`${evento.data_fim}T00:00:00`)
  const formatter = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' })

  return `${formatter.format(start)} - ${formatter.format(end)}`
}

function EventPill({
  eventos,
  selectedEventoId,
  isLoading,
  onSelect,
}: {
  eventos: EventoListItem[]
  selectedEventoId: string
  isLoading: boolean
  onSelect: (eventoId: string) => void
}) {
  const selectedEvento = eventos.find((evento) => evento.id === selectedEventoId)
  const statusMeta = selectedEvento ? STATUS_META[selectedEvento.status] ?? STATUS_META.rascunho : undefined

  return (
    <div className="hidden max-w-full items-center gap-1.5 rounded-[8px] border border-border bg-surface-raised px-2 py-1 text-xs text-text-secondary ring-warm-gold-light focus-within:ring-[3px] sm:inline-flex">
      <span className="material-symbols-rounded text-[13px] text-warm-gold">calendar_month</span>
      {selectedEvento && statusMeta ? <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge> : null}
      <select
        value={selectedEventoId}
        onChange={(event) => onSelect(event.target.value)}
        disabled={isLoading || eventos.length === 0}
        className="min-w-0 max-w-[260px] bg-transparent text-[12px] font-medium text-foreground outline-none disabled:text-text-secondary"
        aria-label="Selecionar evento ativo"
      >
        {isLoading ? <option value="">Carregando eventos</option> : null}
        {!isLoading && eventos.length === 0 ? <option value="">Nenhum evento</option> : null}
        {eventos.map((evento) => (
          <option key={evento.id} value={evento.id}>
            {evento.nome} · {formatDateRange(evento)}
          </option>
        ))}
      </select>
      <span className="material-symbols-rounded text-[14px] text-text-tertiary">expand_more</span>
    </div>
  )
}

function OrganizationPill({
  organizations,
  activeOrgId,
  isLoading,
  onSelect,
}: {
  organizations: Array<{ id: string; name: string; slug: string }>
  activeOrgId: string | null
  isLoading: boolean
  onSelect: (orgId: string) => void
}) {
  return (
    <div className="hidden max-w-full items-center gap-1.5 rounded-[8px] border border-border bg-surface-raised px-2 py-1 text-xs text-text-secondary ring-warm-gold-light focus-within:ring-[3px] xl:inline-flex">
      <span className="material-symbols-rounded text-[13px] text-warm-gold">domain</span>
      <select
        value={activeOrgId ?? ''}
        onChange={(event) => onSelect(event.target.value)}
        disabled={isLoading || organizations.length === 0}
        className="min-w-0 max-w-[220px] bg-transparent text-[12px] font-medium text-foreground outline-none disabled:text-text-secondary"
        aria-label="Selecionar organizacao ativa"
      >
        {isLoading ? <option value="">Carregando organizacoes</option> : null}
        {!isLoading && organizations.length === 0 ? <option value="">Sem organizacao</option> : null}
        {organizations.map((org) => (
          <option key={org.id} value={org.id}>
            {org.name}
          </option>
        ))}
      </select>
      <span className="material-symbols-rounded text-[14px] text-text-tertiary">expand_more</span>
    </div>
  )
}

export function AppLayout({ children, title, actions }: AppLayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthContext()
  const { organizations, activeOrgId, setActiveOrg, isLoading: orgLoading } = useOrgContext()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { data: eventos = [], isLoading: eventosLoading } = useEventos()
  const [selectedEventoId, setSelectedEventoId] = useState(() => {
    if (typeof window === 'undefined') {
      return ''
    }

    return window.localStorage.getItem(SELECTED_EVENT_KEY) ?? ''
  })

  const availableEventos = useMemo(
    () => eventos.filter((evento): evento is EventoListItem & { id: string } => Boolean(evento.id)),
    [eventos]
  )

  useEffect(() => {
    if (availableEventos.length === 0) {
      return
    }

    const selectedStillExists = availableEventos.some((evento) => evento.id === selectedEventoId)
    if (!selectedEventoId || !selectedStillExists) {
      const nextId = availableEventos[0].id
      setSelectedEventoId(nextId)
      window.localStorage.setItem(SELECTED_EVENT_KEY, nextId)
    }
  }, [availableEventos, selectedEventoId])

  const navigateTo = (path: string) => {
    navigate(path)
    setMobileMenuOpen(false)
  }

  const initials = user?.name?.[0]?.toUpperCase() ?? 'U'

  const handleEventoSelect = (eventoId: string) => {
    setSelectedEventoId(eventoId)
    window.localStorage.setItem(SELECTED_EVENT_KEY, eventoId)
  }

  const handleOrgSelect = (orgId: string) => {
    if (!orgId || orgId === activeOrgId) {
      return
    }

    void setActiveOrg(orgId)
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="hidden w-56 shrink-0 flex-col border-r border-border bg-surface lg:flex">
        <div className="flex h-14 items-center gap-3 border-b border-border px-4">
          <div className="flex size-8 items-center justify-center rounded-[7px] bg-primary text-primary-foreground">
            <span className="material-symbols-rounded text-[16px]">diversity_3</span>
          </div>
          <div>
            <h1 className="text-sm font-bold leading-tight text-foreground">Koinonia</h1>
            <p className="text-[10px] font-semibold uppercase text-text-secondary">
              Gestão de Retiros
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-0.5 px-2 py-2">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <button
                key={item.path}
                onClick={() => navigateTo(item.path)}
                className={[
                  'relative flex h-9 w-full items-center gap-3 rounded-[7px] border-l-2 px-2.5 text-left text-[13.5px] transition-colors',
                  isActive
                    ? 'border-warm-gold bg-warm-gold-light font-semibold text-warm-gold'
                    : 'border-transparent font-normal text-text-secondary hover:bg-background hover:text-foreground',
                ].join(' ')}
              >
                <span
                  className="material-symbols-rounded text-[18px]"
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="border-t border-border p-3">
          <div className="flex items-center gap-3 rounded-[8px] bg-surface-raised p-2">
            <div className="flex size-8 items-center justify-center rounded-full bg-warm-gold-light text-xs font-bold text-warm-gold">
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
        <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border bg-surface px-4 lg:px-6">
          <div className="flex min-w-0 items-center gap-4">
            <button
              type="button"
              aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
              className="inline-flex size-9 items-center justify-center rounded-[7px] border border-warm-gold-muted bg-warm-gold-light text-warm-gold lg:hidden"
              onClick={() => setMobileMenuOpen((open) => !open)}
            >
              {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
            <h2 className="truncate text-[15px] font-semibold text-foreground">{title ?? 'Koinonia'}</h2>
            <div className="hidden h-[18px] w-px bg-border sm:block" />
            <OrganizationPill
              organizations={organizations}
              activeOrgId={activeOrgId}
              isLoading={orgLoading}
              onSelect={handleOrgSelect}
            />
            <EventPill
              eventos={availableEventos}
              selectedEventoId={selectedEventoId}
              isLoading={eventosLoading}
              onSelect={handleEventoSelect}
            />
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <OrgSwitcher />
            {actions}
          </div>
        </header>

        {mobileMenuOpen ? (
          <div className="border-b border-border bg-surface px-4 py-3 lg:hidden">
            <nav className="grid gap-2">
              {NAV_ITEMS.map((item) => {
                const isActive = location.pathname === item.path
                return (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => navigateTo(item.path)}
                    className={[
                      'flex h-11 items-center gap-3 rounded-[7px] border-l-2 px-3 text-left text-sm transition-colors',
                      isActive
                        ? 'border-warm-gold bg-warm-gold-light font-semibold text-warm-gold'
                        : 'border-transparent font-normal text-text-secondary hover:bg-background hover:text-foreground',
                    ].join(' ')}
                  >
                    <span className="material-symbols-rounded text-[20px]">{item.icon}</span>
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
