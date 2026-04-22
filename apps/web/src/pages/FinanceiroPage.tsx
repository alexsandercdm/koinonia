import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { TrendingUp, TrendingDown, Target, Plus, X } from 'lucide-react'
import { AppLayout } from '../components/layout/AppLayout'
import { apiFetch } from '../lib/api'

// ---- Types ----

interface MetricasFinanceiro {
  totalArrecadado: number
  totalPrevisto: number
  breakEvenPct: number
  porStatus: Record<string, number>
}

interface Despesa {
  id: string
  descricao: string
  valor: number
  categoria: string
  data: string
  status: 'pendente' | 'pago' | 'cancelado'
}

interface DespesaPayload {
  descricao: string
  valor: number
  categoria: string
  data: string
  status: 'pendente' | 'pago' | 'cancelado'
}

// ---- Helpers ----

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR')
}

const STATUS_COLORS: Record<string, string> = {
  pago: '#10b981',
  pendente: '#f59e0b',
  cancelado: '#ef4444',
  Pago: '#10b981',
  Pendente: '#f59e0b',
  Cancelado: '#ef4444',
}

const STATUS_LABELS: Record<string, string> = {
  pago: 'Pago',
  pendente: 'Pendente',
  cancelado: 'Cancelado',
}

// ---- Modal Nova Despesa ----

interface NovaDespesaModalProps {
  onClose: () => void
  onSave: (despesa: DespesaPayload) => void
  isLoading: boolean
}

