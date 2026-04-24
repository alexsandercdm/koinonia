import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Users,
  ClipboardList,
  Bed,
  Wallet,
  Plus,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  FileText,
  FileSpreadsheet,
  Image,
  CheckCircle,
  Circle,
  MapPin,
} from 'lucide-react'
import { AppLayout } from '../components/layout/AppLayout'
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

const STATUS_CONFIG: Record<string, { label: string; classes: string }> = {
  PAGO_TOTAL: {
    label: 'Pago',
    classes: 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20',
  },
  PAGO_PARCIAL: {
    label: 'Parcial',
    classes: 'bg-blue-400/10 text-blue-400 border border-blue-400/20',
  },
  PENDENTE: {
    label: 'Pendente',
    classes: 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/20',
  },
  LISTA_ESPERA: {
    label: 'Espera',
    classes: 'bg-slate-400/10 text-slate-400 border border-slate-400/20',
  },
  CANCELADA: {
    label: 'Cancelada',
    classes: 'bg-red-400/10 text-red-400 border border-red-400/20',
  },
}

const quickReports = [
  { icon: FileText, label: 'Lista de Presença', meta: 'PDF', color: 'text-violet-400' },
  { icon: FileSpreadsheet, label: 'Resumo Financeiro', meta: 'XLS', color: 'text-emerald-400' },
  { icon: FileText, label: 'Restrições Alimentares', meta: 'PDF', color: 'text-amber-400' },
  { icon: Image, label: 'Mapa de Quartos', meta: 'IMG', color: 'text-sky-400' },
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
    {
      icon: Users,
      label: 'Total de Inscritos',
      value: participantesCount || '—',
      trend: { value: 12, up: true },
      color: 'text-violet-400',
      bg: 'bg-violet-500/10',
      path: '/participantes',
    },
    {
      icon: Wallet,
      label: 'Pagamentos Confirmados',
      value: pagamentosConfirmados || '—',
      trend: { value: 5, up: true },
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      path: '/financeiro',
    },
    {
      icon: Bed,
      label: 'Ocupação de Leitos',
      value: ocupacaoLeitos ? `${ocupacaoLeitos}%` : '—',
      trend: { value: 2, up: false },
      color: 'text-sky-400',
      bg: 'bg-sky-500/10',
      path: '/acomodacoes',
    },
    {
      icon: ClipboardList,
      label: 'Arrecadado',
      value: metricas ? formatCurrency(metricas.totalArrecadado) : '—',
      trend: null,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      path: '/financeiro',
    },
  ]

  return (
    <AppLayout
      actions={
        <button
          onClick={() => navigate('/inscricoes')}
          className="flex items-center gap-2 bg-[#4d0085] hover:bg-[#4d0085]/90 text-white px-4 py-2 rounded-xl font-medium transition-colors text-sm"
        >
          <Plus size={16} />
          Novo Evento
        </button>
      }
    >
      <div className="p-8 space-y-8 max-w-[1400px] mx-auto w-full">
        {/* Hero Card */}
        <section className="relative h-[280px] rounded-2xl overflow-hidden group">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{
              backgroundImage:
                'url(https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=1600&q=80)',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f0814] via-[#0f0814]/80 to-transparent z-10" />
          <div className="relative z-20 h-full flex flex-col justify-end p-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#ffbf00] mb-2">
              Destaque
            </p>
            <h2 className="text-3xl font-bold text-white mb-1 leading-tight">
              {primeiroEvento?.nome ?? 'Retiro Koinonia 2025'}
            </h2>
            {primeiroEvento && (
              <div className="flex items-center gap-4 text-slate-400 text-sm mb-6">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                  {new Date(primeiroEvento.data_inicio).toLocaleDateString('pt-BR')} –{' '}
                  {new Date(primeiroEvento.data_fim).toLocaleDateString('pt-BR')}
                </span>
              </div>
            )}
            {!primeiroEvento && (
              <div className="flex items-center gap-1.5 text-slate-400 text-sm mb-6">
                <MapPin size={14} />
                <span>O maior evento de imersão espiritual do ano</span>
              </div>
            )}
            <button
              onClick={() => navigate('/participantes')}
              className="self-start flex items-center gap-2 bg-[#4d0085] hover:bg-[#4d0085]/90 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-[#4d0085]/20 transition-all"
            >
              Gerenciar Evento
              <ArrowRight size={16} />
            </button>
          </div>
        </section>

        {/* Metrics Grid */}
        <section>
          <h3 className="text-xl font-bold text-white mb-6">Métricas Atuais</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {metricCards.map(({ icon: Icon, label, value, trend, color, bg, path }) => (
              <button
                key={label}
                onClick={() => navigate(path)}
                className="bg-surface-dark border border-border-dark p-6 rounded-xl flex flex-col gap-4 hover:border-[#4d0085]/50 transition-all text-left group"
              >
                <div className="flex items-center justify-between">
                  <div className={`size-10 rounded-xl ${bg} flex items-center justify-center`}>
                    <Icon size={20} className={color} />
                  </div>
                  {trend ? (
                    <span
                      className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                        trend.up
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-red-500/10 text-red-400'
                      }`}
                    >
                      {trend.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {trend.value}%
                    </span>
                  ) : (
                    <ArrowRight
                      size={16}
                      className="text-slate-600 group-hover:text-slate-400 transition-colors"
                    />
                  )}
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{value}</p>
                  <p className="text-sm text-slate-400 mt-1">{label}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Relatórios Rápidos */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Relatórios Rápidos</h3>
            <button className="text-xs font-bold text-[#ffbf00] hover:underline">
              Ver todos os relatórios
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickReports.map(({ icon: Icon, label, meta, color }) => (
              <button
                key={label}
                className="bg-surface-dark border border-border-dark hover:border-[#4d0085]/50 p-5 rounded-xl flex items-center gap-4 transition-all hover:bg-surface-elevated group"
              >
                <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-[#4d0085]/10 transition-colors">
                  <Icon size={18} className={color} />
                </div>
                <div className="text-left min-w-0">
                  <p className="text-sm font-medium text-white truncate">{label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{meta}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Bottom 2-column: Inscrições Recentes + Próximas Tarefas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Inscrições Recentes */}
          <section className="bg-surface-dark border border-border-dark rounded-xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-border-dark">
              <h3 className="font-bold text-white">Inscrições Recentes</h3>
              <button
                onClick={() => navigate('/inscricoes')}
                className="text-xs font-bold text-[#ffbf00] hover:underline"
              >
                Ver Todas
              </button>
            </div>
            <div className="divide-y divide-border-dark">
              {inscricoesRecentes && inscricoesRecentes.length > 0 ? (
                inscricoesRecentes.slice(0, 5).map((inscricao) => {
                  const statusCfg = STATUS_CONFIG[inscricao.status] ?? {
                    label: inscricao.status,
                    classes: 'bg-slate-400/10 text-slate-400 border border-slate-400/20',
                  }
                  const nome = inscricao.pessoa?.nome ?? 'Participante'
                  return (
                    <div key={inscricao.id} className="flex items-center gap-4 px-5 py-4">
                      <div className="size-10 rounded-full bg-[#4d0085]/20 border border-[#4d0085]/30 flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-violet-300">
                          {getInitials(nome)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{nome}</p>
                        <p className="text-xs text-slate-500">{timeAgo(inscricao.created_at)}</p>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase shrink-0 ${statusCfg.classes}`}
                      >
                        {statusCfg.label}
                      </span>
                    </div>
                  )
                })
              ) : (
                [
                  { initials: 'JD', nome: 'João Delatorre', time: 'há 5 min', status: 'PAGO_TOTAL' },
                  { initials: 'MS', nome: 'Maria Santos', time: 'há 15 min', status: 'PENDENTE' },
                  { initials: 'RL', nome: 'Ricardo Lemos', time: 'há 1h', status: 'PAGO_TOTAL' },
                ].map((item) => {
                  const cfg = STATUS_CONFIG[item.status]
                  return (
                    <div key={item.nome} className="flex items-center gap-4 px-5 py-4">
                      <div className="size-10 rounded-full bg-[#4d0085]/20 border border-[#4d0085]/30 flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-violet-300">{item.initials}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white">{item.nome}</p>
                        <p className="text-xs text-slate-500">Inscrito {item.time}</p>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase shrink-0 ${cfg.classes}`}
                      >
                        {cfg.label}
                      </span>
                    </div>
                  )
                })
              )}
            </div>
          </section>

          {/* Próximas Tarefas */}
          <section className="bg-surface-dark border border-border-dark rounded-xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-border-dark">
              <h3 className="font-bold text-white">Próximas Tarefas</h3>
            </div>
            <div className="divide-y divide-border-dark">
              {proximasTarefas.map((tarefa) => (
                <div key={tarefa.label} className="flex items-start gap-4 px-5 py-4">
                  <button className="mt-0.5 shrink-0 text-slate-600 hover:text-[#4d0085] transition-colors">
                    {tarefa.done ? (
                      <CheckCircle size={20} className="text-emerald-400" />
                    ) : (
                      <Circle size={20} />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium ${tarefa.done ? 'line-through text-slate-500' : 'text-white'}`}
                    >
                      {tarefa.label}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">{tarefa.due}</p>
                  </div>
                </div>
              ))}
              <div className="px-5 py-4">
                <button className="flex items-center gap-2 text-sm text-slate-500 hover:text-[#ffbf00] transition-colors font-medium">
                  <Plus size={16} />
                  Adicionar Tarefa
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Financial Summary */}
        {metricas && (
          <section>
            <div className="bg-surface-dark border border-border-dark rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Resumo Financeiro</h3>
                <button
                  onClick={() => navigate('/financeiro')}
                  className="text-xs font-bold text-[#ffbf00] hover:underline"
                >
                  Ver detalhes
                </button>
              </div>
              <div className="flex justify-between items-end mb-3">
                <div>
                  <p className="text-sm text-slate-400">Total Arrecadado</p>
                  <p className="text-2xl font-bold text-emerald-400">
                    {formatCurrency(metricas.totalArrecadado)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-400">Total Previsto</p>
                  <p className="text-xl font-bold text-slate-300">
                    {formatCurrency(metricas.totalPrevisto)}
                  </p>
                </div>
              </div>
              <div className="relative h-3 w-full bg-[#0f0814] rounded-full overflow-hidden">
                <div
                  className="absolute h-full bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.4)] transition-all duration-700"
                  style={{ width: `${Math.min(metricas.breakEvenPct, 100)}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {metricas.breakEvenPct.toFixed(0)}% do previsto arrecadado · Meta: ponto de
                equilíbrio
              </p>
            </div>
          </section>
        )}
      </div>
    </AppLayout>
  )
}
