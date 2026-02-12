import { Timestamp } from "firebase/firestore";

export interface Cliente {
  id?: string;
  nome: string;
  observacao?: string;
  telefone?: string;
  email?: string;
  ativo?: boolean;
  criadoEm?: Timestamp | null;
  atualizadoEm?: Timestamp | null;
}