function NovaDespesaModal({ onClose, onSave, isLoading }: NovaDespesaModalProps) {
  const [form, setForm] = useState<DespesaPayload>({
    descricao: '',
    valor: 0,
    categoria: '',
    data: new Date().toISOString().slice(0, 10),
    status: 'pendente',
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSave(form)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-surface-dark border border-border-dark rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white">Nova Despesa</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">
              Descrição
            </label>
            <input
              type="text"
              required
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-[#4d0085] transition-colors"
              placeholder="Ex: Aluguel do espaço"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">
                Valor (R$)
              </label>
              <input
                type="number"
                required
                min={0}
                step={0.01}
                value={form.valor || ''}
                onChange={(e) => setForm({ ...form, valor: parseFloat(e.target.value) || 0 })}
                className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-[#4d0085] transition-colors"
                placeholder="0,00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">
                Data
              </label>
              <input
                type="date"
                required
                value={form.data}
                onChange={(e) => setForm({ ...form, data: e.target.value })}
                className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#4d0085] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">
              Categoria
            </label>
            <input
              type="text"
              value={form.categoria}
              onChange={(e) => setForm({ ...form, categoria: e.target.value })}
              className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-[#4d0085] transition-colors"
              placeholder="Ex: Infraestrutura"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">
              Status
            </label>
            <select
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value as DespesaPayload['status'] })
              }
              className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#4d0085] transition-colors"
            >
              <option value="pendente">Pendente</option>
              <option value="pago">Pago</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-border-dark text-slate-300 hover:text-white py-2.5 rounded-xl font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-[#4d0085] hover:bg-[#4d0085]/90 text-white py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ---- Main Page ----

export function FinanceiroPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data: metricas, isLoading: metricasLoading } = useQuery({
    queryKey: ['financeiro-metricas'],
    queryFn: () => apiFetch<MetricasFinanceiro>('/api/v1/financeiro/metricas'),
    retry: 1,
  })

  const { data: despesas = [], isLoading: despesasLoading } = useQuery({
    queryKey: ['financeiro-despesas'],
    queryFn: () => apiFetch<Despesa[]>('/api/v1/financeiro/despesas'),
    retry: 1,
  })

  const createDespesa = useMutation({
    mutationFn: (payload: DespesaPayload) =>
      apiFetch<Despesa>('/api/v1/financeiro/despesas', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financeiro-despesas'] })
      queryClient.invalidateQueries({ queryKey: ['financeiro-metricas'] })
      setModalOpen(false)
    },
  })

  // Build chart data from porStatus
  const chartData = metricas?.porStatus
    ? Object.entries(metricas.porStatus).map(([key, value]) => ({
        name: STATUS_LABELS[key] ?? key,
        value,
        color: STATUS_COLORS[key] ?? '#6366f1',
      }))
    : []

  const kpiCards = [
    {
      label: 'Total Arrecadado',
      value: metricas ? formatCurrency(metricas.totalArrecadado) : '—',
      icon: TrendingUp,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
    },
    {
      label: 'Total Previsto',
      value: metricas ? formatCurrency(metricas.totalPrevisto) : '—',
      icon: Target,
      color: 'text-sky-400',
      bg: 'bg-sky-500/10',
      border: 'border-sky-500/20',
    },
    {
      label: 'Break-even',
      value: metricas ? `${metricas.breakEvenPct.toFixed(1)}%` : '—',
      icon: TrendingDown,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
    },
  ]

  return (
    <AppLayout
      title="Financeiro"
      actions={
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-[#4d0085] hover:bg-[#4d0085]/90 text-white px-4 py-2 rounded-xl font-medium transition-colors text-sm"
        >
          <Plus size={16} />
          Nova Despesa
        </button>
      }
    >
      <div className="p-8 space-y-8 max-w-[1400px] mx-auto w-full">
        {/* KPI Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {kpiCards.map(({ label, value, icon: Icon, color, bg, border }) => (
            <div
              key={label}
              className={`bg-surface-dark border ${border} rounded-xl p-6 flex items-center gap-4`}
            >
              <div className={`size-12 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                <Icon size={22} className={color} />
              </div>
              <div>
                <p className="text-sm text-slate-400">{label}</p>
                <p className={`text-2xl font-bold ${color} mt-0.5`}>
                  {metricasLoading ? (
                    <span className="inline-block w-20 h-6 bg-surface-elevated rounded animate-pulse" />
                  ) : (
                    value
                  )}
                </p>
              </div>
            </div>
          ))}
        </section>

        {/* Progress bar */}
        {metricas && (
          <section className="bg-surface-dark border border-border-dark rounded-xl p-6">
            <div className="flex justify-between items-end mb-3">
              <div>
                <p className="text-sm text-slate-400">Total Arrecadado</p>
                <p className="text-2xl font-bold text-emerald-400">
                  {formatCurrency(metricas.totalArrecadado)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-400">Despesas Totais</p>
                <p className="text-xl font-bold text-rose-400">
                  {formatCurrency(metricas.totalPrevisto)}
                </p>
              </div>
            </div>
            <div className="relative h-4 w-full bg-background-dark rounded-full overflow-hidden">
              <div
                className="absolute h-full bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all duration-700"
                style={{ width: `${Math.min(metricas.breakEvenPct, 100)}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {metricas.breakEvenPct.toFixed(0)}% do previsto arrecadado
            </p>
          </section>
        )}

        {/* Chart + Despesas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart */}
          <section className="bg-surface-dark border border-border-dark rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-6">Distribuição por Status</h3>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} barSize={40}>
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    tickFormatter={(v) => formatCurrency(v as number)}
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#1b0f23',
                      border: '1px solid #2d1b3d',
                      borderRadius: '12px',
                      color: '#fff',
                    }}
                    formatter={(value: number) => [formatCurrency(value), 'Valor']}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[220px] text-slate-500 text-sm">
                Sem dados disponíveis
              </div>
            )}
          </section>

          {/* Despesas Table */}
          <section className="bg-surface-dark border border-border-dark rounded-xl overflow-hidden flex flex-col">
            <div className="p-5 border-b border-border-dark flex items-center justify-between bg-rose-500/5">
              <h4 className="font-bold text-lg text-white">Despesas Recentes</h4>
              <button
                onClick={() => setModalOpen(true)}
                className="text-xs font-bold text-[#ffbf00] hover:underline"
              >
                Novo Gasto
              </button>
            </div>

            {despesasLoading ? (
              <div className="flex items-center justify-center py-12 text-slate-500 text-sm">
                Carregando...
              </div>
            ) : despesas.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-slate-500 text-sm">
                Nenhuma despesa registrada
              </div>
            ) : (
              <div className="overflow-y-auto max-h-[260px]">
                <table className="w-full text-sm">
                  <thead className="text-xs uppercase text-slate-500 sticky top-0 bg-surface-dark">
                    <tr>
                      <th className="px-5 py-3 text-left">Descrição</th>
                      <th className="px-5 py-3 text-left">Valor</th>
                      <th className="px-5 py-3 text-left">Data</th>
                      <th className="px-5 py-3 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-dark">
                    {despesas.map((d) => (
                      <tr
                        key={d.id}
                        className="hover:bg-background-dark/40 transition-colors"
                      >
                        <td className="px-5 py-3 font-medium text-white">{d.descricao}</td>
                        <td className="px-5 py-3 text-rose-400">{formatCurrency(d.valor)}</td>
                        <td className="px-5 py-3 text-slate-400">{formatDate(d.data)}</td>
                        <td className="px-5 py-3">
                          <span
                            className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase"
                            style={{
                              background: `${STATUS_COLORS[d.status]}1a`,
                              color: STATUS_COLORS[d.status] ?? '#94a3b8',
                            }}
                          >
                            {STATUS_LABELS[d.status] ?? d.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <NovaDespesaModal
          onClose={() => setModalOpen(false)}
          onSave={(payload) => createDespesa.mutate(payload)}
          isLoading={createDespesa.isPending}
        />
      )}
    </AppLayout>
  )
}
