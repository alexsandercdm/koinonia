import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowRight,
  Bed,
  CheckCircle,
  Circle,
  ClipboardList,
  FileSpreadsheet,
  FileText,
  Image,
  MapPin,
  Plus,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react'
import { AppLayout } from '../components/layout/AppLayout'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { EmptyState } from '../components/ui/empty-state'
import { apiFetch } from '../lib/api'
import type { InscricaoListItem, EventoListItem } from '../hooks/use-inscricoes'

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

function timeAgo(dateStr?: string): string {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'agora'
  if (mins < 60) return `há ${mins} min`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `há ${hrs}h`
  return `há ${Math.floor(hrs / 24)}d`
}

const STATUS_CONFIG: Record<string, { label: string; variant: React.ComponentProps<typeof Badge>['variant'] }> = {
  PAGO_TOTAL: { label: 'Pago', variant: 'success' },
  PAGO_PARCIAL: { label: 'Parcial', variant: 'info' },
  PENDENTE: { label: 'Pendente', variant: 'warning' },
  LISTA_ESPERA: { label: 'Espera', variant: 'neutral' },
  CANCELADA: { label: 'Cancelada', variant: 'danger' },
}

const quickReports = [
  { icon: FileText, label: 'Lista de Presença', meta: 'PDF', variant: 'info' as const },
  { icon: FileSpreadsheet, label: 'Resumo Financeiro', meta: 'XLS', variant: 'success' as const },
  { icon: FileText, label: 'Restrições Alimentares', meta: 'PDF', variant: 'warning' as const },
  { icon: Image, label: 'Mapa de Quartos', meta: 'IMG', variant: 'gold' as const },
]

const proximasTarefas = [
  { label: 'Confirmar Buffet', due: 'Vence hoje, 17:00', done: false },
  { label: 'Enviar E-mail de Boas Vindas', due: 'Vence amanhã', done: false },
  { label: 'Reunião com Equipe de Som', due: '22 de Maio', done: false },
]

