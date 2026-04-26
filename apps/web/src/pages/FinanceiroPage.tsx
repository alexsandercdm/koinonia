import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { TrendingUp, Target, Plus, X, Wallet, Clock, Utensils, Home, Bus, MoreHorizontal } from 'lucide-react'
import { AppLayout } from '../components/layout/AppLayout'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { FormField } from '../components/ui/form-field'
import { Input } from '../components/ui/input'
import { Select } from '../components/ui/select'
import { apiFetch, apiFetchList } from '../lib/api'
import type { EventoListItem } from '../hooks/use-inscricoes'

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

interface InscricaoResumo {
  id: string
  pessoa?: { nome: string }
  valor_total: number
  valor_pago: number
  status: string
}

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR')
}

const DESPESA_STATUS: Record<string, { label: string; variant: React.ComponentProps<typeof Badge>['variant'] }> = {
  pago: { label: 'Quitado', variant: 'success' },
  pendente: { label: 'A Pagar', variant: 'warning' },
  cancelado: { label: 'Cancelado', variant: 'danger' },
}

const INSCRICAO_STATUS: Record<string, { label: string; variant: React.ComponentProps<typeof Badge>['variant'] }> = {
  PAGO_TOTAL: { label: 'Pago', variant: 'success' },
  PAGO_PARCIAL: { label: 'Parcial', variant: 'info' },
  PENDENTE: { label: 'Pendente', variant: 'warning' },
  LISTA_ESPERA: { label: 'Espera', variant: 'neutral' },
  CANCELADA: { label: 'Cancelada', variant: 'danger' },
}

function getCategoriaIcon(categoria: string) {
  const lower = categoria.toLowerCase()
  if (lower.includes('aliment') || lower.includes('buffet') || lower.includes('comida')) return Utensils
  if (lower.includes('local') || lower.includes('chácara') || lower.includes('espaço')) return Home
  if (lower.includes('transporte') || lower.includes('ônibus')) return Bus
  return MoreHorizontal
}

