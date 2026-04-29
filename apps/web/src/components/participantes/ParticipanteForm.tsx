import { FormEvent, useEffect, useMemo, useState } from 'react'
import type { CreatePessoa, Pessoa, UpdatePessoa } from '@koinonia/shared'
import { Button } from '../ui/button'
import { FilterTabs } from '../ui/filter-tabs'
import { FormField } from '../ui/form-field'
import { Input } from '../ui/input'
import { Select } from '../ui/select'
import { TextArea } from '../ui/textarea'

type ParticipanteFormTab = 'dados' | 'saude' | 'emergencia'

interface ParticipanteFormValues {
  nome: string
  genero: '' | 'M' | 'F'
  data_nascimento: string
  telefone: string
  email: string
  padrinho_id: string
  alergias: string
  restricoes_alimentares: string
  medicamentos: string
  condicoes_medicas: string
  contato_emergencia_nome: string
  contato_emergencia_tel: string
}

export interface ParticipanteFormProps {
  initialValue?: Pessoa
  mode: 'create' | 'edit'
  disabled?: boolean
  isSubmitting?: boolean
  onSubmit: (payload: CreatePessoa | UpdatePessoa) => void | Promise<void>
  onCancel: () => void
}

const emptyValues: ParticipanteFormValues = {
  nome: '',
  genero: '',
  data_nascimento: '',
  telefone: '',
  email: '',
  padrinho_id: '',
  alergias: '',
  restricoes_alimentares: '',
  medicamentos: '',
  condicoes_medicas: '',
  contato_emergencia_nome: '',
  contato_emergencia_tel: '',
}

function valuesFromPessoa(pessoa?: Pessoa): ParticipanteFormValues {
  if (!pessoa) return emptyValues

  return {
    nome: pessoa.nome ?? '',
    genero: pessoa.genero ?? '',
    data_nascimento: pessoa.data_nascimento ?? '',
    telefone: pessoa.telefone ?? '',
    email: pessoa.email ?? '',
    padrinho_id: pessoa.padrinho_id ?? '',
    alergias: pessoa.alergias ?? '',
    restricoes_alimentares: pessoa.restricoes_alimentares?.join(', ') ?? '',
    medicamentos: pessoa.medicamentos ?? '',
    condicoes_medicas: pessoa.condicoes_medicas ?? '',
    contato_emergencia_nome: pessoa.contato_emergencia_nome ?? '',
    contato_emergencia_tel: pessoa.contato_emergencia_tel ?? '',
  }
}

function validateField(name: keyof ParticipanteFormValues, value: string) {
  if (name === 'nome' && !value.trim()) return 'Nome obrigatorio'
  if (name === 'genero' && value !== 'M' && value !== 'F') return 'Genero obrigatorio'
  if (name === 'email' && value && !value.includes('@')) return 'Email invalido'
  if (name === 'telefone' && value.length > 20) return 'Telefone deve ter no maximo 20 caracteres'
  if (name === 'contato_emergencia_tel' && value.length > 20) {
    return 'Telefone de emergencia deve ter no maximo 20 caracteres'
  }
  return undefined
}

function buildPayload(values: ParticipanteFormValues, mode: 'create' | 'edit') {
  const restricoes = values.restricoes_alimentares
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

  const payload: CreatePessoa | UpdatePessoa = {
    nome: values.nome.trim(),
    genero: values.genero as 'M' | 'F',
    data_nascimento: values.data_nascimento || undefined,
    telefone: values.telefone.trim() || undefined,
    email: values.email.trim() || undefined,
    padrinho_id: values.padrinho_id.trim() || undefined,
    alergias: values.alergias.trim() || undefined,
    restricoes_alimentares: restricoes.length > 0 ? restricoes : undefined,
    medicamentos: values.medicamentos.trim() || undefined,
    condicoes_medicas: values.condicoes_medicas.trim() || undefined,
    contato_emergencia_nome: values.contato_emergencia_nome.trim() || undefined,
    contato_emergencia_tel: values.contato_emergencia_tel.trim() || undefined,
  }

  if (mode === 'edit') {
    Object.keys(payload).forEach((key) => {
      if (payload[key as keyof typeof payload] === undefined) {
        delete payload[key as keyof typeof payload]
      }
    })
  }

  return payload
}

