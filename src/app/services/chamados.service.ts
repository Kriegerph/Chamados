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
import { BehaviorSubject, Observable } from "rxjs";
import { AuthService } from "./auth.service";
import { FirebaseService } from "./firebase.service";
import { Chamado } from "../models/chamado.model";

@Injectable({
  providedIn: "root"
})
export class ChamadosService {
  private readonly todosSubject = new BehaviorSubject<Chamado[]>([]);
  readonly todos$ = this.todosSubject.asObservable();
  private unsubscribeTodos?: () => void;
  private currentUid: string | null = null;

  constructor(
    private readonly firebase: FirebaseService,
    private readonly auth: AuthService,
    private readonly zone: NgZone
  ) {
    this.auth.authState$.subscribe({
      next: (user) => this.handleAuthChange(user),
      error: (err) => {
        console.error("Erro no authState", err);
        this.stopListener();
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

  listenTodos(): Observable<Chamado[]> {
    return this.todos$;
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

  private handleAuthChange(user: { uid: string } | null) {
    const uid = user?.uid ?? null;
    if (uid === this.currentUid) return;
    this.stopListener();
    if (!uid) {
      this.zone.run(() => this.todosSubject.next([]));
      return;
    }
    this.currentUid = uid;
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
        this.zone.run(() => this.todosSubject.next(items));
      },
      (error) => {
        console.error("Erro ao escutar chamados", error);
        this.zone.run(() => this.todosSubject.next([]));
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
}