function NovaDespesaModal({ onClose, onSave, isLoading }: { onClose: () => void; onSave: (despesa: DespesaPayload) => void; isLoading: boolean }) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Nova Despesa</h3>
          <button type="button" aria-label="Fechar modal" onClick={onClose} className="inline-flex size-10 items-center justify-center rounded-lg text-text-secondary hover:bg-accent hover:text-foreground">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Descrição">
            <Input required value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} placeholder="Ex: Aluguel do espaço" />
          </FormField>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Valor (R$)">
              <Input required type="number" min={0} step={0.01} value={form.valor || ''} onChange={(e) => setForm({ ...form, valor: parseFloat(e.target.value) || 0 })} placeholder="0,00" />
            </FormField>
            <FormField label="Data">
              <Input required type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} />
            </FormField>
          </div>

          <FormField label="Categoria">
            <Input value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} placeholder="Ex: Infraestrutura" />
          </FormField>

          <FormField label="Status">
            <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as DespesaPayload['status'] })}>
              <option value="pendente">Pendente</option>
              <option value="pago">Pago</option>
              <option value="cancelado">Cancelado</option>
            </Select>
          </FormField>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>{isLoading ? 'Salvando...' : 'Salvar'}</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

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
    queryFn: () => apiFetchList<Despesa>('/api/v1/financeiro/despesas'),
    retry: 1,
  })

  const { data: eventos } = useQuery({
    queryKey: ['eventos'],
    queryFn: () => apiFetch<EventoListItem[]>('/api/v1/eventos'),
    retry: 1,
  })

  const primeiroEvento = eventos?.[0]

  const { data: inscricoes = [] } = useQuery({
    queryKey: ['inscricoes-financeiro', primeiroEvento?.id],
    queryFn: () => apiFetch<InscricaoResumo[]>(`/api/v1/inscricoes?evento_id=${primeiroEvento!.id}&limit=8`),
    enabled: !!primeiroEvento?.id,
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

  const saldoAtual = metricas ? metricas.totalArrecadado - despesas.filter((d) => d.status === 'pago').reduce((s, d) => s + d.valor, 0) : 0
  const totalPendente = metricas ? metricas.totalPrevisto - metricas.totalArrecadado : 0

  return (
    <AppLayout
      title="Financeiro"
      actions={<Button size="sm" onClick={() => setModalOpen(true)}><Plus size={16} />Novo Lançamento</Button>}
    >
      <div className="mx-auto w-full max-w-[1400px] space-y-8 p-4 sm:p-6 lg:p-8">
        <Card>
          <CardHeader>
            <CardTitle>Visão Geral</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="mb-1 text-xs font-semibold uppercase text-text-tertiary">Ponto de Equilíbrio</p>
                <div className="flex flex-wrap items-baseline gap-3">
                  <div>
                    <p className="text-xs text-text-secondary">Total Arrecadado</p>
                    <p className="text-xl font-semibold text-status-success">{metricasLoading ? '—' : formatCurrency(metricas?.totalArrecadado ?? 0)}</p>
                  </div>
                  <span className="text-text-tertiary">/</span>
                  <div>
                    <p className="text-xs text-text-secondary">Despesas Totais</p>
                    <p className="text-xl font-semibold text-status-danger">{metricasLoading ? '—' : formatCurrency(metricas?.totalPrevisto ?? 0)}</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-text-secondary">Meta: <span className="font-semibold text-foreground">{metricas?.breakEvenPct.toFixed(0) ?? 0}% atingida</span></p>
            </div>
            <div className="mb-4 h-3 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-status-success transition-all duration-700" style={{ width: `${Math.min(metricas?.breakEvenPct ?? 0, 100)}%` }} />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-4 rounded-lg border border-border bg-surface-raised p-4">
                <Wallet size={20} className="text-status-success" />
                <div><p className="text-xs text-text-secondary">Saldo Atual</p><p className="text-xl font-semibold text-status-success">{metricasLoading ? '—' : formatCurrency(Math.max(saldoAtual, 0))}</p></div>
              </div>
              <div className="flex items-center gap-4 rounded-lg border border-border bg-surface-raised p-4">
                <Clock size={20} className="text-warm-gold" />
                <div><p className="text-xs text-text-secondary">Pendente</p><p className="text-xl font-semibold text-warm-gold">{metricasLoading ? '—' : formatCurrency(Math.max(totalPendente, 0))}</p></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { label: 'Total Arrecadado', value: metricas ? formatCurrency(metricas.totalArrecadado) : '—', icon: TrendingUp, tone: 'text-status-success' },
            { label: 'Total Previsto', value: metricas ? formatCurrency(metricas.totalPrevisto) : '—', icon: Target, tone: 'text-status-info' },
            { label: 'Break-even', value: metricas ? `${metricas.breakEvenPct.toFixed(1)}%` : '—', icon: Wallet, tone: 'text-warm-gold' },
          ].map(({ label, value, icon: Icon, tone }) => (
            <Card key={label}><CardContent className="flex items-center gap-4 p-5"><Icon size={20} className={tone} /><div><p className="text-xs text-text-secondary">{label}</p><p className={`mt-0.5 text-xl font-semibold ${tone}`}>{metricasLoading ? '—' : value}</p></div></CardContent></Card>
          ))}
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex-row items-center justify-between border-b border-border">
              <CardTitle>Receitas (Inscrições)</CardTitle>
              <button className="text-sm font-semibold text-warm-gold">Ver todas</button>
            </CardHeader>
            <CardContent className="p-0">
              {inscricoes.length === 0 ? (
                <div className="py-12 text-center text-sm text-text-secondary">{primeiroEvento ? 'Nenhuma inscrição encontrada' : 'Selecione um evento'}</div>
              ) : (
                <div className="max-h-[300px] overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-card text-xs uppercase text-text-secondary">
                      <tr><th className="px-5 py-3 text-left">Participante</th><th className="px-5 py-3 text-left">Valor</th><th className="px-5 py-3 text-left">Status</th></tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {inscricoes.map((i) => {
                        const cfg = INSCRICAO_STATUS[i.status] ?? { label: i.status, variant: 'neutral' as const }
                        return (
                          <tr key={i.id} className="transition-colors hover:bg-surface-raised">
                            <td className="max-w-[160px] truncate px-5 py-3 font-semibold text-foreground">{i.pessoa?.nome ?? '—'}</td>
                            <td className="px-5 py-3 text-status-success">{formatCurrency(i.valor_total)}</td>
                            <td className="px-5 py-3"><Badge variant={cfg.variant}>{cfg.label}</Badge></td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between border-b border-border">
              <CardTitle>Despesas Previstas</CardTitle>
              <button onClick={() => setModalOpen(true)} className="text-sm font-semibold text-warm-gold">Novo Gasto</button>
            </CardHeader>
            <CardContent className="p-0">
              {despesasLoading ? (
                <div className="py-12 text-center text-sm text-text-secondary">Carregando...</div>
              ) : despesas.length === 0 ? (
                <div className="py-12 text-center text-sm text-text-secondary">Nenhuma despesa registrada</div>
              ) : (
                <div className="max-h-[300px] divide-y divide-border overflow-y-auto">
                  {despesas.map((d) => {
                    const CatIcon = getCategoriaIcon(d.categoria)
                    const cfg = DESPESA_STATUS[d.status] ?? { label: d.status, variant: 'neutral' as const }
                    return (
                      <div key={d.id} className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-surface-raised">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted"><CatIcon size={16} className="text-text-secondary" /></div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-foreground">{d.descricao}</p>
                          <p className="text-xs text-text-secondary">{d.status === 'pago' ? 'Pagamento Antecipado' : `Vencimento: ${formatDate(d.data)}`}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-sm font-semibold text-status-danger">{formatCurrency(d.valor)}</p>
                          <Badge variant={cfg.variant} className="mt-1">{cfg.label}</Badge>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {modalOpen ? (
        <NovaDespesaModal onClose={() => setModalOpen(false)} onSave={(payload) => createDespesa.mutate(payload)} isLoading={createDespesa.isPending} />
      ) : null}
    </AppLayout>
  )
}
