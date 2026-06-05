import { Match, Team } from '../types';

// ─── Teams — ISO 3166-1 alpha-2 codes used for flags ─────────────────────────
// Special cases:
//   England → GB-ENG not in lib → use 'GB' (shown as United Kingdom flag)
//   Scotland → 'GB' same workaround
//   Wales    → 'GB' same workaround
//   Kosovo   → 'XK' (user-assigned code, supported by the lib)
//   North Macedonia → 'MK'
//   Ivory Coast → 'CI'
//   DR Congo → 'CD'
//   New Caledonia → 'NC'
//   Curaçao → 'CW'
//   Bosnia → 'BA'
//   TBD → 'TBD' (placeholder, no flag)
export const TEAMS: Record<string, Team> = {
  // Group A
  MEX: { code: 'MEX', flagCode: 'MX', name: 'México' },
  RSA: { code: 'RSA', flagCode: 'ZA', name: 'África do Sul' },
  KOR: { code: 'KOR', flagCode: 'KR', name: 'Coreia do Sul' },
  GRP_A4: { code: 'GRP_A4', flagCode: 'TBD', name: 'Rep. Tcheca/Dinamarca/Macedônia/Irlanda' },

  // Group B
  CAN: { code: 'CAN', flagCode: 'CA', name: 'Canadá' },
  GRP_B2: { code: 'GRP_B2', flagCode: 'TBD', name: 'Itália/Irlanda do Norte/País de Gales/Bósnia' },
  USA: { code: 'USA', flagCode: 'US', name: 'Estados Unidos' },
  PAR: { code: 'PAR', flagCode: 'PY', name: 'Paraguai' },

  // Group C
  AUS: { code: 'AUS', flagCode: 'AU', name: 'Austrália' },
  GRP_C2: { code: 'GRP_C2', flagCode: 'TBD', name: 'Turquia/Romênia/Eslováquia/Kosovo' },
  QAT: { code: 'QAT', flagCode: 'QA', name: 'Catar' },
  SUI: { code: 'SUI', flagCode: 'CH', name: 'Suíça' },
  BRA: { code: 'BRA', flagCode: 'BR', name: 'Brasil' },
  MAR: { code: 'MAR', flagCode: 'MA', name: 'Marrocos' },
  HAI: { code: 'HAI', flagCode: 'HT', name: 'Haiti' },
  SCO: { code: 'SCO', flagCode: 'GB', name: 'Escócia' },

  // Group D
  GER: { code: 'GER', flagCode: 'DE', name: 'Alemanha' },
  CUW: { code: 'CUW', flagCode: 'CW', name: 'Curaçao' },
  NED: { code: 'NED', flagCode: 'NL', name: 'Países Baixos' },
  JPN: { code: 'JPN', flagCode: 'JP', name: 'Japão' },
  IVC: { code: 'IVC', flagCode: 'CI', name: 'Costa do Marfim' },
  ECU: { code: 'ECU', flagCode: 'EC', name: 'Equador' },
  GRP_D4: { code: 'GRP_D4', flagCode: 'TBD', name: 'Ucrânia/Suécia/Polônia/Albânia' },
  TUN: { code: 'TUN', flagCode: 'TN', name: 'Tunísia' },

  // Group E
  ESP: { code: 'ESP', flagCode: 'ES', name: 'Espanha' },
  CPV: { code: 'CPV', flagCode: 'CV', name: 'Cabo Verde' },
  BEL: { code: 'BEL', flagCode: 'BE', name: 'Bélgica' },
  EGY: { code: 'EGY', flagCode: 'EG', name: 'Egito' },
  SAU: { code: 'SAU', flagCode: 'SA', name: 'Arábia Saudita' },
  URU: { code: 'URU', flagCode: 'UY', name: 'Uruguai' },
  IRI: { code: 'IRI', flagCode: 'IR', name: 'Irã' },
  NZL: { code: 'NZL', flagCode: 'NZ', name: 'Nova Zelândia' },

  // Group F
  ARG: { code: 'ARG', flagCode: 'AR', name: 'Argentina' },
  ALG: { code: 'ALG', flagCode: 'DZ', name: 'Argélia' },
  FRA: { code: 'FRA', flagCode: 'FR', name: 'França' },
  SEN: { code: 'SEN', flagCode: 'SN', name: 'Senegal' },
  GRP_F3: { code: 'GRP_F3', flagCode: 'TBD', name: 'Iraque/Bolívia/Suriname' },
  NOR: { code: 'NOR', flagCode: 'NO', name: 'Noruega' },
  AUT: { code: 'AUT', flagCode: 'AT', name: 'Áustria' },
  JOR: { code: 'JOR', flagCode: 'JO', name: 'Jordânia' },

  // Group G
  POR: { code: 'POR', flagCode: 'PT', name: 'Portugal' },
  GRP_G2: { code: 'GRP_G2', flagCode: 'TBD', name: 'RD Congo/Jamaica/Nova Caledônia' },
  ENG: { code: 'ENG', flagCode: 'GB', name: 'Inglaterra' },
  CRO: { code: 'CRO', flagCode: 'HR', name: 'Croácia' },
  GHA: { code: 'GHA', flagCode: 'GH', name: 'Gana' },
  PAN: { code: 'PAN', flagCode: 'PA', name: 'Panamá' },
  UZB: { code: 'UZB', flagCode: 'UZ', name: 'Uzbequistão' },
  COL: { code: 'COL', flagCode: 'CO', name: 'Colômbia' },

  // TBD
  TBD: { code: 'TBD', flagCode: 'TBD', name: 'A definir' },
};

