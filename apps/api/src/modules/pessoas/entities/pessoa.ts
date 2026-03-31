export interface CreatePessoa {
  nome: string
  genero: 'M' | 'F'
  data_nascimento?: string
  telefone?: string
  email?: string
  padrinho_id?: string | null
  alergias?: string
  restricoes_alimentares?: string[]
  medicamentos?: string
  condicoes_medicas?: string
  contato_emergencia_nome?: string
  contato_emergencia_tel?: string
}

export interface Pessoa {
  id: string
  nome: string
  genero: 'M' | 'F'
  data_nascimento?: string
  telefone?: string
  email?: string
  padrinho_id?: string | null
  alergias?: string
  restricoes_alimentares?: string[]
  medicamentos?: string
  condicoes_medicas?: string
  contato_emergencia_nome?: string
  contato_emergencia_tel?: string
  created_at: string
  updated_at: string
  deleted_at?: string | null
}
