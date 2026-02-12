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
import { BehaviorSubject } from "rxjs";
import { AuthService } from "./auth.service";
import { FirebaseService } from "./firebase.service";
import { Cliente } from "../models/cliente.model";

@Injectable({
  providedIn: "root"
})
export class ClientesService {
  private readonly clientesSubject = new BehaviorSubject<Cliente[]>([]);
  readonly clientes$ = this.clientesSubject.asObservable();
  private unsubscribeClientes?: () => void;
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

  private handleAuthChange(user: { uid: string } | null) {
    const uid = user?.uid ?? null;
    if (uid === this.currentUid) return;
    this.stopListener();
    if (!uid) {
      this.zone.run(() => this.clientesSubject.next([]));
      return;
    }
    this.currentUid = uid;
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
        this.zone.run(() => this.clientesSubject.next(items));
      },
      (error) => {
        console.error("Erro ao escutar clientes", error);
        this.zone.run(() => this.clientesSubject.next([]));
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
}
