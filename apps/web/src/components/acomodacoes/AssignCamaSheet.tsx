import { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '../ui/sheet'
import { Button } from '../ui/button'
import { useInscricoesSemCama, useAtribuirCama, useliberarCama } from '../../hooks/use-acomodacoes'
import type { CamaMapaItem } from '../../hooks/use-acomodacoes'

type UserRole = 'admin' | 'lider' | 'servo'

interface AssignCamaSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cama: CamaMapaItem | null
  eventoId: string
  userRole: UserRole
}

function getApiErrorMessage(error: unknown): string {
  if (!error) return 'Erro desconhecido.'
  if (typeof error === 'object' && error !== null) {
    const e = error as Record<string, unknown>
    if (typeof e.message === 'string') {
      const msg = e.message.toLowerCase()
      if (msg.includes('gênero') || msg.includes('genero') || msg.includes('gender')) {
        return 'Conflito de gênero: este quarto não permite este participante.'
      }
      if (msg.includes('ocupad') || msg.includes('occupied')) {
        return 'Cama já está ocupada. Atualize o mapa e tente novamente.'
      }
      if (msg.includes('bloqueada') || msg.includes('bloqueado') || msg.includes('blocked')) {
        return 'Esta cama está bloqueada e não pode receber atribuição.'
      }
      return e.message
    }
    if (typeof e.error === 'string') return e.error
  }
  return 'Ocorreu um erro ao processar a solicitação.'
}

export function AssignCamaSheet({
  open,
  onOpenChange,
  cama,
  eventoId,
  userRole,
}: AssignCamaSheetProps) {
  const [searchQ, setSearchQ] = useState('')
  const [releaseError, setReleaseError] = useState<string | null>(null)
  const [assignError, setAssignError] = useState<string | null>(null)
  const [confirmRelease, setConfirmRelease] = useState(false)

  const isOcupado = !!(cama && !cama.bloqueada && cama.ocupante)
  const isDisponivel = !!(cama && !cama.bloqueada && !cama.ocupante)

  const { data: candidatos = [], isLoading: candidatosLoading } = useInscricoesSemCama(
    eventoId,
    searchQ
  )

  const atribuir = useAtribuirCama(eventoId)
  const liberar = useliberarCama(eventoId)

  function handleClose() {
    setSearchQ('')
    setAssignError(null)
    setReleaseError(null)
    setConfirmRelease(false)
    onOpenChange(false)
  }

  async function handleAtribuir(inscricaoId: string) {
    if (!cama) return
    setAssignError(null)
    try {
      await atribuir.mutateAsync({ camaId: cama.id, inscricaoId })
      handleClose()
    } catch (err) {
      setAssignError(getApiErrorMessage(err))
    }
  }

  async function handleLiberar() {
    if (!cama) return
    setReleaseError(null)
    try {
      await liberar.mutateAsync({ camaId: cama.id })
      handleClose()
    } catch (err) {
      setReleaseError(getApiErrorMessage(err))
    }
  }

  if (!cama) return null

  const canWrite = userRole === 'admin' || userRole === 'lider'

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="bottom">
        <SheetHeader>
          <SheetTitle>Cama {cama.identificacao}</SheetTitle>
          <SheetDescription>
            {cama.bloqueada
              ? 'Esta cama está bloqueada.'
              : isOcupado
                ? `Ocupante: ${cama.ocupante}`
                : 'Disponível para atribuição.'}
          </SheetDescription>
        </SheetHeader>

        <div className="px-4 pb-6 space-y-4 mt-3">
          {/* Liberar cama (Ocupado) */}
          {canWrite && isOcupado && (
            <div className="space-y-3">
              {releaseError && (
                <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                  {releaseError}
                </div>
              )}
              {!confirmRelease ? (
                <Button
                  variant="destructive"
                  className="w-full h-12 text-base"
                  onClick={() => setConfirmRelease(true)}
                >
                  Liberar cama
                </Button>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 text-center">
                    Confirmar liberação de <strong>{cama.ocupante}</strong>?
                  </p>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 h-12"
                      onClick={() => setConfirmRelease(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1 h-12"
                      onClick={handleLiberar}
                      disabled={liberar.isPending}
                    >
                      {liberar.isPending ? 'Liberando...' : 'Confirmar'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Atribuir cama (Disponivel) */}
          {canWrite && isDisponivel && (
            <div className="space-y-3">
              {assignError && (
                <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                  {assignError}
                </div>
              )}
              <div className="relative">
                <input
                  type="search"
                  placeholder="Buscar participante..."
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                  className="w-full h-12 rounded-md border border-gray-300 bg-white px-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {candidatosLoading ? (
                <div className="flex justify-center py-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                </div>
              ) : candidatos.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">
                  {searchQ ? 'Nenhum participante encontrado.' : 'Nenhum participante sem cama.'}
                </p>
              ) : (
                <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200 overflow-hidden">
                  {candidatos.map((c) => (
                    <li key={c.id} className="flex items-center justify-between px-3 py-3 bg-white">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {c.participante_nome}
                        </p>
                        {c.participante_genero && (
                          <p className="text-xs text-gray-500">
                            {c.participante_genero === 'M' ? 'Masculino' : c.participante_genero === 'F' ? 'Feminino' : c.participante_genero}
                          </p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        className="h-10 shrink-0 ml-3"
                        onClick={() => handleAtribuir(c.id)}
                        disabled={atribuir.isPending}
                      >
                        Atribuir
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Cama bloqueada — sem ação */}
          {cama.bloqueada && (
            <p className="text-sm text-gray-500 text-center py-4">
              Esta cama está bloqueada e não pode receber atribuições.
            </p>
          )}

          {/* Servo — modo leitura */}
          {!canWrite && (
            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 text-center">
              Apenas administradores e líderes podem atribuir ou liberar camas.
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
