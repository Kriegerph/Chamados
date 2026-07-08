import {
  AuthService,
  BehaviorSubject,
  FirebaseService,
  Injectable,
  NgZone,
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  map,
  onSnapshot,
  serverTimestamp,
  setClassMetadata,
  updateDoc,
  ɵɵdefineInjectable,
  ɵɵinject
} from "./chunk-SRMKRKBP.js";
import {
  __spreadProps,
  __spreadValues
} from "./chunk-GOMI4DH3.js";

// src/app/services/chamados.service.ts
var ChamadosService = class _ChamadosService {
  firebase;
  auth;
  zone;
  todosStateSubject = new BehaviorSubject({
    status: "loading",
    data: [],
    error: null
  });
  todosState$ = this.todosStateSubject.asObservable();
  todos$ = this.todosState$.pipe(map((state) => state.data));
  unsubscribeTodos;
  currentUid = null;
  constructor(firebase, auth, zone) {
    this.firebase = firebase;
    this.auth = auth;
    this.zone = zone;
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
  getChamadosCol(uid) {
    return collection(this.firebase.db, "users", uid, "chamados");
  }
  getUidOrThrow() {
    const uid = this.auth.getUid();
    if (!uid) {
      throw new Error("Fa\xE7a login.");
    }
    return uid;
  }
  async addChamadoNovo(data) {
    const uid = this.getUidOrThrow();
    const dataInicioAtendimento = Timestamp.now();
    const tempoAtendimentoMinutos = this.normalizeTempoAtendimentoMinutos(data.tempoAtendimentoMinutos);
    const payload = {
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
      criadoEm: serverTimestamp(),
      dataFechamento: null,
      concluidoEm: null,
      dataInicioAtendimento,
      dataFimAtendimento: null,
      tempoAtendimento: tempoAtendimentoMinutos,
      tempoAtendimentoMinutos,
      tipoCadastro: "novo"
    };
    const ref = await addDoc(this.getChamadosCol(uid), payload);
    this.applyLocalUpsert(__spreadProps(__spreadValues({
      id: ref.id
    }, payload), {
      criadoEm: Timestamp.now()
    }));
  }
  async addChamadoAntigo(data) {
    const uid = this.getUidOrThrow();
    const dataInicioAtendimento = Timestamp.now();
    const tempoAtendimentoMinutos = this.normalizeTempoAtendimentoMinutos(data.tempoAtendimentoMinutos);
    const payload = {
      motivo: data.motivo,
      cliente: data.empresa,
      clienteNome: data.empresa,
      empresa: data.empresa,
      empresaId: data.empresaId,
      funcionario: data.funcionario,
      funcionarioId: data.funcionarioId,
      contextoSistemaId: data.contextoSistemaId.trim(),
      sistemasRelacionados: this.normalizeSistemaIds(data.sistemasRelacionados, data.contextoSistemaId),
      data: data.data,
      status: "concluido",
      resolucao: data.resolucao,
      origem: "manual",
      criadoEm: serverTimestamp(),
      dataFechamento: serverTimestamp(),
      concluidoEm: serverTimestamp(),
      dataInicioAtendimento,
      dataFimAtendimento: dataInicioAtendimento,
      tempoAtendimento: tempoAtendimentoMinutos,
      tempoAtendimentoMinutos,
      tipoCadastro: "antigo"
    };
    const ref = await addDoc(this.getChamadosCol(uid), payload);
    this.applyLocalUpsert(__spreadProps(__spreadValues({
      id: ref.id
    }, payload), {
      criadoEm: Timestamp.now(),
      concluidoEm: Timestamp.now()
    }));
  }
  async finalizarChamado(id, data) {
    const uid = this.getUidOrThrow();
    const ref = doc(this.firebase.db, "users", uid, "chamados", id);
    const chamadoAtual = this.todosStateSubject.value.data.find((item) => item.id === id);
    const dataFimAtendimento = Timestamp.now();
    const dataInicioAtendimento = this.getTimestamp(chamadoAtual?.dataInicioAtendimento) ?? this.getTimestamp(chamadoAtual?.criadoEm) ?? this.getTimestamp(chamadoAtual?.data);
    const payload = {
      status: "concluido",
      resolucao: data.resolucao,
      contextoSistemaId: data.contextoSistemaId.trim(),
      sistemasRelacionados: this.normalizeSistemaIds(data.sistemasRelacionados, data.contextoSistemaId),
      concluidoEm: serverTimestamp(),
      dataFechamento: serverTimestamp(),
      dataFimAtendimento
    };
    if (typeof data.motivo === "string") {
      payload.motivo = data.motivo;
    }
    if (data.empresaId && data.empresa && data.funcionarioId && data.funcionario) {
      payload.empresaId = data.empresaId;
      payload.empresa = data.empresa;
      payload.funcionarioId = data.funcionarioId;
      payload.funcionario = data.funcionario;
      payload.cliente = data.empresa;
      payload.clienteNome = data.empresa;
    }
    if (dataInicioAtendimento) {
      payload.dataInicioAtendimento = dataInicioAtendimento;
      const tempoAtendimentoMinutos = this.calcularTempoAtendimentoMinutos(dataInicioAtendimento, dataFimAtendimento);
      payload.tempoAtendimentoMinutos = tempoAtendimentoMinutos;
      payload.tempoAtendimento = tempoAtendimentoMinutos;
    }
    await updateDoc(ref, payload);
    this.applyLocalPatch(id, __spreadProps(__spreadValues({}, payload), {
      concluidoEm: dataFimAtendimento,
      dataFechamento: dataFimAtendimento
    }));
  }
  async updateChamado(id, data) {
    const uid = this.getUidOrThrow();
    const ref = doc(this.firebase.db, "users", uid, "chamados", id);
    const patch = __spreadValues({}, data);
    if ("contextoSistemaId" in data || "sistemasRelacionados" in data) {
      const contextoSistemaId = typeof data.contextoSistemaId === "string" ? data.contextoSistemaId.trim() : "";
      patch.contextoSistemaId = contextoSistemaId;
      patch.sistemasRelacionados = this.normalizeSistemaIds(data.sistemasRelacionados, contextoSistemaId);
    }
    await updateDoc(ref, patch);
    this.applyLocalPatch(id, patch);
  }
  async deleteChamado(id) {
    const uid = this.getUidOrThrow();
    const ref = doc(this.firebase.db, "users", uid, "chamados", id);
    await deleteDoc(ref);
    this.applyLocalRemove(id);
  }
  handleAuthChange(authState) {
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
        error: authState.error || "Falha ao resolver autentica\xE7\xE3o."
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
    if (uid === this.currentUid)
      return;
    this.stopListener();
    this.currentUid = uid;
    this.emitState({
      status: "loading",
      data: [],
      error: null
    });
    this.startListener(uid);
  }
  startListener(uid) {
    this.unsubscribeTodos = onSnapshot(this.getChamadosCol(uid), (snapshot) => {
      const items = snapshot.docs.map((docSnap) => __spreadValues({
        id: docSnap.id
      }, this.normalizeChamado(docSnap.data())));
      this.emitState({
        status: "ready",
        data: items,
        error: null
      });
      console.debug(`[Chamados] listener recebeu ${items.length} itens`);
    }, (error) => {
      console.error("Erro ao escutar chamados", error);
      this.emitState({
        status: "error",
        data: [],
        error: this.toErrorMessage(error)
      });
    });
  }
  stopListener() {
    if (this.unsubscribeTodos) {
      this.unsubscribeTodos();
      this.unsubscribeTodos = void 0;
    }
    this.currentUid = null;
  }
  emitState(state) {
    this.zone.run(() => this.todosStateSubject.next(state));
  }
  applyLocalUpsert(chamado) {
    const current = this.todosStateSubject.value;
    const filtered = current.data.filter((item) => item.id !== chamado.id);
    this.emitState(__spreadProps(__spreadValues({}, current), {
      data: [...filtered, chamado]
    }));
  }
  applyLocalPatch(id, patch) {
    const current = this.todosStateSubject.value;
    const data = current.data.map((item) => item.id === id ? __spreadValues(__spreadValues({}, item), patch) : item);
    this.emitState(__spreadProps(__spreadValues({}, current), {
      data
    }));
  }
  applyLocalRemove(id) {
    const current = this.todosStateSubject.value;
    this.emitState(__spreadProps(__spreadValues({}, current), {
      data: current.data.filter((item) => item.id !== id)
    }));
  }
  getTimestamp(value) {
    if (value instanceof Timestamp) {
      return value;
    }
    if (value && typeof value === "object" && typeof value.toDate === "function" && typeof value.toMillis === "function") {
      return value;
    }
    return null;
  }
  normalizeChamado(chamado) {
    const dataTimestamp = this.getTimestamp(chamado.data);
    const criadoEm = this.getTimestamp(chamado.criadoEm) ?? dataTimestamp;
    const dataInicioAtendimento = this.getTimestamp(chamado.dataInicioAtendimento) ?? criadoEm;
    const concluidoEm = this.getTimestamp(chamado.concluidoEm) ?? this.getTimestamp(chamado.dataFechamento) ?? this.getTimestamp(chamado.dataFimAtendimento);
    const dataFimAtendimento = this.getTimestamp(chamado.dataFimAtendimento) ?? this.getTimestamp(chamado.dataFechamento) ?? concluidoEm;
    const dataFechamento = this.getTimestamp(chamado.dataFechamento) ?? this.getTimestamp(chamado.dataFimAtendimento) ?? concluidoEm;
    const data = this.normalizeDataField(chamado.data);
    const tempoAtendimentoMinutos = chamado.tempoAtendimentoMinutos ?? this.normalizeTempoAtendimentoMinutos(chamado.tempoAtendimento);
    return __spreadProps(__spreadValues({}, chamado), {
      resolucao: chamado.resolucao || "",
      contextoSistemaId: typeof chamado.contextoSistemaId === "string" ? chamado.contextoSistemaId.trim() : "",
      sistemasRelacionados: this.normalizeSistemaIds(chamado.sistemasRelacionados, chamado.contextoSistemaId),
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
    });
  }
  normalizeDataField(value) {
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
  normalizeTempoAtendimentoMinutos(value) {
    return typeof value === "number" && Number.isFinite(value) ? value : null;
  }
  normalizeSistemaIds(value, contextoSistemaId) {
    const contexto = typeof contextoSistemaId === "string" ? contextoSistemaId.trim() : "";
    if (!Array.isArray(value)) {
      return [];
    }
    return [...new Set(value.filter((item) => typeof item === "string").map((item) => item.trim()).filter((item) => !!item && item !== contexto))];
  }
  calcularTempoAtendimentoMinutos(dataInicioAtendimento, dataFimAtendimento) {
    const diffMs = dataFimAtendimento.toMillis() - dataInicioAtendimento.toMillis();
    return Math.max(0, Math.floor(diffMs / 6e4));
  }
  toErrorMessage(error) {
    if (error instanceof Error && error.message) {
      return error.message;
    }
    return "Erro ao carregar chamados.";
  }
  static \u0275fac = function ChamadosService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _ChamadosService)(\u0275\u0275inject(FirebaseService), \u0275\u0275inject(AuthService), \u0275\u0275inject(NgZone));
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _ChamadosService, factory: _ChamadosService.\u0275fac, providedIn: "root" });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ChamadosService, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], () => [{ type: FirebaseService }, { type: AuthService }, { type: NgZone }], null);
})();

export {
  ChamadosService
};
//# sourceMappingURL=chunk-F7YXGS3T.js.map
