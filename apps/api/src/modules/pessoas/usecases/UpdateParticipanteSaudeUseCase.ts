import { type Database } from '../../../db'
import type { TenantContext } from '../../../lib/tenant/types'
import { AuditLogRepository } from '../repositories/AuditLogRepository'
import { PessoasRepository } from '../repositories/PessoasRepository'

export class UpdateParticipanteSaudeUseCase {
  constructor(
    private db: Database,
    private auditLogRepo: AuditLogRepository,
    private ctx: TenantContext,
  ) {}

  async execute(id: string, user_id: string, data: Partial<{
    alergias: string
    restricoes_alimentares: string[]
    medicamentos: string
    condicoes_medicas: string
    contato_emergencia_nome: string
    contato_emergencia_tel: string
  }>) {
    const repository = new PessoasRepository(this.db, this.ctx)
    const participante = await repository.update(id, data)

    if (participante) {
      await this.auditLogRepo.logAction({
        user_id,
        target_id: id,
        action: 'UPDATE_HEALTH',
        changes: data as any,
      })
    }

    return participante
  }
}
