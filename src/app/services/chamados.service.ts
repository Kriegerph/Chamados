import { Injectable, NgZone } from "@angular/core";
import {
  addDoc,
  collection,
  CollectionReference,
  DocumentData,
  Timestamp,
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
    empresaId: string;
    empresa: string;
    funcionarioId: string;
    funcionario: string;
    data: string;
  }) {
    const uid = this.getUidOrThrow();
    const dataInicioAtendimento = Timestamp.now();
    const payload: Omit<Chamado, "id"> = {
      motivo: data.motivo,
      cliente: data.empresa,
      clienteNome: data.empresa,
      empresa: data.empresa,
      empresaId: data.empresaId,
      funcionario: data.funcionario,
      funcionarioId: data.funcionarioId,
      data: data.data,
      status: "aberto",
      resolucao: "",
      origem: "manual",
      criadoEm: serverTimestamp() as any,
      dataFechamento: null,
      concluidoEm: null,
      dataInicioAtendimento,
      dataFimAtendimento: null,
      tempoAtendimento: null,
      tempoAtendimentoMinutos: null,
      tipoCadastro: "novo"
    };
    const ref = await addDoc(this.getChamadosCol(uid), payload);
    this.applyLocalUpsert({
      id: ref.id,
      ...payload,
      criadoEm: Timestamp.now()
    });
  }

  async addChamadoAntigo(data: {
    motivo: string;
    empresaId: string;
    empresa: string;
    funcionarioId: string;
    funcionario: string;
    data: string;
    resolucao: string;
    contextoSistemaId: string;
    sistemasRelacionados?: string[];
  }) {
    const uid = this.getUidOrThrow();
    const dataInicioAtendimento = Timestamp.now();
    const payload: Omit<Chamado, "id"> = {
      motivo: data.motivo,
      cliente: data.empresa,
      clienteNome: data.empresa,
      empresa: data.empresa,
      empresaId: data.empresaId,
      funcionario: data.funcionario,
      funcionarioId: data.funcionarioId,
      contextoSistemaId: data.contextoSistemaId.trim(),
      sistemasRelacionados: this.normalizeSistemaIds(
        data.sistemasRelacionados,
        data.contextoSistemaId
      ),
      data: data.data,
      status: "concluido",
      resolucao: data.resolucao,
      origem: "manual",
      criadoEm: serverTimestamp() as any,
      dataFechamento: serverTimestamp() as any,
      concluidoEm: serverTimestamp() as any,
      dataInicioAtendimento,
      dataFimAtendimento: dataInicioAtendimento,
      tempoAtendimento: 0,
      tempoAtendimentoMinutos: 0,
      tipoCadastro: "antigo"
    };
    const ref = await addDoc(this.getChamadosCol(uid), payload);
    this.applyLocalUpsert({
      id: ref.id,
      ...payload,
      criadoEm: Timestamp.now(),
      concluidoEm: Timestamp.now()
    });
  }

  async finalizarChamado(
    id: string,
    data: {
      resolucao: string;
      motivo?: string;
      contextoSistemaId: string;
      sistemasRelacionados?: string[];
    }
  ) {
    const uid = this.getUidOrThrow();
    const ref = doc(this.firebase.db, "users", uid, "chamados", id);
    const chamadoAtual = this.todosStateSubject.value.data.find((item) => item.id === id);
    const dataFimAtendimento = Timestamp.now();
    const dataInicioAtendimento =
      this.getTimestamp(chamadoAtual?.dataInicioAtendimento) ??
      this.getTimestamp(chamadoAtual?.criadoEm) ??
      this.getTimestamp(chamadoAtual?.data);

    const payload: Partial<Chamado> & { concluidoEm: any; dataFechamento: any } = {
      status: "concluido",
      resolucao: data.resolucao,
      contextoSistemaId: data.contextoSistemaId.trim(),
      sistemasRelacionados: this.normalizeSistemaIds(
        data.sistemasRelacionados,
        data.contextoSistemaId
      ),
      concluidoEm: serverTimestamp() as any,
      dataFechamento: serverTimestamp() as any,
      dataFimAtendimento
    };

    if (typeof data.motivo === "string") {
      payload.motivo = data.motivo;
    }

    if (dataInicioAtendimento) {
      payload.dataInicioAtendimento = dataInicioAtendimento;
      const tempoAtendimentoMinutos = this.calcularTempoAtendimentoMinutos(
        dataInicioAtendimento,
        dataFimAtendimento
      );
      payload.tempoAtendimentoMinutos = tempoAtendimentoMinutos;
      payload.tempoAtendimento = tempoAtendimentoMinutos;
    }

    await updateDoc(ref, payload as any);
    this.applyLocalPatch(id, {
      ...payload,
      concluidoEm: dataFimAtendimento,
      dataFechamento: dataFimAtendimento
    });
  }

  async updateChamado(id: string, data: Partial<Chamado>) {
    const uid = this.getUidOrThrow();
    const ref = doc(this.firebase.db, "users", uid, "chamados", id);
    const patch: Partial<Chamado> = { ...data };

    if ("contextoSistemaId" in data || "sistemasRelacionados" in data) {
      const contextoSistemaId = typeof data.contextoSistemaId === "string"
        ? data.contextoSistemaId.trim()
        : "";

      patch.contextoSistemaId = contextoSistemaId;
      patch.sistemasRelacionados = this.normalizeSistemaIds(
        data.sistemasRelacionados,
        contextoSistemaId
      );
    }

    await updateDoc(ref, patch as any);
    this.applyLocalPatch(id, patch);
  }

  async deleteChamado(id: string) {
    const uid = this.getUidOrThrow();
    const ref = doc(this.firebase.db, "users", uid, "chamados", id);
    await deleteDoc(ref);
    this.applyLocalRemove(id);
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
    this.unsubscribeTodos = onSnapshot(
      this.getChamadosCol(uid),
      (snapshot) => {
        const items = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...this.normalizeChamado(docSnap.data() as Chamado)
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

  private applyLocalUpsert(chamado: Chamado) {
    const current = this.todosStateSubject.value;
    const filtered = current.data.filter((item) => item.id !== chamado.id);
    this.emitState({
      ...current,
      data: [...filtered, chamado]
    });
  }

  private applyLocalPatch(id: string, patch: Partial<Chamado>) {
    const current = this.todosStateSubject.value;
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
    const current = this.todosStateSubject.value;
    this.emitState({
      ...current,
      data: current.data.filter((item) => item.id !== id)
    });
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

  private normalizeChamado(chamado: Chamado): Chamado {
    const dataTimestamp = this.getTimestamp(chamado.data);
    const criadoEm = this.getTimestamp(chamado.criadoEm) ?? dataTimestamp;
    const dataInicioAtendimento =
      this.getTimestamp(chamado.dataInicioAtendimento) ?? criadoEm;
    const concluidoEm =
      this.getTimestamp(chamado.concluidoEm) ??
      this.getTimestamp(chamado.dataFechamento) ??
      this.getTimestamp(chamado.dataFimAtendimento);
    const dataFimAtendimento =
      this.getTimestamp(chamado.dataFimAtendimento) ??
      this.getTimestamp(chamado.dataFechamento) ??
      concluidoEm;
    const dataFechamento =
      this.getTimestamp(chamado.dataFechamento) ??
      this.getTimestamp(chamado.dataFimAtendimento) ??
      concluidoEm;
    const data = this.normalizeDataField(chamado.data);
    const tempoAtendimentoMinutos =
      chamado.tempoAtendimentoMinutos ??
      this.normalizeTempoAtendimentoMinutos(chamado.tempoAtendimento);

    return {
      ...chamado,
      resolucao: chamado.resolucao || "",
      contextoSistemaId: typeof chamado.contextoSistemaId === "string"
        ? chamado.contextoSistemaId.trim()
        : "",
      sistemasRelacionados: this.normalizeSistemaIds(
        chamado.sistemasRelacionados,
        chamado.contextoSistemaId
      ),
      origem: chamado.origem === "whatsapp" ? "whatsapp" : "manual",
      criadoEm,
      concluidoEm,
      dataFechamento,
      dataInicioAtendimento,
      dataFimAtendimento,
      data,
      tempoAtendimento: tempoAtendimentoMinutos,
      tipoCadastro: chamado.tipoCadastro === "antigo" ? "antigo" : "novo",
      tempoAtendimentoMinutos
    };
  }

  private normalizeDataField(value: unknown): string {
    if (typeof value === "string") {
      return value;
    }

    const timestamp = this.getTimestamp(value);
    if (!timestamp) {
      return "";
    }

    const date = timestamp.toDate();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  private normalizeTempoAtendimentoMinutos(value: unknown): number | null {
    return typeof value === "number" && Number.isFinite(value) ? value : null;
  }

  private normalizeSistemaIds(value: unknown, contextoSistemaId?: string | null): string[] {
    const contexto = typeof contextoSistemaId === "string" ? contextoSistemaId.trim() : "";
    if (!Array.isArray(value)) {
      return [];
    }

    return [...new Set(
      value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter((item) => !!item && item !== contexto)
    )];
  }

  private calcularTempoAtendimentoMinutos(
    dataInicioAtendimento: Timestamp,
    dataFimAtendimento: Timestamp
  ): number {
    const diffMs = dataFimAtendimento.toMillis() - dataInicioAtendimento.toMillis();
    return Math.max(0, Math.floor(diffMs / 60000));
  }

  private toErrorMessage(error: unknown): string {
    if (error instanceof Error && error.message) {
      return error.message;
    }
    return "Erro ao carregar chamados.";
  }
}
