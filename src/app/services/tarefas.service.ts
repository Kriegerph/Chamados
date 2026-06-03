import { Injectable, NgZone } from "@angular/core";
import {
  addDoc,
  collection,
  CollectionReference,
  deleteDoc,
  doc,
  DocumentData,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  updateDoc
} from "firebase/firestore";
import { BehaviorSubject, map } from "rxjs";
import { DataState } from "../models/data-state.model";
import { Tarefa, TarefaPrioridade, TarefaStatus } from "../models/tarefa.model";
import { AuthService, AuthState } from "./auth.service";
import { FirebaseService } from "./firebase.service";

export type TarefaPayload = {
  titulo: string;
  descricao: string;
  empresaId: string;
  nomeEmpresa: string;
  clienteId: string;
  nomeCliente: string;
  sistemaId: string;
  nomeSistema: string;
  status: TarefaStatus;
  prioridade: TarefaPrioridade;
  prazo: string;
};

@Injectable({
  providedIn: "root"
})
export class TarefasService {
  private readonly tarefasStateSubject = new BehaviorSubject<DataState<Tarefa[]>>({
    status: "loading",
    data: [],
    error: null
  });
  readonly tarefasState$ = this.tarefasStateSubject.asObservable();
  readonly tarefas$ = this.tarefasState$.pipe(map((state) => state.data));
  private unsubscribeTarefas?: () => void;
  private currentUid: string | null = null;

  constructor(
    private readonly firebase: FirebaseService,
    private readonly auth: AuthService,
    private readonly zone: NgZone
  ) {
    this.auth.authViewState$.subscribe({
      next: (authState) => this.handleAuthChange(authState),
      error: (err) => {
        console.error("Erro no authState", err);
        this.stopListener();
        this.emitState({
          status: "error",
          data: [],
          error: this.toErrorMessage(err)
        });
      }
    });
  }

  async createTarefa(data: TarefaPayload): Promise<string> {
    const uid = this.getUidOrThrow();
    const payload: Omit<Tarefa, "id"> = {
      titulo: data.titulo.trim(),
      descricao: data.descricao.trim(),
      empresaId: data.empresaId.trim(),
      nomeEmpresa: data.nomeEmpresa.trim(),
      clienteId: data.clienteId.trim(),
      nomeCliente: data.nomeCliente.trim(),
      sistemaId: data.sistemaId.trim(),
      nomeSistema: data.nomeSistema.trim(),
      status: data.status,
      prioridade: data.prioridade,
      prazo: data.prazo.trim(),
      dataCriacao: serverTimestamp() as any,
      dataAtualizacao: serverTimestamp() as any
    };

    const ref = await addDoc(this.getTarefasCol(uid), payload);
    const now = Timestamp.now();
    this.applyLocalUpsert({
      id: ref.id,
      ...payload,
      dataCriacao: now,
      dataAtualizacao: now
    });
    return ref.id;
  }

  async updateTarefa(id: string, data: TarefaPayload) {
    const uid = this.getUidOrThrow();
    const ref = doc(this.firebase.db, "users", uid, "tarefas", id);
    const patch = {
      titulo: data.titulo.trim(),
      descricao: data.descricao.trim(),
      empresaId: data.empresaId.trim(),
      nomeEmpresa: data.nomeEmpresa.trim(),
      clienteId: data.clienteId.trim(),
      nomeCliente: data.nomeCliente.trim(),
      sistemaId: data.sistemaId.trim(),
      nomeSistema: data.nomeSistema.trim(),
      status: data.status,
      prioridade: data.prioridade,
      prazo: data.prazo.trim(),
      dataAtualizacao: serverTimestamp()
    };

    await updateDoc(ref, patch as any);
    this.applyLocalPatch(id, {
      ...patch,
      dataAtualizacao: Timestamp.now()
    });
  }

  async deleteTarefa(id: string) {
    const uid = this.getUidOrThrow();
    const ref = doc(this.firebase.db, "users", uid, "tarefas", id);
    await deleteDoc(ref);
    this.applyLocalRemove(id);
  }

  private getTarefasCol(uid: string): CollectionReference<DocumentData> {
    return collection(this.firebase.db, "users", uid, "tarefas");
  }

  private getUidOrThrow(): string {
    const uid = this.auth.getUid();
    if (!uid) {
      throw new Error("Faça login.");
    }
    return uid;
  }

