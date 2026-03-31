import { pgTable, uuid, varchar, text, date, numeric, integer, timestamp, boolean, index } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Import Better Auth schema
export { user, session, account, verification, userRelations, sessionRelations, accountRelations } from './auth-schema'

// Tables
export const pessoas = pgTable('pessoas', {
  id: uuid('id').primaryKey().defaultRandom(),
  nome: varchar('nome', { length: 200 }).notNull(),
  genero: varchar('genero', { length: 1 }).notNull(), // 'M' or 'F'
  data_nascimento: date('data_nascimento'),
  telefone: varchar('telefone', { length: 20 }),
  email: varchar('email', { length: 200 }).unique(),
  padrinho_id: uuid('padrinho_id'),
  alergias: text('alergias'),
  restricoes_alimentares: text('restricoes_alimentares').array(),
  medicamentos: text('medicamentos'),
  condicoes_medicas: text('condicoes_medicas'),
  contato_emergencia_nome: varchar('contato_emergencia_nome', { length: 200 }),
  contato_emergencia_tel: varchar('contato_emergencia_tel', { length: 20 }),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
  deleted_at: timestamp('deleted_at'),
})

// Add the self-reference after the table definition
export const pessoasSelfRef = pessoas
export const pessoasTable = pessoas

export const locais = pgTable('locais', {
  id: uuid('id').primaryKey().defaultRandom(),
  nome: varchar('nome', { length: 200 }).notNull(),
  endereco: text('endereco'),
  capacidade_total: integer('capacidade_total'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
})

export const quartos = pgTable('quartos', {
  id: uuid('id').primaryKey().defaultRandom(),
  local_id: uuid('local_id').notNull().references(() => locais.id),
  nome: varchar('nome', { length: 100 }).notNull(),
  genero_permitido: varchar('genero_permitido', { length: 5 }).notNull(), // 'M', 'F', 'MISTO'
  capacidade: integer('capacidade').notNull(),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
})

export const camas = pgTable('camas', {
  id: uuid('id').primaryKey().defaultRandom(),
  quarto_id: uuid('quarto_id').notNull().references(() => quartos.id),
  identificacao: varchar('identificacao', { length: 50 }),
  tipo: varchar('tipo', { length: 20 }).notNull(), // 'solteiro', 'beliche_superior', 'beliche_inferior', 'casal'
  created_at: timestamp('created_at').defaultNow(),
})

export const eventos = pgTable('eventos', {
  id: uuid('id').primaryKey().defaultRandom(),
  nome: varchar('nome', { length: 200 }).notNull(),
  descricao: text('descricao'),
  data_inicio: date('data_inicio').notNull(),
  data_fim: date('data_fim').notNull(),
  local_id: uuid('local_id').notNull().references(() => locais.id),
  valor_inscricao_encontrista: numeric('valor_inscricao_encontrista', { precision: 10, scale: 2 }).notNull(),
  valor_inscricao_servo: numeric('valor_inscricao_servo', { precision: 10, scale: 2 }).default('0'),
  capacidade_maxima: integer('capacidade_maxima').notNull(),
  status: varchar('status', { length: 20 }).notNull(), // 'rascunho', 'aberto', 'encerrado', 'realizado'
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
})

export const inscricoes = pgTable('inscricoes', {
  id: uuid('id').primaryKey().defaultRandom(),
  evento_id: uuid('evento_id').notNull().references(() => eventos.id),
  pessoa_id: uuid('pessoa_id').notNull().references(() => pessoas.id),
  papel: varchar('papel', { length: 20 }).notNull(), // 'encontrista', 'servo'
  valor_total: numeric('valor_total', { precision: 10, scale: 2 }).notNull(),
  valor_pago: numeric('valor_pago', { precision: 10, scale: 2 }).default('0'),
  status_pagamento: varchar('status_pagamento', { length: 20 }),
  cama_id: uuid('cama_id').references(() => camas.id),
  observacoes: text('observacoes'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
})

export const pagamentos = pgTable('pagamentos', {
  id: uuid('id').primaryKey().defaultRandom(),
  inscricao_id: uuid('inscricao_id').notNull().references(() => inscricoes.id),
  valor: numeric('valor', { precision: 10, scale: 2 }).notNull(),
  forma_pagamento: varchar('forma_pagamento', { length: 20 }).notNull(), // 'pix', 'dinheiro', 'cartao', 'outro'
  data_pagamento: date('data_pagamento').notNull(),
  comprovante_url: text('comprovante_url'),
  registrado_por: uuid('registrado_por'),
  created_at: timestamp('created_at').defaultNow(),
})

export const despesas = pgTable('despesas', {
  id: uuid('id').primaryKey().defaultRandom(),
  evento_id: uuid('evento_id').notNull().references(() => eventos.id),
  descricao: varchar('descricao', { length: 300 }).notNull(),
  categoria: varchar('categoria', { length: 20 }).notNull(), // 'alimentacao', 'transporte', 'material', 'hospedagem', 'outro'
  valor: numeric('valor', { precision: 10, scale: 2 }).notNull(),
  data_despesa: date('data_despesa').notNull(),
  comprovante_url: text('comprovante_url'),
  registrado_por: uuid('registrado_por'),
  created_at: timestamp('created_at').defaultNow(),
})

// Relations
export const pessoasRelations = relations(pessoas, ({ many, one }) => ({
  padrinho: one(pessoas, {
    fields: [pessoas.padrinho_id],
    references: [pessoas.id],
  }),
  afilhados: many(pessoas),
  inscricoes: many(inscricoes),
}))

export const locaisRelations = relations(locais, ({ many }) => ({
  quartos: many(quartos),
  eventos: many(eventos),
}))

export const quartosRelations = relations(quartos, ({ many, one }) => ({
  local: one(locais, {
    fields: [quartos.local_id],
    references: [locais.id],
  }),
  camas: many(camas),
}))

export const camasRelations = relations(camas, ({ many, one }) => ({
  quarto: one(quartos, {
    fields: [camas.quarto_id],
    references: [quartos.id],
  }),
  inscricoes: many(inscricoes),
}))

export const eventosRelations = relations(eventos, ({ many, one }) => ({
  local: one(locais, {
    fields: [eventos.local_id],
    references: [locais.id],
  }),
  inscricoes: many(inscricoes),
  despesas: many(despesas),
}))

export const inscricoesRelations = relations(inscricoes, ({ many, one }) => ({
  evento: one(eventos, {
    fields: [inscricoes.evento_id],
    references: [eventos.id],
  }),
  pessoa: one(pessoas, {
    fields: [inscricoes.pessoa_id],
    references: [pessoas.id],
  }),
  cama: one(camas, {
    fields: [inscricoes.cama_id],
    references: [camas.id],
  }),
  pagamentos: many(pagamentos),
}))

export const pagamentosRelations = relations(pagamentos, ({ one }) => ({
  inscricao: one(inscricoes, {
    fields: [pagamentos.inscricao_id],
    references: [inscricoes.id],
  }),
}))

export const despesasRelations = relations(despesas, ({ one }) => ({
  evento: one(eventos, {
    fields: [despesas.evento_id],
    references: [eventos.id],
  }),
}))

// Types
export type Pessoa = typeof pessoas.$inferSelect
export type CreatePessoa = typeof pessoas.$inferInsert
export type Local = typeof locais.$inferSelect
export type CreateLocal = typeof locais.$inferInsert
export type Quarto = typeof quartos.$inferSelect
export type CreateQuarto = typeof quartos.$inferInsert
export type Cama = typeof camas.$inferSelect
export type CreateCama = typeof camas.$inferInsert
export type Evento = typeof eventos.$inferSelect
export type CreateEvento = typeof eventos.$inferInsert
export type Inscricao = typeof inscricoes.$inferSelect
export type CreateInscricao = typeof inscricoes.$inferInsert
export type Pagamento = typeof pagamentos.$inferSelect
export type CreatePagamento = typeof pagamentos.$inferInsert
export type Despesa = typeof despesas.$inferSelect
export type CreateDespesa = typeof despesas.$inferInsert
