import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Bed,
  Calendar,
  ChevronRight,
  ClipboardList,
  Plus,
  Users,
  Wallet,
} from 'lucide-react'
import { AppLayout } from '../components/layout/AppLayout'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { EmptyState } from '../components/ui/empty-state'
import { useOrgContext } from '../contexts/org-context'
import { apiFetch } from '../lib/api'
import type { InscricaoListItem, EventoListItem } from '../hooks/use-inscricoes'
import type { MapaAcomodacao } from '@koinonia/shared'

interface MetricasFinanceiro {
  totalArrecadado: number
  totalPrevisto: number
  breakEvenPct: number
  porStatus?: Record<string, number>
}

interface ParticipantesListResponse {
  total?: number
  data?: unknown[]
}

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function getInitials(nome: string): string {
  return nome
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

function formatEventDate(value?: string): string {
  if (!value) return ''
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
    .format(new Date(`${value}T00:00:00`))
}

const STATUS_CONFIG: Record<string, { label: string; variant: React.ComponentProps<typeof Badge>['variant'] }> = {
  PAGO_TOTAL: { label: 'Pago', variant: 'success' },
  PAGO_PARCIAL: { label: 'Parcial', variant: 'info' },
  PENDENTE: { label: 'Pendente', variant: 'warning' },
  LISTA_ESPERA: { label: 'Espera', variant: 'neutral' },
  CANCELADA: { label: 'Cancelada', variant: 'danger' },
}

const PAPEL_LABEL: Record<string, string> = {
  encontrista: 'Encontrista',
  servo: 'Servo',
}

const quickLinks = [
  { icon: Users, label: 'Participantes', path: '/participantes' },
  { icon: Calendar, label: 'Eventos', path: '/eventos' },
  { icon: ClipboardList, label: 'Inscrições', path: '/inscricoes' },
  { icon: Bed, label: 'Acomodações', path: '/acomodacoes' },
  { icon: Wallet, label: 'Financeiro', path: '/financeiro' },
]

export function DashboardPage() {
  const navigate = useNavigate()
  const { activeOrgId } = useOrgContext()

  const { data: participantesData } = useQuery({
    queryKey: ['org', activeOrgId, 'dashboard', 'participantes-count'],
    queryFn: () => apiFetch<ParticipantesListResponse | unknown[]>('/api/v1/participantes'),
    enabled: !!activeOrgId,
    retry: 1,
  })

  const { data: metricas } = useQuery({
    queryKey: ['org', activeOrgId, 'dashboard', 'financeiro-metricas'],
    queryFn: () => apiFetch<MetricasFinanceiro>('/api/v1/financeiro/metricas'),
    enabled: !!activeOrgId,
    retry: 1,
  })

  const { data: eventos } = useQuery({
    queryKey: ['org', activeOrgId, 'dashboard', 'eventos'],
    queryFn: () => apiFetch<EventoListItem[]>('/api/v1/eventos'),
    enabled: !!activeOrgId,
    retry: 1,
  })

  const primeiroEvento = eventos?.[0]

  const { data: inscricoes } = useQuery({
    queryKey: ['org', activeOrgId, 'dashboard', 'inscricoes', primeiroEvento?.id],
    queryFn: () =>
      apiFetch<InscricaoListItem[]>(`/api/v1/inscricoes?evento_id=${primeiroEvento!.id}`),
    enabled: !!activeOrgId && !!primeiroEvento?.id,
    retry: 1,
  })

  const { data: mapa } = useQuery({
    queryKey: ['org', activeOrgId, 'dashboard', 'mapa-acomodacao', primeiroEvento?.id],
    queryFn: () =>
      apiFetch<MapaAcomodacao>(`/api/v1/eventos/${primeiroEvento!.id}/mapa-acomodacao`),
    enabled: !!activeOrgId && !!primeiroEvento?.id,
    retry: 1,
  })

  const participantesCount = Array.isArray(participantesData)
    ? participantesData.length
    : (participantesData as ParticipantesListResponse)?.total ?? 0

  const inscricoesCount = inscricoes?.length ?? 0
  const inadimplentesCount = inscricoes?.filter(
    (i) => i.valor_total > 0 && i.valor_pago < i.valor_total
  ).length ?? 0

  const todasCamas = mapa?.quartos.flatMap((q) => q.camas) ?? []
  const totalCamas = todasCamas.length
  const ocupadas = todasCamas.filter((c) => c.ocupante !== null).length
  const vagasLivres = totalCamas - ocupadas

  const metricCards = [
    {
      icon: Users,
      label: 'Participantes',
      value: participantesCount || '—',
      subtitle: participantesCount ? `${participantesCount} cadastrados` : 'Nenhum ainda',
      iconClass: 'bg-status-info-bg text-status-info',
      path: '/participantes',
    },
    {
      icon: ClipboardList,
      label: 'Inscrições',
      value: inscricoesCount || '—',
      subtitle: inadimplentesCount > 0 ? `${inadimplentesCount} inadimplentes` : 'Nenhum inadimplente',
      iconClass: 'bg-warm-gold-light text-warm-gold',
      path: '/inscricoes',
    },
    {
      icon: Bed,
      label: 'Acomodações',
      value: totalCamas ? `${ocupadas} / ${totalCamas}` : '—',
      subtitle: totalCamas ? `${vagasLivres} vagas livres` : 'Sem mapa carregado',
      iconClass: 'bg-status-success-bg text-status-success',
      path: '/acomodacoes',
    },
    {
      icon: Wallet,
      label: 'Arrecadado',
      value: metricas ? formatCurrency(metricas.totalArrecadado) : '—',
      subtitle: metricas ? `${metricas.breakEvenPct.toFixed(0)}% da meta` : 'Sem dados',
      iconClass: 'bg-status-warning-bg text-status-warning',
      path: '/financeiro',
    },
  ]

  const localInfo = [mapa?.local.nome, mapa?.local.endereco].filter(Boolean).join(' · ')
  const dateRange = primeiroEvento
    ? `${formatEventDate(primeiroEvento.data_inicio)} – ${formatEventDate(primeiroEvento.data_fim)}`
    : null
  const eventSubtitle = [localInfo, dateRange].filter(Boolean).join(' · ')

  return (
    <AppLayout
      title="Dashboard"
      actions={
        <Button onClick={() => navigate('/eventos')} size="sm">
          <Plus size={16} />
          Novo evento
        </Button>
      }
    >
      <div className="mx-auto w-full max-w-[1100px] space-y-7 p-4 sm:p-6 lg:p-7">
        {/* Event Banner */}
        <section className="overflow-hidden rounded-panel border border-border bg-surface shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex flex-col gap-5 border-l-[3px] border-warm-gold px-8 py-7 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-warm-gold">
                Evento em andamento
              </p>
              <h2 className="text-[22px] font-semibold leading-tight tracking-[-0.02em] text-foreground">
                {primeiroEvento?.nome ?? 'Nenhum evento ativo'}
              </h2>
              {eventSubtitle && (
                <p className="mt-1 text-[13px] text-text-secondary">{eventSubtitle}</p>
              )}
            </div>
            <div className="flex shrink-0 gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate('/acomodacoes')}>
                <Bed size={15} />
                Mapa
              </Button>
              <Button size="sm" onClick={() => navigate('/inscricoes')}>
                <ClipboardList size={15} />
                Inscrições
              </Button>
            </div>
          </div>
          <div className="relative h-1.5 bg-neutral-soft">
            <div
              className="absolute inset-y-0 left-0 rounded-r-full bg-warm-gold"
              style={{ width: `${Math.min(metricas?.breakEvenPct ?? 0, 100)}%` }}
            />
          </div>
          <div className="flex justify-end px-8 py-2">
            <span className="text-[11px] text-text-tertiary">
              {Math.min(metricas?.breakEvenPct ?? 0, 100).toFixed(0)}% da meta financeira atingida
            </span>
          </div>
        </section>

        {/* Metric Cards */}
        <section>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {metricCards.map(({ icon: Icon, label, value, subtitle, iconClass, path }) => (
              <button
                key={label}
                onClick={() => navigate(path)}
                className="rounded-[10px] border border-border bg-surface p-5 text-left shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-colors hover:border-warm-border-strong hover:bg-surface-raised"
              >
                <div className={`mb-4 flex size-10 items-center justify-center rounded-[8px] ${iconClass}`}>
                  <Icon size={18} />
                </div>
                <p className="text-[28px] font-semibold leading-none tracking-tight text-foreground">
                  {value}
                </p>
                <p className="mt-1.5 text-[13px] font-medium text-foreground">{label}</p>
                <p className="mt-0.5 text-[12px] text-text-secondary">{subtitle}</p>
              </button>
            ))}
          </div>
        </section>

        {/* Inscrições + Acesso Rápido */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
          {/* Inscrições Recentes */}
          <Card>
            <CardHeader className="flex-row items-center justify-between border-b border-border">
              <CardTitle>Inscrições recentes</CardTitle>
              <button
                onClick={() => navigate('/inscricoes')}
                className="text-sm font-semibold text-warm-gold"
              >
                Ver todas
              </button>
            </CardHeader>
            <CardContent className="p-0">
              {inscricoes && inscricoes.length > 0 ? (
                <>
                  {/* Table header */}
                  <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
                    <span>Participante</span>
                    <span className="w-24 text-center">Papel</span>
                    <span className="w-20 text-center">Status</span>
                    <span className="w-24 text-right">Valor</span>
                  </div>
                  <div className="divide-y divide-border">
                    {inscricoes.slice(0, 6).map((inscricao) => {
                      const statusCfg = STATUS_CONFIG[inscricao.status] ?? {
                        label: inscricao.status,
                        variant: 'neutral' as const,
                      }
                      const nome = inscricao.pessoa?.nome ?? 'Participante'
                      const valorDisplay =
                        inscricao.valor_total > 0 ? formatCurrency(inscricao.valor_total) : '—'
                      return (
                        <div
                          key={inscricao.id}
                          className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 px-5 py-3.5"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-bold text-foreground">
                              {getInitials(nome)}
                            </div>
                            <p className="truncate text-sm font-medium text-foreground">{nome}</p>
                          </div>
                          <span className="w-24 text-center text-sm text-text-secondary">
                            {PAPEL_LABEL[inscricao.papel] ?? inscricao.papel}
                          </span>
                          <div className="flex w-20 justify-center">
                            <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
                          </div>
                          <span className="w-24 text-right text-sm font-medium text-foreground">
                            {valorDisplay}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </>
              ) : (
                <div className="p-5">
                  <EmptyState
                    title="Nenhuma inscrição ainda"
                    description="As inscrições aparecerão aqui assim que houver um evento ativo."
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Acesso Rápido */}
          <Card>
            <CardHeader className="border-b border-border">
              <CardTitle>Acesso rápido</CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-border p-0">
              {quickLinks.map(({ icon: Icon, label, path }) => (
                <button
                  key={label}
                  onClick={() => navigate(path)}
                  className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-surface-raised"
                >
                  <Icon size={16} className="shrink-0 text-text-secondary" />
                  <span className="flex-1 text-sm font-medium text-foreground">{label}</span>
                  <ChevronRight size={16} className="shrink-0 text-text-tertiary" />
                </button>
              ))}
            </CardContent>
          </Card>
        </section>
      </div>
    </AppLayout>
  )
}
