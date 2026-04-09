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
import { Anotacao } from "../models/anotacao.model";
import { DataState } from "../models/data-state.model";
import { AuthService, AuthState } from "./auth.service";
import { FirebaseService } from "./firebase.service";

@Injectable({
  providedIn: "root"
})
export class AnotacoesService {
  private readonly anotacoesStateSubject = new BehaviorSubject<DataState<Anotacao[]>>({
    status: "loading",
    data: [],
    error: null
  });
  readonly anotacoesState$ = this.anotacoesStateSubject.asObservable();
  readonly anotacoes$ = this.anotacoesState$.pipe(map((state) => state.data));
  private unsubscribeAnotacoes?: () => void;
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

  async createAnotacao(data: { titulo: string; conteudo: string }): Promise<string> {
    const uid = this.getUidOrThrow();
    const payload: Omit<Anotacao, "id"> = {
      titulo: data.titulo.trim(),
      conteudo: data.conteudo,
      dataCriacao: serverTimestamp() as any,
      dataAtualizacao: serverTimestamp() as any
    };
    const ref = await addDoc(this.getAnotacoesCol(uid), payload);
    const now = Timestamp.now();
    this.applyLocalUpsert({
      id: ref.id,
      ...payload,
      dataCriacao: now,
      dataAtualizacao: now
    });
    return ref.id;
  }

  async updateAnotacao(id: string, data: { titulo: string; conteudo: string }) {
    const uid = this.getUidOrThrow();
    const ref = doc(this.firebase.db, "users", uid, "anotacoes", id);
    const patch = {
      titulo: data.titulo.trim(),
      conteudo: data.conteudo,
      dataAtualizacao: serverTimestamp()
    };

    await updateDoc(ref, patch as any);
    this.applyLocalPatch(id, {
      titulo: data.titulo.trim(),
      conteudo: data.conteudo,
      dataAtualizacao: Timestamp.now()
    });
  }

  async deleteAnotacao(id: string) {
    const uid = this.getUidOrThrow();
    const ref = doc(this.firebase.db, "users", uid, "anotacoes", id);
    await deleteDoc(ref);
    this.applyLocalRemove(id);
  }

  getAnotacoesSnapshot(): Anotacao[] {
    return this.anotacoesStateSubject.value.data;
  }

  private getAnotacoesCol(uid: string): CollectionReference<DocumentData> {
    return collection(this.firebase.db, "users", uid, "anotacoes");
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
        data: this.anotacoesStateSubject.value.data,
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
    this.unsubscribeAnotacoes = onSnapshot(
      this.getAnotacoesCol(uid),
      (snapshot) => {
        const items = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...this.normalizeAnotacao(docSnap.data() as Anotacao)
        }));
        this.emitState({
          status: "ready",
          data: items,
          error: null
        });
      },
      (error) => {
        console.error("Erro ao escutar anotações", error);
        this.emitState({
          status: "error",
          data: [],
          error: this.toErrorMessage(error)
        });
      }
    );
  }

  private stopListener() {
    if (this.unsubscribeAnotacoes) {
      this.unsubscribeAnotacoes();
      this.unsubscribeAnotacoes = undefined;
    }
    this.currentUid = null;
  }

  private emitState(state: DataState<Anotacao[]>) {
    this.zone.run(() => this.anotacoesStateSubject.next(state));
  }

  private applyLocalUpsert(anotacao: Anotacao) {
    const current = this.anotacoesStateSubject.value;
    const filtered = current.data.filter((item) => item.id !== anotacao.id);
    this.emitState({
      ...current,
      data: [...filtered, anotacao]
    });
  }

  private applyLocalPatch(id: string, patch: Partial<Anotacao>) {
    const current = this.anotacoesStateSubject.value;
    const data = current.data.map((item) =>
      item.id === id
        ? {
            ...item,
            ...patch
          }
        : item
    );
    this.emitState({
      ...current,
      data
    });
  }

  private applyLocalRemove(id: string) {
    const current = this.anotacoesStateSubject.value;
    this.emitState({
      ...current,
      data: current.data.filter((item) => item.id !== id)
    });
  }

  private normalizeAnotacao(anotacao: Anotacao): Anotacao {
    const dataCriacao = this.getTimestamp(anotacao.dataCriacao);
    const dataAtualizacao = this.getTimestamp(anotacao.dataAtualizacao) ?? dataCriacao;

    return {
      ...anotacao,
      titulo: anotacao.titulo || "",
      conteudo: anotacao.conteudo || "",
      dataCriacao,
      dataAtualizacao
    };
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
    return "Erro ao carregar anotações.";
  }
}
