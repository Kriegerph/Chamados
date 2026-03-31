import { Injectable, NgZone } from "@angular/core";
import {
  collection,
  CollectionReference,
  deleteDoc,
  doc,
  DocumentData,
  getDocs,
  onSnapshot,
  setDoc
} from "firebase/firestore";
import { BehaviorSubject, map } from "rxjs";
import { DataState } from "../models/data-state.model";
import { Sistema } from "../models/sistema.model";
import { AuthService, AuthState } from "./auth.service";
import { FirebaseService } from "./firebase.service";

@Injectable({
  providedIn: "root"
})
export class SistemasService {
  private readonly sistemasStateSubject = new BehaviorSubject<DataState<Sistema[]>>({
    status: "loading",
    data: [],
    error: null
  });
  readonly sistemasState$ = this.sistemasStateSubject.asObservable();
  readonly sistemas$ = this.sistemasState$.pipe(map((state) => state.data));
  private unsubscribeSistemas?: () => void;
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

  buildSistemaId(nome: string): string {
    return nome
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]+/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_+|_+$/g, "");
  }

  async createSistema(nome: string): Promise<string> {
    const uid = this.getUidOrThrow();

    const nomeNormalizado = this.normalizeDisplayName(nome);
    if (!nomeNormalizado) {
      throw new Error("Informe o nome do sistema.");
    }

    const sistemaId = this.buildSistemaId(nomeNormalizado);
    if (!sistemaId) {
      throw new Error("Nao foi possivel gerar um ID valido para o sistema.");
    }

    const sistemas = await this.listAllSistemas(uid);
    const conflitoNome = sistemas.some(
      (item) => this.normalizeComparableName(item.nome) === this.normalizeComparableName(nomeNormalizado)
    );
    const conflitoId = sistemas.some((item) => item.id === sistemaId);

    if (conflitoNome) {
      throw new Error("Ja existe um sistema com este nome.");
    }

    if (conflitoId) {
      throw new Error("Ja existe um sistema com este ID.");
    }

    await setDoc(doc(this.firebase.db, "users", uid, "sistemas", sistemaId), {
      nome: nomeNormalizado
    } as Omit<Sistema, "id">);

    this.applyLocalUpsert({
      id: sistemaId,
      nome: nomeNormalizado
    });

    return sistemaId;
  }

  async deleteSistema(sistema: Sistema) {
    const uid = this.getUidOrThrow();

    const sistemaId = sistema.id?.trim();
    if (!sistemaId) {
      throw new Error("Sistema invalido.");
    }

    const emUso = await this.isSistemaInUse(sistemaId, sistema.nome || sistemaId);
    if (emUso) {
      throw new Error("Este sistema esta em uso e nao pode ser excluido");
    }

    await deleteDoc(doc(this.firebase.db, "users", uid, "sistemas", sistemaId));
    this.applyLocalRemove(sistemaId);
  }

  getSistemasSnapshot(): Sistema[] {
    return this.sistemasStateSubject.value.data;
  }

  private getSistemasCol(uid: string): CollectionReference<DocumentData> {
    return collection(this.firebase.db, "users", uid, "sistemas");
  }

  private async listAllSistemas(uid: string): Promise<Sistema[]> {
    const snapshot = await getDocs(this.getSistemasCol(uid));
    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      nome: String(docSnap.data()["nome"] || "")
    }));
  }

  private getUidOrThrow(): string {
    const uid = this.auth.getUid();
    if (!uid) {
      throw new Error("Faca login.");
    }
    return uid;
  }

  private async isSistemaInUse(sistemaId: string, sistemaNome: string): Promise<boolean> {
    const uid = this.getUidOrThrow();

    const [empresasSnapshot, chamadosSnapshot] = await Promise.all([
      getDocs(collection(this.firebase.db, "users", uid, "empresas")),
      getDocs(collection(this.firebase.db, "users", uid, "chamados"))
    ]);

    const nomeNormalizado = this.normalizeComparableName(sistemaNome);

    return [...empresasSnapshot.docs, ...chamadosSnapshot.docs].some((docSnap) =>
      this.containsSistemaReference(docSnap.data(), sistemaId, nomeNormalizado)
    );
  }

  private containsSistemaReference(
    value: unknown,
    sistemaId: string,
    sistemaNomeNormalizado: string,
    parentKey = ""
  ): boolean {
    if (value == null) {
      return false;
    }

    if (typeof value === "string") {
      return this.isSistemaKey(parentKey)
        ? this.matchesSistemaString(value, sistemaId, sistemaNomeNormalizado)
        : false;
    }

    if (Array.isArray(value)) {
      return value.some((item) =>
        this.containsSistemaReference(item, sistemaId, sistemaNomeNormalizado, parentKey)
      );
    }

    if (typeof value !== "object") {
      return false;
    }

    return Object.entries(value as Record<string, unknown>).some(([key, child]) => {
      const normalizedKey = this.normalizeComparableName(key);

      if (this.isSistemaKey(normalizedKey)) {
        return this.matchesSistemaValue(child, sistemaId, sistemaNomeNormalizado);
      }

      return this.containsSistemaReference(child, sistemaId, sistemaNomeNormalizado, normalizedKey);
    });
  }

  private matchesSistemaValue(
    value: unknown,
    sistemaId: string,
    sistemaNomeNormalizado: string
  ): boolean {
    if (typeof value === "string") {
      return this.matchesSistemaString(value, sistemaId, sistemaNomeNormalizado);
    }

    if (Array.isArray(value)) {
      return value.some((item) => this.matchesSistemaValue(item, sistemaId, sistemaNomeNormalizado));
    }

    if (!value || typeof value !== "object") {
      return false;
    }

    return Object.entries(value as Record<string, unknown>).some(([key, child]) => {
      const normalizedKey = this.normalizeComparableName(key);

      if (
        ["id", "sistemaid", "sistema_id"].includes(normalizedKey) &&
        typeof child === "string"
      ) {
        return child.trim() === sistemaId;
      }

      if (
        (normalizedKey.includes("nome") || normalizedKey.includes("label")) &&
        typeof child === "string"
      ) {
        return this.matchesSistemaString(child, sistemaId, sistemaNomeNormalizado);
      }

      return this.matchesSistemaValue(child, sistemaId, sistemaNomeNormalizado);
    });
  }

  private matchesSistemaString(
    value: string,
    sistemaId: string,
    sistemaNomeNormalizado: string
  ): boolean {
    const comparable = this.normalizeComparableName(value);
    if (!comparable) {
      return false;
    }

    return (
      comparable === sistemaNomeNormalizado ||
      comparable === sistemaId ||
      this.buildSistemaId(value) === sistemaId
    );
  }

  private isSistemaKey(key: string): boolean {
    return key.includes("sistema");
  }

  private normalizeDisplayName(value: string): string {
    return value.trim().replace(/\s+/g, " ");
  }

  private normalizeComparableName(value: string): string {
    return value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, " ");
  }

  private handleAuthChange(authState: AuthState) {
    if (authState.status === "loading") {
      this.emitState({
        status: "loading",
        data: this.sistemasStateSubject.value.data,
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

    if (uid === this.currentUid) {
      return;
    }

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
    this.unsubscribeSistemas = onSnapshot(
      this.getSistemasCol(uid),
      (snapshot) => {
        const items = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          nome: String(docSnap.data()["nome"] || "")
        }));
        this.emitState({
          status: "ready",
          data: items,
          error: null
        });
      },
      (error) => {
        console.error("Erro ao escutar sistemas", error);
        this.emitState({
          status: "error",
          data: [],
          error: this.toErrorMessage(error)
        });
      }
    );
  }

  private stopListener() {
    if (this.unsubscribeSistemas) {
      this.unsubscribeSistemas();
      this.unsubscribeSistemas = undefined;
    }
    this.currentUid = null;
  }

  private emitState(state: DataState<Sistema[]>) {
    this.zone.run(() => this.sistemasStateSubject.next(state));
  }

  private applyLocalUpsert(sistema: Sistema) {
    const current = this.sistemasStateSubject.value;
    const filtered = current.data.filter((item) => item.id !== sistema.id);
    this.emitState({
      ...current,
      data: [...filtered, sistema]
    });
  }

  private applyLocalRemove(id: string) {
    const current = this.sistemasStateSubject.value;
    this.emitState({
      ...current,
      data: current.data.filter((item) => item.id !== id)
    });
  }

  private toErrorMessage(error: unknown): string {
    if (error instanceof Error && error.message) {
      return error.message;
    }
    return "Erro ao carregar sistemas.";
  }
}
