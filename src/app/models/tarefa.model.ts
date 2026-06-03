import { Timestamp } from "firebase/firestore";

export type TarefaStatus = "pendente" | "andamento" | "concluida";
export type TarefaPrioridade = "baixa" | "media" | "alta";

export interface Tarefa {
  id?: string;
  titulo: string;
  descricao: string;
  empresaId?: string;
  nomeEmpresa?: string;
  clienteId?: string;
  nomeCliente?: string;
  sistemaId?: string;
  nomeSistema?: string;
  status: TarefaStatus;
  prioridade: TarefaPrioridade;
  prazo?: string;
  dataCriacao?: Timestamp | null;
  dataAtualizacao?: Timestamp | null;
}
