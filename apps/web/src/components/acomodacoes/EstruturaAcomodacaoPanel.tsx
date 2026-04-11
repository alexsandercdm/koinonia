import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import {
  useLocais,
  useQuartos,
  useCreateLocal,
  useUpdateLocal,
  useCreateQuarto,
  useUpdateQuarto,
  useCreateCama,
  useUpdateCama,
} from '../../hooks/use-acomodacoes'
import type { Local, Quarto, Cama } from '@koinonia/shared'

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
    onSave({
      nome,
      endereco: endereco || undefined,
      capacidade_total: capacidadeTotal ? parseInt(capacidadeTotal, 10) : undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="local-nome">Nome *</Label>
        <Input
          id="local-nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Nome do local"
          required
          className="h-12 text-base"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="local-endereco">Endereço</Label>
        <Input
          id="local-endereco"
          value={endereco}
          onChange={(e) => setEndereco(e.target.value)}
          placeholder="Endereço completo"
          className="h-12 text-base"
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
          placeholder="Ex: 50"
          className="h-12 text-base"
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={isSaving} className="flex-1 h-12">
          {isSaving ? 'Salvando...' : 'Salvar'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="h-12 px-6">
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
    onSave({
      local_id: localId,
      nome,
      genero_permitido: generoPermitido,
      capacidade: parseInt(capacidade, 10),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="quarto-nome">Nome *</Label>
        <Input
          id="quarto-nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Ex: Quarto 1A"
          required
          className="h-12 text-base"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="quarto-genero">Gênero Permitido *</Label>
        <select
          id="quarto-genero"
          value={generoPermitido}
          onChange={(e) => setGeneroPermitido(e.target.value as 'M' | 'F' | 'MISTO')}
          className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <option value="M">Masculino</option>
          <option value="F">Feminino</option>
          <option value="MISTO">Misto</option>
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="quarto-capacidade">Capacidade *</Label>
        <Input
          id="quarto-capacidade"
          type="number"
          min={1}
          value={capacidade}
          onChange={(e) => setCapacidade(e.target.value)}
          placeholder="Ex: 4"
          required
          className="h-12 text-base"
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={isSaving} className="flex-1 h-12">
          {isSaving ? 'Salvando...' : 'Salvar'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="h-12 px-6">
          Cancelar
        </Button>
      </div>
    </form>
  )
}

// -------- Cama Form --------

interface CamaFormProps {
  quartoId: string
  initial?: Partial<Cama> & { bloqueada?: boolean }
  onSave: (data: {
    quarto_id: string
    identificacao: string
    tipo: 'solteiro' | 'beliche_superior' | 'beliche_inferior' | 'casal'
    bloqueada: boolean
  }) => void
  onCancel: () => void
  isSaving: boolean
}

function CamaForm({ quartoId, initial, onSave, onCancel, isSaving }: CamaFormProps) {
  const [identificacao, setIdentificacao] = useState(initial?.identificacao ?? '')
  const [tipo, setTipo] = useState<'solteiro' | 'beliche_superior' | 'beliche_inferior' | 'casal'>(
    (initial?.tipo as 'solteiro' | 'beliche_superior' | 'beliche_inferior' | 'casal') ?? 'solteiro'
  )
  const [bloqueada, setBloqueada] = useState(initial?.bloqueada ?? false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ quarto_id: quartoId, identificacao, tipo, bloqueada })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="cama-id">Identificação *</Label>
        <Input
          id="cama-id"
          value={identificacao}
          onChange={(e) => setIdentificacao(e.target.value)}
          placeholder="Ex: C01"
          required
          className="h-12 text-base"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="cama-tipo">Tipo *</Label>
        <select
          id="cama-tipo"
          value={tipo}
          onChange={(e) =>
            setTipo(e.target.value as 'solteiro' | 'beliche_superior' | 'beliche_inferior' | 'casal')
          }
          className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <option value="solteiro">Solteiro</option>
          <option value="beliche_superior">Beliche Superior</option>
          <option value="beliche_inferior">Beliche Inferior</option>
          <option value="casal">Casal</option>
        </select>
      </div>
      <div className="flex items-center gap-3 py-1">
        <input
          id="cama-bloqueada"
          type="checkbox"
          checked={bloqueada}
          onChange={(e) => setBloqueada(e.target.checked)}
          className="h-5 w-5 rounded border-gray-300"
        />
        <Label htmlFor="cama-bloqueada" className="text-base cursor-pointer">
          Cama bloqueada
        </Label>
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={isSaving} className="flex-1 h-12">
          {isSaving ? 'Salvando...' : 'Salvar'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="h-12 px-6">
          Cancelar
        </Button>
      </div>
    </form>
  )
}

// -------- Main Panel --------

export function EstruturaAcomodacaoPanel({ userRole }: EstruturaAcomodacaoPanelProps) {
  const canEdit = userRole === 'admin' || userRole === 'lider'

  const { data: locais = [], isLoading: locaisLoading } = useLocais()

  const [selectedLocalId, setSelectedLocalId] = useState<string>('')
  const [selectedQuartoId, setSelectedQuartoId] = useState<string>('')

  const { data: quartos = [], isLoading: quartosLoading } = useQuartos(selectedLocalId)

  const [showLocalForm, setShowLocalForm] = useState(false)
  const [editingLocal, setEditingLocal] = useState<Local | null>(null)

  const [showQuartoForm, setShowQuartoForm] = useState(false)
  const [editingQuarto, setEditingQuarto] = useState<Quarto | null>(null)

  const [showCamaForm, setShowCamaForm] = useState(false)
  const [editingCama, setEditingCama] = useState<(Cama & { bloqueada?: boolean }) | null>(null)

  const createLocal = useCreateLocal()
  const updateLocal = useUpdateLocal()
  const createQuarto = useCreateQuarto()
  const updateQuarto = useUpdateQuarto()
  const createCama = useCreateCama()
  const updateCama = useUpdateCama()

  const generoLabel = (g: string) => ({ M: 'Masculino', F: 'Feminino', MISTO: 'Misto' }[g] ?? g)

  return (
    <div className="space-y-4">
      {/* ---- Locais ---- */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Locais</CardTitle>
            {canEdit && !showLocalForm && (
              <Button
                size="sm"
                className="h-10 px-4"
                onClick={() => {
                  setEditingLocal(null)
                  setShowLocalForm(true)
                }}
              >
                + Novo Local
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {showLocalForm && canEdit && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-medium mb-3">
                {editingLocal ? 'Editar Local' : 'Novo Local'}
              </h3>
              <LocalForm
                initial={editingLocal ?? undefined}
                isSaving={createLocal.isPending || updateLocal.isPending}
                onCancel={() => {
                  setShowLocalForm(false)
                  setEditingLocal(null)
                }}
                onSave={async (data) => {
                  if (editingLocal) {
                    await updateLocal.mutateAsync({ id: editingLocal.id!, payload: data })
                  } else {
                    await createLocal.mutateAsync(data)
                  }
                  setShowLocalForm(false)
                  setEditingLocal(null)
                }}
              />
            </div>
          )}

          {locaisLoading ? (
            <p className="text-sm text-gray-500 py-2">Carregando locais...</p>
          ) : locais.length === 0 ? (
            <p className="text-sm text-gray-500 py-2">Nenhum local cadastrado.</p>
          ) : (
            <div className="space-y-2">
              {locais.map((local) => (
                <div
                  key={local.id}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedLocalId === local.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => {
                    setSelectedLocalId(local.id === selectedLocalId ? '' : (local.id ?? ''))
                    setSelectedQuartoId('')
                  }}
                >
                  <div>
                    <p className="font-medium text-sm">{local.nome}</p>
                    {local.endereco && (
                      <p className="text-xs text-gray-500">{local.endereco}</p>
                    )}
                    {local.capacidade_total && (
                      <p className="text-xs text-gray-500">
                        Capacidade: {local.capacidade_total}
                      </p>
                    )}
                  </div>
                  {canEdit && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-10 px-3 shrink-0"
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditingLocal(local)
                        setShowLocalForm(true)
                      }}
                    >
                      Editar
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ---- Quartos ---- */}
      {selectedLocalId && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Quartos</CardTitle>
              {canEdit && !showQuartoForm && (
                <Button
                  size="sm"
                  className="h-10 px-4"
                  onClick={() => {
                    setEditingQuarto(null)
                    setShowQuartoForm(true)
                  }}
                >
                  + Novo Quarto
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {showQuartoForm && canEdit && (
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-medium mb-3">
                  {editingQuarto ? 'Editar Quarto' : 'Novo Quarto'}
                </h3>
                <QuartoForm
                  localId={selectedLocalId}
                  initial={editingQuarto ?? undefined}
                  isSaving={createQuarto.isPending || updateQuarto.isPending}
                  onCancel={() => {
                    setShowQuartoForm(false)
                    setEditingQuarto(null)
                  }}
                  onSave={async (data) => {
                    if (editingQuarto) {
                      await updateQuarto.mutateAsync({
                        id: editingQuarto.id!,
                        local_id: selectedLocalId,
                        payload: data,
                      })
                    } else {
                      await createQuarto.mutateAsync(data)
                    }
                    setShowQuartoForm(false)
                    setEditingQuarto(null)
                  }}
                />
              </div>
            )}

            {quartosLoading ? (
              <p className="text-sm text-gray-500 py-2">Carregando quartos...</p>
            ) : quartos.length === 0 ? (
              <p className="text-sm text-gray-500 py-2">Nenhum quarto cadastrado.</p>
            ) : (
              <div className="space-y-2">
                {quartos.map((quarto) => (
                  <div
                    key={quarto.id}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedQuartoId === quarto.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() =>
                      setSelectedQuartoId(quarto.id === selectedQuartoId ? '' : (quarto.id ?? ''))
                    }
                  >
                    <div>
                      <p className="font-medium text-sm">{quarto.nome}</p>
                      <p className="text-xs text-gray-500">
                        {generoLabel(quarto.genero_permitido)} · Cap. {quarto.capacidade}
                      </p>
                    </div>
                    {canEdit && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-10 px-3 shrink-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingQuarto(quarto)
                          setShowQuartoForm(true)
                        }}
                      >
                        Editar
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ---- Camas ---- */}
      {selectedQuartoId && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Camas</CardTitle>
              {canEdit && !showCamaForm && (
                <Button
                  size="sm"
                  className="h-10 px-4"
                  onClick={() => {
                    setEditingCama(null)
                    setShowCamaForm(true)
                  }}
                >
                  + Nova Cama
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {showCamaForm && canEdit && (
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-medium mb-3">
                  {editingCama ? 'Editar Cama' : 'Nova Cama'}
                </h3>
                <CamaForm
                  quartoId={selectedQuartoId}
                  initial={editingCama ?? undefined}
                  isSaving={createCama.isPending || updateCama.isPending}
                  onCancel={() => {
                    setShowCamaForm(false)
                    setEditingCama(null)
                  }}
                  onSave={async (data) => {
                    if (editingCama) {
                      await updateCama.mutateAsync({
                        id: editingCama.id!,
                        quarto_id: selectedQuartoId,
                        payload: data,
                      })
                    } else {
                      await createCama.mutateAsync(data)
                    }
                    setShowCamaForm(false)
                    setEditingCama(null)
                  }}
                />
              </div>
            )}

            <p className="text-sm text-gray-500 py-2">
              Selecione um quarto para ver as camas no mapa abaixo.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