export function ParticipanteForm({
  initialValue,
  mode,
  disabled,
  isSubmitting,
  onSubmit,
  onCancel,
}: ParticipanteFormProps) {
  const [activeTab, setActiveTab] = useState<ParticipanteFormTab>('dados')
  const [values, setValues] = useState<ParticipanteFormValues>(() => valuesFromPessoa(initialValue))
  const [errors, setErrors] = useState<Partial<Record<keyof ParticipanteFormValues, string>>>({})

  useEffect(() => {
    setValues(valuesFromPessoa(initialValue))
    setErrors({})
  }, [initialValue])

  const submitLabel = mode === 'create' ? 'Cadastrar participante' : 'Salvar alteracoes'
  const isDisabled = disabled || isSubmitting

  const tabOptions = useMemo(() => [
    { value: 'dados', label: 'Dados' },
    { value: 'saude', label: 'Saude' },
    { value: 'emergencia', label: 'Emergencia' },
  ], [])

  function updateValue(name: keyof ParticipanteFormValues, value: string) {
    setValues((current) => ({ ...current, [name]: value }))
  }

  function handleBlur(name: keyof ParticipanteFormValues) {
    const error = validateField(name, values[name])
    setErrors((current) => ({ ...current, [name]: error }))
  }

  function validateAll() {
    const nextErrors: Partial<Record<keyof ParticipanteFormValues, string>> = {}
    ;(['nome', 'genero', 'email', 'telefone', 'contato_emergencia_tel'] as const).forEach((name) => {
      const error = validateField(name, values[name])
      if (error) nextErrors[name] = error
    })
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!validateAll()) return
    await onSubmit(buildPayload(values, mode))
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <FilterTabs
        ariaLabel="Secoes da ficha do participante"
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as ParticipanteFormTab)}
        options={tabOptions}
        className="w-full"
      />

      {activeTab === 'dados' ? (
        <div className="space-y-4">
          <FormField label="Nome" htmlFor="participante-nome" required error={errors.nome}>
            <Input
              id="participante-nome"
              value={values.nome}
              disabled={isDisabled}
              onChange={(event) => updateValue('nome', event.target.value)}
              onBlur={() => handleBlur('nome')}
            />
          </FormField>

          <FormField label="Genero" htmlFor="participante-genero" required error={errors.genero}>
            <Select
              id="participante-genero"
              value={values.genero}
              disabled={isDisabled}
              onChange={(event) => updateValue('genero', event.target.value)}
              onBlur={() => handleBlur('genero')}
            >
              <option value="">Selecione</option>
              <option value="M">Masculino</option>
              <option value="F">Feminino</option>
            </Select>
          </FormField>

          <FormField label="Data de nascimento" htmlFor="participante-data">
            <Input
              id="participante-data"
              type="date"
              value={values.data_nascimento}
              disabled={isDisabled}
              onChange={(event) => updateValue('data_nascimento', event.target.value)}
            />
          </FormField>

          <FormField label="Telefone" htmlFor="participante-telefone" error={errors.telefone}>
            <Input
              id="participante-telefone"
              value={values.telefone}
              disabled={isDisabled}
              onChange={(event) => updateValue('telefone', event.target.value)}
              onBlur={() => handleBlur('telefone')}
            />
          </FormField>

          <FormField label="Email" htmlFor="participante-email" error={errors.email}>
            <Input
              id="participante-email"
              type="email"
              value={values.email}
              disabled={isDisabled}
              onChange={(event) => updateValue('email', event.target.value)}
              onBlur={() => handleBlur('email')}
            />
          </FormField>

          <FormField label="Padrinho" htmlFor="participante-padrinho" hint="Informe o ID do padrinho quando houver vinculo cadastrado.">
            <Input
              id="participante-padrinho"
              value={values.padrinho_id}
              disabled={isDisabled}
              onChange={(event) => updateValue('padrinho_id', event.target.value)}
            />
          </FormField>
        </div>
      ) : null}

      {activeTab === 'saude' ? (
        <div className="space-y-4">
          <FormField label="Alergias" htmlFor="participante-alergias">
            <TextArea
              id="participante-alergias"
              value={values.alergias}
              disabled={isDisabled}
              onChange={(event) => updateValue('alergias', event.target.value)}
            />
          </FormField>

          <FormField label="Restricoes alimentares" htmlFor="participante-restricoes" hint="Separe os itens por virgula.">
            <TextArea
              id="participante-restricoes"
              value={values.restricoes_alimentares}
              disabled={isDisabled}
              onChange={(event) => updateValue('restricoes_alimentares', event.target.value)}
            />
          </FormField>

          <FormField label="Medicamentos" htmlFor="participante-medicamentos">
            <TextArea
              id="participante-medicamentos"
              value={values.medicamentos}
              disabled={isDisabled}
              onChange={(event) => updateValue('medicamentos', event.target.value)}
            />
          </FormField>

          <FormField label="Condicoes medicas" htmlFor="participante-condicoes">
            <TextArea
              id="participante-condicoes"
              value={values.condicoes_medicas}
              disabled={isDisabled}
              onChange={(event) => updateValue('condicoes_medicas', event.target.value)}
            />
          </FormField>
        </div>
      ) : null}

      {activeTab === 'emergencia' ? (
        <div className="space-y-4">
          <FormField label="Contato de emergencia" htmlFor="participante-contato-emergencia">
            <Input
              id="participante-contato-emergencia"
              value={values.contato_emergencia_nome}
              disabled={isDisabled}
              onChange={(event) => updateValue('contato_emergencia_nome', event.target.value)}
            />
          </FormField>

          <FormField label="Telefone de emergencia" htmlFor="participante-contato-tel" error={errors.contato_emergencia_tel}>
            <Input
              id="participante-contato-tel"
              value={values.contato_emergencia_tel}
              disabled={isDisabled}
              onChange={(event) => updateValue('contato_emergencia_tel', event.target.value)}
              onBlur={() => handleBlur('contato_emergencia_tel')}
            />
          </FormField>
        </div>
      ) : null}

      <div className="flex flex-col-reverse gap-3 border-t border-border pt-4 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" variant="gold" disabled={isDisabled}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
