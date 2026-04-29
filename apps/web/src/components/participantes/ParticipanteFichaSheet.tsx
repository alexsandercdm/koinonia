import { useEffect, useMemo, useState } from 'react'
import type { CreatePessoa, Pessoa, UpdatePessoa } from '@koinonia/shared'
import { Alert, AlertDescription } from '../ui/alert'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { EmptyState } from '../ui/empty-state'
import { FilterTabs } from '../ui/filter-tabs'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '../ui/sheet'
import {
  ParticipanteHistoricoItem,
  useCreateParticipante,
  useDeleteParticipante,
  useParticipante,
  useParticipanteHistorico,
  useUpdateParticipante,
} from '../../hooks/use-participantes'
import { ParticipanteForm } from './ParticipanteForm'

type FichaSection = 'dados' | 'saude' | 'emergencia' | 'historico'
type StatusMessage = { type: 'success' | 'error'; text: string } | null

export interface ParticipanteFichaSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  participanteId?: string
  mode: 'create' | 'edit'
  canWrite: boolean
  canDelete: boolean
}

function formatMoney(value: string | number) {
  const parsed = typeof value === 'number' ? value : Number(value)
  if (Number.isNaN(parsed)) return String(value)
  return parsed.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function HistoricoList({ entries }: { entries: ParticipanteHistoricoItem[] }) {
  if (entries.length === 0) {
    return (
      <EmptyState
        title="Sem historico"
        description="As inscricoes deste participante aparecerao aqui quando existirem."
      />
    )
  }

  return (
    <div className="space-y-3">
      {entries.map((item) => (
        <div key={item.inscricao.id} className="rounded-lg border border-border bg-surface-raised p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h4 className="font-semibold text-foreground">{item.evento.nome}</h4>
              <p className="mt-1 text-sm text-text-secondary">
                {formatMoney(item.inscricao.valor_pago)} pagos de {formatMoney(item.inscricao.valor_total)}
              </p>
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <Badge variant="neutral">{item.inscricao.papel}</Badge>
              <Badge variant={item.inscricao.status === 'PAGO_TOTAL' ? 'success' : 'warning'}>
                {item.inscricao.status}
              </Badge>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function ParticipanteFichaSheet({
  open,
  onOpenChange,
  participanteId,
  mode,
  canWrite,
  canDelete,
}: ParticipanteFichaSheetProps) {
  const [section, setSection] = useState<FichaSection>('dados')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [statusMessage, setStatusMessage] = useState<StatusMessage>(null)

  const detailQuery = useParticipante(participanteId ?? '', mode === 'edit' && open && !!participanteId)
  const historicoQuery = useParticipanteHistorico(participanteId ?? '', mode === 'edit' && open && !!participanteId)
  const createMutation = useCreateParticipante()
  const updateMutation = useUpdateParticipante()
  const deleteMutation = useDeleteParticipante()

  useEffect(() => {
    if (open) {
      setSection('dados')
      setConfirmDelete(false)
      setStatusMessage(null)
    }
  }, [open, mode, participanteId])

  const sectionOptions = useMemo(() => [
    { value: 'dados', label: 'Dados' },
    { value: 'saude', label: 'Saude' },
    { value: 'emergencia', label: 'Emergencia' },
    { value: 'historico', label: 'Historico' },
  ], [])

  const participante = detailQuery.data as Pessoa | undefined
  const isSubmitting = createMutation.isPending || updateMutation.isPending
  const canSubmit = mode === 'create' ? canWrite : canWrite && !!participanteId

  async function handleSubmit(payload: CreatePessoa | UpdatePessoa) {
    setStatusMessage(null)

    try {
      if (mode === 'create') {
        await createMutation.mutateAsync(payload as CreatePessoa)
        setStatusMessage({ type: 'success', text: 'Participante cadastrado' })
        return
      }

      if (!participanteId) return
      await updateMutation.mutateAsync({ id: participanteId, payload: payload as UpdatePessoa })
      setStatusMessage({ type: 'success', text: 'Ficha atualizada' })
    } catch (error) {
      setStatusMessage({
        type: 'error',
        text: `Nao foi possivel salvar os dados do participante. ${(error as Error).message}`,
      })
    }
  }

  async function handleDelete() {
    if (!participanteId) return

    setStatusMessage(null)
    try {
      await deleteMutation.mutateAsync(participanteId)
      setStatusMessage({ type: 'success', text: 'Participante desativado' })
      setConfirmDelete(false)
    } catch (error) {
      setStatusMessage({
        type: 'error',
        text: `Nao foi possivel desativar o participante. ${(error as Error).message}`,
      })
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex h-full w-full max-w-full flex-col overflow-y-auto sm:max-w-xl lg:max-w-2xl">
        <SheetHeader className="border-b border-border pr-12">
          <SheetTitle>{mode === 'create' ? 'Adicionar Participante' : participante?.nome ?? 'Ficha do participante'}</SheetTitle>
          <SheetDescription>
            {mode === 'create'
              ? 'Cadastre os dados pessoais, de saude e emergencia.'
              : 'Revise dados, saude, emergencia e Historico.'}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-5 px-4 py-4">
          {!canWrite ? (
            <Alert>
              <AlertDescription>Sem permissao para editar este participante</AlertDescription>
            </Alert>
          ) : null}

          {statusMessage ? (
            <Alert variant={statusMessage.type === 'error' ? 'destructive' : 'default'}>
              <AlertDescription>{statusMessage.text}</AlertDescription>
            </Alert>
          ) : null}

          {mode === 'edit' ? (
            <FilterTabs
              ariaLabel="Secoes da ficha"
              value={section}
              onValueChange={(value) => setSection(value as FichaSection)}
              options={sectionOptions}
              className="w-full"
            />
          ) : null}

          {mode === 'edit' && detailQuery.isLoading ? (
            <div className="h-44 animate-pulse rounded-lg bg-muted" />
          ) : null}

          {(mode === 'create' || (mode === 'edit' && section !== 'historico' && participante)) ? (
            <ParticipanteForm
              initialValue={mode === 'edit' ? participante : undefined}
              mode={mode}
              disabled={!canSubmit}
              isSubmitting={isSubmitting}
              onSubmit={handleSubmit}
              onCancel={() => onOpenChange(false)}
            />
          ) : null}

          {mode === 'edit' && section === 'historico' ? (
            historicoQuery.isLoading ? (
              <div className="h-44 animate-pulse rounded-lg bg-muted" />
            ) : (
              <HistoricoList entries={historicoQuery.data ?? []} />
            )
          ) : null}

          {mode === 'edit' ? (
            <div className="space-y-3 border-t border-border pt-5">
              {!canDelete ? (
                <p className="text-sm text-text-secondary">Apenas administradores podem desativar participantes</p>
              ) : null}

              {confirmDelete ? (
                <div className="rounded-lg border border-status-danger/25 bg-status-danger-bg p-4">
                  <p className="font-semibold text-status-danger">Desativar participante</p>
                  <p className="mt-1 text-sm text-status-danger">
                    O historico de inscricoes preservado continuara disponivel para consulta.
                  </p>
                  <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                    <Button
                      type="button"
                      variant="danger"
                      onClick={handleDelete}
                      disabled={!canDelete || deleteMutation.isPending}
                    >
                      Confirmar desativacao
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setConfirmDelete(false)}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setConfirmDelete(true)}
                  disabled={!canDelete}
                >
                  Desativar participante
                </Button>
              )}
            </div>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  )
}
