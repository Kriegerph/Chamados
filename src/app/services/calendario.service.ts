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
import { CalendarioItem } from "../models/calendario.model";
import { DataState } from "../models/data-state.model";
import { AuthService, AuthState } from "./auth.service";
import { FirebaseService } from "./firebase.service";

export type CalendarioPayload = {
  data: string;
  titulo: string;
  descricao: string;
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
  private unsubscribeCalendario?: () => void;
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

  private getCalendarioCol(uid: string): CollectionReference<DocumentData> {
    return collection(this.firebase.db, "users", uid, "calendario");
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
    this.currentUid = null;
  }

  private emitState(state: DataState<CalendarioItem[]>) {
    this.zone.run(() => this.calendarioStateSubject.next(state));
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

  private normalizeItem(item: CalendarioItem): CalendarioItem {
    return {
      ...item,
      data: typeof item.data === "string" ? item.data : "",
      titulo: item.titulo || "",
      descricao: item.descricao || "",
      criadoEm: this.getTimestamp(item.criadoEm),
      atualizadoEm: this.getTimestamp(item.atualizadoEm) ?? this.getTimestamp(item.criadoEm)
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
    return "Erro ao carregar calendario.";
  }
}
