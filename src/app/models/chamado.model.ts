import { Timestamp } from "firebase/firestore";

export type StatusChamado = "aberto" | "concluido";
export type TipoCadastro = "novo" | "antigo";
export type OrigemChamado = "manual" | "whatsapp";

export interface Chamado {
  id?: string;
  motivo: string;
  cliente?: string;
  clienteId?: string;
  clienteNome?: string;
  empresa?: string;
  empresaId?: string;
  funcionario?: string;
  funcionarioId?: string;
  telefoneOrigem?: string;
  contextoSistemaId?: string;
  sistemasRelacionados?: string[];
  data: string;
  status: StatusChamado;
  resolucao: string;
  origem?: OrigemChamado;
  criadoEm?: Timestamp | null;
  concluidoEm?: Timestamp | null;
  dataFechamento?: Timestamp | null;
  dataInicioAtendimento?: Timestamp | null;
  dataFimAtendimento?: Timestamp | null;
  tempoAtendimento?: number | null;
  tempoAtendimentoMinutos?: number | null;
  tipoCadastro: TipoCadastro;
}

export interface DashboardStats {
  totalGeral: number;
  totalAno: number;
  totalMes: number;
  totalDia: number;
  abertosHoje: number;
  concluidosHoje: number;
  abertosAtuais: number;
  concluidosAtuais: number;
  totaisPorMes: number[];
}
