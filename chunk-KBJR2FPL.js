import {
  AuthService,
  BehaviorSubject,
  FirebaseService,
  Injectable,
  NgZone,
  collection,
  deleteDoc,
  doc,
  getDocs,
  map,
  onSnapshot,
  setClassMetadata,
  setDoc,
  ɵɵdefineInjectable,
  ɵɵinject
} from "./chunk-SRMKRKBP.js";
import {
  __spreadProps,
  __spreadValues
} from "./chunk-GOMI4DH3.js";

// src/app/services/sistemas.service.ts
var SistemasService = class _SistemasService {
  firebase;
  auth;
  zone;
  sistemasStateSubject = new BehaviorSubject({
    status: "loading",
    data: [],
    error: null
  });
  sistemasState$ = this.sistemasStateSubject.asObservable();
  sistemas$ = this.sistemasState$.pipe(map((state) => state.data));
  unsubscribeSistemas;
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
  buildSistemaId(nome) {
    return nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/\s+/g, "_").replace(/[^a-z0-9_]+/g, "_").replace(/_+/g, "_").replace(/^_+|_+$/g, "");
  }
  async createSistema(nome) {
    const uid = this.getUidOrThrow();
    const nomeNormalizado = this.normalizeDisplayName(nome);
    if (!nomeNormalizado) {
      throw new Error("Informe o nome do sistema.");
    }
    const sistemaId = this.buildSistemaId(nomeNormalizado);
    if (!sistemaId) {
      throw new Error("N\xE3o foi poss\xEDvel gerar um ID v\xE1lido para o sistema.");
    }
    const sistemas = await this.listAllSistemas(uid);
    const conflitoNome = sistemas.some((item) => this.normalizeComparableName(item.nome) === this.normalizeComparableName(nomeNormalizado));
    const conflitoId = sistemas.some((item) => item.id === sistemaId);
    if (conflitoNome) {
      throw new Error("J\xE1 existe um sistema com este nome.");
    }
    if (conflitoId) {
      throw new Error("J\xE1 existe um sistema com este ID.");
    }
    await setDoc(doc(this.firebase.db, "users", uid, "sistemas", sistemaId), {
      nome: nomeNormalizado
    });
    this.applyLocalUpsert({
      id: sistemaId,
      nome: nomeNormalizado
    });
    return sistemaId;
  }
  async deleteSistema(sistema) {
    const uid = this.getUidOrThrow();
    const sistemaId = sistema.id?.trim();
    if (!sistemaId) {
      throw new Error("Sistema inv\xE1lido.");
    }
    const emUso = await this.isSistemaInUse(sistemaId, sistema.nome || sistemaId);
    if (emUso) {
      throw new Error("Este sistema est\xE1 em uso e n\xE3o pode ser exclu\xEDdo.");
    }
    await deleteDoc(doc(this.firebase.db, "users", uid, "sistemas", sistemaId));
    this.applyLocalRemove(sistemaId);
  }
  getSistemasSnapshot() {
    return this.sistemasStateSubject.value.data;
  }
  getSistemasCol(uid) {
    return collection(this.firebase.db, "users", uid, "sistemas");
  }
  async listAllSistemas(uid) {
    const snapshot = await getDocs(this.getSistemasCol(uid));
    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      nome: String(docSnap.data()["nome"] || "")
    }));
  }
  getUidOrThrow() {
    const uid = this.auth.getUid();
    if (!uid) {
      throw new Error("Fa\xE7a login.");
    }
    return uid;
  }
  async isSistemaInUse(sistemaId, sistemaNome) {
    const uid = this.getUidOrThrow();
    const [empresasSnapshot, chamadosSnapshot] = await Promise.all([
      getDocs(collection(this.firebase.db, "users", uid, "empresas")),
      getDocs(collection(this.firebase.db, "users", uid, "chamados"))
    ]);
    const nomeNormalizado = this.normalizeComparableName(sistemaNome);
    return [...empresasSnapshot.docs, ...chamadosSnapshot.docs].some((docSnap) => this.containsSistemaReference(docSnap.data(), sistemaId, nomeNormalizado));
  }
  containsSistemaReference(value, sistemaId, sistemaNomeNormalizado, parentKey = "") {
    if (value == null) {
      return false;
    }
    if (typeof value === "string") {
      return this.isSistemaKey(parentKey) ? this.matchesSistemaString(value, sistemaId, sistemaNomeNormalizado) : false;
    }
    if (Array.isArray(value)) {
      return value.some((item) => this.containsSistemaReference(item, sistemaId, sistemaNomeNormalizado, parentKey));
    }
    if (typeof value !== "object") {
      return false;
    }
    return Object.entries(value).some(([key, child]) => {
      const normalizedKey = this.normalizeComparableName(key);
      if (this.isSistemaKey(normalizedKey)) {
        return this.matchesSistemaValue(child, sistemaId, sistemaNomeNormalizado);
      }
      return this.containsSistemaReference(child, sistemaId, sistemaNomeNormalizado, normalizedKey);
    });
  }
  matchesSistemaValue(value, sistemaId, sistemaNomeNormalizado) {
    if (typeof value === "string") {
      return this.matchesSistemaString(value, sistemaId, sistemaNomeNormalizado);
    }
    if (Array.isArray(value)) {
      return value.some((item) => this.matchesSistemaValue(item, sistemaId, sistemaNomeNormalizado));
    }
    if (!value || typeof value !== "object") {
      return false;
    }
    return Object.entries(value).some(([key, child]) => {
      const normalizedKey = this.normalizeComparableName(key);
      if (["id", "sistemaid", "sistema_id"].includes(normalizedKey) && typeof child === "string") {
        return child.trim() === sistemaId;
      }
      if ((normalizedKey.includes("nome") || normalizedKey.includes("label")) && typeof child === "string") {
        return this.matchesSistemaString(child, sistemaId, sistemaNomeNormalizado);
      }
      return this.matchesSistemaValue(child, sistemaId, sistemaNomeNormalizado);
    });
  }
  matchesSistemaString(value, sistemaId, sistemaNomeNormalizado) {
    const comparable = this.normalizeComparableName(value);
    if (!comparable) {
      return false;
    }
    return comparable === sistemaNomeNormalizado || comparable === sistemaId || this.buildSistemaId(value) === sistemaId;
  }
  isSistemaKey(key) {
    return key.includes("sistema");
  }
  normalizeDisplayName(value) {
    return value.trim().replace(/\s+/g, " ");
  }
  normalizeComparableName(value) {
    return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/\s+/g, " ");
  }
  handleAuthChange(authState) {
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
  startListener(uid) {
    this.unsubscribeSistemas = onSnapshot(this.getSistemasCol(uid), (snapshot) => {
      const items = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        nome: String(docSnap.data()["nome"] || "")
      }));
      this.emitState({
        status: "ready",
        data: items,
        error: null
      });
    }, (error) => {
      console.error("Erro ao escutar sistemas", error);
      this.emitState({
        status: "error",
        data: [],
        error: this.toErrorMessage(error)
      });
    });
  }
  stopListener() {
    if (this.unsubscribeSistemas) {
      this.unsubscribeSistemas();
      this.unsubscribeSistemas = void 0;
    }
    this.currentUid = null;
  }
  emitState(state) {
    this.zone.run(() => this.sistemasStateSubject.next(state));
  }
  applyLocalUpsert(sistema) {
    const current = this.sistemasStateSubject.value;
    const filtered = current.data.filter((item) => item.id !== sistema.id);
    this.emitState(__spreadProps(__spreadValues({}, current), {
      data: [...filtered, sistema]
    }));
  }
  applyLocalRemove(id) {
    const current = this.sistemasStateSubject.value;
    this.emitState(__spreadProps(__spreadValues({}, current), {
      data: current.data.filter((item) => item.id !== id)
    }));
  }
  toErrorMessage(error) {
    if (error instanceof Error && error.message) {
      return error.message;
    }
    return "Erro ao carregar sistemas.";
  }
  static \u0275fac = function SistemasService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _SistemasService)(\u0275\u0275inject(FirebaseService), \u0275\u0275inject(AuthService), \u0275\u0275inject(NgZone));
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _SistemasService, factory: _SistemasService.\u0275fac, providedIn: "root" });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(SistemasService, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], () => [{ type: FirebaseService }, { type: AuthService }, { type: NgZone }], null);
})();

export {
  SistemasService
};
//# sourceMappingURL=chunk-KBJR2FPL.js.map
