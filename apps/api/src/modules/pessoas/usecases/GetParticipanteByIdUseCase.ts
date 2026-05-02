import { type Database } from '../../../db'
import { PessoasRepository } from '../repositories/PessoasRepository'
import { resolveTenantContext } from './tenant-context'
import type { TenantContext } from '../../../lib/tenant/types'

export class GetParticipanteByIdUseCase {
  constructor(
    private db: Database,
    private ctx?: TenantContext,
  ) {}

  async execute(id: string) {
    return new PessoasRepository(this.db, resolveTenantContext(this.ctx)).findById(id)
  }
}