export function DashboardPage() {
  const navigate = useNavigate()

  const { data: participantesData } = useQuery({
    queryKey: ['participantes-count'],
    queryFn: () => apiFetch<ParticipantesListResponse | unknown[]>('/api/v1/participantes'),
    retry: 1,
  })

  const { data: metricas } = useQuery({
    queryKey: ['financeiro-metricas'],
    queryFn: () => apiFetch<MetricasFinanceiro>('/api/v1/financeiro/metricas'),
    retry: 1,
  })

  const { data: eventos } = useQuery({
    queryKey: ['eventos'],
    queryFn: () => apiFetch<EventoListItem[]>('/api/v1/eventos'),
    retry: 1,
  })

  const primeiroEvento = eventos?.[0]

  const { data: inscricoesRecentes } = useQuery({
    queryKey: ['inscricoes-recentes', primeiroEvento?.id],
    queryFn: () =>
      apiFetch<InscricaoListItem[]>(`/api/v1/inscricoes?evento_id=${primeiroEvento!.id}&limit=5`),
    enabled: !!primeiroEvento?.id,
    retry: 1,
  })

  const participantesCount = Array.isArray(participantesData)
    ? participantesData.length
    : (participantesData as ParticipantesListResponse)?.total ?? 0

  const pagamentosConfirmados = metricas?.porStatus?.['PAGO_TOTAL'] ?? metricas?.porStatus?.['Pago'] ?? 0
  const ocupacaoLeitos = metricas ? Math.round(metricas.breakEvenPct) : 0

  const metricCards = [
    { icon: Users, label: 'Total de Inscritos', value: participantesCount || '—', trend: { value: 12, up: true }, variant: 'gold' as const, path: '/participantes' },
    { icon: Wallet, label: 'Pagamentos Confirmados', value: pagamentosConfirmados || '—', trend: { value: 5, up: true }, variant: 'success' as const, path: '/financeiro' },
    { icon: Bed, label: 'Ocupação de Leitos', value: ocupacaoLeitos ? `${ocupacaoLeitos}%` : '—', trend: { value: 2, up: false }, variant: 'info' as const, path: '/acomodacoes' },
    { icon: ClipboardList, label: 'Arrecadado', value: metricas ? formatCurrency(metricas.totalArrecadado) : '—', trend: null, variant: 'warning' as const, path: '/financeiro' },
  ]

  return (
    <AppLayout
      actions={
        <Button onClick={() => navigate('/inscricoes')} size="sm">
          <Plus size={16} />
          Novo Evento
        </Button>
      }
    >
      <div className="mx-auto w-full max-w-[1400px] space-y-8 p-4 sm:p-6 lg:p-8">
        <section className="rounded-lg border border-border bg-card p-6 sm:p-8">
          <p className="mb-3 text-xs font-semibold uppercase text-warm-gold">Evento ativo</p>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
                {primeiroEvento?.nome ?? 'Retiro Koinonia 2025'}
              </h2>
              {primeiroEvento ? (
                <p className="mt-2 text-sm text-text-secondary">
                  {new Date(primeiroEvento.data_inicio).toLocaleDateString('pt-BR')} a{' '}
                  {new Date(primeiroEvento.data_fim).toLocaleDateString('pt-BR')} · capacidade {primeiroEvento.capacidade_maxima}
                </p>
              ) : (
                <p className="mt-2 flex items-center gap-2 text-sm text-text-secondary">
                  <MapPin size={14} />
                  Selecione ou cadastre o evento para alimentar os indicadores.
                </p>
              )}
            </div>
            <Button onClick={() => navigate('/participantes')}>
              Gerenciar Evento
              <ArrowRight size={16} />
            </Button>
          </div>
        </section>

        <section>
          <h3 className="mb-4 text-xl font-semibold text-foreground">Métricas Atuais</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {metricCards.map(({ icon: Icon, label, value, trend, variant, path }) => (
              <button
                key={label}
                onClick={() => navigate(path)}
                className="rounded-lg border border-border bg-card p-5 text-left transition-colors hover:border-warm-border-strong hover:bg-surface-raised"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex size-11 items-center justify-center rounded-lg bg-muted">
                    <Icon size={20} className="text-foreground" />
                  </div>
                  {trend ? (
                    <Badge variant={trend.up ? 'success' : 'danger'}>
                      {trend.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {trend.value}%
                    </Badge>
                  ) : (
                    <Badge variant={variant}>Atual</Badge>
                  )}
                </div>
                <p className="text-2xl font-semibold text-foreground">{value}</p>
                <p className="mt-1 text-sm text-text-secondary">{label}</p>
              </button>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-semibold text-foreground">Relatórios Rápidos</h3>
            <button className="text-sm font-semibold text-warm-gold">Ver todos os relatórios</button>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {quickReports.map(({ icon: Icon, label, meta, variant }) => (
              <button key={label} className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 text-left transition-colors hover:bg-surface-raised">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <Icon size={18} className="text-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{label}</p>
                  <Badge variant={variant} className="mt-1">{meta}</Badge>
                </div>
              </button>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex-row items-center justify-between border-b border-border">
              <CardTitle>Inscrições Recentes</CardTitle>
              <button onClick={() => navigate('/inscricoes')} className="text-sm font-semibold text-warm-gold">
                Ver Todas
              </button>
            </CardHeader>
            <CardContent className="divide-y divide-border p-0">
              {inscricoesRecentes && inscricoesRecentes.length > 0 ? (
                inscricoesRecentes.slice(0, 5).map((inscricao) => {
                  const statusCfg = STATUS_CONFIG[inscricao.status] ?? { label: inscricao.status, variant: 'neutral' as const }
                  const nome = inscricao.pessoa?.nome ?? 'Participante'
                  return (
                    <div key={inscricao.id} className="flex items-center gap-4 px-5 py-4" data-testid="inscricoes-recentes">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold text-foreground">
                        {getInitials(nome)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-foreground">{nome}</p>
                        <p className="text-xs text-text-secondary">{timeAgo(inscricao.created_at)}</p>
                      </div>
                      <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
                    </div>
                  )
                })
              ) : (
                <div className="p-5">
                  <EmptyState
                    title="Nenhuma inscrição recente"
                    description="As últimas inscrições aparecerão aqui assim que houver um evento ativo."
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-border">
              <CardTitle>Próximas Tarefas</CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-border p-0">
              {proximasTarefas.map((tarefa) => (
                <div key={tarefa.label} className="flex items-start gap-4 px-5 py-4">
                  {tarefa.done ? <CheckCircle size={20} className="mt-0.5 text-status-success" /> : <Circle size={20} className="mt-0.5 text-text-tertiary" />}
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-semibold ${tarefa.done ? 'text-text-tertiary line-through' : 'text-foreground'}`}>
                      {tarefa.label}
                    </p>
                    <p className="mt-0.5 text-xs text-text-secondary">{tarefa.due}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {metricas && (
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Resumo Financeiro</CardTitle>
              <button onClick={() => navigate('/financeiro')} className="text-sm font-semibold text-warm-gold">
                Ver detalhes
              </button>
            </CardHeader>
            <CardContent>
              <div className="mb-3 flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm text-text-secondary">Total Arrecadado</p>
                  <p className="text-2xl font-semibold text-status-success">{formatCurrency(metricas.totalArrecadado)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-text-secondary">Total Previsto</p>
                  <p className="text-xl font-semibold text-foreground">{formatCurrency(metricas.totalPrevisto)}</p>
                </div>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-status-success transition-all duration-700"
                  style={{ width: `${Math.min(metricas.breakEvenPct, 100)}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-text-secondary">
                {metricas.breakEvenPct.toFixed(0)}% do previsto arrecadado · Meta: ponto de equilíbrio
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}
