import {
  AuthService,
  BehaviorSubject,
  FirebaseService,
  Injectable,
  NgZone,
  addDoc,
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDocs,
  increment,
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

// src/app/utils/phone.util.ts
var COUNTRY_CODE = "55";
var LOCAL_LENGTH = 10;
var LOCAL_WITH_NINTH_DIGIT_LENGTH = 11;
var digitsOnly = (value) => typeof value === "string" ? value.replace(/\D/g, "") : "";
var stripCountryCode = (digits) => digits.startsWith(COUNTRY_CODE) ? digits.slice(COUNTRY_CODE.length) : digits;
var removeNinthDigit = (localDigits) => localDigits.length === LOCAL_WITH_NINTH_DIGIT_LENGTH ? `${localDigits.slice(0, 2)}${localDigits.slice(3)}` : localDigits;
var normalizePhoneTo12Digits = (value) => {
  const cleaned = digitsOnly(value);
  if (!cleaned) {
    return "";
  }
  const localDigits = removeNinthDigit(stripCountryCode(cleaned));
  if (localDigits.length !== LOCAL_LENGTH) {
    return "";
  }
  return `${COUNTRY_CODE}${localDigits}`;
};
var isValidPhone12Digits = (value) => normalizePhoneTo12Digits(value).length === 12;

// src/app/services/empresas.service.ts
var EmpresasService = class _EmpresasService {
  firebase;
  auth;
  zone;
  empresasStateSubject = new BehaviorSubject({
    status: "loading",
    data: [],
    error: null
  });
  empresasState$ = this.empresasStateSubject.asObservable();
  empresas$ = this.empresasState$.pipe(map((state) => state.data));
  unsubscribeEmpresas;
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
  async addEmpresa(data) {
    const uid = this.getUidOrThrow();
    const payload = {
      nomeEmpresa: data.nomeEmpresa.trim(),
      observacoes: data.observacoes?.trim() || "",
      sistemas: this.normalizeSistemaIds(data.sistemas),
      totalFuncionarios: 0,
      dataCadastro: serverTimestamp(),
      atualizadoEm: serverTimestamp()
    };
    await addDoc(this.getEmpresasCol(uid), payload);
  }
  async updateEmpresa(id, data) {
    const uid = this.getUidOrThrow();
    const ref = doc(this.firebase.db, "users", uid, "empresas", id);
    const payload = __spreadValues({}, data);
    if ("sistemas" in data) {
      payload.sistemas = this.normalizeSistemaIds(data.sistemas);
    }
    await updateDoc(ref, __spreadProps(__spreadValues({}, payload), {
      atualizadoEm: serverTimestamp()
    }));
  }
  async deleteEmpresa(id) {
    const uid = this.getUidOrThrow();
    const funcionariosSnapshot = await getDocs(this.getFuncionariosCol(uid, id));
    await Promise.all(funcionariosSnapshot.docs.map((item) => deleteDoc(item.ref)));
    await deleteDoc(doc(this.firebase.db, "users", uid, "empresas", id));
  }
  async listFuncionarios(empresaId) {
    const uid = this.getUidOrThrow();
    const snapshot = await getDocs(this.getFuncionariosCol(uid, empresaId));
    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      nomeFuncionario: String(docSnap.data()["nomeFuncionario"] || ""),
      telefone: normalizePhoneTo12Digits(docSnap.data()["telefone"]) || String(docSnap.data()["telefone"] || ""),
      telefoneBusca: normalizePhoneTo12Digits(docSnap.data()["telefoneBusca"] || docSnap.data()["telefone"]),
      criarChamadoAutomatico: this.normalizeCriacaoAutomatica(docSnap.data()["criarChamadoAutomatico"]),
      ativo: docSnap.data()["ativo"] !== false,
      dataCadastro: docSnap.data()["dataCadastro"] ?? null,
      atualizadoEm: docSnap.data()["atualizadoEm"] ?? null
    }));
  }
  async addFuncionario(empresaId, data) {
    const uid = this.getUidOrThrow();
    const telefone = normalizePhoneTo12Digits(data.telefone);
    const payload = {
      nomeFuncionario: data.nomeFuncionario.trim(),
      telefone,
      telefoneBusca: telefone,
      criarChamadoAutomatico: this.normalizeCriacaoAutomatica(data.criarChamadoAutomatico),
      ativo: true,
      dataCadastro: serverTimestamp(),
      atualizadoEm: serverTimestamp()
    };
    await addDoc(this.getFuncionariosCol(uid, empresaId), payload);
    await updateDoc(doc(this.firebase.db, "users", uid, "empresas", empresaId), {
      totalFuncionarios: increment(1),
      atualizadoEm: serverTimestamp()
    });
  }
  async updateFuncionario(empresaId, funcionarioId, data) {
    const uid = this.getUidOrThrow();
    const ref = doc(this.firebase.db, "users", uid, "empresas", empresaId, "funcionarios", funcionarioId);
    const telefone = normalizePhoneTo12Digits(data.telefone);
    await updateDoc(ref, {
      nomeFuncionario: data.nomeFuncionario?.trim() || "",
      telefone,
      telefoneBusca: telefone,
      criarChamadoAutomatico: this.normalizeCriacaoAutomatica(data.criarChamadoAutomatico),
      cargo: deleteField(),
      email: deleteField(),
      atualizadoEm: serverTimestamp()
    });
  }
  isCriacaoAutomaticaHabilitada(funcionario) {
    return this.normalizeCriacaoAutomatica(funcionario?.criarChamadoAutomatico);
  }
  async deleteFuncionario(empresaId, funcionarioId) {
    const uid = this.getUidOrThrow();
    const ref = doc(this.firebase.db, "users", uid, "empresas", empresaId, "funcionarios", funcionarioId);
    await deleteDoc(ref);
    await updateDoc(doc(this.firebase.db, "users", uid, "empresas", empresaId), {
      totalFuncionarios: increment(-1),
      atualizadoEm: serverTimestamp()
    });
  }
  getEmpresasSnapshot() {
    return this.empresasStateSubject.value.data;
  }
  getEmpresasCol(uid) {
    return collection(this.firebase.db, "users", uid, "empresas");
  }
  getFuncionariosCol(uid, empresaId) {
    return collection(this.firebase.db, "users", uid, "empresas", empresaId, "funcionarios");
  }
  getUidOrThrow() {
    const uid = this.auth.getUid();
    if (!uid) {
      throw new Error("Fa\xE7a login.");
    }
    return uid;
  }
  normalizeCriacaoAutomatica(value) {
    return value === false ? false : true;
  }
  normalizeEmpresa(data) {
    return __spreadProps(__spreadValues({}, data), {
      nomeEmpresa: data.nomeEmpresa || "",
      observacoes: data.observacoes || "",
      sistemas: this.normalizeSistemaIds(data.sistemas)
    });
  }
  normalizeSistemaIds(value) {
    if (!Array.isArray(value)) {
      return [];
    }
    return [...new Set(value.filter((item) => typeof item === "string").map((item) => item.trim()).filter(Boolean))];
  }
  handleAuthChange(authState) {
    if (authState.status === "loading") {
      this.emitState({
        status: "loading",
        data: this.empresasStateSubject.value.data,
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
    this.unsubscribeEmpresas = onSnapshot(this.getEmpresasCol(uid), (snapshot) => {
      const items = snapshot.docs.map((docSnap) => __spreadValues({
        id: docSnap.id
      }, this.normalizeEmpresa(docSnap.data())));
      this.emitState({
        status: "ready",
        data: items,
        error: null
      });
    }, (error) => {
      console.error("Erro ao escutar empresas", error);
      this.emitState({
        status: "error",
        data: [],
        error: this.toErrorMessage(error)
      });
    });
  }
  stopListener() {
    if (this.unsubscribeEmpresas) {
      this.unsubscribeEmpresas();
      this.unsubscribeEmpresas = void 0;
    }
    this.currentUid = null;
  }
  emitState(state) {
    this.zone.run(() => this.empresasStateSubject.next(state));
  }
  toErrorMessage(error) {
    if (error instanceof Error && error.message) {
      return error.message;
    }
    return "Erro ao carregar empresas.";
  }
  static \u0275fac = function EmpresasService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _EmpresasService)(\u0275\u0275inject(FirebaseService), \u0275\u0275inject(AuthService), \u0275\u0275inject(NgZone));
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _EmpresasService, factory: _EmpresasService.\u0275fac, providedIn: "root" });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(EmpresasService, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], () => [{ type: FirebaseService }, { type: AuthService }, { type: NgZone }], null);
})();

export {
  normalizePhoneTo12Digits,
  isValidPhone12Digits,
  EmpresasService
};
//# sourceMappingURL=chunk-E7I6VKBJ.js.map
