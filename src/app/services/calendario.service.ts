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
import { CalendarioItem, CalendarioPessoa } from "../models/calendario.model";
import { DataState } from "../models/data-state.model";
import { AuthService, AuthState } from "./auth.service";
import { FirebaseService } from "./firebase.service";

export type CalendarioPayload = {
  data: string;
  titulo: string;
  descricao: string;
  pessoaId?: string | null;
};

export type CalendarioPessoaPayload = {
  nome: string;
  cor: string;
};

@Injectable({
  providedIn: "root"
})
export class CalendarioService {
  private readonly calendarioStateSubject = new BehaviorSubject<DataState<CalendarioItem[]>>({
    status: "loading",
    data: [],
    error: null
  });
  readonly calendarioState$ = this.calendarioStateSubject.asObservable();
  readonly calendario$ = this.calendarioState$.pipe(map((state) => state.data));
  private readonly pessoasStateSubject = new BehaviorSubject<DataState<CalendarioPessoa[]>>({
    status: "loading",
    data: [],
    error: null
  });
  readonly pessoasState$ = this.pessoasStateSubject.asObservable();
  readonly pessoas$ = this.pessoasState$.pipe(map((state) => state.data));
  private unsubscribeCalendario?: () => void;
  private unsubscribePessoas?: () => void;
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

  async createItem(data: CalendarioPayload): Promise<string> {
    const uid = this.getUidOrThrow();
    const payload: Omit<CalendarioItem, "id"> = {
      data: data.data,
      titulo: data.titulo.trim(),
      descricao: data.descricao.trim(),
      pessoaId: this.getPessoaId(data.pessoaId),
      criadoEm: serverTimestamp() as any,
      atualizadoEm: serverTimestamp() as any
    };

    const ref = await addDoc(this.getCalendarioCol(uid), payload);
    const now = Timestamp.now();
    this.applyLocalUpsert({
      id: ref.id,
      ...payload,
      criadoEm: now,
      atualizadoEm: now
    });
    return ref.id;
  }

  async updateItem(id: string, data: CalendarioPayload) {
    const uid = this.getUidOrThrow();
    const ref = doc(this.firebase.db, "users", uid, "calendario", id);
    const patch = {
      data: data.data,
      titulo: data.titulo.trim(),
      descricao: data.descricao.trim(),
      pessoaId: this.getPessoaId(data.pessoaId),
      atualizadoEm: serverTimestamp()
    };

    await updateDoc(ref, patch as any);
    this.applyLocalPatch(id, {
      ...patch,
      atualizadoEm: Timestamp.now()
    });
  }

  async deleteItem(id: string) {
    const uid = this.getUidOrThrow();
    const ref = doc(this.firebase.db, "users", uid, "calendario", id);
    await deleteDoc(ref);
    this.applyLocalRemove(id);
  }

  async createPessoa(data: CalendarioPessoaPayload): Promise<string> {
    const uid = this.getUidOrThrow();
    const payload: Omit<CalendarioPessoa, "id"> = {
      nome: data.nome.trim(),
      cor: this.normalizeColor(data.cor),
      criadoEm: serverTimestamp() as any,
      atualizadoEm: serverTimestamp() as any
    };

    const ref = await addDoc(this.getPessoasCol(uid), payload);
    const now = Timestamp.now();
    this.applyLocalPessoaUpsert({
      id: ref.id,
      ...payload,
      criadoEm: now,
      atualizadoEm: now
    });
    return ref.id;
  }

  async updatePessoa(id: string, data: CalendarioPessoaPayload) {
    const uid = this.getUidOrThrow();
    const ref = doc(this.firebase.db, "users", uid, "calendarioPessoas", id);
    const patch = {
      nome: data.nome.trim(),
      cor: this.normalizeColor(data.cor),
      atualizadoEm: serverTimestamp()
    };

    await updateDoc(ref, patch as any);
    this.applyLocalPessoaPatch(id, {
      ...patch,
      atualizadoEm: Timestamp.now()
    });
  }

  async deletePessoa(id: string) {
    const uid = this.getUidOrThrow();
    const ref = doc(this.firebase.db, "users", uid, "calendarioPessoas", id);
    await deleteDoc(ref);
    this.applyLocalPessoaRemove(id);
  }

  private getCalendarioCol(uid: string): CollectionReference<DocumentData> {
    return collection(this.firebase.db, "users", uid, "calendario");
  }

  private getPessoasCol(uid: string): CollectionReference<DocumentData> {
    return collection(this.firebase.db, "users", uid, "calendarioPessoas");
  }

  private getUidOrThrow(): string {
    const uid = this.auth.getUid();
    if (!uid) {
      throw new Error("Faca login.");
    }
    return uid;
  }

