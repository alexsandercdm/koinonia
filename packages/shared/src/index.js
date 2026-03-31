"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateDespesaDTO = exports.CreatePagamentoDTO = exports.CreateInscricaoDTO = exports.UpdateEventoDTO = exports.CreateEventoDTO = exports.UpdatePessoaDTO = exports.CreatePessoaDTO = exports.DespesaSchema = exports.PagamentoSchema = exports.InscricaoSchema = exports.EventoSchema = exports.CamaSchema = exports.QuartoSchema = exports.LocalSchema = exports.PessoaSchema = exports.UserRoleEnum = exports.TipoCamaEnum = exports.GeneroQuartoEnum = exports.CategoriaDespesaEnum = exports.FormaPagamentoEnum = exports.StatusEventoEnum = exports.StatusPagamentoEnum = exports.PapelEnum = exports.GeneroEnum = void 0;
const zod_1 = require("zod");
// Enums
exports.GeneroEnum = zod_1.z.enum(['M', 'F']);
exports.PapelEnum = zod_1.z.enum(['encontrista', 'servo']);
exports.StatusPagamentoEnum = zod_1.z.enum(['pendente', 'pago_parcial', 'pago_total']);
exports.StatusEventoEnum = zod_1.z.enum(['rascunho', 'aberto', 'encerrado', 'realizado']);
exports.FormaPagamentoEnum = zod_1.z.enum(['pix', 'dinheiro', 'cartao', 'outro']);
exports.CategoriaDespesaEnum = zod_1.z.enum(['alimentacao', 'transporte', 'material', 'hospedagem', 'outro']);
exports.GeneroQuartoEnum = zod_1.z.enum(['M', 'F', 'MISTO']);
exports.TipoCamaEnum = zod_1.z.enum(['solteiro', 'beliche_superior', 'beliche_inferior', 'casal']);
exports.UserRoleEnum = zod_1.z.enum(['admin', 'lider', 'servo']);
// Base schemas
exports.PessoaSchema = zod_1.z.object({
    id: zod_1.z.string().uuid().optional(),
    nome: zod_1.z.string().min(1).max(200),
    genero: exports.GeneroEnum,
    data_nascimento: zod_1.z.string().date().optional(),
    telefone: zod_1.z.string().max(20).optional(),
    email: zod_1.z.string().email().max(200).optional(),
    padrinho_id: zod_1.z.string().uuid().nullable().optional(),
    alergias: zod_1.z.string().optional(),
    restricoes_alimentares: zod_1.z.array(zod_1.z.string()).optional(),
    medicamentos: zod_1.z.string().optional(),
    condicoes_medicas: zod_1.z.string().optional(),
    contato_emergencia_nome: zod_1.z.string().max(200).optional(),
    contato_emergencia_tel: zod_1.z.string().max(20).optional(),
    created_at: zod_1.z.string().datetime().optional(),
    updated_at: zod_1.z.string().datetime().optional(),
    deleted_at: zod_1.z.string().datetime().nullable().optional(),
});
exports.LocalSchema = zod_1.z.object({
    id: zod_1.z.string().uuid().optional(),
    nome: zod_1.z.string().min(1).max(200),
    endereco: zod_1.z.string().optional(),
    capacidade_total: zod_1.z.number().int().positive().optional(),
    created_at: zod_1.z.string().datetime().optional(),
    updated_at: zod_1.z.string().datetime().optional(),
});
exports.QuartoSchema = zod_1.z.object({
    id: zod_1.z.string().uuid().optional(),
    local_id: zod_1.z.string().uuid(),
    nome: zod_1.z.string().min(1).max(100),
    genero_permitido: exports.GeneroQuartoEnum,
    capacidade: zod_1.z.number().int().positive(),
    created_at: zod_1.z.string().datetime().optional(),
    updated_at: zod_1.z.string().datetime().optional(),
});
exports.CamaSchema = zod_1.z.object({
    id: zod_1.z.string().uuid().optional(),
    quarto_id: zod_1.z.string().uuid(),
    identificacao: zod_1.z.string().max(50),
    tipo: exports.TipoCamaEnum,
    created_at: zod_1.z.string().datetime().optional(),
});
exports.EventoSchema = zod_1.z.object({
    id: zod_1.z.string().uuid().optional(),
    nome: zod_1.z.string().min(1).max(200),
    descricao: zod_1.z.string().optional(),
    data_inicio: zod_1.z.string().date(),
    data_fim: zod_1.z.string().date(),
    local_id: zod_1.z.string().uuid(),
    valor_inscricao_encontrista: zod_1.z.number().min(0),
    valor_inscricao_servo: zod_1.z.number().min(0),
    capacidade_maxima: zod_1.z.number().int().positive(),
    status: exports.StatusEventoEnum,
    created_at: zod_1.z.string().datetime().optional(),
    updated_at: zod_1.z.string().datetime().optional(),
});
exports.InscricaoSchema = zod_1.z.object({
    id: zod_1.z.string().uuid().optional(),
    evento_id: zod_1.z.string().uuid(),
    pessoa_id: zod_1.z.string().uuid(),
    papel: exports.PapelEnum,
    valor_total: zod_1.z.number().min(0),
    valor_pago: zod_1.z.number().min(0),
    cama_id: zod_1.z.string().uuid().nullable().optional(),
    observacoes: zod_1.z.string().optional(),
    created_at: zod_1.z.string().datetime().optional(),
    updated_at: zod_1.z.string().datetime().optional(),
});
exports.PagamentoSchema = zod_1.z.object({
    id: zod_1.z.string().uuid().optional(),
    inscricao_id: zod_1.z.string().uuid(),
    valor: zod_1.z.number().min(0),
    forma_pagamento: exports.FormaPagamentoEnum,
    data_pagamento: zod_1.z.string().date(),
    comprovante_url: zod_1.z.string().url().nullable().optional(),
    registrado_por: zod_1.z.string().uuid().optional(),
    created_at: zod_1.z.string().datetime().optional(),
});
exports.DespesaSchema = zod_1.z.object({
    id: zod_1.z.string().uuid().optional(),
    evento_id: zod_1.z.string().uuid(),
    descricao: zod_1.z.string().min(1).max(300),
    categoria: exports.CategoriaDespesaEnum,
    valor: zod_1.z.number().min(0),
    data_despesa: zod_1.z.string().date(),
    comprovante_url: zod_1.z.string().url().nullable().optional(),
    registrado_por: zod_1.z.string().uuid().optional(),
    created_at: zod_1.z.string().datetime().optional(),
});
// API DTOs
exports.CreatePessoaDTO = exports.PessoaSchema.omit({
    id: true,
    created_at: true,
    updated_at: true,
    deleted_at: true,
});
exports.UpdatePessoaDTO = exports.CreatePessoaDTO.partial();
exports.CreateEventoDTO = exports.EventoSchema.omit({
    id: true,
    created_at: true,
    updated_at: true,
});
exports.UpdateEventoDTO = exports.CreateEventoDTO.partial();
exports.CreateInscricaoDTO = exports.InscricaoSchema.omit({
    id: true,
    created_at: true,
    updated_at: true,
});
exports.CreatePagamentoDTO = exports.PagamentoSchema.omit({
    id: true,
    created_at: true,
});
exports.CreateDespesaDTO = exports.DespesaSchema.omit({
    id: true,
    created_at: true,
});
//# sourceMappingURL=index.js.map