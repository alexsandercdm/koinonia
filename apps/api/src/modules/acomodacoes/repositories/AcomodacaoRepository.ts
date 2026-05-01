import { and, asc, eq, ilike, isNull, ne, sql } from 'drizzle-orm'
import { Database } from '../../../db'
import { camas, eventos, inscricoes, locais, pessoas, quartos } from '../../../db/schema'

export class AcomodacaoRepository {
  constructor(private readonly db: Database) {}

  async createLocal(data: typeof locais.$inferInsert) {
    const [local] = await this.db.insert(locais).values(data).returning()
    return local
  }

  async deleteQuarto(quartoId: string) {
    await this.db.delete(camas).where(eq(camas.quarto_id, quartoId))
    await this.db.delete(quartos).where(eq(quartos.id, quartoId))
  }

  async updateLocal(localId: string, data: Partial<typeof locais.$inferInsert>) {
    const [local] = await this.db
      .update(locais)
      .set({ ...data, updated_at: new Date() })
      .where(eq(locais.id, localId))
      .returning()

    return local
  }

  async createQuarto(data: typeof quartos.$inferInsert) {
    const [quarto] = await this.db.insert(quartos).values(data).returning()
    return quarto
  }

  async updateQuarto(quartoId: string, data: Partial<typeof quartos.$inferInsert>) {
    const [quarto] = await this.db
      .update(quartos)
      .set({ ...data, updated_at: new Date() })
      .where(eq(quartos.id, quartoId))
      .returning()

    return quarto
  }

  async createCama(data: typeof camas.$inferInsert) {
    const [cama] = await this.db.insert(camas).values(data).returning()
    return cama
  }

  async updateCama(camaId: string, data: Partial<typeof camas.$inferInsert>) {
    const [cama] = await this.db
      .update(camas)
      .set(data)
      .where(eq(camas.id, camaId))
      .returning()

    return cama
  }

  async findLocalById(localId: string) {
    return this.db.query.locais.findFirst({
      where: eq(locais.id, localId),
    })
  }

  async findQuartoById(quartoId: string) {
    return this.db.query.quartos.findFirst({
      where: eq(quartos.id, quartoId),
    })
  }

  async findCamaById(camaId: string) {
    return this.db.query.camas.findFirst({
      where: eq(camas.id, camaId),
    })
  }

  async listLocaisWithStructure() {
    const locaisRows = await this.db.query.locais.findMany({
      with: {
        quartos: {
          with: {
            camas: true,
          },
        },
      },
      orderBy: [asc(locais.nome)],
    })

    return locaisRows.map((local) => ({
      ...local,
      quartos: [...local.quartos]
        .sort((a, b) => a.nome.localeCompare(b.nome))
        .map((quarto) => ({
          ...quarto,
          camas: [...quarto.camas].sort((a, b) => (a.identificacao ?? '').localeCompare(b.identificacao ?? '')),
        })),
    }))
  }

  async listQuartosByLocalId(localId: string) {
    return this.db.query.quartos.findMany({
      where: eq(quartos.local_id, localId),
      with: {
        camas: true,
      },
      orderBy: [asc(quartos.nome)],
    })
  }

  async listCamasByQuartoId(quartoId: string) {
    return this.db.query.camas.findMany({
      where: eq(camas.quarto_id, quartoId),
      orderBy: [asc(camas.identificacao)],
    })
  }

  async findEventoById(eventoId: string) {
    return this.db.query.eventos.findFirst({
      where: eq(eventos.id, eventoId),
    })
  }

