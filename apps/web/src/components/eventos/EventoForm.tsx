import { FormEvent, useEffect, useState } from 'react'
import type { CreateEvento, EventoListItem, StatusEvento, UpdateEvento } from '@koinonia/shared'
import { Button } from '../ui/button'
import { FormField } from '../ui/form-field'
import { Input } from '../ui/input'
import { Select } from '../ui/select'
import { TextArea } from '../ui/textarea'
import { EVENTO_STATUS_OPTIONS } from './evento-status'
import { useLocais } from '../../hooks/use-acomodacoes'

interface EventoFormValues {
  nome: string
  descricao: string
  data_inicio: string
  data_fim: string
  local_id: string
  capacidade_maxima: string
  status: StatusEvento
}

export interface EventoFormProps {
  initialValue?: EventoListItem
  mode: 'create' | 'edit'
  disabled?: boolean
  isSubmitting?: boolean
  onSubmit: (payload: CreateEvento | UpdateEvento) => void | Promise<void>
  onCancel: () => void
}

const emptyValues: EventoFormValues = {
  nome: '',
  descricao: '',
  data_inicio: '',
  data_fim: '',
  local_id: '',
  capacidade_maxima: '',
  status: 'rascunho',
}

function valuesFromEvento(evento?: EventoListItem): EventoFormValues {
  if (!evento) return emptyValues

  return {
    nome: evento.nome ?? '',
    descricao: evento.descricao ?? '',
    data_inicio: evento.data_inicio ?? '',
    data_fim: evento.data_fim ?? '',
    local_id: evento.local_id ?? '',
    capacidade_maxima: String(evento.capacidade_maxima ?? ''),
    status: (evento.status as StatusEvento) ?? 'rascunho',
  }
}

function validate(values: EventoFormValues) {
  const errors: Partial<Record<keyof EventoFormValues, string>> = {}
  const capacidade = Number(values.capacidade_maxima)

  if (!values.nome.trim()) errors.nome = 'Nome obrigatorio'
  if (!values.data_inicio) errors.data_inicio = 'Data inicial obrigatoria'
  if (!values.data_fim) errors.data_fim = 'Data final obrigatoria'
  if (!Number.isInteger(capacidade) || capacidade <= 0) {
    errors.capacidade_maxima = 'Capacidade deve ser um numero inteiro positivo'
  }
  if (values.data_inicio && values.data_fim && values.data_fim < values.data_inicio) {
    errors.data_fim = 'Data final deve ser depois da data inicial'
  }

  return errors
}

function buildPayload(values: EventoFormValues, mode: 'create' | 'edit') {
  const payload: CreateEvento | UpdateEvento = {
    nome: values.nome.trim(),
    descricao: values.descricao.trim() || undefined,
    data_inicio: values.data_inicio,
    data_fim: values.data_fim,
    local_id: values.local_id.trim() || undefined,
    capacidade_maxima: Number(values.capacidade_maxima),
    status: values.status,
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

export function EventoForm({
  initialValue,
  mode,
  disabled,
  isSubmitting,
  onSubmit,
  onCancel,
}: EventoFormProps) {
  const locaisQuery = useLocais()
  const locais = locaisQuery.data ?? []
  const [values, setValues] = useState<EventoFormValues>(() => valuesFromEvento(initialValue))
  const [errors, setErrors] = useState<Partial<Record<keyof EventoFormValues, string>>>({})

  useEffect(() => {
    setValues(valuesFromEvento(initialValue))
    setErrors({})
  }, [initialValue])

  const isDisabled = disabled || isSubmitting
  const submitLabel = mode === 'create' ? 'Criar evento' : 'Salvar evento'

  function updateValue(name: keyof EventoFormValues, value: string) {
    setValues((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const nextErrors = validate(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    await onSubmit(buildPayload(values, mode))
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <FormField label="Nome" htmlFor="evento-nome" required error={errors.nome}>
        <Input
          id="evento-nome"
          value={values.nome}
          disabled={isDisabled}
          onChange={(event) => updateValue('nome', event.target.value)}
        />
      </FormField>

      <FormField label="Descricao" htmlFor="evento-descricao">
        <TextArea
          id="evento-descricao"
          value={values.descricao}
          disabled={isDisabled}
          onChange={(event) => updateValue('descricao', event.target.value)}
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Inicio" htmlFor="evento-data-inicio" required error={errors.data_inicio}>
          <Input
            id="evento-data-inicio"
            type="date"
            value={values.data_inicio}
            disabled={isDisabled}
            onChange={(event) => updateValue('data_inicio', event.target.value)}
          />
        </FormField>

        <FormField label="Fim" htmlFor="evento-data-fim" required error={errors.data_fim}>
          <Input
            id="evento-data-fim"
            type="date"
            value={values.data_fim}
            disabled={isDisabled}
            onChange={(event) => updateValue('data_fim', event.target.value)}
          />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Capacidade" htmlFor="evento-capacidade" required error={errors.capacidade_maxima}>
          <Input
            id="evento-capacidade"
            type="number"
            min={1}
            value={values.capacidade_maxima}
            disabled={isDisabled}
            onChange={(event) => updateValue('capacidade_maxima', event.target.value)}
          />
        </FormField>

        <FormField label="Status" htmlFor="evento-status">
          <Select
            id="evento-status"
            value={values.status}
            disabled={isDisabled}
            onChange={(event) => updateValue('status', event.target.value)}
          >
            {EVENTO_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <FormField label="Local" htmlFor="evento-local">
        <Select
          id="evento-local"
          value={values.local_id}
          disabled={isDisabled || locaisQuery.isLoading}
          onChange={(event) => updateValue('local_id', event.target.value)}
        >
          <option value="">Sem local vinculado</option>
          {locais.map((local) => (
            <option key={local.id} value={local.id ?? ''}>
              {local.nome}
            </option>
          ))}
        </Select>
      </FormField>

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
