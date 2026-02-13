import { Injectable, NgZone } from "@angular/core";
import {
  addDoc,
  collection,
  CollectionReference,
  DocumentData,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc
} from "firebase/firestore";
import { BehaviorSubject, map } from "rxjs";
import { DataState } from "../models/data-state.model";
import { AuthService, AuthState } from "./auth.service";
import { FirebaseService } from "./firebase.service";
import { Chamado } from "../models/chamado.model";

@Injectable({
  providedIn: "root"
})
export class ChamadosService {
  private readonly todosStateSubject = new BehaviorSubject<DataState<Chamado[]>>({
    status: "loading",
    data: [],
    error: null
  });
  readonly todosState$ = this.todosStateSubject.asObservable();
  readonly todos$ = this.todosState$.pipe(map((state) => state.data));
  private unsubscribeTodos?: () => void;
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

  private getChamadosCol(uid: string): CollectionReference<DocumentData> {
    return collection(this.firebase.db, "users", uid, "chamados");
  }

  private getUidOrThrow(): string {
    const uid = this.auth.getUid();
    if (!uid) {
      throw new Error("Faça login.");
    }
    return uid;
  }

  async addChamadoNovo(data: {
    motivo: string;
    clienteId: string;
    clienteNome: string;
    data: string;
  }) {
    const uid = this.getUidOrThrow();
    const payload: Omit<Chamado, "id"> = {
      motivo: data.motivo,
      cliente: data.clienteNome,
      clienteId: data.clienteId,
      clienteNome: data.clienteNome,
      data: data.data,
      status: "aberto",
      resolucao: "",
      criadoEm: serverTimestamp() as any,
      concluidoEm: null,
      tipoCadastro: "novo"
    };
    await addDoc(this.getChamadosCol(uid), payload);
  }

  async addChamadoAntigo(data: {
    motivo: string;
    clienteId: string;
    clienteNome: string;
    data: string;
    resolucao: string;
  }) {
    const uid = this.getUidOrThrow();
    const payload: Omit<Chamado, "id"> = {
      motivo: data.motivo,
      cliente: data.clienteNome,
      clienteId: data.clienteId,
      clienteNome: data.clienteNome,
      data: data.data,
      status: "concluido",
      resolucao: data.resolucao,
      criadoEm: serverTimestamp() as any,
      concluidoEm: serverTimestamp() as any,
      tipoCadastro: "antigo"
    };
    await addDoc(this.getChamadosCol(uid), payload);
  }

  async finalizarChamado(id: string, resolucao: string) {
    const uid = this.getUidOrThrow();
    const ref = doc(this.firebase.db, "users", uid, "chamados", id);
    await updateDoc(ref, {
      status: "concluido",
      resolucao,
      concluidoEm: serverTimestamp()
    });
  }

  async updateChamado(id: string, data: Partial<Chamado>) {
    const uid = this.getUidOrThrow();
    const ref = doc(this.firebase.db, "users", uid, "chamados", id);
    await updateDoc(ref, data as any);
  }

  async deleteChamado(id: string) {
    const uid = this.getUidOrThrow();
    const ref = doc(this.firebase.db, "users", uid, "chamados", id);
    await deleteDoc(ref);
  }

  private handleAuthChange(authState: AuthState) {
    if (authState.status === "loading") {
      this.emitState({
        status: "loading",
        data: this.todosStateSubject.value.data,
        error: null
      });
      return;
    }

    if (authState.status === "error") {
      this.stopListener();
      this.emitState({
        status: "error",
        data: [],
        error: authState.error || "Falha ao resolver autenticacao."
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
    this.unsubscribeTodos = onSnapshot(
      this.getChamadosCol(uid),
      (snapshot) => {
        const items = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Chamado)
        }));
        this.emitState({
          status: "ready",
          data: items,
          error: null
        });
        console.debug(`[Chamados] listener recebeu ${items.length} itens`);
      },
      (error) => {
        console.error("Erro ao escutar chamados", error);
        this.emitState({
          status: "error",
          data: [],
          error: this.toErrorMessage(error)
        });
      }
    );
  }

  private stopListener() {
    if (this.unsubscribeTodos) {
      this.unsubscribeTodos();
      this.unsubscribeTodos = undefined;
    }
    this.currentUid = null;
  }

  private emitState(state: DataState<Chamado[]>) {
    this.zone.run(() => this.todosStateSubject.next(state));
  }

  private toErrorMessage(error: unknown): string {
    if (error instanceof Error && error.message) {
      return error.message;
    }
    return "Erro ao carregar chamados.";
  }
}