  private handleAuthChange(authState: AuthState) {
    if (authState.status === "loading") {
      this.emitState({
        status: "loading",
        data: this.calendarioStateSubject.value.data,
        error: null
      });
      this.emitPessoasState({
        status: "loading",
        data: this.pessoasStateSubject.value.data,
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
      this.emitPessoasState({
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
      this.emitPessoasState({
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
    this.emitPessoasState({
      status: "loading",
      data: [],
      error: null
    });
    this.startListener(uid);
    this.startPessoasListener(uid);
  }

  private startListener(uid: string) {
    this.unsubscribeCalendario = onSnapshot(
      this.getCalendarioCol(uid),
      (snapshot) => {
        const items = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...this.normalizeItem(docSnap.data() as CalendarioItem)
        }));
        this.emitState({
          status: "ready",
          data: items,
          error: null
        });
      },
      (error) => {
        console.error("Erro ao escutar calendario", error);
        this.emitState({
          status: "error",
          data: [],
          error: this.toErrorMessage(error)
        });
      }
    );
  }

  private stopListener() {
    if (this.unsubscribeCalendario) {
      this.unsubscribeCalendario();
      this.unsubscribeCalendario = undefined;
    }
    if (this.unsubscribePessoas) {
      this.unsubscribePessoas();
      this.unsubscribePessoas = undefined;
    }
    this.currentUid = null;
  }

  private emitState(state: DataState<CalendarioItem[]>) {
    this.zone.run(() => this.calendarioStateSubject.next(state));
  }

  private startPessoasListener(uid: string) {
    this.unsubscribePessoas = onSnapshot(
      this.getPessoasCol(uid),
      (snapshot) => {
        const pessoas = snapshot.docs
          .map((docSnap) => ({
            id: docSnap.id,
            ...this.normalizePessoa(docSnap.data() as CalendarioPessoa)
          }))
          .sort((a, b) => (a.nome || "").localeCompare(b.nome || "", "pt-BR"));
        this.emitPessoasState({
          status: "ready",
          data: pessoas,
          error: null
        });
      },
      (error) => {
        console.error("Erro ao escutar pessoas do calendario", error);
        this.emitPessoasState({
          status: "error",
          data: [],
          error: this.toErrorMessage(error)
        });
      }
    );
  }

  private emitPessoasState(state: DataState<CalendarioPessoa[]>) {
    this.zone.run(() => this.pessoasStateSubject.next(state));
  }

  private applyLocalUpsert(item: CalendarioItem) {
    const current = this.calendarioStateSubject.value;
    const filtered = current.data.filter((entry) => entry.id !== item.id);
    this.emitState({
      ...current,
      data: [...filtered, item]
    });
  }

  private applyLocalPatch(id: string, patch: Partial<CalendarioItem>) {
    const current = this.calendarioStateSubject.value;
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
    const current = this.calendarioStateSubject.value;
    this.emitState({
      ...current,
      data: current.data.filter((item) => item.id !== id)
    });
  }

  private applyLocalPessoaUpsert(pessoa: CalendarioPessoa) {
    const current = this.pessoasStateSubject.value;
    const filtered = current.data.filter((entry) => entry.id !== pessoa.id);
    this.emitPessoasState({
      ...current,
      data: [...filtered, pessoa].sort((a, b) => (a.nome || "").localeCompare(b.nome || "", "pt-BR"))
    });
  }

  private applyLocalPessoaPatch(id: string, patch: Partial<CalendarioPessoa>) {
    const current = this.pessoasStateSubject.value;
    this.emitPessoasState({
      ...current,
      data: current.data
        .map((pessoa) =>
          pessoa.id === id
            ? {
                ...pessoa,
                ...patch
              }
            : pessoa
        )
        .sort((a, b) => (a.nome || "").localeCompare(b.nome || "", "pt-BR"))
    });
  }

  private applyLocalPessoaRemove(id: string) {
    const current = this.pessoasStateSubject.value;
    this.emitPessoasState({
      ...current,
      data: current.data.filter((pessoa) => pessoa.id !== id)
    });
  }

  private normalizeItem(item: CalendarioItem): CalendarioItem {
    return {
      ...item,
      data: typeof item.data === "string" ? item.data : "",
      titulo: item.titulo || "",
      descricao: item.descricao || "",
      pessoaId: typeof item.pessoaId === "string" ? item.pessoaId : null,
      criadoEm: this.getTimestamp(item.criadoEm),
      atualizadoEm: this.getTimestamp(item.atualizadoEm) ?? this.getTimestamp(item.criadoEm)
    };
  }

  private normalizePessoa(pessoa: CalendarioPessoa): CalendarioPessoa {
    return {
      ...pessoa,
      nome: pessoa.nome || "",
      cor: this.normalizeColor(pessoa.cor),
      criadoEm: this.getTimestamp(pessoa.criadoEm),
      atualizadoEm: this.getTimestamp(pessoa.atualizadoEm) ?? this.getTimestamp(pessoa.criadoEm)
    };
  }

  private getPessoaId(pessoaId?: string | null): string | null {
    if (!pessoaId) return null;
    return this.pessoasStateSubject.value.data.some((pessoa) => pessoa.id === pessoaId) ? pessoaId : null;
  }

  private normalizeColor(value?: string | null): string {
    return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value) ? value : "#2563eb";
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
    return "Erro ao carregar calendario.";
  }
}
