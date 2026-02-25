import { Timestamp } from "firebase/firestore";

export type StatusChamado = "aberto" | "concluido";
export type TipoCadastro = "novo" | "antigo";

export interface Chamado {
  id?: string;
  motivo: string;
  cliente?: string;
  clienteId?: string;
  clienteNome?: string;
  data: string;
  status: StatusChamado;
  resolucao: string;
  criadoEm?: Timestamp | null;
  concluidoEm?: Timestamp | null;
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
