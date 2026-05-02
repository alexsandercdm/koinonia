import { type Database } from '../../../db'
import type { TenantContext } from '../../../lib/tenant/types'
import { CreatePessoa } from '../entities/pessoa'
import { PessoasRepository } from '../repositories/PessoasRepository'

export class CreateParticipanteUseCase {
  constructor(
    private db: Database,
    private ctx: TenantContext,
  ) {}

  async execute(data: CreatePessoa) {
    const repository = new PessoasRepository(this.db, this.ctx)

    // Check if email already exists
    if (data.email) {
      const existing = await repository.findByEmail(data.email)

      if (existing) {
        throw new Error('Email already exists')
      }
    }

    // Check if phone already exists
    if (data.telefone) {
      const existing = await repository.findByPhone(data.telefone)

      if (existing) {
        throw new Error('Phone already exists')
      }
    }

    // Create participant
    return repository.create(data)
  }
}