  async getMapaAcomodacao(eventoId: string) {
    const evento = await this.db.query.eventos.findFirst({
      where: eq(eventos.id, eventoId),
      with: {
        local: {
          with: {
            quartos: {
              with: {
                camas: true,
              },
            },
          },
        },
      },
    })

    if (!evento || !evento.local) {
      return { evento, quartos: [], inscricoesAtivas: [] }
    }

    const inscricoesAtivas = await this.db
      .select({
        id: inscricoes.id,
        evento_id: inscricoes.evento_id,
        pessoa_id: inscricoes.pessoa_id,
        cama_id: inscricoes.cama_id,
        papel: inscricoes.papel,
        status: inscricoes.status,
        nome: pessoas.nome,
        genero: pessoas.genero,
      })
      .from(inscricoes)
      .innerJoin(pessoas, eq(pessoas.id, inscricoes.pessoa_id))
      .where(
        and(
          eq(inscricoes.evento_id, eventoId),
          ne(inscricoes.status, 'CANCELADA'),
          sql`${inscricoes.cama_id} is not null`,
        ),
      )

    return {
      evento,
      quartos: evento.local.quartos,
      inscricoesAtivas,
    }
  }

  async listInscricoesDisponiveis(eventoId: string, query?: string) {
    const filters = [
      eq(inscricoes.evento_id, eventoId),
      isNull(inscricoes.cama_id),
      ne(inscricoes.status, 'CANCELADA'),
      ne(inscricoes.status, 'LISTA_ESPERA'),
    ]

    if (query?.trim()) {
      filters.push(ilike(pessoas.nome, `%${query.trim()}%`))
    }

    return this.db
      .select({
        id: inscricoes.id,
        evento_id: inscricoes.evento_id,
        pessoa_id: inscricoes.pessoa_id,
        papel: inscricoes.papel,
        status: inscricoes.status,
        nome: pessoas.nome,
        genero: pessoas.genero,
      })
      .from(inscricoes)
      .innerJoin(pessoas, eq(pessoas.id, inscricoes.pessoa_id))
      .where(and(...filters))
      .orderBy(asc(pessoas.nome))
  }

  async lockCama(tx: any, camaId: string) {
    const rows = await tx.execute(sql`
      select
        c.id,
        c.quarto_id,
        c.identificacao,
        c.tipo,
        c.bloqueada,
        q.local_id,
        q.genero_permitido
      from ${camas} c
      left join ${quartos} q on q.id = c.quarto_id
      where c.id = ${camaId}
      for update
    `)

    return rows[0] ?? null
  }

  async lockInscricao(tx: any, inscricaoId: string) {
    const rows = await tx.execute(sql`
      select
        i.id,
        i.evento_id,
        i.pessoa_id,
        i.papel,
        i.status,
        i.cama_id,
        e.local_id,
        p.nome,
        p.genero
      from ${inscricoes} i
      inner join ${eventos} e on e.id = i.evento_id
      inner join ${pessoas} p on p.id = i.pessoa_id
      where i.id = ${inscricaoId}
      for update
    `)

    return rows[0] ?? null
  }

  async lockOccupancyForBed(tx: any, eventoId: string, camaId: string) {
    const rows = await tx.execute(sql`
      select id
      from ${inscricoes}
      where evento_id = ${eventoId}
        and cama_id = ${camaId}
        and status <> 'CANCELADA'
      for update
    `)

    return rows.map((row: any) => row.id as string)
  }

  async assignCama(tx: any, inscricaoId: string, camaId: string) {
    const [inscricao] = await tx
      .update(inscricoes)
      .set({ cama_id: camaId, updated_at: new Date() })
      .where(eq(inscricoes.id, inscricaoId))
      .returning()

    return inscricao
  }

  async findInscricaoByCamaIdForUpdate(tx: any, camaId: string) {
    const rows = await tx.execute(sql`
      select id, evento_id, pessoa_id, papel, status, cama_id
      from ${inscricoes}
      where cama_id = ${camaId}
        and status <> 'CANCELADA'
      for update
    `)

    return rows[0] ?? null
  }

  async releaseCama(tx: any, inscricaoId: string) {
    const [inscricao] = await tx
      .update(inscricoes)
      .set({ cama_id: null, updated_at: new Date() })
      .where(eq(inscricoes.id, inscricaoId))
      .returning()

    return inscricao
  }
}
