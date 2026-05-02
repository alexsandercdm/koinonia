import { type Database } from '../../../db'
import type { TenantContext } from '../../../lib/tenant/types'
import { PessoasRepository } from '../repositories/PessoasRepository'

export class GetParticipanteByIdUseCase {
  constructor(
    private db: Database,
    private ctx: TenantContext,
  ) {}

  async execute(id: string) {
    return new PessoasRepository(this.db, this.ctx).findById(id)
  }
}
