import { Timestamp } from "firebase/firestore";

export interface CalendarioItem {
  id?: string;
  data: string;
  titulo: string;
  descricao: string;
  pessoaId?: string | null;
  criadoEm?: Timestamp | null;
  atualizadoEm?: Timestamp | null;
}

export interface CalendarioPessoa {
  id?: string;
  nome: string;
  cor: string;
  criadoEm?: Timestamp | null;
  atualizadoEm?: Timestamp | null;
}