// ─── Phase labels ─────────────────────────────────────────────────────────────
export const PHASE_LABELS: Record<string, string> = {
  group_stage: 'Fase de Grupos',
  round_of_32: 'Rodada de 32',
  round_of_16: 'Oitavas de Final',
  quarterfinals: 'Quartas de Final',
  semifinals: 'Semifinais',
  third_place: 'Disputa 3º Lugar',
  final: 'Final',
};

export const PHASE_ORDER = [
  'group_stage',
  'round_of_32',
  'round_of_16',
  'quarterfinals',
  'semifinals',
  'third_place',
  'final',
];

const T = TEAMS;

// Dates are in Brasília time (UTC-3). Using explicit offset to avoid DST ambiguity.
const brt = (iso: string) => new Date(iso);

// ─── Matches — Copa do Mundo 2026 (horários de Brasília) ─────────────────────
export const WC2026_MATCHES: Omit<Match, 'status' | 'homeScore' | 'awayScore'>[] = [

  // ══ 1ª RODADA ══════════════════════════════════════════════════════════════

  // 11/jun
  { id: 'm001', matchNumber: 1,  phase: 'group_stage', groupName: 'Grupo A', homeTeam: T.MEX,    awayTeam: T.RSA,     startTime: brt('2026-06-11T16:00:00-03:00'), venue: 'Estadio Azteca — Cidade do México, MEX' },
  { id: 'm002', matchNumber: 2,  phase: 'group_stage', groupName: 'Grupo A', homeTeam: T.KOR,    awayTeam: T.GRP_A4,  startTime: brt('2026-06-11T23:00:00-03:00'), venue: 'Estadio Akron — Guadalajara, MEX' },

  // 12/jun
  { id: 'm003', matchNumber: 3,  phase: 'group_stage', groupName: 'Grupo B', homeTeam: T.CAN,    awayTeam: T.GRP_B2,  startTime: brt('2026-06-12T16:00:00-03:00'), venue: 'BMO Field — Toronto, CAN' },
  { id: 'm004', matchNumber: 4,  phase: 'group_stage', groupName: 'Grupo B', homeTeam: T.USA,    awayTeam: T.PAR,     startTime: brt('2026-06-12T22:00:00-03:00'), venue: 'Rose Bowl — Los Angeles, EUA' },

  // 13/jun
  { id: 'm005', matchNumber: 5,  phase: 'group_stage', groupName: 'Grupo C', homeTeam: T.AUS,    awayTeam: T.GRP_C2,  startTime: brt('2026-06-13T01:00:00-03:00'), venue: 'BC Place — Vancouver, CAN' },
  { id: 'm006', matchNumber: 6,  phase: 'group_stage', groupName: 'Grupo C', homeTeam: T.QAT,    awayTeam: T.SUI,     startTime: brt('2026-06-13T16:00:00-03:00'), venue: 'Levi\'s Stadium — San Francisco, EUA' },
  { id: 'm007', matchNumber: 7,  phase: 'group_stage', groupName: 'Grupo C', homeTeam: T.BRA,    awayTeam: T.MAR,     startTime: brt('2026-06-13T19:00:00-03:00'), venue: 'MetLife Stadium — Nova York/NJ, EUA' },
  { id: 'm008', matchNumber: 8,  phase: 'group_stage', groupName: 'Grupo C', homeTeam: T.HAI,    awayTeam: T.SCO,     startTime: brt('2026-06-13T22:00:00-03:00'), venue: 'Gillette Stadium — Boston, EUA' },

  // 14/jun
  { id: 'm009', matchNumber: 9,  phase: 'group_stage', groupName: 'Grupo D', homeTeam: T.GER,    awayTeam: T.CUW,     startTime: brt('2026-06-14T14:00:00-03:00'), venue: 'NRG Stadium — Houston, EUA' },
  { id: 'm010', matchNumber: 10, phase: 'group_stage', groupName: 'Grupo D', homeTeam: T.NED,    awayTeam: T.JPN,     startTime: brt('2026-06-14T17:00:00-03:00'), venue: 'AT&T Stadium — Dallas, EUA' },
  { id: 'm011', matchNumber: 11, phase: 'group_stage', groupName: 'Grupo D', homeTeam: T.IVC,    awayTeam: T.ECU,     startTime: brt('2026-06-14T20:00:00-03:00'), venue: 'Lincoln Financial — Filadélfia, EUA' },
  { id: 'm012', matchNumber: 12, phase: 'group_stage', groupName: 'Grupo D', homeTeam: T.GRP_D4, awayTeam: T.TUN,     startTime: brt('2026-06-14T23:00:00-03:00'), venue: 'Estadio BBVA — Monterrey, MEX' },

  // 15/jun
  { id: 'm013', matchNumber: 13, phase: 'group_stage', groupName: 'Grupo E', homeTeam: T.ESP,    awayTeam: T.CPV,     startTime: brt('2026-06-15T13:00:00-03:00'), venue: 'Mercedes-Benz Stadium — Atlanta, EUA' },
  { id: 'm014', matchNumber: 14, phase: 'group_stage', groupName: 'Grupo E', homeTeam: T.BEL,    awayTeam: T.EGY,     startTime: brt('2026-06-15T16:00:00-03:00'), venue: 'Lumen Field — Seattle, EUA' },
  { id: 'm015', matchNumber: 15, phase: 'group_stage', groupName: 'Grupo E', homeTeam: T.SAU,    awayTeam: T.URU,     startTime: brt('2026-06-15T19:00:00-03:00'), venue: 'Hard Rock Stadium — Miami, EUA' },
  { id: 'm016', matchNumber: 16, phase: 'group_stage', groupName: 'Grupo E', homeTeam: T.IRI,    awayTeam: T.NZL,     startTime: brt('2026-06-15T22:00:00-03:00'), venue: 'Rose Bowl — Los Angeles, EUA' },

  // 16/jun
  { id: 'm017', matchNumber: 17, phase: 'group_stage', groupName: 'Grupo F', homeTeam: T.ARG,    awayTeam: T.ALG,     startTime: brt('2026-06-16T14:00:00-03:00'), venue: 'Arrowhead Stadium — Kansas City, EUA' },
  { id: 'm018', matchNumber: 18, phase: 'group_stage', groupName: 'Grupo F', homeTeam: T.FRA,    awayTeam: T.SEN,     startTime: brt('2026-06-16T16:00:00-03:00'), venue: 'MetLife Stadium — Nova York/NJ, EUA' },
  { id: 'm019', matchNumber: 19, phase: 'group_stage', groupName: 'Grupo F', homeTeam: T.GRP_F3, awayTeam: T.NOR,     startTime: brt('2026-06-16T19:00:00-03:00'), venue: 'Gillette Stadium — Boston, EUA' },

  // 17/jun
  { id: 'm020', matchNumber: 20, phase: 'group_stage', groupName: 'Grupo F', homeTeam: T.AUT,    awayTeam: T.JOR,     startTime: brt('2026-06-17T01:00:00-03:00'), venue: 'Levi\'s Stadium — San Francisco, EUA' },
  { id: 'm021', matchNumber: 21, phase: 'group_stage', groupName: 'Grupo G', homeTeam: T.POR,    awayTeam: T.GRP_G2,  startTime: brt('2026-06-17T14:00:00-03:00'), venue: 'NRG Stadium — Houston, EUA' },
  { id: 'm022', matchNumber: 22, phase: 'group_stage', groupName: 'Grupo G', homeTeam: T.ENG,    awayTeam: T.CRO,     startTime: brt('2026-06-17T17:00:00-03:00'), venue: 'AT&T Stadium — Dallas, EUA' },
  { id: 'm023', matchNumber: 23, phase: 'group_stage', groupName: 'Grupo G', homeTeam: T.GHA,    awayTeam: T.PAN,     startTime: brt('2026-06-17T20:00:00-03:00'), venue: 'BMO Field — Toronto, CAN' },
  { id: 'm024', matchNumber: 24, phase: 'group_stage', groupName: 'Grupo G', homeTeam: T.UZB,    awayTeam: T.COL,     startTime: brt('2026-06-17T23:00:00-03:00'), venue: 'Estadio Azteca — Cidade do México, MEX' },

  // ══ 2ª RODADA ══════════════════════════════════════════════════════════════

  // 18/jun
  { id: 'm025', matchNumber: 25, phase: 'group_stage', groupName: 'Grupo A', homeTeam: T.GRP_A4, awayTeam: T.RSA,     startTime: brt('2026-06-18T13:00:00-03:00'), venue: 'Mercedes-Benz Stadium — Atlanta, EUA' },
  { id: 'm026', matchNumber: 26, phase: 'group_stage', groupName: 'Grupo B', homeTeam: T.SUI,    awayTeam: T.GRP_B2,  startTime: brt('2026-06-18T16:00:00-03:00'), venue: 'Rose Bowl — Los Angeles, EUA' },
  { id: 'm027', matchNumber: 27, phase: 'group_stage', groupName: 'Grupo B', homeTeam: T.CAN,    awayTeam: T.QAT,     startTime: brt('2026-06-18T19:00:00-03:00'), venue: 'BC Place — Vancouver, CAN' },
  { id: 'm028', matchNumber: 28, phase: 'group_stage', groupName: 'Grupo A', homeTeam: T.MEX,    awayTeam: T.KOR,     startTime: brt('2026-06-18T22:00:00-03:00'), venue: 'Estadio Akron — Guadalajara, MEX' },

  // 19/jun
  { id: 'm029', matchNumber: 29, phase: 'group_stage', groupName: 'Grupo C', homeTeam: T.GRP_C2, awayTeam: T.PAR,     startTime: brt('2026-06-19T01:00:00-03:00'), venue: 'Levi\'s Stadium — San Francisco, EUA' },
  { id: 'm030', matchNumber: 30, phase: 'group_stage', groupName: 'Grupo B', homeTeam: T.USA,    awayTeam: T.AUS,     startTime: brt('2026-06-19T16:00:00-03:00'), venue: 'Lumen Field — Seattle, EUA' },
  { id: 'm031', matchNumber: 31, phase: 'group_stage', groupName: 'Grupo C', homeTeam: T.SCO,    awayTeam: T.MAR,     startTime: brt('2026-06-19T19:00:00-03:00'), venue: 'Gillette Stadium — Boston, EUA' },
  { id: 'm032', matchNumber: 32, phase: 'group_stage', groupName: 'Grupo C', homeTeam: T.BRA,    awayTeam: T.HAI,     startTime: brt('2026-06-19T22:00:00-03:00'), venue: 'Lincoln Financial — Filadélfia, EUA' },

  // 20/jun
  { id: 'm033', matchNumber: 33, phase: 'group_stage', groupName: 'Grupo D', homeTeam: T.NED,    awayTeam: T.GRP_D4,  startTime: brt('2026-06-20T14:00:00-03:00'), venue: 'NRG Stadium — Houston, EUA' },
  { id: 'm034', matchNumber: 34, phase: 'group_stage', groupName: 'Grupo D', homeTeam: T.GER,    awayTeam: T.IVC,     startTime: brt('2026-06-20T17:00:00-03:00'), venue: 'BMO Field — Toronto, CAN' },
  { id: 'm035', matchNumber: 35, phase: 'group_stage', groupName: 'Grupo D', homeTeam: T.ECU,    awayTeam: T.CUW,     startTime: brt('2026-06-20T21:00:00-03:00'), venue: 'Arrowhead Stadium — Kansas City, EUA' },

  // 21/jun
  { id: 'm036', matchNumber: 36, phase: 'group_stage', groupName: 'Grupo D', homeTeam: T.TUN,    awayTeam: T.JPN,     startTime: brt('2026-06-21T01:00:00-03:00'), venue: 'Estadio BBVA — Monterrey, MEX' },
  { id: 'm037', matchNumber: 37, phase: 'group_stage', groupName: 'Grupo E', homeTeam: T.ESP,    awayTeam: T.SAU,     startTime: brt('2026-06-21T13:00:00-03:00'), venue: 'Mercedes-Benz Stadium — Atlanta, EUA' },
  { id: 'm038', matchNumber: 38, phase: 'group_stage', groupName: 'Grupo E', homeTeam: T.BEL,    awayTeam: T.IRI,     startTime: brt('2026-06-21T16:00:00-03:00'), venue: 'Rose Bowl — Los Angeles, EUA' },
  { id: 'm039', matchNumber: 39, phase: 'group_stage', groupName: 'Grupo E', homeTeam: T.URU,    awayTeam: T.CPV,     startTime: brt('2026-06-21T19:00:00-03:00'), venue: 'Hard Rock Stadium — Miami, EUA' },
  { id: 'm040', matchNumber: 40, phase: 'group_stage', groupName: 'Grupo E', homeTeam: T.NZL,    awayTeam: T.EGY,     startTime: brt('2026-06-21T22:00:00-03:00'), venue: 'BC Place — Vancouver, CAN' },

  // 22/jun
  { id: 'm041', matchNumber: 41, phase: 'group_stage', groupName: 'Grupo F', homeTeam: T.ARG,    awayTeam: T.AUT,     startTime: brt('2026-06-22T14:00:00-03:00'), venue: 'AT&T Stadium — Dallas, EUA' },
  { id: 'm042', matchNumber: 42, phase: 'group_stage', groupName: 'Grupo F', homeTeam: T.FRA,    awayTeam: T.GRP_F3,  startTime: brt('2026-06-22T18:00:00-03:00'), venue: 'Lincoln Financial — Filadélfia, EUA' },
  { id: 'm043', matchNumber: 43, phase: 'group_stage', groupName: 'Grupo F', homeTeam: T.NOR,    awayTeam: T.SEN,     startTime: brt('2026-06-22T21:00:00-03:00'), venue: 'MetLife Stadium — Nova York/NJ, EUA' },

  // 23/jun
  { id: 'm044', matchNumber: 44, phase: 'group_stage', groupName: 'Grupo F', homeTeam: T.JOR,    awayTeam: T.ALG,     startTime: brt('2026-06-23T00:00:00-03:00'), venue: 'Levi\'s Stadium — San Francisco, EUA' },
  { id: 'm045', matchNumber: 45, phase: 'group_stage', groupName: 'Grupo G', homeTeam: T.ENG,    awayTeam: T.GHA,     startTime: brt('2026-06-23T14:00:00-03:00'), venue: 'Gillette Stadium — Boston, EUA' },
  { id: 'm046', matchNumber: 46, phase: 'group_stage', groupName: 'Grupo G', homeTeam: T.POR,    awayTeam: T.UZB,     startTime: brt('2026-06-23T17:00:00-03:00'), venue: 'NRG Stadium — Houston, EUA' },
  { id: 'm047', matchNumber: 47, phase: 'group_stage', groupName: 'Grupo G', homeTeam: T.PAN,    awayTeam: T.CRO,     startTime: brt('2026-06-23T20:00:00-03:00'), venue: 'BMO Field — Toronto, CAN' },
  { id: 'm048', matchNumber: 48, phase: 'group_stage', groupName: 'Grupo G', homeTeam: T.COL,    awayTeam: T.GRP_G2,  startTime: brt('2026-06-23T23:00:00-03:00'), venue: 'Estadio Akron — Guadalajara, MEX' },

  // ══ 3ª RODADA ══════════════════════════════════════════════════════════════

  // 24/jun
  { id: 'm049', matchNumber: 49, phase: 'group_stage', groupName: 'Grupo B', homeTeam: T.SUI,    awayTeam: T.CAN,     startTime: brt('2026-06-24T16:00:00-03:00'), venue: 'BC Place — Vancouver, CAN' },
  { id: 'm050', matchNumber: 50, phase: 'group_stage', groupName: 'Grupo B', homeTeam: T.GRP_B2, awayTeam: T.QAT,     startTime: brt('2026-06-24T16:00:00-03:00'), venue: 'Lumen Field — Seattle, EUA' },
  { id: 'm051', matchNumber: 51, phase: 'group_stage', groupName: 'Grupo C', homeTeam: T.SCO,    awayTeam: T.BRA,     startTime: brt('2026-06-24T19:00:00-03:00'), venue: 'Hard Rock Stadium — Miami, EUA' },
  { id: 'm052', matchNumber: 52, phase: 'group_stage', groupName: 'Grupo C', homeTeam: T.MAR,    awayTeam: T.HAI,     startTime: brt('2026-06-24T19:00:00-03:00'), venue: 'Mercedes-Benz Stadium — Atlanta, EUA' },
  { id: 'm053', matchNumber: 53, phase: 'group_stage', groupName: 'Grupo A', homeTeam: T.GRP_A4, awayTeam: T.MEX,     startTime: brt('2026-06-24T22:00:00-03:00'), venue: 'Estadio Azteca — Cidade do México, MEX' },
  { id: 'm054', matchNumber: 54, phase: 'group_stage', groupName: 'Grupo A', homeTeam: T.RSA,    awayTeam: T.KOR,     startTime: brt('2026-06-24T22:00:00-03:00'), venue: 'Estadio BBVA — Monterrey, MEX' },

  // 25/jun
  { id: 'm055', matchNumber: 55, phase: 'group_stage', groupName: 'Grupo D', homeTeam: T.ECU,    awayTeam: T.GER,     startTime: brt('2026-06-25T17:00:00-03:00'), venue: 'MetLife Stadium — Nova York/NJ, EUA' },
  { id: 'm056', matchNumber: 56, phase: 'group_stage', groupName: 'Grupo D', homeTeam: T.CUW,    awayTeam: T.IVC,     startTime: brt('2026-06-25T17:00:00-03:00'), venue: 'Lincoln Financial — Filadélfia, EUA' },
  { id: 'm057', matchNumber: 57, phase: 'group_stage', groupName: 'Grupo D', homeTeam: T.JPN,    awayTeam: T.GRP_D4,  startTime: brt('2026-06-25T20:00:00-03:00'), venue: 'AT&T Stadium — Dallas, EUA' },
  { id: 'm058', matchNumber: 58, phase: 'group_stage', groupName: 'Grupo D', homeTeam: T.TUN,    awayTeam: T.NED,     startTime: brt('2026-06-25T20:00:00-03:00'), venue: 'Arrowhead Stadium — Kansas City, EUA' },
  { id: 'm059', matchNumber: 59, phase: 'group_stage', groupName: 'Grupo B', homeTeam: T.GRP_C2, awayTeam: T.USA,     startTime: brt('2026-06-25T23:00:00-03:00'), venue: 'Rose Bowl — Los Angeles, EUA' },
  { id: 'm060', matchNumber: 60, phase: 'group_stage', groupName: 'Grupo B', homeTeam: T.PAR,    awayTeam: T.AUS,     startTime: brt('2026-06-25T23:00:00-03:00'), venue: 'Levi\'s Stadium — San Francisco, EUA' },

  // 26/jun
  { id: 'm061', matchNumber: 61, phase: 'group_stage', groupName: 'Grupo F', homeTeam: T.NOR,    awayTeam: T.FRA,     startTime: brt('2026-06-26T16:00:00-03:00'), venue: 'Gillette Stadium — Boston, EUA' },
  { id: 'm062', matchNumber: 62, phase: 'group_stage', groupName: 'Grupo F', homeTeam: T.SEN,    awayTeam: T.GRP_F3,  startTime: brt('2026-06-26T16:00:00-03:00'), venue: 'BMO Field — Toronto, CAN' },
  { id: 'm063', matchNumber: 63, phase: 'group_stage', groupName: 'Grupo E', homeTeam: T.CPV,    awayTeam: T.SAU,     startTime: brt('2026-06-26T21:00:00-03:00'), venue: 'NRG Stadium — Houston, EUA' },
  { id: 'm064', matchNumber: 64, phase: 'group_stage', groupName: 'Grupo E', homeTeam: T.URU,    awayTeam: T.ESP,     startTime: brt('2026-06-26T21:00:00-03:00'), venue: 'Estadio Akron — Guadalajara, MEX' },

  // 27/jun
  { id: 'm065', matchNumber: 65, phase: 'group_stage', groupName: 'Grupo E', homeTeam: T.EGY,    awayTeam: T.IRI,     startTime: brt('2026-06-27T00:00:00-03:00'), venue: 'Lumen Field — Seattle, EUA' },
  { id: 'm066', matchNumber: 66, phase: 'group_stage', groupName: 'Grupo E', homeTeam: T.NZL,    awayTeam: T.BEL,     startTime: brt('2026-06-27T00:00:00-03:00'), venue: 'BC Place — Vancouver, CAN' },
  { id: 'm067', matchNumber: 67, phase: 'group_stage', groupName: 'Grupo G', homeTeam: T.PAN,    awayTeam: T.ENG,     startTime: brt('2026-06-27T18:00:00-03:00'), venue: 'MetLife Stadium — Nova York/NJ, EUA' },
  { id: 'm068', matchNumber: 68, phase: 'group_stage', groupName: 'Grupo G', homeTeam: T.CRO,    awayTeam: T.GHA,     startTime: brt('2026-06-27T18:00:00-03:00'), venue: 'Lincoln Financial — Filadélfia, EUA' },
  { id: 'm069', matchNumber: 69, phase: 'group_stage', groupName: 'Grupo G', homeTeam: T.COL,    awayTeam: T.POR,     startTime: brt('2026-06-27T20:30:00-03:00'), venue: 'Hard Rock Stadium — Miami, EUA' },
  { id: 'm070', matchNumber: 70, phase: 'group_stage', groupName: 'Grupo G', homeTeam: T.GRP_G2, awayTeam: T.UZB,     startTime: brt('2026-06-27T20:30:00-03:00'), venue: 'Mercedes-Benz Stadium — Atlanta, EUA' },
  { id: 'm071', matchNumber: 71, phase: 'group_stage', groupName: 'Grupo F', homeTeam: T.ALG,    awayTeam: T.AUT,     startTime: brt('2026-06-27T23:00:00-03:00'), venue: 'Arrowhead Stadium — Kansas City, EUA' },
  { id: 'm072', matchNumber: 72, phase: 'group_stage', groupName: 'Grupo F', homeTeam: T.JOR,    awayTeam: T.ARG,     startTime: brt('2026-06-27T23:00:00-03:00'), venue: 'AT&T Stadium — Dallas, EUA' },

  // ══ RODADA DE 32 (placeholders TBD) ══════════════════════════════════════

  { id: 'm073', matchNumber: 73, phase: 'round_of_32', homeTeam: T.TBD, awayTeam: T.TBD, startTime: brt('2026-06-29T18:00:00-03:00'), venue: 'A definir' },
  { id: 'm074', matchNumber: 74, phase: 'round_of_32', homeTeam: T.TBD, awayTeam: T.TBD, startTime: brt('2026-06-29T22:00:00-03:00'), venue: 'A definir' },
  { id: 'm075', matchNumber: 75, phase: 'round_of_32', homeTeam: T.TBD, awayTeam: T.TBD, startTime: brt('2026-06-30T18:00:00-03:00'), venue: 'A definir' },
  { id: 'm076', matchNumber: 76, phase: 'round_of_32', homeTeam: T.TBD, awayTeam: T.TBD, startTime: brt('2026-06-30T22:00:00-03:00'), venue: 'A definir' },
  { id: 'm077', matchNumber: 77, phase: 'round_of_32', homeTeam: T.TBD, awayTeam: T.TBD, startTime: brt('2026-07-01T18:00:00-03:00'), venue: 'A definir' },
  { id: 'm078', matchNumber: 78, phase: 'round_of_32', homeTeam: T.TBD, awayTeam: T.TBD, startTime: brt('2026-07-01T22:00:00-03:00'), venue: 'A definir' },
  { id: 'm079', matchNumber: 79, phase: 'round_of_32', homeTeam: T.TBD, awayTeam: T.TBD, startTime: brt('2026-07-02T18:00:00-03:00'), venue: 'A definir' },
  { id: 'm080', matchNumber: 80, phase: 'round_of_32', homeTeam: T.TBD, awayTeam: T.TBD, startTime: brt('2026-07-02T22:00:00-03:00'), venue: 'A definir' },
  { id: 'm081', matchNumber: 81, phase: 'round_of_32', homeTeam: T.TBD, awayTeam: T.TBD, startTime: brt('2026-07-03T18:00:00-03:00'), venue: 'A definir' },
  { id: 'm082', matchNumber: 82, phase: 'round_of_32', homeTeam: T.TBD, awayTeam: T.TBD, startTime: brt('2026-07-03T22:00:00-03:00'), venue: 'A definir' },
  { id: 'm083', matchNumber: 83, phase: 'round_of_32', homeTeam: T.TBD, awayTeam: T.TBD, startTime: brt('2026-07-04T18:00:00-03:00'), venue: 'A definir' },
  { id: 'm084', matchNumber: 84, phase: 'round_of_32', homeTeam: T.TBD, awayTeam: T.TBD, startTime: brt('2026-07-04T22:00:00-03:00'), venue: 'A definir' },
  { id: 'm085', matchNumber: 85, phase: 'round_of_32', homeTeam: T.TBD, awayTeam: T.TBD, startTime: brt('2026-07-05T18:00:00-03:00'), venue: 'A definir' },
  { id: 'm086', matchNumber: 86, phase: 'round_of_32', homeTeam: T.TBD, awayTeam: T.TBD, startTime: brt('2026-07-05T22:00:00-03:00'), venue: 'A definir' },
  { id: 'm087', matchNumber: 87, phase: 'round_of_32', homeTeam: T.TBD, awayTeam: T.TBD, startTime: brt('2026-07-06T18:00:00-03:00'), venue: 'A definir' },
  { id: 'm088', matchNumber: 88, phase: 'round_of_32', homeTeam: T.TBD, awayTeam: T.TBD, startTime: brt('2026-07-06T22:00:00-03:00'), venue: 'A definir' },

  // ══ OITAVAS ════════════════════════════════════════════════════════════════
  { id: 'm089', matchNumber: 89, phase: 'round_of_16', homeTeam: T.TBD, awayTeam: T.TBD, startTime: brt('2026-07-09T18:00:00-03:00'), venue: 'A definir' },
  { id: 'm090', matchNumber: 90, phase: 'round_of_16', homeTeam: T.TBD, awayTeam: T.TBD, startTime: brt('2026-07-09T22:00:00-03:00'), venue: 'A definir' },
  { id: 'm091', matchNumber: 91, phase: 'round_of_16', homeTeam: T.TBD, awayTeam: T.TBD, startTime: brt('2026-07-10T18:00:00-03:00'), venue: 'A definir' },
  { id: 'm092', matchNumber: 92, phase: 'round_of_16', homeTeam: T.TBD, awayTeam: T.TBD, startTime: brt('2026-07-10T22:00:00-03:00'), venue: 'A definir' },
  { id: 'm093', matchNumber: 93, phase: 'round_of_16', homeTeam: T.TBD, awayTeam: T.TBD, startTime: brt('2026-07-11T18:00:00-03:00'), venue: 'A definir' },
  { id: 'm094', matchNumber: 94, phase: 'round_of_16', homeTeam: T.TBD, awayTeam: T.TBD, startTime: brt('2026-07-11T22:00:00-03:00'), venue: 'A definir' },
  { id: 'm095', matchNumber: 95, phase: 'round_of_16', homeTeam: T.TBD, awayTeam: T.TBD, startTime: brt('2026-07-12T18:00:00-03:00'), venue: 'A definir' },
  { id: 'm096', matchNumber: 96, phase: 'round_of_16', homeTeam: T.TBD, awayTeam: T.TBD, startTime: brt('2026-07-12T22:00:00-03:00'), venue: 'A definir' },

  // ══ QUARTAS ════════════════════════════════════════════════════════════════
  { id: 'm097', matchNumber: 97,  phase: 'quarterfinals', homeTeam: T.TBD, awayTeam: T.TBD, startTime: brt('2026-07-14T18:00:00-03:00'), venue: 'A definir' },
  { id: 'm098', matchNumber: 98,  phase: 'quarterfinals', homeTeam: T.TBD, awayTeam: T.TBD, startTime: brt('2026-07-14T22:00:00-03:00'), venue: 'A definir' },
  { id: 'm099', matchNumber: 99,  phase: 'quarterfinals', homeTeam: T.TBD, awayTeam: T.TBD, startTime: brt('2026-07-15T18:00:00-03:00'), venue: 'A definir' },
  { id: 'm100', matchNumber: 100, phase: 'quarterfinals', homeTeam: T.TBD, awayTeam: T.TBD, startTime: brt('2026-07-15T22:00:00-03:00'), venue: 'A definir' },

  // ══ SEMIFINAIS ═════════════════════════════════════════════════════════════
  { id: 'm101', matchNumber: 101, phase: 'semifinals', homeTeam: T.TBD, awayTeam: T.TBD, startTime: brt('2026-07-17T22:00:00-03:00'), venue: 'MetLife Stadium — Nova York/NJ, EUA' },
  { id: 'm102', matchNumber: 102, phase: 'semifinals', homeTeam: T.TBD, awayTeam: T.TBD, startTime: brt('2026-07-18T22:00:00-03:00'), venue: 'Rose Bowl — Los Angeles, EUA' },

  // ══ 3º LUGAR ═══════════════════════════════════════════════════════════════
  { id: 'm103', matchNumber: 103, phase: 'third_place', homeTeam: T.TBD, awayTeam: T.TBD, startTime: brt('2026-07-18T16:00:00-03:00'), venue: 'Hard Rock Stadium — Miami, EUA' },

  // ══ FINAL ══════════════════════════════════════════════════════════════════
  { id: 'm104', matchNumber: 104, phase: 'final', homeTeam: T.TBD, awayTeam: T.TBD, startTime: brt('2026-07-19T16:00:00-03:00'), venue: 'MetLife Stadium — Nova York/NJ, EUA' },
];

export const getMatchesGroupedByPhase = () =>
  WC2026_MATCHES.reduce((acc, match) => {
    if (!acc[match.phase]) acc[match.phase] = [];
    acc[match.phase].push(match);
    return acc;
  }, {} as Record<string, typeof WC2026_MATCHES>);
