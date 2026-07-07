import { Timestamp } from "firebase/firestore";

export interface CalendarioItem {
  id?: string;
  data: string;
  titulo: string;
  descricao: string;
  criadoEm?: Timestamp | null;
  atualizadoEm?: Timestamp | null;
}
