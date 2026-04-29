import { useState } from 'react'
import { Building2, ChevronDown, ChevronUp, Pencil, Plus } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import {
  useLocais,
  useCreateLocal,
  useUpdateLocal,
  useCreateQuarto,
  useUpdateQuarto,
  useDeleteQuarto,
} from '../../hooks/use-acomodacoes'
import type { Local, Quarto } from '@koinonia/shared'

type UserRole = 'admin' | 'lider' | 'servo'

interface EstruturaAcomodacaoPanelProps {
  userRole: UserRole
}

// -------- Local Form --------

interface LocalFormProps {
  initial?: Partial<Local>
  onSave: (data: { nome: string; endereco?: string; capacidade_total?: number }) => void
  onCancel: () => void
  isSaving: boolean
}

function LocalForm({ initial, onSave, onCancel, isSaving }: LocalFormProps) {
  const [nome, setNome] = useState(initial?.nome ?? '')
  const [endereco, setEndereco] = useState(initial?.endereco ?? '')
  const [capacidadeTotal, setCapacidadeTotal] = useState(
    initial?.capacidade_total?.toString() ?? ''
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const parsedCapacidade = capacidadeTotal ? parseInt(capacidadeTotal, 10) : undefined
    onSave({
      nome,
      endereco: endereco || undefined,
      capacidade_total: parsedCapacidade && !isNaN(parsedCapacidade) ? parsedCapacidade : undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border border-border bg-surface-raised p-4">
      <p className="text-sm font-semibold text-foreground">
        {initial?.nome ? 'Editar chácara' : 'Nova chácara'}
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="local-nome">Nome *</Label>
          <Input
            id="local-nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: Chácara Paz e Amor"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="local-endereco">Cidade / Endereço</Label>
          <Input
            id="local-endereco"
            value={endereco}
            onChange={(e) => setEndereco(e.target.value)}
            placeholder="Ex: Juiz de Fora, MG"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="local-capacidade">Capacidade Total</Label>
          <Input
            id="local-capacidade"
            type="number"
            min={1}
            value={capacidadeTotal}
            onChange={(e) => setCapacidadeTotal(e.target.value)}
            placeholder="Ex: 120"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={isSaving}>
          {isSaving ? 'Salvando...' : 'Salvar'}
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}

// -------- Quarto Form --------

interface QuartoFormProps {
  localId: string
  initial?: Partial<Quarto>
  onSave: (data: {
    local_id: string
    nome: string
    genero_permitido: 'M' | 'F' | 'MISTO'
    capacidade: number
  }) => void
  onCancel: () => void
  isSaving: boolean
}

function QuartoForm({ localId, initial, onSave, onCancel, isSaving }: QuartoFormProps) {
  const [nome, setNome] = useState(initial?.nome ?? '')
  const [generoPermitido, setGeneroPermitido] = useState<'M' | 'F' | 'MISTO'>(
    initial?.genero_permitido ?? 'M'
  )
  const [capacidade, setCapacidade] = useState(initial?.capacidade?.toString() ?? '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const parsedCapacidade = capacidade ? parseInt(capacidade, 10) : 0
    onSave({
      local_id: localId,
      nome,
      genero_permitido: generoPermitido,
      capacidade: parsedCapacidade && !isNaN(parsedCapacidade) ? parsedCapacidade : 1,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border border-dashed border-border bg-surface-raised p-4">
      <p className="text-sm font-semibold text-foreground">
        {initial?.nome ? 'Editar quarto' : 'Novo quarto'}
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="quarto-nome">Nome *</Label>
          <Input
            id="quarto-nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: Quarto 01"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="quarto-genero">Gênero *</Label>
          <select
            id="quarto-genero"
            value={generoPermitido}
            onChange={(e) => setGeneroPermitido(e.target.value as 'M' | 'F' | 'MISTO')}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="M">Masculino</option>
            <option value="F">Feminino</option>
            <option value="MISTO">Misto</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="quarto-capacidade">Camas *</Label>
          <Input
            id="quarto-capacidade"
            type="number"
            min={1}
            value={capacidade}
            onChange={(e) => setCapacidade(e.target.value)}
            placeholder="4"
            required
          />
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={isSaving}>
          {isSaving ? 'Salvando...' : 'Salvar'}
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}

// -------- Quarto Row --------

interface QuartoRowProps {
  quarto: Quarto & { camas?: unknown[] }
  localId: string
  canEdit: boolean
  onEdit: (quarto: Quarto) => void
}

function QuartoRow({ quarto, localId, canEdit, onEdit }: QuartoRowProps) {
  const generoLabel = ({ M: 'Masculino', F: 'Feminino', MISTO: 'Misto' } as Record<string, string>)[quarto.genero_permitido] ?? quarto.genero_permitido
  const deleteQuarto = useDeleteQuarto(localId)

  const generoSymbol = quarto.genero_permitido === 'F' ? '♀' : quarto.genero_permitido === 'M' ? '♂' : null
  const iconStyle = quarto.genero_permitido === 'F'
    ? 'bg-status-warning-bg text-status-warning'
    : 'bg-status-info-bg text-status-info'

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <div className="flex items-center gap-3">
        {generoSymbol ? (
          <div className={`flex size-7 items-center justify-center rounded-full text-sm ${iconStyle}`}>
            {generoSymbol}
          </div>
        ) : (
          <div className="size-7" />
        )}
        <div>
          <span className="text-sm font-semibold text-foreground">{quarto.nome}</span>
          <span className="ml-2 text-xs text-text-secondary">
            {generoLabel} · {quarto.capacidade} camas
          </span>
        </div>
      </div>
      {canEdit && (
        <div className="flex items-center gap-3 text-xs font-semibold">
          <button
            type="button"
            className="text-warm-gold hover:underline"
            onClick={() => onEdit(quarto)}
          >
            Editar
          </button>
          <button
            type="button"
            className="text-status-danger hover:underline disabled:opacity-50"
            disabled={deleteQuarto.isPending}
            onClick={() => {
              if (confirm(`Remover "${quarto.nome}" e todas as suas camas?`)) {
                deleteQuarto.mutate(quarto.id!)
              }
            }}
          >
            Remover
          </button>
        </div>
      )}
    </div>
  )
}

// -------- Local Row --------

interface LocalWithQuartos extends Local {
  quartos?: (Quarto & { camas?: unknown[] })[]
}

interface LocalRowProps {
  local: LocalWithQuartos
  canEdit: boolean
}

function LocalRow({ local, canEdit }: LocalRowProps) {
  const [expanded, setExpanded] = useState(true)
  const [showQuartoForm, setShowQuartoForm] = useState(false)
  const [editingQuarto, setEditingQuarto] = useState<Quarto | null>(null)
  const [editingLocal, setEditingLocal] = useState(false)

  const createQuarto = useCreateQuarto()
  const updateQuarto = useUpdateQuarto()
  const updateLocal = useUpdateLocal()

  const quartos = local.quartos ?? []
  const quartoCount = quartos.length

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      {/* Local header */}
      <div className="flex items-center justify-between gap-3 p-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-warm-gold-soft text-warm-gold">
            <Building2 className="size-5" />
          </div>
          <div>
            <p className="font-semibold text-foreground">{local.nome}</p>
            <p className="text-xs text-text-secondary">
              {local.endereco ? `${local.endereco}` : ''}
              {local.capacidade_total ? ` · Cap. ${local.capacidade_total} pessoas` : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-secondary">{quartoCount} quarto{quartoCount !== 1 ? 's' : ''}</span>
          {canEdit && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1 px-3 text-xs"
              onClick={() => {
                setShowQuartoForm(true)
                setEditingQuarto(null)
                setExpanded(true)
              }}
            >
              <Plus className="size-3.5" />
              Quarto
            </Button>
          )}
          {canEdit && (
            <button
              type="button"
              className="flex size-8 items-center justify-center rounded-md border border-border text-text-secondary hover:bg-surface-raised"
              onClick={() => setEditingLocal((v) => !v)}
              title="Editar chácara"
            >
              <Pencil className="size-3.5" />
            </button>
          )}
          <button
            type="button"
            className="flex size-8 items-center justify-center rounded-md border border-border text-text-secondary hover:bg-surface-raised"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </button>
        </div>
      </div>

      {/* Edit local form */}
      {editingLocal && canEdit && (
        <div className="border-t border-border p-4">
          <LocalForm
            initial={local}
            isSaving={updateLocal.isPending}
            onCancel={() => setEditingLocal(false)}
            onSave={async (data) => {
              await updateLocal.mutateAsync({ id: local.id!, payload: data })
              setEditingLocal(false)
            }}
          />
        </div>
      )}

      {/* Quartos list */}
      {expanded && (
        <div className="border-t border-border">
          {quartos.length > 0 && (
            <div className="divide-y divide-border">
              <div className="px-4 py-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">Quartos</p>
              </div>
              {quartos.map((quarto) => (
                <div key={quarto.id}>
                  {editingQuarto?.id === quarto.id && editingQuarto ? (
                    <div className="p-4">
                      <QuartoForm
                        localId={local.id!}
                        initial={editingQuarto}
                        isSaving={updateQuarto.isPending}
                        onCancel={() => setEditingQuarto(null)}
                        onSave={async (data) => {
                          await updateQuarto.mutateAsync({
                            id: editingQuarto.id!,
                            localId: local.id!,
                            payload: data,
                          })
                          setEditingQuarto(null)
                        }}
                      />
                    </div>
                  ) : (
                    <QuartoRow
                      quarto={quarto}
                      localId={local.id!}
                      canEdit={canEdit}
                      onEdit={(q) => {
                        setEditingQuarto(q)
                        setShowQuartoForm(false)
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {showQuartoForm && canEdit && (
            <div className="p-4">
              <QuartoForm
                localId={local.id!}
                isSaving={createQuarto.isPending}
                onCancel={() => setShowQuartoForm(false)}
                onSave={async (data) => {
                  await createQuarto.mutateAsync({ localId: local.id!, payload: data })
                  setShowQuartoForm(false)
                }}
              />
            </div>
          )}

          {!showQuartoForm && canEdit && (
            <button
              type="button"
              className="flex w-full items-center gap-2 border-t border-dashed border-border px-4 py-3 text-sm text-text-tertiary transition-colors hover:bg-surface-raised hover:text-text-secondary"
              onClick={() => {
                setShowQuartoForm(true)
                setEditingQuarto(null)
              }}
            >
              <Plus className="size-4" />
              Adicionar quarto
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// -------- Main Panel --------

export function EstruturaAcomodacaoPanel({ userRole }: EstruturaAcomodacaoPanelProps) {
  const canEdit = userRole === 'admin' || userRole === 'lider'

  const { data: locais = [], isLoading } = useLocais()
  const createLocal = useCreateLocal()

  const [showLocalForm, setShowLocalForm] = useState(false)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-end">
        {canEdit && !showLocalForm && (
          <Button size="sm" variant="gold" onClick={() => setShowLocalForm(true)}>
            <Plus className="size-4" />
            Nova chácara
          </Button>
        )}
      </div>

      {showLocalForm && canEdit && (
        <LocalForm
          isSaving={createLocal.isPending}
          onCancel={() => setShowLocalForm(false)}
          onSave={async (data) => {
            await createLocal.mutateAsync(data)
            setShowLocalForm(false)
          }}
        />
      )}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : locais.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-10 text-center">
          <p className="font-semibold text-text-secondary">Nenhuma chácara cadastrada</p>
          <p className="mt-1 text-sm text-text-tertiary">Clique em "Nova chácara" para começar.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {(locais as LocalWithQuartos[]).map((local) => (
            <LocalRow key={local.id} local={local} canEdit={canEdit} />
          ))}
        </div>
      )}

      {/* Footer add link */}
      {!showLocalForm && canEdit && locais.length > 0 && (
        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border py-3 text-sm text-text-tertiary transition-colors hover:border-warm-gold/50 hover:text-warm-gold"
          onClick={() => setShowLocalForm(true)}
        >
          <Building2 className="size-4" />
          Adicionar nova chácara
        </button>
      )}
    </div>
  )
}
