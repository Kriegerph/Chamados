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
import { Cliente } from "../models/cliente.model";

@Injectable({
  providedIn: "root"
})
export class ClientesService {
  private readonly clientesStateSubject = new BehaviorSubject<DataState<Cliente[]>>({
    status: "loading",
    data: [],
    error: null
  });
  readonly clientesState$ = this.clientesStateSubject.asObservable();
  readonly clientes$ = this.clientesState$.pipe(map((state) => state.data));
  private unsubscribeClientes?: () => void;
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

  private getClientesCol(uid: string): CollectionReference<DocumentData> {
    return collection(this.firebase.db, "users", uid, "clientes");
  }

  private getUidOrThrow(): string {
    const uid = this.auth.getUid();
    if (!uid) {
      throw new Error("Faça login.");
    }
    return uid;
  }

  async addCliente(data: {
    nome: string;
    observacao?: string;
    telefone?: string;
    email?: string;
  }) {
    const uid = this.getUidOrThrow();
    const payload: Omit<Cliente, "id"> = {
      nome: data.nome.trim(),
      observacao: data.observacao?.trim() || "",
      telefone: data.telefone?.trim() || "",
      email: data.email?.trim() || "",
      ativo: true,
      criadoEm: serverTimestamp() as any,
      atualizadoEm: serverTimestamp() as any
    };
    await addDoc(this.getClientesCol(uid), payload);
  }

  async updateCliente(id: string, data: Partial<Cliente>) {
    const uid = this.getUidOrThrow();
    const ref = doc(this.firebase.db, "users", uid, "clientes", id);
    await updateDoc(ref, {
      ...data,
      atualizadoEm: serverTimestamp()
    } as any);
  }

  async deleteCliente(id: string) {
    const uid = this.getUidOrThrow();
    const ref = doc(this.firebase.db, "users", uid, "clientes", id);
    await deleteDoc(ref);
  }

  getClientesSnapshot(): Cliente[] {
    return this.clientesStateSubject.value.data;
  }

  private handleAuthChange(authState: AuthState) {
    if (authState.status === "loading") {
      this.emitState({
        status: "loading",
        data: this.clientesStateSubject.value.data,
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
    this.unsubscribeClientes = onSnapshot(
      this.getClientesCol(uid),
      (snapshot) => {
        const items = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Cliente)
        }));
        this.emitState({
          status: "ready",
          data: items,
          error: null
        });
      },
      (error) => {
        console.error("Erro ao escutar clientes", error);
        this.emitState({
          status: "error",
          data: [],
          error: this.toErrorMessage(error)
        });
      }
    );
  }

  private stopListener() {
    if (this.unsubscribeClientes) {
      this.unsubscribeClientes();
      this.unsubscribeClientes = undefined;
    }
    this.currentUid = null;
  }

  private emitState(state: DataState<Cliente[]>) {
    this.zone.run(() => this.clientesStateSubject.next(state));
  }

  private toErrorMessage(error: unknown): string {
    if (error instanceof Error && error.message) {
      return error.message;
    }
    return "Erro ao carregar clientes.";
  }
}
