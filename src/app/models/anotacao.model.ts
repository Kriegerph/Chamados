import { Timestamp } from "firebase/firestore";

export interface Anotacao {
  id?: string;
  titulo: string;
  conteudo: string;
  dataCriacao?: Timestamp | null;
  dataAtualizacao?: Timestamp | null;
}