  private handleAuthChange(authState: AuthState) {
    if (authState.status === "loading") {
      this.emitState({
        status: "loading",
        data: this.tarefasStateSubject.value.data,
        error: null
      });
      return;
    }

    if (authState.status === "error") {
      this.stopListener();
      this.emitState({
        status: "error",
        data: [],
        error: authState.error || "Falha ao resolver autenticação."
      });
      return;
    }

    const uid = authState.user?.uid ?? null;
    if (!uid) {
      this.stopListener();
      this.emitState({
        status: "ready",
        data: [],
        error: null
      });
      return;
    }

    if (uid === this.currentUid) return;

    this.stopListener();
    this.currentUid = uid;
    this.emitState({
      status: "loading",
      data: [],
      error: null
    });
    this.startListener(uid);
  }

  private startListener(uid: string) {
    this.unsubscribeTarefas = onSnapshot(
      this.getTarefasCol(uid),
      (snapshot) => {
        const items = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...this.normalizeTarefa(docSnap.data() as Tarefa)
        }));
        this.emitState({
          status: "ready",
          data: items,
          error: null
        });
      },
      (error) => {
        console.error("Erro ao escutar tarefas", error);
        this.emitState({
          status: "error",
          data: [],
          error: this.toErrorMessage(error)
        });
      }
    );
  }

  private stopListener() {
    if (this.unsubscribeTarefas) {
      this.unsubscribeTarefas();
      this.unsubscribeTarefas = undefined;
    }
    this.currentUid = null;
  }

  private emitState(state: DataState<Tarefa[]>) {
    this.zone.run(() => this.tarefasStateSubject.next(state));
  }

  private applyLocalUpsert(tarefa: Tarefa) {
    const current = this.tarefasStateSubject.value;
    const filtered = current.data.filter((item) => item.id !== tarefa.id);
    this.emitState({
      ...current,
      data: [...filtered, tarefa]
    });
  }

  private applyLocalPatch(id: string, patch: Partial<Tarefa>) {
    const current = this.tarefasStateSubject.value;
    this.emitState({
      ...current,
      data: current.data.map((item) =>
        item.id === id
          ? {
              ...item,
              ...patch
            }
          : item
      )
    });
  }

  private applyLocalRemove(id: string) {
    const current = this.tarefasStateSubject.value;
    this.emitState({
      ...current,
      data: current.data.filter((item) => item.id !== id)
    });
  }

  private normalizeTarefa(tarefa: Tarefa): Tarefa {
    const dataCriacao = this.getTimestamp(tarefa.dataCriacao);
    const dataAtualizacao = this.getTimestamp(tarefa.dataAtualizacao) ?? dataCriacao;

    return {
      ...tarefa,
      titulo: tarefa.titulo || "",
      descricao: tarefa.descricao || "",
      empresaId: tarefa.empresaId || "",
      nomeEmpresa: tarefa.nomeEmpresa || "",
      clienteId: tarefa.clienteId || "",
      nomeCliente: tarefa.nomeCliente || "",
      sistemaId: tarefa.sistemaId || "",
      nomeSistema: tarefa.nomeSistema || "",
      status: this.normalizeStatus(tarefa.status),
      prioridade: this.normalizePrioridade(tarefa.prioridade),
      prazo: tarefa.prazo || "",
      dataCriacao,
      dataAtualizacao
    };
  }

  private normalizeStatus(status: unknown): TarefaStatus {
    return status === "andamento" || status === "concluida" || status === "pendente"
      ? status
      : "pendente";
  }

  private normalizePrioridade(prioridade: unknown): TarefaPrioridade {
    return prioridade === "baixa" || prioridade === "alta" || prioridade === "media"
      ? prioridade
      : "media";
  }

  private getTimestamp(value: unknown): Timestamp | null {
    if (value instanceof Timestamp) {
      return value;
    }
    if (
      value &&
      typeof value === "object" &&
      typeof (value as Timestamp).toDate === "function" &&
      typeof (value as Timestamp).toMillis === "function"
    ) {
      return value as Timestamp;
    }
    return null;
  }

  private toErrorMessage(error: unknown): string {
    if (error instanceof Error && error.message) {
      return error.message;
    }
    return "Erro ao carregar tarefas.";
  }
}
