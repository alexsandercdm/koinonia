/* ─── STATUS MAP ───────────────────────────────────────────── */
const STATUS_MAP = {
  PAGO_TOTAL:   { label: 'Pago',     color: 'success' },
  PAGO_PARCIAL: { label: 'Parcial',  color: 'warning' },
  PENDENTE:     { label: 'Pendente', color: 'danger'  },
  LISTA_ESPERA: { label: 'Espera',   color: 'neutral' },
  CANCELADA:    { label: 'Cancelada',color: 'danger'  },
};

const EVENTO_STATUS = {
  EM_ANDAMENTO: { label: 'Em andamento', color: 'success' },
  PLANEJAMENTO: { label: 'Planejamento', color: 'info'    },
  ABERTO:       { label: 'Aberto',       color: 'gold'    },
  ENCERRADO:    { label: 'Encerrado',    color: 'neutral' },
};

/* ─── PARTICIPANTES ────────────────────────────────────────── */
const PARTICIPANTES = [
  { id: 1, nome: 'Ana Carolina Ferreira',  genero: 'F', papel: 'encontrista', email: 'ana@email.com',      telefone: '(32) 99876-5432', alergias: null,              condicoes_medicas: 'Hipertensão',   cpf: '123.456.789-00', nascimento: '1995-03-12' },
  { id: 2, nome: 'Bruno Henrique Santos',  genero: 'M', papel: 'servo',       email: 'bruno@email.com',    telefone: '(32) 99123-4567', alergias: 'Frutos do mar',   condicoes_medicas: null,            cpf: '234.567.890-11', nascimento: '1990-07-25' },
  { id: 3, nome: 'Camila Dias Oliveira',   genero: 'F', papel: 'encontrista', email: 'camila@email.com',   telefone: '(32) 98765-4321', alergias: null,              condicoes_medicas: null,            cpf: '345.678.901-22', nascimento: '2001-11-08' },
  { id: 4, nome: 'Daniel Rocha Lima',      genero: 'M', papel: 'servo',       email: 'daniel@email.com',   telefone: '(32) 97654-3210', alergias: null,              condicoes_medicas: null,            cpf: '456.789.012-33', nascimento: '1988-05-19' },
  { id: 5, nome: 'Fernanda Mota Costa',    genero: 'F', papel: 'encontrista', email: 'fernanda@email.com', telefone: null,              alergias: 'Glúten',          condicoes_medicas: null,            cpf: '567.890.123-44', nascimento: '1999-01-30' },
  { id: 6, nome: 'Gabriel Silva Nunes',    genero: 'M', papel: 'encontrista', email: 'gabriel@email.com',  telefone: '(32) 96543-2109', alergias: null,              condicoes_medicas: null,            cpf: '678.901.234-55', nascimento: '2003-09-14' },
  { id: 7, nome: 'Helena Costa Barbosa',   genero: 'F', papel: 'servo',       email: 'helena@email.com',   telefone: '(32) 95432-1098', alergias: null,              condicoes_medicas: null,            cpf: '789.012.345-66', nascimento: '1985-12-02' },
  { id: 8, nome: 'Igor Mendes Pereira',    genero: 'M', papel: 'encontrista', email: 'igor@email.com',     telefone: '(21) 94321-0987', alergias: null,              condicoes_medicas: 'Diabetes tipo 2', cpf: '890.123.456-77', nascimento: '1993-06-22' },
];

/* ─── INSCRIÇÕES ───────────────────────────────────────────── */
const INSCRICOES = [
  { id: 1, nome: 'Ana Carolina Ferreira', papel: 'encontrista', status: 'PAGO_TOTAL',   valor_total: 380, valor_pago: 380, genero: 'F' },
  { id: 2, nome: 'Bruno Henrique Santos', papel: 'servo',       status: 'PAGO_PARCIAL', valor_total: 280, valor_pago: 140, genero: 'M' },
  { id: 3, nome: 'Camila Dias Oliveira',  papel: 'encontrista', status: 'PENDENTE',     valor_total: 380, valor_pago: 0,   genero: 'F' },
  { id: 4, nome: 'Daniel Rocha Lima',     papel: 'servo',       status: 'PAGO_TOTAL',   valor_total: 280, valor_pago: 280, genero: 'M' },
  { id: 5, nome: 'Fernanda Mota Costa',   papel: 'encontrista', status: 'LISTA_ESPERA', valor_total: 380, valor_pago: 0,   genero: 'F' },
  { id: 6, nome: 'Gabriel Silva Nunes',   papel: 'encontrista', status: 'PAGO_TOTAL',   valor_total: 380, valor_pago: 380, genero: 'M' },
  { id: 7, nome: 'Helena Costa Barbosa',  papel: 'servo',       status: 'PAGO_TOTAL',   valor_total: 280, valor_pago: 280, genero: 'F' },
  { id: 8, nome: 'Igor Mendes Pereira',   papel: 'encontrista', status: 'PAGO_PARCIAL', valor_total: 380, valor_pago: 200, genero: 'M' },
];

