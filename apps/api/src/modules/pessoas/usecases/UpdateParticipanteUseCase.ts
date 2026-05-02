import { and, eq, isNull, ne } from 'drizzle-orm'
import { type Database } from '../../../db'
import { AuditLogRepository } from '../repositories/AuditLogRepository'
import { PessoasRepository } from '../repositories/PessoasRepository'
import { resolveTenantContext } from './tenant-context'
import type { TenantContext } from '../../../lib/tenant/types'

export type UpdateParticipanteData = Partial<{
  nome: string
  genero: string
  data_nascimento: string
  telefone: string
  email: string
  padrinho_id: string | null
  alergias: string
  restricoes_alimentares: string[]
  medicamentos: string
  condicoes_medicas: string
  contato_emergencia_nome: string
  contato_emergencia_tel: string
}>

export class UpdateParticipanteUseCase {
  constructor(
    private db: Database,
    private auditLogRepo: AuditLogRepository,
    private ctx?: TenantContext,
  ) {}

  async execute(id: string, user_id: string, data: UpdateParticipanteData) {
    const repository = new PessoasRepository(this.db, resolveTenantContext(this.ctx))

    if (data.email) {
      const existing = await repository.findByEmail(data.email, id)

      if (existing) {
        throw new Error('Email already exists')
      }
    }

    if (data.telefone) {
      const existing = await repository.findByPhone(data.telefone, id)

      if (existing) {
        throw new Error('Phone already exists')
      }
    }

    const participante = await repository.update(id, data)

    if (!participante) {
      throw new Error('Participante not found')
    }

    await this.auditLogRepo.logAction({
      user_id,
      target_id: id,
      action: 'UPDATE_PARTICIPANT',
      changes: data as any,
    })

    return participante
  }
}
