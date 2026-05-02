import { type Database } from '../../../db'
import type { TenantContext } from '../../../lib/tenant/types'
import { PessoasRepository } from '../repositories/PessoasRepository'

interface ListParticipantesParams {
  q?: string
  page: number
  pageSize: number
}

export class ListParticipantesUseCase {
  constructor(
    private db: Database,
    private ctx: TenantContext,
  ) {}

  async execute({ q, page, pageSize }: ListParticipantesParams) {
    return new PessoasRepository(this.db, this.ctx).list({ q, page, pageSize })
  }
}
