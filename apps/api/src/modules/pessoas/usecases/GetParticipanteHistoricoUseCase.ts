import { type Database } from '../../../db'
import type { TenantContext } from '../../../lib/tenant/types'
import { PessoasRepository } from '../repositories/PessoasRepository'

export class GetParticipanteHistoricoUseCase {
  constructor(
    private db: Database,
    private ctx: TenantContext,
  ) {}

  async execute(pessoaId: string) {
    return new PessoasRepository(this.db, this.ctx).getHistorico(pessoaId)
  }
}
