import { z } from 'zod'

// Enums
export const GeneroEnum = z.enum(['M', 'F'])
export const PapelEnum = z.enum(['encontrista', 'servo'])
export const StatusPagamentoEnum = z.enum(['pendente', 'pago_parcial', 'pago_total'])
export const StatusEventoEnum = z.enum(['rascunho', 'aberto', 'encerrado', 'realizado'])
export const FormaPagamentoEnum = z.enum(['pix', 'dinheiro', 'cartao', 'outro'])
export const CategoriaDespesaEnum = z.enum(['alimentacao', 'transporte', 'material', 'hospedagem', 'outro'])
export const GeneroQuartoEnum = z.enum(['M', 'F', 'MISTO'])
export const TipoCamaEnum = z.enum(['solteiro', 'beliche_superior', 'beliche_inferior', 'casal'])
export const UserRoleEnum = z.enum(['admin', 'lider', 'servo'])

// Base schemas
export const PessoaSchema = z.object({
  id: z.string().uuid().optional(),
  nome: z.string().min(1).max(200),
  genero: GeneroEnum,
  data_nascimento: z.string().date().optional(),
  telefone: z.string().max(20).optional(),
  email: z.string().email().max(200).optional(),
  padrinho_id: z.string().uuid().nullable().optional(),
  alergias: z.string().optional(),
  restricoes_alimentares: z.array(z.string()).optional(),
  medicamentos: z.string().optional(),
  condicoes_medicas: z.string().optional(),
  contato_emergencia_nome: z.string().max(200).optional(),
  contato_emergencia_tel: z.string().max(20).optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
  deleted_at: z.string().datetime().nullable().optional(),
})

export const LocalSchema = z.object({
  id: z.string().uuid().optional(),
  nome: z.string().min(1).max(200),
  endereco: z.string().optional(),
  capacidade_total: z.number().int().positive().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
})

export const QuartoSchema = z.object({
  id: z.string().uuid().optional(),
  local_id: z.string().uuid(),
  nome: z.string().min(1).max(100),
  genero_permitido: GeneroQuartoEnum,
  capacidade: z.number().int().positive(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
})

export const CamaSchema = z.object({
  id: z.string().uuid().optional(),
  quarto_id: z.string().uuid(),
  identificacao: z.string().max(50),
  tipo: TipoCamaEnum,
  created_at: z.string().datetime().optional(),
})

export const EventoSchema = z.object({
  id: z.string().uuid().optional(),
  nome: z.string().min(1).max(200),
  descricao: z.string().optional(),
  data_inicio: z.string().date(),
  data_fim: z.string().date(),
  local_id: z.string().uuid(),
  valor_inscricao_encontrista: z.number().min(0),
  valor_inscricao_servo: z.number().min(0),
  capacidade_maxima: z.number().int().positive(),
  status: StatusEventoEnum,
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
})

export const InscricaoSchema = z.object({
  id: z.string().uuid().optional(),
  evento_id: z.string().uuid(),
  pessoa_id: z.string().uuid(),
  papel: PapelEnum,
  valor_total: z.number().min(0),
  valor_pago: z.number().min(0),
  cama_id: z.string().uuid().nullable().optional(),
  observacoes: z.string().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
})

export const PagamentoSchema = z.object({
  id: z.string().uuid().optional(),
  inscricao_id: z.string().uuid(),
  valor: z.number().min(0),
  forma_pagamento: FormaPagamentoEnum,
  data_pagamento: z.string().date(),
  comprovante_url: z.string().url().nullable().optional(),
  registrado_por: z.string().uuid().optional(),
  created_at: z.string().datetime().optional(),
})

export const DespesaSchema = z.object({
  id: z.string().uuid().optional(),
  evento_id: z.string().uuid(),
  descricao: z.string().min(1).max(300),
  categoria: CategoriaDespesaEnum,
  valor: z.number().min(0),
  data_despesa: z.string().date(),
  comprovante_url: z.string().url().nullable().optional(),
  registrado_por: z.string().uuid().optional(),
  created_at: z.string().datetime().optional(),
})

// API DTOs
export const CreatePessoaDTO = PessoaSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
})

export const UpdatePessoaDTO = CreatePessoaDTO.partial()

export const CreateEventoDTO = EventoSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
})

export const UpdateEventoDTO = CreateEventoDTO.partial()

export const CreateInscricaoDTO = InscricaoSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
})

export const CreatePagamentoDTO = PagamentoSchema.omit({
  id: true,
  created_at: true,
})

export const CreateDespesaDTO = DespesaSchema.omit({
  id: true,
  created_at: true,
})

// Response types
export type Pessoa = z.infer<typeof PessoaSchema>
export type Local = z.infer<typeof LocalSchema>
export type Quarto = z.infer<typeof QuartoSchema>
export type Cama = z.infer<typeof CamaSchema>
export type Evento = z.infer<typeof EventoSchema>
export type Inscricao = z.infer<typeof InscricaoSchema>
export type Pagamento = z.infer<typeof PagamentoSchema>
export type Despesa = z.infer<typeof DespesaSchema>

export type CreatePessoa = z.infer<typeof CreatePessoaDTO>
export type UpdatePessoa = z.infer<typeof UpdatePessoaDTO>
export type CreateEvento = z.infer<typeof CreateEventoDTO>
export type UpdateEvento = z.infer<typeof UpdateEventoDTO>
export type CreateInscricao = z.infer<typeof CreateInscricaoDTO>
export type CreatePagamento = z.infer<typeof CreatePagamentoDTO>
export type CreateDespesa = z.infer<typeof CreateDespesaDTO>

export type Genero = z.infer<typeof GeneroEnum>
export type Papel = z.infer<typeof PapelEnum>
export type StatusPagamento = z.infer<typeof StatusPagamentoEnum>
export type StatusEvento = z.infer<typeof StatusEventoEnum>
export type FormaPagamento = z.infer<typeof FormaPagamentoEnum>
export type CategoriaDespesa = z.infer<typeof CategoriaDespesaEnum>
export type GeneroQuarto = z.infer<typeof GeneroQuartoEnum>
export type TipoCama = z.infer<typeof TipoCamaEnum>
export type UserRole = z.infer<typeof UserRoleEnum>
