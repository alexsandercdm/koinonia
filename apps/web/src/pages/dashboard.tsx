import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Users, ClipboardList, Bed, Wallet, Plus, ArrowRight } from 'lucide-react'
import { AppLayout } from '../components/layout/AppLayout'
import { apiFetch } from '../lib/api'

interface MetricasFinanceiro {
  totalArrecadado: number
  totalPrevisto: number
  breakEvenPct: number
}

interface ParticipantesListResponse {
  total?: number
  data?: unknown[]
}

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

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

  const participantesCount = Array.isArray(participantesData)
    ? participantesData.length
    : (participantesData as ParticipantesListResponse)?.total ?? 0

  const metricCards = [
    {
      icon: Users,
      label: 'Participantes',
      value: participantesCount,
      color: 'text-violet-400',
      bg: 'bg-violet-500/10',
      path: '/participantes',
    },
    {
      icon: ClipboardList,
      label: 'Inscrições',
      value: participantesCount,
      color: 'text-sky-400',
      bg: 'bg-sky-500/10',
      path: '/inscricoes',
    },
    {
      icon: Bed,
      label: 'Acomodações',
      value: '—',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      path: '/acomodacoes',
    },
    {
      icon: Wallet,
      label: 'Arrecadado',
      value: metricas ? formatCurrency(metricas.totalArrecadado) : '—',
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      path: '/financeiro',
    },
  ]

  const quickActions = [
    { label: 'Participantes', path: '/participantes', icon: Users },
    { label: 'Inscrições', path: '/inscricoes', icon: ClipboardList },
    { label: 'Acomodações', path: '/acomodacoes', icon: Bed },
    { label: 'Financeiro', path: '/financeiro', icon: Wallet },
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
                'url(https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1600&q=80)',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f0814] via-[#0f0814]/80 to-transparent z-10" />
          <div className="relative z-20 h-full flex flex-col justify-end p-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#ffbf00] mb-2">
              Evento Atual
            </p>
            <h2 className="text-3xl font-bold text-white mb-1 leading-tight">
              Retiro Koinonia 2025
            </h2>
            <p className="text-slate-400 text-sm mb-6">Juiz de Fora, MG · Janeiro 2025</p>
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
            {metricCards.map(({ icon: Icon, label, value, color, bg, path }) => (
              <button
                key={label}
                onClick={() => navigate(path)}
                className="bg-surface-dark border border-border-dark p-6 rounded-xl flex flex-col gap-4 hover:border-[#4d0085]/50 transition-all text-left group"
              >
                <div className="flex items-center justify-between">
                  <div className={`size-10 rounded-xl ${bg} flex items-center justify-center`}>
                    <Icon size={20} className={color} />
                  </div>
                  <ArrowRight
                    size={16}
                    className="text-slate-600 group-hover:text-slate-400 transition-colors"
                  />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{value}</p>
                  <p className="text-sm text-slate-400 mt-1">{label}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <h3 className="text-xl font-bold text-white mb-6">Acesso Rápido</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map(({ label, path, icon: Icon }) => (
              <button
                key={label}
                onClick={() => navigate(path)}
                className="bg-surface-dark border border-border-dark hover:border-[#4d0085]/50 p-5 rounded-xl flex flex-col items-center gap-3 transition-all hover:bg-surface-elevated group"
              >
                <div className="size-12 rounded-xl bg-[#4d0085]/10 flex items-center justify-center group-hover:bg-[#4d0085]/20 transition-colors">
                  <Icon size={22} className="text-[#4d0085]" />
                </div>
                <span className="text-sm font-medium text-slate-300">{label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Financial Summary (if data available) */}
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
                {metricas.breakEvenPct.toFixed(0)}% do previsto arrecadado
              </p>
            </div>
          </section>
        )}
      </div>
    </AppLayout>
  )
}
