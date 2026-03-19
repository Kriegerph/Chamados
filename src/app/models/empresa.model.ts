import { Timestamp } from "firebase/firestore";

export interface Empresa {
  id?: string;
  nomeEmpresa: string;
  observacoes?: string;
  totalFuncionarios?: number;
  dataCadastro?: Timestamp | null;
  atualizadoEm?: Timestamp | null;
}

export interface Funcionario {
  id?: string;
  nomeFuncionario: string;
  telefone?: string;
  criarChamadoAutomatico?: boolean;
  ativo: boolean;
  dataCadastro?: Timestamp | null;
  atualizadoEm?: Timestamp | null;
}