/* ─── CHACARAS ─────────────────────────────────────────────── */
const CHACARAS = [
  {
    id: 1, nome: 'Chácara Paz e Amor',
    endereco: 'Estrada do Retiro, 1200 — Zona Rural',
    cidade: 'Juiz de Fora, MG', capacidade: 120,
    quartos: [
      { id: 1, nome: 'Quarto 01', genero: 'F', capacidade: 4, camas: 4 },
      { id: 2, nome: 'Quarto 02', genero: 'F', capacidade: 4, camas: 4 },
      { id: 3, nome: 'Quarto 03', genero: 'M', capacidade: 4, camas: 4 },
      { id: 4, nome: 'Quarto 04', genero: 'M', capacidade: 4, camas: 4 },
      { id: 5, nome: 'Quarto 05', genero: 'M', capacidade: 4, camas: 4 },
    ],
  },
  {
    id: 2, nome: 'Sítio das Águas',
    endereco: 'Rodovia MG-040, KM 15',
    cidade: 'Barbacena, MG', capacidade: 80,
    quartos: [
      { id: 6, nome: 'Ala Feminina',  genero: 'F', capacidade: 6, camas: 6 },
      { id: 7, nome: 'Ala Masculina', genero: 'M', capacidade: 6, camas: 6 },
    ],
  },
];

/* ─── QUARTOS (mapa visual) ────────────────────────────────── */
const QUARTOS = [
  { id: 1, nome: 'Quarto 01', genero: 'F', camas: [
    { id: 1, ocupante: 'Ana Carolina F.' }, { id: 2, ocupante: 'Camila Dias O.' },
    { id: 3, ocupante: null }, { id: 4, ocupante: null },
  ]},
  { id: 2, nome: 'Quarto 02', genero: 'F', camas: [
    { id: 5, ocupante: 'Fernanda Mota C.' }, { id: 6, ocupante: 'Helena Costa B.' },
    { id: 7, ocupante: null }, { id: 8, ocupante: null },
  ]},
  { id: 3, nome: 'Quarto 03', genero: 'M', camas: [
    { id: 9,  ocupante: 'Bruno H. Santos'   }, { id: 10, ocupante: 'Daniel Rocha L.' },
    { id: 11, ocupante: 'Gabriel Silva N.'  }, { id: 12, ocupante: null },
  ]},
  { id: 4, nome: 'Quarto 04', genero: 'M', camas: [
    { id: 13, ocupante: 'Igor Mendes P.' }, { id: 14, ocupante: null },
    { id: 15, ocupante: null }, { id: 16, ocupante: null },
  ]},
  { id: 5, nome: 'Quarto 05', genero: 'M', camas: [
    { id: 17, ocupante: null }, { id: 18, ocupante: null },
    { id: 19, ocupante: null }, { id: 20, ocupante: null },
  ]},
];

/* ─── EVENTOS ──────────────────────────────────────────────── */
const EVENTOS = [
  {
    id: 1, nome: 'Retiro Koinonia 2025',
    chacara: 'Chácara Paz e Amor', chacara_id: 1,
    data_inicio: '18/01/2025', data_fim: '20/01/2025',
    status: 'EM_ANDAMENTO', capacidade: 90, inscritos: 78,
    valor_encontrista: 380, valor_servo: 280,
    descricao: 'Retiro anual da comunidade Koinonia.',
  },
  {
    id: 2, nome: 'Retiro de Jovens 2024',
    chacara: 'Sítio das Águas', chacara_id: 2,
    data_inicio: '05/07/2024', data_fim: '07/07/2024',
    status: 'ENCERRADO', capacidade: 60, inscritos: 58,
    valor_encontrista: 320, valor_servo: 240,
    descricao: 'Retiro exclusivo para o grupo jovem.',
  },
  {
    id: 3, nome: 'Encontro de Casais 2025',
    chacara: 'Chácara Paz e Amor', chacara_id: 1,
    data_inicio: '14/06/2025', data_fim: '16/06/2025',
    status: 'PLANEJAMENTO', capacidade: 50, inscritos: 12,
    valor_encontrista: 450, valor_servo: 350,
    descricao: 'Encontro especial para casais da comunidade.',
  },
];

Object.assign(window, { STATUS_MAP, EVENTO_STATUS, PARTICIPANTES, INSCRICOES, CHACARAS, QUARTOS, EVENTOS });
