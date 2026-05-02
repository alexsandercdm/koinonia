import { type Database } from '../../../db'
import { PessoasRepository } from '../repositories/PessoasRepository'
import { resolveTenantContext } from './tenant-context'
import type { TenantContext } from '../../../lib/tenant/types'

interface ListParticipantesParams {
  q?: string
  page: number
  pageSize: number
}

export class ListParticipantesUseCase {
  constructor(
    private db: Database,
    private ctx?: TenantContext,
  ) {}

  async execute({ q, page, pageSize }: ListParticipantesParams) {
    return new PessoasRepository(this.db, resolveTenantContext(this.ctx)).list({ q, page, pageSize })
  }
}
