import { type Database } from '../../../db'
import type { TenantContext } from '../../../lib/tenant/types'
import { PessoasRepository } from '../repositories/PessoasRepository'

export class DeleteParticipanteUseCase {
  constructor(
    private db: Database,
    private ctx: TenantContext,
  ) {}

  async execute(id: string) {
    await new PessoasRepository(this.db, this.ctx).softDelete(id)
  }
}
