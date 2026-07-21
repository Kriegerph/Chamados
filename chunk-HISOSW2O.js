import {
  AsyncPipe,
  AuthService,
  BehaviorSubject,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  CommonModule,
  Component,
  DefaultValueAccessor,
  FirebaseService,
  FormsModule,
  Injectable,
  NgControlStatus,
  NgControlStatusGroup,
  NgForOf,
  NgForm,
  NgIf,
  NgModel,
  NgSelectOption,
  NgStyle,
  NgZone,
  RequiredValidator,
  SelectControlValueAccessor,
  Timestamp,
  ToastService,
  addDoc,
  collection,
  combineLatest,
  deleteDoc,
  doc,
  map,
  onSnapshot,
  serverTimestamp,
  setClassMetadata,
  tap,
  updateDoc,
  ɵNgNoValidate,
  ɵNgSelectMultipleOption,
  ɵsetClassDebugInfo,
  ɵɵadvance,
  ɵɵattribute,
  ɵɵclassProp,
  ɵɵdefineComponent,
  ɵɵdefineInjectable,
  ɵɵdirectiveInject,
  ɵɵelement,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵgetCurrentView,
  ɵɵinject,
  ɵɵlistener,
  ɵɵnextContext,
  ɵɵpipe,
  ɵɵpipeBind1,
  ɵɵproperty,
  ɵɵresetView,
  ɵɵrestoreView,
  ɵɵstyleProp,
  ɵɵtemplate,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵtextInterpolate1,
  ɵɵtwoWayBindingSet,
  ɵɵtwoWayListener,
  ɵɵtwoWayProperty
} from "./chunk-SRMKRKBP.js";
import {
  __spreadProps,
  __spreadValues
} from "./chunk-GOMI4DH3.js";

// src/app/services/calendario.service.ts
var CalendarioService = class _CalendarioService {
  firebase;
  auth;
  zone;
  calendarioStateSubject = new BehaviorSubject({
    status: "loading",
    data: [],
    error: null
  });
  calendarioState$ = this.calendarioStateSubject.asObservable();
  calendario$ = this.calendarioState$.pipe(map((state) => state.data));
  pessoasStateSubject = new BehaviorSubject({
    status: "loading",
    data: [],
    error: null
  });
  pessoasState$ = this.pessoasStateSubject.asObservable();
  pessoas$ = this.pessoasState$.pipe(map((state) => state.data));
  unsubscribeCalendario;
  unsubscribePessoas;
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
  async createItem(data) {
    const uid = this.getUidOrThrow();
    const payload = {
      data: data.data,
      titulo: data.titulo.trim(),
      descricao: data.descricao.trim(),
      pessoaId: this.getPessoaId(data.pessoaId),
      criadoEm: serverTimestamp(),
      atualizadoEm: serverTimestamp()
    };
    const ref = await addDoc(this.getCalendarioCol(uid), payload);
    const now = Timestamp.now();
    this.applyLocalUpsert(__spreadProps(__spreadValues({
      id: ref.id
    }, payload), {
      criadoEm: now,
      atualizadoEm: now
    }));
    return ref.id;
  }
  async updateItem(id, data) {
    const uid = this.getUidOrThrow();
    const ref = doc(this.firebase.db, "users", uid, "calendario", id);
    const patch = {
      data: data.data,
      titulo: data.titulo.trim(),
      descricao: data.descricao.trim(),
      pessoaId: this.getPessoaId(data.pessoaId),
      atualizadoEm: serverTimestamp()
    };
    await updateDoc(ref, patch);
    this.applyLocalPatch(id, __spreadProps(__spreadValues({}, patch), {
      atualizadoEm: Timestamp.now()
    }));
  }
  async deleteItem(id) {
    const uid = this.getUidOrThrow();
    const ref = doc(this.firebase.db, "users", uid, "calendario", id);
    await deleteDoc(ref);
    this.applyLocalRemove(id);
  }
  async createPessoa(data) {
    const uid = this.getUidOrThrow();
    const payload = {
      nome: data.nome.trim(),
      cor: this.normalizeColor(data.cor),
      criadoEm: serverTimestamp(),
      atualizadoEm: serverTimestamp()
    };
    const ref = await addDoc(this.getPessoasCol(uid), payload);
    const now = Timestamp.now();
    this.applyLocalPessoaUpsert(__spreadProps(__spreadValues({
      id: ref.id
    }, payload), {
      criadoEm: now,
      atualizadoEm: now
    }));
    return ref.id;
  }
  async updatePessoa(id, data) {
    const uid = this.getUidOrThrow();
    const ref = doc(this.firebase.db, "users", uid, "calendarioPessoas", id);
    const patch = {
      nome: data.nome.trim(),
      cor: this.normalizeColor(data.cor),
      atualizadoEm: serverTimestamp()
    };
    await updateDoc(ref, patch);
    this.applyLocalPessoaPatch(id, __spreadProps(__spreadValues({}, patch), {
      atualizadoEm: Timestamp.now()
    }));
  }
  async deletePessoa(id) {
    const uid = this.getUidOrThrow();
    const ref = doc(this.firebase.db, "users", uid, "calendarioPessoas", id);
    await deleteDoc(ref);
    this.applyLocalPessoaRemove(id);
  }
  getCalendarioCol(uid) {
    return collection(this.firebase.db, "users", uid, "calendario");
  }
  getPessoasCol(uid) {
    return collection(this.firebase.db, "users", uid, "calendarioPessoas");
  }
  getUidOrThrow() {
    const uid = this.auth.getUid();
    if (!uid) {
      throw new Error("Faca login.");
    }
    return uid;
  }
  handleAuthChange(authState) {
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
    if (uid === this.currentUid)
      return;
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
  startListener(uid) {
    this.unsubscribeCalendario = onSnapshot(this.getCalendarioCol(uid), (snapshot) => {
      const items = snapshot.docs.map((docSnap) => __spreadValues({
        id: docSnap.id
      }, this.normalizeItem(docSnap.data())));
      this.emitState({
        status: "ready",
        data: items,
        error: null
      });
    }, (error) => {
      console.error("Erro ao escutar calendario", error);
      this.emitState({
        status: "error",
        data: [],
        error: this.toErrorMessage(error)
      });
    });
  }
  stopListener() {
    if (this.unsubscribeCalendario) {
      this.unsubscribeCalendario();
      this.unsubscribeCalendario = void 0;
    }
    if (this.unsubscribePessoas) {
      this.unsubscribePessoas();
      this.unsubscribePessoas = void 0;
    }
    this.currentUid = null;
  }
  emitState(state) {
    this.zone.run(() => this.calendarioStateSubject.next(state));
  }
  startPessoasListener(uid) {
    this.unsubscribePessoas = onSnapshot(this.getPessoasCol(uid), (snapshot) => {
      const pessoas = snapshot.docs.map((docSnap) => __spreadValues({
        id: docSnap.id
      }, this.normalizePessoa(docSnap.data()))).sort((a, b) => (a.nome || "").localeCompare(b.nome || "", "pt-BR"));
      this.emitPessoasState({
        status: "ready",
        data: pessoas,
        error: null
      });
    }, (error) => {
      console.error("Erro ao escutar pessoas do calendario", error);
      this.emitPessoasState({
        status: "error",
        data: [],
        error: this.toErrorMessage(error)
      });
    });
  }
  emitPessoasState(state) {
    this.zone.run(() => this.pessoasStateSubject.next(state));
  }
  applyLocalUpsert(item) {
    const current = this.calendarioStateSubject.value;
    const filtered = current.data.filter((entry) => entry.id !== item.id);
    this.emitState(__spreadProps(__spreadValues({}, current), {
      data: [...filtered, item]
    }));
  }
  applyLocalPatch(id, patch) {
    const current = this.calendarioStateSubject.value;
    this.emitState(__spreadProps(__spreadValues({}, current), {
      data: current.data.map((item) => item.id === id ? __spreadValues(__spreadValues({}, item), patch) : item)
    }));
  }
  applyLocalRemove(id) {
    const current = this.calendarioStateSubject.value;
    this.emitState(__spreadProps(__spreadValues({}, current), {
      data: current.data.filter((item) => item.id !== id)
    }));
  }
  applyLocalPessoaUpsert(pessoa) {
    const current = this.pessoasStateSubject.value;
    const filtered = current.data.filter((entry) => entry.id !== pessoa.id);
    this.emitPessoasState(__spreadProps(__spreadValues({}, current), {
      data: [...filtered, pessoa].sort((a, b) => (a.nome || "").localeCompare(b.nome || "", "pt-BR"))
    }));
  }
  applyLocalPessoaPatch(id, patch) {
    const current = this.pessoasStateSubject.value;
    this.emitPessoasState(__spreadProps(__spreadValues({}, current), {
      data: current.data.map((pessoa) => pessoa.id === id ? __spreadValues(__spreadValues({}, pessoa), patch) : pessoa).sort((a, b) => (a.nome || "").localeCompare(b.nome || "", "pt-BR"))
    }));
  }
  applyLocalPessoaRemove(id) {
    const current = this.pessoasStateSubject.value;
    this.emitPessoasState(__spreadProps(__spreadValues({}, current), {
      data: current.data.filter((pessoa) => pessoa.id !== id)
    }));
  }
  normalizeItem(item) {
    return __spreadProps(__spreadValues({}, item), {
      data: typeof item.data === "string" ? item.data : "",
      titulo: item.titulo || "",
      descricao: item.descricao || "",
      pessoaId: typeof item.pessoaId === "string" ? item.pessoaId : null,
      criadoEm: this.getTimestamp(item.criadoEm),
      atualizadoEm: this.getTimestamp(item.atualizadoEm) ?? this.getTimestamp(item.criadoEm)
    });
  }
  normalizePessoa(pessoa) {
    return __spreadProps(__spreadValues({}, pessoa), {
      nome: pessoa.nome || "",
      cor: this.normalizeColor(pessoa.cor),
      criadoEm: this.getTimestamp(pessoa.criadoEm),
      atualizadoEm: this.getTimestamp(pessoa.atualizadoEm) ?? this.getTimestamp(pessoa.criadoEm)
    });
  }
  getPessoaId(pessoaId) {
    if (!pessoaId)
      return null;
    return this.pessoasStateSubject.value.data.some((pessoa) => pessoa.id === pessoaId) ? pessoaId : null;
  }
  normalizeColor(value) {
    return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value) ? value : "#2563eb";
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
  toErrorMessage(error) {
    if (error instanceof Error && error.message) {
      return error.message;
    }
    return "Erro ao carregar calendario.";
  }
  static \u0275fac = function CalendarioService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _CalendarioService)(\u0275\u0275inject(FirebaseService), \u0275\u0275inject(AuthService), \u0275\u0275inject(NgZone));
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _CalendarioService, factory: _CalendarioService.\u0275fac, providedIn: "root" });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(CalendarioService, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], () => [{ type: FirebaseService }, { type: AuthService }, { type: NgZone }], null);
})();

// src/app/pages/calendario/calendario.component.ts
function CalendarioComponent_section_0_option_11_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "option", 15);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const mes_r3 = ctx.$implicit;
    \u0275\u0275property("value", mes_r3.valor);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", mes_r3.label, " ");
  }
}
function CalendarioComponent_section_0_div_14_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "div", 16);
  }
}
function CalendarioComponent_section_0_div_15_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 17);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const vm_r4 = \u0275\u0275nextContext().ngIf;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(vm_r4.erro);
  }
}
function CalendarioComponent_section_0_div_16_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 17);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const vm_r4 = \u0275\u0275nextContext().ngIf;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(vm_r4.erroPessoas);
  }
}
function CalendarioComponent_section_0_div_17_div_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 21);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const diaSemana_r5 = ctx.$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", diaSemana_r5, " ");
  }
}
function CalendarioComponent_section_0_div_17_div_2_span_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 25);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const dia_r7 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(dia_r7.numero);
  }
}
function CalendarioComponent_section_0_div_17_div_2_span_2_button_1_span_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 30);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const item_r9 = \u0275\u0275nextContext().$implicit;
    const vm_r4 = \u0275\u0275nextContext(4).ngIf;
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", ctx_r1.getPessoaNome(item_r9, vm_r4.pessoas), " ");
  }
}
function CalendarioComponent_section_0_div_17_div_2_span_2_button_1_Template(rf, ctx) {
  if (rf & 1) {
    const _r8 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 28);
    \u0275\u0275listener("click", function CalendarioComponent_section_0_div_17_div_2_span_2_button_1_Template_button_click_0_listener($event) {
      const item_r9 = \u0275\u0275restoreView(_r8).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(5);
      ctx_r1.abrirEdicao(item_r9);
      return \u0275\u0275resetView($event.stopPropagation());
    });
    \u0275\u0275template(1, CalendarioComponent_section_0_div_17_div_2_span_2_button_1_span_1_Template, 2, 1, "span", 29);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const item_r9 = ctx.$implicit;
    const vm_r4 = \u0275\u0275nextContext(4).ngIf;
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275property("ngStyle", ctx_r1.getItemStyle(item_r9, vm_r4.pessoas));
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r1.getPessoaNome(item_r9, vm_r4.pessoas));
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", item_r9.titulo, " ");
  }
}
function CalendarioComponent_section_0_div_17_div_2_span_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 26);
    \u0275\u0275template(1, CalendarioComponent_section_0_div_17_div_2_span_2_button_1_Template, 3, 3, "button", 27);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const dia_r7 = \u0275\u0275nextContext().$implicit;
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275advance();
    \u0275\u0275property("ngForOf", dia_r7.itens)("ngForTrackBy", ctx_r1.trackByItem);
  }
}
function CalendarioComponent_section_0_div_17_div_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r6 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 22);
    \u0275\u0275listener("click", function CalendarioComponent_section_0_div_17_div_2_Template_div_click_0_listener() {
      const dia_r7 = \u0275\u0275restoreView(_r6).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r1.abrirNovoItem(dia_r7));
    })("keydown.enter", function CalendarioComponent_section_0_div_17_div_2_Template_div_keydown_enter_0_listener() {
      const dia_r7 = \u0275\u0275restoreView(_r6).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r1.abrirNovoItem(dia_r7));
    })("keydown.space", function CalendarioComponent_section_0_div_17_div_2_Template_div_keydown_space_0_listener($event) {
      const dia_r7 = \u0275\u0275restoreView(_r6).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(3);
      ctx_r1.abrirNovoItem(dia_r7);
      return \u0275\u0275resetView($event.preventDefault());
    });
    \u0275\u0275template(1, CalendarioComponent_section_0_div_17_div_2_span_1_Template, 2, 1, "span", 23)(2, CalendarioComponent_section_0_div_17_div_2_span_2_Template, 2, 2, "span", 24);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const dia_r7 = ctx.$implicit;
    \u0275\u0275classProp("is-empty", dia_r7.foraDoMes)("is-today", dia_r7.hoje);
    \u0275\u0275attribute("role", dia_r7.foraDoMes ? null : "button")("tabindex", dia_r7.foraDoMes ? -1 : 0)("aria-disabled", dia_r7.foraDoMes);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", dia_r7.numero);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", dia_r7.itens.length > 0);
  }
}
function CalendarioComponent_section_0_div_17_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 18);
    \u0275\u0275template(1, CalendarioComponent_section_0_div_17_div_1_Template, 2, 1, "div", 19)(2, CalendarioComponent_section_0_div_17_div_2_Template, 3, 9, "div", 20);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const vm_r4 = \u0275\u0275nextContext().ngIf;
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275property("ngForOf", ctx_r1.diasSemana);
    \u0275\u0275advance();
    \u0275\u0275property("ngForOf", vm_r4.dias)("ngForTrackBy", ctx_r1.trackByDia);
  }
}
function CalendarioComponent_section_0_div_18_option_21_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "option", 38);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const pessoa_r11 = ctx.$implicit;
    \u0275\u0275property("ngValue", pessoa_r11.id);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", pessoa_r11.nome, " ");
  }
}
function CalendarioComponent_section_0_div_18_button_27_Template(rf, ctx) {
  if (rf & 1) {
    const _r12 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 45);
    \u0275\u0275listener("click", function CalendarioComponent_section_0_div_18_button_27_Template_button_click_0_listener() {
      \u0275\u0275restoreView(_r12);
      const ctx_r1 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r1.excluirItem());
    });
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275property("disabled", ctx_r1.salvando || ctx_r1.excluindo);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", ctx_r1.getExcluirLabel(), " ");
  }
}
function CalendarioComponent_section_0_div_18_Template(rf, ctx) {
  if (rf & 1) {
    const _r10 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 31);
    \u0275\u0275listener("click", function CalendarioComponent_section_0_div_18_Template_div_click_0_listener() {
      \u0275\u0275restoreView(_r10);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.fecharModal());
    });
    \u0275\u0275elementStart(1, "section", 32);
    \u0275\u0275listener("click", function CalendarioComponent_section_0_div_18_Template_section_click_1_listener($event) {
      \u0275\u0275restoreView(_r10);
      return \u0275\u0275resetView($event.stopPropagation());
    });
    \u0275\u0275elementStart(2, "header", 33)(3, "div")(4, "h3");
    \u0275\u0275text(5);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "p");
    \u0275\u0275text(7);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(8, "button", 34);
    \u0275\u0275listener("click", function CalendarioComponent_section_0_div_18_Template_button_click_8_listener() {
      \u0275\u0275restoreView(_r10);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.fecharModal());
    });
    \u0275\u0275text(9, " x ");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(10, "form", 35);
    \u0275\u0275listener("ngSubmit", function CalendarioComponent_section_0_div_18_Template_form_ngSubmit_10_listener() {
      \u0275\u0275restoreView(_r10);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.salvarItem());
    });
    \u0275\u0275elementStart(11, "label")(12, "span");
    \u0275\u0275text(13, "O que sera feito");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(14, "input", 36);
    \u0275\u0275twoWayListener("ngModelChange", function CalendarioComponent_section_0_div_18_Template_input_ngModelChange_14_listener($event) {
      \u0275\u0275restoreView(_r10);
      const ctx_r1 = \u0275\u0275nextContext(2);
      \u0275\u0275twoWayBindingSet(ctx_r1.form.titulo, $event) || (ctx_r1.form.titulo = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(15, "label")(16, "span");
    \u0275\u0275text(17, "Pessoa");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(18, "select", 37);
    \u0275\u0275twoWayListener("ngModelChange", function CalendarioComponent_section_0_div_18_Template_select_ngModelChange_18_listener($event) {
      \u0275\u0275restoreView(_r10);
      const ctx_r1 = \u0275\u0275nextContext(2);
      \u0275\u0275twoWayBindingSet(ctx_r1.form.pessoaId, $event) || (ctx_r1.form.pessoaId = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementStart(19, "option", 38);
    \u0275\u0275text(20, "Sem pessoa");
    \u0275\u0275elementEnd();
    \u0275\u0275template(21, CalendarioComponent_section_0_div_18_option_21_Template, 2, 2, "option", 39);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(22, "label")(23, "span");
    \u0275\u0275text(24, "Detalhes");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(25, "textarea", 40);
    \u0275\u0275twoWayListener("ngModelChange", function CalendarioComponent_section_0_div_18_Template_textarea_ngModelChange_25_listener($event) {
      \u0275\u0275restoreView(_r10);
      const ctx_r1 = \u0275\u0275nextContext(2);
      \u0275\u0275twoWayBindingSet(ctx_r1.form.descricao, $event) || (ctx_r1.form.descricao = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(26, "div", 41);
    \u0275\u0275template(27, CalendarioComponent_section_0_div_18_button_27_Template, 2, 2, "button", 42);
    \u0275\u0275elementStart(28, "button", 43);
    \u0275\u0275listener("click", function CalendarioComponent_section_0_div_18_Template_button_click_28_listener() {
      \u0275\u0275restoreView(_r10);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.fecharModal());
    });
    \u0275\u0275text(29, " Cancelar ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(30, "button", 44);
    \u0275\u0275text(31);
    \u0275\u0275elementEnd()()()()();
  }
  if (rf & 2) {
    const vm_r4 = \u0275\u0275nextContext().ngIf;
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(ctx_r1.getTituloModal());
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ctx_r1.getDataSelecionadaLabel());
    \u0275\u0275advance(7);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.form.titulo);
    \u0275\u0275advance(4);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.form.pessoaId);
    \u0275\u0275advance();
    \u0275\u0275property("ngValue", null);
    \u0275\u0275advance(2);
    \u0275\u0275property("ngForOf", vm_r4.pessoas)("ngForTrackBy", ctx_r1.trackByPessoa);
    \u0275\u0275advance(4);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.form.descricao);
    \u0275\u0275advance(2);
    \u0275\u0275property("ngIf", !!ctx_r1.itemEditandoId);
    \u0275\u0275advance();
    \u0275\u0275property("disabled", ctx_r1.salvando || ctx_r1.excluindo);
    \u0275\u0275advance(2);
    \u0275\u0275property("disabled", ctx_r1.salvando || ctx_r1.excluindo);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", ctx_r1.getSalvarLabel(), " ");
  }
}
function CalendarioComponent_section_0_div_19_button_23_Template(rf, ctx) {
  if (rf & 1) {
    const _r14 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 43);
    \u0275\u0275listener("click", function CalendarioComponent_section_0_div_19_button_23_Template_button_click_0_listener() {
      \u0275\u0275restoreView(_r14);
      const ctx_r1 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r1.cancelarEdicaoPessoa());
    });
    \u0275\u0275text(1, " Cancelar edicao ");
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275property("disabled", ctx_r1.salvandoPessoa);
  }
}
function CalendarioComponent_section_0_div_19_div_25_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 56);
    \u0275\u0275text(1, " Nenhuma pessoa cadastrada. ");
    \u0275\u0275elementEnd();
  }
}
function CalendarioComponent_section_0_div_19_div_26_Template(rf, ctx) {
  if (rf & 1) {
    const _r15 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 57);
    \u0275\u0275element(1, "span", 58);
    \u0275\u0275elementStart(2, "span", 59);
    \u0275\u0275text(3);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "button", 60);
    \u0275\u0275listener("click", function CalendarioComponent_section_0_div_19_div_26_Template_button_click_4_listener() {
      const pessoa_r16 = \u0275\u0275restoreView(_r15).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r1.editarPessoa(pessoa_r16));
    });
    \u0275\u0275text(5, " Editar ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "button", 61);
    \u0275\u0275listener("click", function CalendarioComponent_section_0_div_19_div_26_Template_button_click_6_listener() {
      const pessoa_r16 = \u0275\u0275restoreView(_r15).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r1.excluirPessoa(pessoa_r16));
    });
    \u0275\u0275text(7);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const pessoa_r16 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275advance();
    \u0275\u0275styleProp("background", pessoa_r16.cor);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(pessoa_r16.nome);
    \u0275\u0275advance(3);
    \u0275\u0275property("disabled", ctx_r1.excluindoPessoaId === pessoa_r16.id);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", ctx_r1.excluindoPessoaId === pessoa_r16.id ? "Excluindo..." : "Excluir", " ");
  }
}
function CalendarioComponent_section_0_div_19_Template(rf, ctx) {
  if (rf & 1) {
    const _r13 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 31);
    \u0275\u0275listener("click", function CalendarioComponent_section_0_div_19_Template_div_click_0_listener() {
      \u0275\u0275restoreView(_r13);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.fecharModalPessoas());
    });
    \u0275\u0275elementStart(1, "section", 46);
    \u0275\u0275listener("click", function CalendarioComponent_section_0_div_19_Template_section_click_1_listener($event) {
      \u0275\u0275restoreView(_r13);
      return \u0275\u0275resetView($event.stopPropagation());
    });
    \u0275\u0275elementStart(2, "header", 33)(3, "div")(4, "h3");
    \u0275\u0275text(5);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "p");
    \u0275\u0275text(7, "Cadastre as pessoas usadas nas anotacoes do calendario.");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(8, "button", 34);
    \u0275\u0275listener("click", function CalendarioComponent_section_0_div_19_Template_button_click_8_listener() {
      \u0275\u0275restoreView(_r13);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.fecharModalPessoas());
    });
    \u0275\u0275text(9, " x ");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(10, "form", 35);
    \u0275\u0275listener("ngSubmit", function CalendarioComponent_section_0_div_19_Template_form_ngSubmit_10_listener() {
      \u0275\u0275restoreView(_r13);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.salvarPessoa());
    });
    \u0275\u0275elementStart(11, "div", 47)(12, "label")(13, "span");
    \u0275\u0275text(14, "Nome");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(15, "input", 48);
    \u0275\u0275twoWayListener("ngModelChange", function CalendarioComponent_section_0_div_19_Template_input_ngModelChange_15_listener($event) {
      \u0275\u0275restoreView(_r13);
      const ctx_r1 = \u0275\u0275nextContext(2);
      \u0275\u0275twoWayBindingSet(ctx_r1.pessoaForm.nome, $event) || (ctx_r1.pessoaForm.nome = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(16, "label", 49)(17, "span");
    \u0275\u0275text(18, "Cor");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(19, "input", 50);
    \u0275\u0275twoWayListener("ngModelChange", function CalendarioComponent_section_0_div_19_Template_input_ngModelChange_19_listener($event) {
      \u0275\u0275restoreView(_r13);
      const ctx_r1 = \u0275\u0275nextContext(2);
      \u0275\u0275twoWayBindingSet(ctx_r1.pessoaForm.cor, $event) || (ctx_r1.pessoaForm.cor = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(20, "button", 51);
    \u0275\u0275text(21);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(22, "div", 41);
    \u0275\u0275template(23, CalendarioComponent_section_0_div_19_button_23_Template, 2, 1, "button", 52);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(24, "div", 53);
    \u0275\u0275template(25, CalendarioComponent_section_0_div_19_div_25_Template, 2, 0, "div", 54)(26, CalendarioComponent_section_0_div_19_div_26_Template, 8, 5, "div", 55);
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const vm_r4 = \u0275\u0275nextContext().ngIf;
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(ctx_r1.getTituloModalPessoas());
    \u0275\u0275advance(10);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.pessoaForm.nome);
    \u0275\u0275advance(4);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.pessoaForm.cor);
    \u0275\u0275advance();
    \u0275\u0275property("disabled", ctx_r1.salvandoPessoa);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", ctx_r1.getPessoaSalvarLabel(), " ");
    \u0275\u0275advance(2);
    \u0275\u0275property("ngIf", !!ctx_r1.pessoaEditandoId);
    \u0275\u0275advance(2);
    \u0275\u0275property("ngIf", vm_r4.pessoas.length === 0);
    \u0275\u0275advance();
    \u0275\u0275property("ngForOf", vm_r4.pessoas)("ngForTrackBy", ctx_r1.trackByPessoa);
  }
}
function CalendarioComponent_section_0_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "section", 1)(1, "article", 2)(2, "div", 3)(3, "div")(4, "h3", 4);
    \u0275\u0275text(5);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "p", 5);
    \u0275\u0275text(7, "Clique em um dia para registrar o que sera feito.");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(8, "div", 6)(9, "label", 7)(10, "select", 8);
    \u0275\u0275twoWayListener("ngModelChange", function CalendarioComponent_section_0_Template_select_ngModelChange_10_listener($event) {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r1.mesSelecionado, $event) || (ctx_r1.mesSelecionado = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275listener("ngModelChange", function CalendarioComponent_section_0_Template_select_ngModelChange_10_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.onMesChange());
    });
    \u0275\u0275template(11, CalendarioComponent_section_0_option_11_Template, 2, 2, "option", 9);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(12, "button", 10);
    \u0275\u0275listener("click", function CalendarioComponent_section_0_Template_button_click_12_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.abrirModalPessoas());
    });
    \u0275\u0275text(13, " Cadastrar pessoa ");
    \u0275\u0275elementEnd()()();
    \u0275\u0275template(14, CalendarioComponent_section_0_div_14_Template, 1, 0, "div", 11)(15, CalendarioComponent_section_0_div_15_Template, 2, 1, "div", 12)(16, CalendarioComponent_section_0_div_16_Template, 2, 1, "div", 12)(17, CalendarioComponent_section_0_div_17_Template, 3, 3, "div", 13);
    \u0275\u0275elementEnd();
    \u0275\u0275template(18, CalendarioComponent_section_0_div_18_Template, 32, 12, "div", 14)(19, CalendarioComponent_section_0_div_19_Template, 27, 9, "div", 14);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const vm_r4 = ctx.ngIf;
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(vm_r4.tituloMes);
    \u0275\u0275advance(5);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.mesSelecionado);
    \u0275\u0275advance();
    \u0275\u0275property("ngForOf", ctx_r1.mesesOptions);
    \u0275\u0275advance(3);
    \u0275\u0275property("ngIf", vm_r4.carregando && vm_r4.dias.length === 0);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", !!vm_r4.erro);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", !vm_r4.erro && !!vm_r4.erroPessoas);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", !vm_r4.erro);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r1.modalAberto);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r1.pessoasModalAberto);
  }
}
var WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
var CalendarioComponent = class _CalendarioComponent {
  calendarioService;
  toast;
  cdr;
  diasSemana = WEEKDAYS;
  vm$;
  mesesOptions;
  modalAberto = false;
  pessoasModalAberto = false;
  salvando = false;
  excluindo = false;
  salvandoPessoa = false;
  excluindoPessoaId = null;
  itemEditandoId = null;
  pessoaEditandoId = null;
  dataSelecionada = "";
  form = this.getFormInicial("");
  pessoaForm = this.getPessoaFormInicial();
  mesSelecionado;
  hoje = /* @__PURE__ */ new Date();
  anoAtual = this.hoje.getFullYear();
  mesAtual = this.hoje.getMonth();
  mesSelecionadoSubject;
  tituloFormatter = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric"
  });
  constructor(calendarioService, toast, cdr) {
    this.calendarioService = calendarioService;
    this.toast = toast;
    this.cdr = cdr;
    this.mesSelecionado = this.toMonthKey(this.anoAtual, this.mesAtual);
    this.mesSelecionadoSubject = new BehaviorSubject(this.mesSelecionado);
    this.mesesOptions = this.buildMesesOptions();
    this.vm$ = combineLatest([
      this.calendarioService.calendarioState$,
      this.calendarioService.pessoasState$,
      this.mesSelecionadoSubject
    ]).pipe(map(([state, pessoasState, mesSelecionado]) => this.buildViewModel(state, pessoasState, mesSelecionado)), tap(() => this.cdr.markForCheck()));
  }
  trackByDia(index, dia) {
    return dia.data || `vazio-${index}`;
  }
  trackByItem(_, item) {
    return item.id ?? `${item.data}-${item.titulo}`;
  }
  trackByPessoa(_, pessoa) {
    return pessoa.id ?? pessoa.nome;
  }
  onMesChange() {
    this.mesSelecionadoSubject.next(this.mesSelecionado);
    this.forcarAtualizacaoTela();
  }
  abrirNovoItem(dia) {
    if (dia.foraDoMes || !dia.data)
      return;
    this.itemEditandoId = null;
    this.dataSelecionada = dia.data;
    this.form = this.getFormInicial(dia.data);
    this.modalAberto = true;
    this.forcarAtualizacaoTela();
  }
  abrirEdicao(item) {
    this.itemEditandoId = item.id ?? null;
    this.dataSelecionada = item.data;
    this.form = {
      data: item.data,
      titulo: item.titulo || "",
      descricao: item.descricao || "",
      pessoaId: item.pessoaId || null
    };
    this.modalAberto = true;
    this.forcarAtualizacaoTela();
  }
  fecharModal(forcar = false) {
    if ((this.salvando || this.excluindo) && !forcar)
      return;
    this.modalAberto = false;
    this.salvando = false;
    this.excluindo = false;
    this.itemEditandoId = null;
    this.dataSelecionada = "";
    this.form = this.getFormInicial("");
    this.forcarAtualizacaoTela();
  }
  abrirModalPessoas() {
    this.pessoasModalAberto = true;
    this.pessoaEditandoId = null;
    this.pessoaForm = this.getPessoaFormInicial();
    this.forcarAtualizacaoTela();
  }
  fecharModalPessoas(forcar = false) {
    if (this.salvandoPessoa && !forcar)
      return;
    this.pessoasModalAberto = false;
    this.salvandoPessoa = false;
    this.excluindoPessoaId = null;
    this.pessoaEditandoId = null;
    this.pessoaForm = this.getPessoaFormInicial();
    this.forcarAtualizacaoTela();
  }
  editarPessoa(pessoa) {
    this.pessoaEditandoId = pessoa.id ?? null;
    this.pessoaForm = {
      nome: pessoa.nome || "",
      cor: this.getSafeColor(pessoa.cor)
    };
    this.forcarAtualizacaoTela();
  }
  cancelarEdicaoPessoa() {
    this.pessoaEditandoId = null;
    this.pessoaForm = this.getPessoaFormInicial();
    this.forcarAtualizacaoTela();
  }
  async salvarItem() {
    if (this.salvando)
      return;
    const payload = this.getPayloadSanitizado();
    if (!payload.titulo) {
      this.toast.show("Informe o que sera feito.", "error");
      return;
    }
    this.salvando = true;
    this.forcarAtualizacaoTela();
    try {
      if (this.itemEditandoId) {
        await this.calendarioService.updateItem(this.itemEditandoId, payload);
        this.toast.show("Anotacao atualizada.", "success");
      } else {
        await this.calendarioService.createItem(payload);
        this.toast.show("Anotacao salva.", "success");
      }
      this.fecharModal(true);
    } catch (err) {
      this.toast.show(`Erro ao salvar anotacao: ${err?.message || err}`, "error");
    } finally {
      this.salvando = false;
      this.forcarAtualizacaoTela();
    }
  }
  async salvarPessoa() {
    if (this.salvandoPessoa)
      return;
    const payload = this.getPessoaPayloadSanitizado();
    if (!payload.nome) {
      this.toast.show("Informe o nome da pessoa.", "error");
      return;
    }
    this.salvandoPessoa = true;
    this.forcarAtualizacaoTela();
    try {
      if (this.pessoaEditandoId) {
        await this.calendarioService.updatePessoa(this.pessoaEditandoId, payload);
        this.toast.show("Pessoa atualizada.", "success");
      } else {
        await this.calendarioService.createPessoa(payload);
        this.toast.show("Pessoa cadastrada.", "success");
      }
      this.cancelarEdicaoPessoa();
    } catch (err) {
      this.toast.show(`Erro ao salvar pessoa: ${err?.message || err}`, "error");
    } finally {
      this.salvandoPessoa = false;
      this.forcarAtualizacaoTela();
    }
  }
  async excluirItem() {
    if (!this.itemEditandoId || this.excluindo)
      return;
    const ok = window.confirm("Deseja excluir esta anotacao do calendario?");
    if (!ok)
      return;
    this.excluindo = true;
    this.forcarAtualizacaoTela();
    try {
      await this.calendarioService.deleteItem(this.itemEditandoId);
      this.toast.show("Anotacao excluida.", "success");
      this.fecharModal(true);
    } catch (err) {
      this.toast.show(`Erro ao excluir anotacao: ${err?.message || err}`, "error");
    } finally {
      this.excluindo = false;
      this.forcarAtualizacaoTela();
    }
  }
  async excluirPessoa(pessoa) {
    if (!pessoa.id || this.excluindoPessoaId)
      return;
    const ok = window.confirm("Deseja excluir esta pessoa do calendario?");
    if (!ok)
      return;
    this.excluindoPessoaId = pessoa.id;
    this.forcarAtualizacaoTela();
    try {
      await this.calendarioService.deletePessoa(pessoa.id);
      if (this.pessoaEditandoId === pessoa.id) {
        this.cancelarEdicaoPessoa();
      }
      if (this.form.pessoaId === pessoa.id) {
        this.form = __spreadProps(__spreadValues({}, this.form), {
          pessoaId: null
        });
      }
      this.toast.show("Pessoa excluida.", "success");
    } catch (err) {
      this.toast.show(`Erro ao excluir pessoa: ${err?.message || err}`, "error");
    } finally {
      this.excluindoPessoaId = null;
      this.forcarAtualizacaoTela();
    }
  }
  getTituloModal() {
    return this.itemEditandoId ? "Editar anotacao" : "Nova anotacao";
  }
  getDataSelecionadaLabel() {
    if (!this.dataSelecionada)
      return "";
    const [year, month, day] = this.dataSelecionada.split("-").map(Number);
    return new Intl.DateTimeFormat("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long"
    }).format(new Date(year, month - 1, day));
  }
  getSalvarLabel() {
    return this.salvando ? "Salvando..." : "Salvar";
  }
  getExcluirLabel() {
    return this.excluindo ? "Excluindo..." : "Excluir";
  }
  getPessoaSalvarLabel() {
    return this.salvandoPessoa ? "Salvando..." : "Salvar";
  }
  getTituloModalPessoas() {
    return this.pessoaEditandoId ? "Editar pessoa" : "Cadastrar pessoa";
  }
  getPessoaCor(item, pessoas) {
    const pessoa = this.getPessoaDoItem(item, pessoas);
    return pessoa ? this.getSafeColor(pessoa.cor) : "#2563eb";
  }
  getPessoaNome(item, pessoas) {
    const pessoa = this.getPessoaDoItem(item, pessoas);
    return pessoa?.nome || "";
  }
  getItemStyle(item, pessoas) {
    return {
      "--cal-person-color": this.getPessoaCor(item, pessoas)
    };
  }
  buildViewModel(state, pessoasState, mesSelecionado) {
    const { year, monthIndex } = this.parseMonthKey(mesSelecionado);
    return {
      carregando: state.status === "loading" || pessoasState.status === "loading",
      erro: state.error,
      erroPessoas: pessoasState.error,
      tituloMes: this.capitalize(this.tituloFormatter.format(new Date(year, monthIndex, 1))),
      dias: this.buildDias(state.data, year, monthIndex),
      pessoas: pessoasState.data
    };
  }
  buildDias(items, year, monthIndex) {
    const primeiroDiaMes = new Date(year, monthIndex, 1);
    const ultimoDiaMes = new Date(year, monthIndex + 1, 0);
    const totalDiasMes = ultimoDiaMes.getDate();
    const deslocamentoInicial = primeiroDiaMes.getDay();
    const hojeData = this.toDateKey(this.hoje);
    const itensPorData = this.groupItemsByDate(items, year, monthIndex);
    const dias = [];
    for (let i = 0; i < deslocamentoInicial; i++) {
      dias.push({
        data: "",
        numero: null,
        foraDoMes: true,
        hoje: false,
        itens: []
      });
    }
    for (let day = 1; day <= totalDiasMes; day++) {
      const data = this.toDateKey(new Date(year, monthIndex, day));
      dias.push({
        data,
        numero: day,
        foraDoMes: false,
        hoje: data === hojeData,
        itens: itensPorData.get(data) ?? []
      });
    }
    while (dias.length % 7 !== 0) {
      dias.push({
        data: "",
        numero: null,
        foraDoMes: true,
        hoje: false,
        itens: []
      });
    }
    return dias;
  }
  groupItemsByDate(items, year, monthIndex) {
    const map2 = /* @__PURE__ */ new Map();
    const currentMonthPrefix = this.toMonthKey(year, monthIndex);
    items.filter((item) => item.data?.startsWith(currentMonthPrefix)).forEach((item) => {
      const current = map2.get(item.data) ?? [];
      map2.set(item.data, [...current, item]);
    });
    map2.forEach((value, key) => {
      map2.set(key, [...value].sort((a, b) => (a.titulo || "").localeCompare(b.titulo || "", "pt-BR")));
    });
    return map2;
  }
  buildMesesOptions() {
    return Array.from({ length: 12 }, (_, monthIndex) => {
      const date = new Date(this.anoAtual, monthIndex, 1);
      return {
        valor: this.toMonthKey(this.anoAtual, monthIndex),
        label: this.capitalize(this.tituloFormatter.format(date))
      };
    });
  }
  getPayloadSanitizado() {
    return {
      data: this.form.data,
      titulo: this.form.titulo.trim(),
      descricao: this.form.descricao.trim(),
      pessoaId: this.form.pessoaId || null
    };
  }
  getFormInicial(data) {
    return {
      data,
      titulo: "",
      descricao: "",
      pessoaId: null
    };
  }
  getPessoaPayloadSanitizado() {
    return {
      nome: this.pessoaForm.nome.trim(),
      cor: this.getSafeColor(this.pessoaForm.cor)
    };
  }
  getPessoaFormInicial() {
    return {
      nome: "",
      cor: "#2563eb"
    };
  }
  toDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  toMonthKey(year, monthIndex) {
    return `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
  }
  parseMonthKey(value) {
    const [yearValue, monthValue] = value.split("-").map(Number);
    const year = Number.isFinite(yearValue) ? yearValue : this.anoAtual;
    const monthIndex = Number.isFinite(monthValue) ? Math.max(0, Math.min(11, monthValue - 1)) : this.mesAtual;
    return { year, monthIndex };
  }
  capitalize(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
  getPessoaDoItem(item, pessoas) {
    if (!item.pessoaId)
      return null;
    return pessoas.find((pessoa) => pessoa.id === item.pessoaId) ?? null;
  }
  getSafeColor(value) {
    return /^#[0-9a-fA-F]{6}$/.test(value || "") ? value : "#2563eb";
  }
  forcarAtualizacaoTela() {
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }
  static \u0275fac = function CalendarioComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _CalendarioComponent)(\u0275\u0275directiveInject(CalendarioService), \u0275\u0275directiveInject(ToastService), \u0275\u0275directiveInject(ChangeDetectorRef));
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _CalendarioComponent, selectors: [["app-calendario"]], decls: 2, vars: 3, consts: [["class", "page-section calendario-page", 4, "ngIf"], [1, "page-section", "calendario-page"], [1, "card", "calendario-card"], [1, "card-title-row", "calendario-header"], [1, "card-title"], [1, "card-subtitle"], [1, "calendario-header-actions"], ["for", "calendarioMes", 1, "field", "calendario-month-field"], ["id", "calendarioMes", "name", "calendarioMes", 3, "ngModelChange", "ngModel"], [3, "value", 4, "ngFor", "ngForOf"], ["type", "button", 1, "btn", "secondary", "calendario-person-button", 3, "click"], ["class", "skeleton", "style", "min-height: 360px;", 4, "ngIf"], ["class", "empty-state", 4, "ngIf"], ["class", "calendario-grid", 4, "ngIf"], ["class", "calendario-modal-backdrop", 3, "click", 4, "ngIf"], [3, "value"], [1, "skeleton", 2, "min-height", "360px"], [1, "empty-state"], [1, "calendario-grid"], ["class", "calendario-weekday", 4, "ngFor", "ngForOf"], ["class", "calendario-day", 3, "is-empty", "is-today", "click", "keydown.enter", "keydown.space", 4, "ngFor", "ngForOf", "ngForTrackBy"], [1, "calendario-weekday"], [1, "calendario-day", 3, "click", "keydown.enter", "keydown.space"], ["class", "calendario-day-number", 4, "ngIf"], ["class", "calendario-day-items", 4, "ngIf"], [1, "calendario-day-number"], [1, "calendario-day-items"], ["class", "calendario-item", "type", "button", 3, "ngStyle", "click", 4, "ngFor", "ngForOf", "ngForTrackBy"], ["type", "button", 1, "calendario-item", 3, "click", "ngStyle"], ["class", "calendario-item-person", 4, "ngIf"], [1, "calendario-item-person"], [1, "calendario-modal-backdrop", 3, "click"], ["role", "dialog", "aria-modal", "true", 1, "calendario-modal", 3, "click"], [1, "calendario-modal-header"], ["type", "button", "aria-label", "Fechar", 1, "modal-close", 3, "click"], [1, "form", "calendario-form", 3, "ngSubmit"], ["name", "tituloCalendario", "type", "text", "placeholder", "Ex: Revisar pendencias do sistema", "required", "", 3, "ngModelChange", "ngModel"], ["name", "pessoaCalendario", 3, "ngModelChange", "ngModel"], [3, "ngValue"], [3, "ngValue", 4, "ngFor", "ngForOf", "ngForTrackBy"], ["name", "descricaoCalendario", "rows", "5", "placeholder", "Observacoes, contexto ou proximos passos", 3, "ngModelChange", "ngModel"], [1, "calendario-modal-actions"], ["class", "btn danger", "type", "button", 3, "disabled", "click", 4, "ngIf"], ["type", "button", 1, "btn", "secondary", 3, "click", "disabled"], ["type", "submit", 1, "btn", "primary", 3, "disabled"], ["type", "button", 1, "btn", "danger", 3, "click", "disabled"], ["role", "dialog", "aria-modal", "true", 1, "calendario-modal", "calendario-pessoas-modal", 3, "click"], [1, "calendario-person-form-row"], ["name", "nomePessoaCalendario", "type", "text", "placeholder", "Ex: Fabiola", "required", "", 3, "ngModelChange", "ngModel"], [1, "calendario-color-field"], ["name", "corPessoaCalendario", "type", "color", 3, "ngModelChange", "ngModel"], ["type", "submit", 1, "btn", "primary", "calendario-person-save", 3, "disabled"], ["class", "btn secondary", "type", "button", 3, "disabled", "click", 4, "ngIf"], [1, "calendario-person-list"], ["class", "empty-state compact", 4, "ngIf"], ["class", "calendario-person-row", 4, "ngFor", "ngForOf", "ngForTrackBy"], [1, "empty-state", "compact"], [1, "calendario-person-row"], [1, "calendario-person-color"], [1, "calendario-person-name"], ["type", "button", 1, "btn", "secondary", "small", 3, "click"], ["type", "button", 1, "btn", "danger", "small", 3, "click", "disabled"]], template: function CalendarioComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275template(0, CalendarioComponent_section_0_Template, 20, 9, "section", 0);
      \u0275\u0275pipe(1, "async");
    }
    if (rf & 2) {
      \u0275\u0275property("ngIf", \u0275\u0275pipeBind1(1, 1, ctx.vm$));
    }
  }, dependencies: [CommonModule, NgForOf, NgIf, NgStyle, FormsModule, \u0275NgNoValidate, NgSelectOption, \u0275NgSelectMultipleOption, DefaultValueAccessor, SelectControlValueAccessor, NgControlStatus, NgControlStatusGroup, RequiredValidator, NgModel, NgForm, AsyncPipe], styles: ["\n\n.calendario-page[_ngcontent-%COMP%] {\n  display: grid;\n  min-width: 0;\n}\n.calendario-card[_ngcontent-%COMP%] {\n  min-width: 0;\n  padding: 18px;\n}\n.calendario-card[_ngcontent-%COMP%]:hover {\n  transform: none;\n}\n.calendario-header[_ngcontent-%COMP%] {\n  align-items: center;\n}\n.calendario-header-actions[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: flex-end;\n  align-items: center;\n  gap: 10px;\n}\n.calendario-month-field[_ngcontent-%COMP%] {\n  width: 190px;\n  margin: 0;\n}\n.calendario-month-field[_ngcontent-%COMP%]   select[_ngcontent-%COMP%] {\n  width: 100%;\n}\n.calendario-person-button[_ngcontent-%COMP%] {\n  align-self: center;\n  white-space: nowrap;\n}\n.calendario-grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(7, minmax(0, 1fr));\n  gap: 8px;\n  min-width: 0;\n}\n.calendario-weekday[_ngcontent-%COMP%] {\n  min-width: 0;\n  padding: 0 4px 4px;\n  color: var(--text-muted);\n  font-size: 12px;\n  font-weight: 800;\n  text-align: center;\n  text-transform: uppercase;\n}\n.calendario-day[_ngcontent-%COMP%] {\n  min-width: 0;\n  min-height: clamp(92px, calc((100vh - 250px) / 5), 136px);\n  padding: 9px;\n  border: 1px solid #dbe3ee;\n  border-radius: 10px;\n  background: #ffffff;\n  color: var(--text-main);\n  text-align: left;\n  cursor: pointer;\n  overflow: hidden;\n  display: flex;\n  flex-direction: column;\n  gap: 7px;\n}\n.calendario-day[_ngcontent-%COMP%]:hover:not(.is-empty) {\n  border-color: #93c5fd;\n  background: #f8fbff;\n}\n.calendario-day[_ngcontent-%COMP%]:focus-visible, \n.calendario-item[_ngcontent-%COMP%]:focus-visible {\n  outline: 3px solid rgba(37, 99, 235, 0.22);\n  outline-offset: 2px;\n}\n.calendario-day[aria-disabled=true][_ngcontent-%COMP%] {\n  cursor: default;\n}\n.calendario-day.is-empty[_ngcontent-%COMP%] {\n  background: #f8fafc;\n  border-style: dashed;\n  opacity: 0.65;\n}\n.calendario-day.is-today[_ngcontent-%COMP%] {\n  border-color: var(--primary-500);\n  box-shadow: inset 0 0 0 1px rgba(37, 99, 235, 0.20);\n}\n.calendario-day-number[_ngcontent-%COMP%] {\n  display: inline-grid;\n  place-items: center;\n  width: 26px;\n  height: 26px;\n  border-radius: 999px;\n  font-size: 13px;\n  font-weight: 900;\n}\n.calendario-day.is-today[_ngcontent-%COMP%]   .calendario-day-number[_ngcontent-%COMP%] {\n  background: var(--primary-500);\n  color: #ffffff;\n}\n.calendario-day-items[_ngcontent-%COMP%] {\n  min-width: 0;\n  display: grid;\n  gap: 5px;\n  overflow: hidden;\n}\n.calendario-item[_ngcontent-%COMP%] {\n  min-width: 0;\n  max-width: 100%;\n  padding: 5px 7px;\n  border: 1px solid var(--cal-person-color, #bfdbfe);\n  border-radius: 7px;\n  background: color-mix(in srgb, var(--cal-person-color, #2563eb) 14%, #ffffff);\n  color: #0f172a;\n  font-size: 11px;\n  font-weight: 800;\n  line-height: 1.25;\n  text-align: left;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  cursor: pointer;\n}\n.calendario-item[_ngcontent-%COMP%]:hover {\n  filter: brightness(0.96);\n}\n.calendario-item-person[_ngcontent-%COMP%] {\n  display: block;\n  min-width: 0;\n  max-width: 100%;\n  margin-bottom: 1px;\n  font-size: 9px;\n  font-weight: 900;\n  opacity: 0.78;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  text-transform: uppercase;\n  white-space: nowrap;\n}\n.calendario-modal-backdrop[_ngcontent-%COMP%] {\n  position: fixed;\n  inset: 0;\n  z-index: 50;\n  display: grid;\n  place-items: center;\n  padding: 24px;\n  background: rgba(15, 23, 42, 0.48);\n}\n.calendario-modal[_ngcontent-%COMP%] {\n  width: min(560px, 100%);\n  max-height: calc(100dvh - 48px);\n  overflow: auto;\n  border-radius: 14px;\n  background: #ffffff;\n  box-shadow: 0 24px 70px rgba(15, 23, 42, 0.28);\n}\n.calendario-modal-header[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  gap: 16px;\n  align-items: flex-start;\n  padding: 20px 22px 14px;\n  border-bottom: 1px solid #e2e8f0;\n}\n.calendario-modal-header[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%] {\n  margin: 0;\n  color: var(--text-main);\n  font-size: 20px;\n}\n.calendario-modal-header[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n  margin: 6px 0 0;\n  color: var(--text-muted);\n  font-size: 13px;\n  text-transform: capitalize;\n}\n.modal-close[_ngcontent-%COMP%] {\n  display: inline-grid;\n  place-items: center;\n  width: 34px;\n  height: 34px;\n  border: 1px solid #dbe3ee;\n  border-radius: 10px;\n  background: #ffffff;\n  color: var(--text-muted);\n  font-size: 22px;\n  line-height: 1;\n  cursor: pointer;\n}\n.modal-close[_ngcontent-%COMP%]:hover {\n  border-color: #bfdbfe;\n  color: var(--text-main);\n}\n.calendario-form[_ngcontent-%COMP%] {\n  padding: 20px 22px 22px;\n}\n.calendario-form[_ngcontent-%COMP%]   textarea[_ngcontent-%COMP%] {\n  min-height: 130px;\n  resize: vertical;\n}\n.calendario-modal-actions[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: flex-end;\n  gap: 10px;\n  padding-top: 4px;\n}\n.calendario-pessoas-modal[_ngcontent-%COMP%] {\n  width: min(660px, 100%);\n}\n.calendario-person-form-row[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: minmax(0, 1fr) 112px auto;\n  gap: 12px;\n  align-items: end;\n}\n.calendario-color-field[_ngcontent-%COMP%]   input[type=color][_ngcontent-%COMP%] {\n  min-height: 42px;\n  padding: 4px;\n  cursor: pointer;\n}\n.calendario-person-save[_ngcontent-%COMP%] {\n  min-height: 42px;\n  white-space: nowrap;\n}\n.calendario-person-list[_ngcontent-%COMP%] {\n  display: grid;\n  gap: 8px;\n  padding: 0 22px 22px;\n}\n.calendario-person-row[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: 28px minmax(0, 1fr) auto auto;\n  gap: 8px;\n  align-items: center;\n  min-width: 0;\n  padding: 8px;\n  border: 1px solid #e2e8f0;\n  border-radius: 8px;\n  background: #f8fafc;\n}\n.calendario-person-color[_ngcontent-%COMP%] {\n  width: 22px;\n  height: 22px;\n  border: 1px solid rgba(15, 23, 42, 0.14);\n  border-radius: 999px;\n}\n.calendario-person-name[_ngcontent-%COMP%] {\n  min-width: 0;\n  color: var(--text-main);\n  font-size: 13px;\n  font-weight: 800;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n.btn.small[_ngcontent-%COMP%] {\n  min-height: 32px;\n  padding: 6px 10px;\n  font-size: 12px;\n}\n.empty-state.compact[_ngcontent-%COMP%] {\n  padding: 12px;\n}\n@media (max-width: 900px) {\n  .calendario-card[_ngcontent-%COMP%] {\n    padding: 14px;\n  }\n  .calendario-grid[_ngcontent-%COMP%] {\n    gap: 6px;\n  }\n  .calendario-day[_ngcontent-%COMP%] {\n    min-height: 88px;\n    padding: 7px;\n  }\n  .calendario-item[_ngcontent-%COMP%] {\n    padding: 4px 5px;\n    font-size: 10px;\n  }\n}\n@media (max-width: 640px) {\n  .calendario-header[_ngcontent-%COMP%] {\n    align-items: stretch;\n    flex-direction: column;\n  }\n  .calendario-header-actions[_ngcontent-%COMP%], \n   .calendario-month-field[_ngcontent-%COMP%] {\n    width: 100%;\n  }\n  .calendario-header-actions[_ngcontent-%COMP%] {\n    flex-direction: column;\n    align-items: stretch;\n  }\n  .calendario-person-button[_ngcontent-%COMP%] {\n    width: 100%;\n  }\n  .calendario-card[_ngcontent-%COMP%] {\n    padding: 12px;\n  }\n  .calendario-grid[_ngcontent-%COMP%] {\n    gap: 4px;\n  }\n  .calendario-weekday[_ngcontent-%COMP%] {\n    font-size: 10px;\n    padding-inline: 0;\n  }\n  .calendario-day[_ngcontent-%COMP%] {\n    min-height: 74px;\n    padding: 5px;\n    border-radius: 8px;\n  }\n  .calendario-day-number[_ngcontent-%COMP%] {\n    width: 22px;\n    height: 22px;\n    font-size: 12px;\n  }\n  .calendario-modal-backdrop[_ngcontent-%COMP%] {\n    padding: 14px;\n  }\n  .calendario-modal-actions[_ngcontent-%COMP%] {\n    flex-direction: column;\n  }\n  .calendario-person-form-row[_ngcontent-%COMP%], \n   .calendario-person-row[_ngcontent-%COMP%] {\n    grid-template-columns: 1fr;\n  }\n  .calendario-person-save[_ngcontent-%COMP%] {\n    width: 100%;\n  }\n  .calendario-person-color[_ngcontent-%COMP%] {\n    width: 100%;\n    height: 10px;\n    border-radius: 999px;\n  }\n}\n.calendario-card[_ngcontent-%COMP%] {\n  background:\n    linear-gradient(\n      180deg,\n      #ffffff 0%,\n      #f8fbff 100%);\n}\n.calendario-header[_ngcontent-%COMP%] {\n  margin-bottom: 16px;\n}\n.calendario-day[_ngcontent-%COMP%] {\n  border-color: #dce5f1;\n  border-radius: var(--radius-md);\n  background: #ffffff;\n  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.72);\n  transition:\n    border-color var(--transition-fast),\n    box-shadow var(--transition-fast),\n    background var(--transition-fast);\n}\n.calendario-day[_ngcontent-%COMP%]:hover:not(.is-empty) {\n  border-color: #93c5fd;\n  background: #f8fbff;\n  box-shadow: 0 8px 18px rgba(17, 24, 39, 0.06);\n}\n.calendario-day.is-empty[_ngcontent-%COMP%] {\n  background: #f3f6fa;\n}\n.calendario-weekday[_ngcontent-%COMP%] {\n  color: #53627a;\n}\n.calendario-item[_ngcontent-%COMP%] {\n  border-radius: 6px;\n  box-shadow: 0 1px 2px rgba(17, 24, 39, 0.08);\n}\n.calendario-modal[_ngcontent-%COMP%] {\n  border: 1px solid #dbe3ee;\n  border-radius: var(--radius-lg);\n}\n.calendario-person-row[_ngcontent-%COMP%] {\n  border-radius: var(--radius-md);\n  background: #ffffff;\n}\n@media (max-width: 640px) {\n  .calendario-card[_ngcontent-%COMP%] {\n    padding: 12px;\n  }\n  .calendario-header[_ngcontent-%COMP%] {\n    gap: 10px;\n    margin-bottom: 12px;\n  }\n  .calendario-grid[_ngcontent-%COMP%] {\n    gap: 3px;\n  }\n  .calendario-weekday[_ngcontent-%COMP%] {\n    font-size: 9px;\n  }\n  .calendario-day[_ngcontent-%COMP%] {\n    min-height: clamp(76px, 16vw, 96px);\n    padding: 4px;\n  }\n  .calendario-day-number[_ngcontent-%COMP%] {\n    width: 20px;\n    height: 20px;\n    font-size: 11px;\n  }\n  .calendario-day-items[_ngcontent-%COMP%] {\n    gap: 3px;\n  }\n  .calendario-item[_ngcontent-%COMP%] {\n    min-height: 22px;\n    padding: 3px 4px;\n    font-size: 9px;\n    line-height: 1.2;\n  }\n  .calendario-item-person[_ngcontent-%COMP%] {\n    display: none;\n  }\n  .calendario-modal-backdrop[_ngcontent-%COMP%] {\n    align-items: end;\n    place-items: end center;\n    padding: 10px;\n  }\n  .calendario-modal[_ngcontent-%COMP%], \n   .calendario-pessoas-modal[_ngcontent-%COMP%] {\n    width: 100%;\n    max-height: calc(100dvh - 20px);\n  }\n  .calendario-modal-header[_ngcontent-%COMP%], \n   .calendario-form[_ngcontent-%COMP%], \n   .calendario-person-list[_ngcontent-%COMP%] {\n    padding-inline: 16px;\n  }\n}\n/*# sourceMappingURL=calendario.component.css.map */"], changeDetection: 0 });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(CalendarioComponent, [{
    type: Component,
    args: [{ selector: "app-calendario", standalone: true, imports: [CommonModule, FormsModule], changeDetection: ChangeDetectionStrategy.OnPush, template: `<section class="page-section calendario-page" *ngIf="vm$ | async as vm">
  <article class="card calendario-card">
    <div class="card-title-row calendario-header">
      <div>
        <h3 class="card-title">{{ vm.tituloMes }}</h3>
        <p class="card-subtitle">Clique em um dia para registrar o que sera feito.</p>
      </div>
      <div class="calendario-header-actions">
        <label class="field calendario-month-field" for="calendarioMes">
          <select
            id="calendarioMes"
            name="calendarioMes"
            [(ngModel)]="mesSelecionado"
            (ngModelChange)="onMesChange()"
          >
            <option *ngFor="let mes of mesesOptions" [value]="mes.valor">
              {{ mes.label }}
            </option>
          </select>
        </label>
        <button class="btn secondary calendario-person-button" type="button" (click)="abrirModalPessoas()">
          Cadastrar pessoa
        </button>
      </div>
    </div>

    <div class="skeleton" style="min-height: 360px;" *ngIf="vm.carregando && vm.dias.length === 0"></div>
    <div class="empty-state" *ngIf="!!vm.erro">{{ vm.erro }}</div>
    <div class="empty-state" *ngIf="!vm.erro && !!vm.erroPessoas">{{ vm.erroPessoas }}</div>

    <div class="calendario-grid" *ngIf="!vm.erro">
      <div class="calendario-weekday" *ngFor="let diaSemana of diasSemana">
        {{ diaSemana }}
      </div>

      <div
        class="calendario-day"
        *ngFor="let dia of vm.dias; trackBy: trackByDia"
        [class.is-empty]="dia.foraDoMes"
        [class.is-today]="dia.hoje"
        [attr.role]="dia.foraDoMes ? null : 'button'"
        [attr.tabindex]="dia.foraDoMes ? -1 : 0"
        [attr.aria-disabled]="dia.foraDoMes"
        (click)="abrirNovoItem(dia)"
        (keydown.enter)="abrirNovoItem(dia)"
        (keydown.space)="abrirNovoItem(dia); $event.preventDefault()"
      >
        <span class="calendario-day-number" *ngIf="dia.numero">{{ dia.numero }}</span>

        <span class="calendario-day-items" *ngIf="dia.itens.length > 0">
          <button
            class="calendario-item"
            type="button"
            *ngFor="let item of dia.itens; trackBy: trackByItem"
            [ngStyle]="getItemStyle(item, vm.pessoas)"
            (click)="abrirEdicao(item); $event.stopPropagation()"
          >
            <span class="calendario-item-person" *ngIf="getPessoaNome(item, vm.pessoas)">
              {{ getPessoaNome(item, vm.pessoas) }}
            </span>
            {{ item.titulo }}
          </button>
        </span>
      </div>
    </div>
  </article>

  <div class="calendario-modal-backdrop" *ngIf="modalAberto" (click)="fecharModal()">
    <section class="calendario-modal" role="dialog" aria-modal="true" (click)="$event.stopPropagation()">
      <header class="calendario-modal-header">
        <div>
          <h3>{{ getTituloModal() }}</h3>
          <p>{{ getDataSelecionadaLabel() }}</p>
        </div>
        <button class="modal-close" type="button" (click)="fecharModal()" aria-label="Fechar">
          x
        </button>
      </header>

      <form class="form calendario-form" (ngSubmit)="salvarItem()">
        <label>
          <span>O que sera feito</span>
          <input
            name="tituloCalendario"
            type="text"
            [(ngModel)]="form.titulo"
            placeholder="Ex: Revisar pendencias do sistema"
            required
          />
        </label>

        <label>
          <span>Pessoa</span>
          <select name="pessoaCalendario" [(ngModel)]="form.pessoaId">
            <option [ngValue]="null">Sem pessoa</option>
            <option *ngFor="let pessoa of vm.pessoas; trackBy: trackByPessoa" [ngValue]="pessoa.id">
              {{ pessoa.nome }}
            </option>
          </select>
        </label>

        <label>
          <span>Detalhes</span>
          <textarea
            name="descricaoCalendario"
            rows="5"
            [(ngModel)]="form.descricao"
            placeholder="Observacoes, contexto ou proximos passos"
          ></textarea>
        </label>

        <div class="calendario-modal-actions">
          <button
            class="btn danger"
            type="button"
            *ngIf="!!itemEditandoId"
            (click)="excluirItem()"
            [disabled]="salvando || excluindo"
          >
            {{ getExcluirLabel() }}
          </button>
          <button class="btn secondary" type="button" (click)="fecharModal()" [disabled]="salvando || excluindo">
            Cancelar
          </button>
          <button class="btn primary" type="submit" [disabled]="salvando || excluindo">
            {{ getSalvarLabel() }}
          </button>
        </div>
      </form>
    </section>
  </div>

  <div class="calendario-modal-backdrop" *ngIf="pessoasModalAberto" (click)="fecharModalPessoas()">
    <section class="calendario-modal calendario-pessoas-modal" role="dialog" aria-modal="true" (click)="$event.stopPropagation()">
      <header class="calendario-modal-header">
        <div>
          <h3>{{ getTituloModalPessoas() }}</h3>
          <p>Cadastre as pessoas usadas nas anotacoes do calendario.</p>
        </div>
        <button class="modal-close" type="button" (click)="fecharModalPessoas()" aria-label="Fechar">
          x
        </button>
      </header>

      <form class="form calendario-form" (ngSubmit)="salvarPessoa()">
        <div class="calendario-person-form-row">
          <label>
            <span>Nome</span>
            <input
              name="nomePessoaCalendario"
              type="text"
              [(ngModel)]="pessoaForm.nome"
              placeholder="Ex: Fabiola"
              required
            />
          </label>

          <label class="calendario-color-field">
            <span>Cor</span>
            <input name="corPessoaCalendario" type="color" [(ngModel)]="pessoaForm.cor" />
          </label>

          <button class="btn primary calendario-person-save" type="submit" [disabled]="salvandoPessoa">
            {{ getPessoaSalvarLabel() }}
          </button>
        </div>

        <div class="calendario-modal-actions">
          <button
            class="btn secondary"
            type="button"
            *ngIf="!!pessoaEditandoId"
            (click)="cancelarEdicaoPessoa()"
            [disabled]="salvandoPessoa"
          >
            Cancelar edicao
          </button>
        </div>
      </form>

      <div class="calendario-person-list">
        <div class="empty-state compact" *ngIf="vm.pessoas.length === 0">
          Nenhuma pessoa cadastrada.
        </div>

        <div class="calendario-person-row" *ngFor="let pessoa of vm.pessoas; trackBy: trackByPessoa">
          <span class="calendario-person-color" [style.background]="pessoa.cor"></span>
          <span class="calendario-person-name">{{ pessoa.nome }}</span>
          <button class="btn secondary small" type="button" (click)="editarPessoa(pessoa)">
            Editar
          </button>
          <button
            class="btn danger small"
            type="button"
            (click)="excluirPessoa(pessoa)"
            [disabled]="excluindoPessoaId === pessoa.id"
          >
            {{ excluindoPessoaId === pessoa.id ? "Excluindo..." : "Excluir" }}
          </button>
        </div>
      </div>
    </section>
  </div>
</section>
`, styles: ["/* src/app/pages/calendario/calendario.component.css */\n.calendario-page {\n  display: grid;\n  min-width: 0;\n}\n.calendario-card {\n  min-width: 0;\n  padding: 18px;\n}\n.calendario-card:hover {\n  transform: none;\n}\n.calendario-header {\n  align-items: center;\n}\n.calendario-header-actions {\n  display: flex;\n  justify-content: flex-end;\n  align-items: center;\n  gap: 10px;\n}\n.calendario-month-field {\n  width: 190px;\n  margin: 0;\n}\n.calendario-month-field select {\n  width: 100%;\n}\n.calendario-person-button {\n  align-self: center;\n  white-space: nowrap;\n}\n.calendario-grid {\n  display: grid;\n  grid-template-columns: repeat(7, minmax(0, 1fr));\n  gap: 8px;\n  min-width: 0;\n}\n.calendario-weekday {\n  min-width: 0;\n  padding: 0 4px 4px;\n  color: var(--text-muted);\n  font-size: 12px;\n  font-weight: 800;\n  text-align: center;\n  text-transform: uppercase;\n}\n.calendario-day {\n  min-width: 0;\n  min-height: clamp(92px, calc((100vh - 250px) / 5), 136px);\n  padding: 9px;\n  border: 1px solid #dbe3ee;\n  border-radius: 10px;\n  background: #ffffff;\n  color: var(--text-main);\n  text-align: left;\n  cursor: pointer;\n  overflow: hidden;\n  display: flex;\n  flex-direction: column;\n  gap: 7px;\n}\n.calendario-day:hover:not(.is-empty) {\n  border-color: #93c5fd;\n  background: #f8fbff;\n}\n.calendario-day:focus-visible,\n.calendario-item:focus-visible {\n  outline: 3px solid rgba(37, 99, 235, 0.22);\n  outline-offset: 2px;\n}\n.calendario-day[aria-disabled=true] {\n  cursor: default;\n}\n.calendario-day.is-empty {\n  background: #f8fafc;\n  border-style: dashed;\n  opacity: 0.65;\n}\n.calendario-day.is-today {\n  border-color: var(--primary-500);\n  box-shadow: inset 0 0 0 1px rgba(37, 99, 235, 0.20);\n}\n.calendario-day-number {\n  display: inline-grid;\n  place-items: center;\n  width: 26px;\n  height: 26px;\n  border-radius: 999px;\n  font-size: 13px;\n  font-weight: 900;\n}\n.calendario-day.is-today .calendario-day-number {\n  background: var(--primary-500);\n  color: #ffffff;\n}\n.calendario-day-items {\n  min-width: 0;\n  display: grid;\n  gap: 5px;\n  overflow: hidden;\n}\n.calendario-item {\n  min-width: 0;\n  max-width: 100%;\n  padding: 5px 7px;\n  border: 1px solid var(--cal-person-color, #bfdbfe);\n  border-radius: 7px;\n  background: color-mix(in srgb, var(--cal-person-color, #2563eb) 14%, #ffffff);\n  color: #0f172a;\n  font-size: 11px;\n  font-weight: 800;\n  line-height: 1.25;\n  text-align: left;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  cursor: pointer;\n}\n.calendario-item:hover {\n  filter: brightness(0.96);\n}\n.calendario-item-person {\n  display: block;\n  min-width: 0;\n  max-width: 100%;\n  margin-bottom: 1px;\n  font-size: 9px;\n  font-weight: 900;\n  opacity: 0.78;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  text-transform: uppercase;\n  white-space: nowrap;\n}\n.calendario-modal-backdrop {\n  position: fixed;\n  inset: 0;\n  z-index: 50;\n  display: grid;\n  place-items: center;\n  padding: 24px;\n  background: rgba(15, 23, 42, 0.48);\n}\n.calendario-modal {\n  width: min(560px, 100%);\n  max-height: calc(100dvh - 48px);\n  overflow: auto;\n  border-radius: 14px;\n  background: #ffffff;\n  box-shadow: 0 24px 70px rgba(15, 23, 42, 0.28);\n}\n.calendario-modal-header {\n  display: flex;\n  justify-content: space-between;\n  gap: 16px;\n  align-items: flex-start;\n  padding: 20px 22px 14px;\n  border-bottom: 1px solid #e2e8f0;\n}\n.calendario-modal-header h3 {\n  margin: 0;\n  color: var(--text-main);\n  font-size: 20px;\n}\n.calendario-modal-header p {\n  margin: 6px 0 0;\n  color: var(--text-muted);\n  font-size: 13px;\n  text-transform: capitalize;\n}\n.modal-close {\n  display: inline-grid;\n  place-items: center;\n  width: 34px;\n  height: 34px;\n  border: 1px solid #dbe3ee;\n  border-radius: 10px;\n  background: #ffffff;\n  color: var(--text-muted);\n  font-size: 22px;\n  line-height: 1;\n  cursor: pointer;\n}\n.modal-close:hover {\n  border-color: #bfdbfe;\n  color: var(--text-main);\n}\n.calendario-form {\n  padding: 20px 22px 22px;\n}\n.calendario-form textarea {\n  min-height: 130px;\n  resize: vertical;\n}\n.calendario-modal-actions {\n  display: flex;\n  justify-content: flex-end;\n  gap: 10px;\n  padding-top: 4px;\n}\n.calendario-pessoas-modal {\n  width: min(660px, 100%);\n}\n.calendario-person-form-row {\n  display: grid;\n  grid-template-columns: minmax(0, 1fr) 112px auto;\n  gap: 12px;\n  align-items: end;\n}\n.calendario-color-field input[type=color] {\n  min-height: 42px;\n  padding: 4px;\n  cursor: pointer;\n}\n.calendario-person-save {\n  min-height: 42px;\n  white-space: nowrap;\n}\n.calendario-person-list {\n  display: grid;\n  gap: 8px;\n  padding: 0 22px 22px;\n}\n.calendario-person-row {\n  display: grid;\n  grid-template-columns: 28px minmax(0, 1fr) auto auto;\n  gap: 8px;\n  align-items: center;\n  min-width: 0;\n  padding: 8px;\n  border: 1px solid #e2e8f0;\n  border-radius: 8px;\n  background: #f8fafc;\n}\n.calendario-person-color {\n  width: 22px;\n  height: 22px;\n  border: 1px solid rgba(15, 23, 42, 0.14);\n  border-radius: 999px;\n}\n.calendario-person-name {\n  min-width: 0;\n  color: var(--text-main);\n  font-size: 13px;\n  font-weight: 800;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n.btn.small {\n  min-height: 32px;\n  padding: 6px 10px;\n  font-size: 12px;\n}\n.empty-state.compact {\n  padding: 12px;\n}\n@media (max-width: 900px) {\n  .calendario-card {\n    padding: 14px;\n  }\n  .calendario-grid {\n    gap: 6px;\n  }\n  .calendario-day {\n    min-height: 88px;\n    padding: 7px;\n  }\n  .calendario-item {\n    padding: 4px 5px;\n    font-size: 10px;\n  }\n}\n@media (max-width: 640px) {\n  .calendario-header {\n    align-items: stretch;\n    flex-direction: column;\n  }\n  .calendario-header-actions,\n  .calendario-month-field {\n    width: 100%;\n  }\n  .calendario-header-actions {\n    flex-direction: column;\n    align-items: stretch;\n  }\n  .calendario-person-button {\n    width: 100%;\n  }\n  .calendario-card {\n    padding: 12px;\n  }\n  .calendario-grid {\n    gap: 4px;\n  }\n  .calendario-weekday {\n    font-size: 10px;\n    padding-inline: 0;\n  }\n  .calendario-day {\n    min-height: 74px;\n    padding: 5px;\n    border-radius: 8px;\n  }\n  .calendario-day-number {\n    width: 22px;\n    height: 22px;\n    font-size: 12px;\n  }\n  .calendario-modal-backdrop {\n    padding: 14px;\n  }\n  .calendario-modal-actions {\n    flex-direction: column;\n  }\n  .calendario-person-form-row,\n  .calendario-person-row {\n    grid-template-columns: 1fr;\n  }\n  .calendario-person-save {\n    width: 100%;\n  }\n  .calendario-person-color {\n    width: 100%;\n    height: 10px;\n    border-radius: 999px;\n  }\n}\n.calendario-card {\n  background:\n    linear-gradient(\n      180deg,\n      #ffffff 0%,\n      #f8fbff 100%);\n}\n.calendario-header {\n  margin-bottom: 16px;\n}\n.calendario-day {\n  border-color: #dce5f1;\n  border-radius: var(--radius-md);\n  background: #ffffff;\n  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.72);\n  transition:\n    border-color var(--transition-fast),\n    box-shadow var(--transition-fast),\n    background var(--transition-fast);\n}\n.calendario-day:hover:not(.is-empty) {\n  border-color: #93c5fd;\n  background: #f8fbff;\n  box-shadow: 0 8px 18px rgba(17, 24, 39, 0.06);\n}\n.calendario-day.is-empty {\n  background: #f3f6fa;\n}\n.calendario-weekday {\n  color: #53627a;\n}\n.calendario-item {\n  border-radius: 6px;\n  box-shadow: 0 1px 2px rgba(17, 24, 39, 0.08);\n}\n.calendario-modal {\n  border: 1px solid #dbe3ee;\n  border-radius: var(--radius-lg);\n}\n.calendario-person-row {\n  border-radius: var(--radius-md);\n  background: #ffffff;\n}\n@media (max-width: 640px) {\n  .calendario-card {\n    padding: 12px;\n  }\n  .calendario-header {\n    gap: 10px;\n    margin-bottom: 12px;\n  }\n  .calendario-grid {\n    gap: 3px;\n  }\n  .calendario-weekday {\n    font-size: 9px;\n  }\n  .calendario-day {\n    min-height: clamp(76px, 16vw, 96px);\n    padding: 4px;\n  }\n  .calendario-day-number {\n    width: 20px;\n    height: 20px;\n    font-size: 11px;\n  }\n  .calendario-day-items {\n    gap: 3px;\n  }\n  .calendario-item {\n    min-height: 22px;\n    padding: 3px 4px;\n    font-size: 9px;\n    line-height: 1.2;\n  }\n  .calendario-item-person {\n    display: none;\n  }\n  .calendario-modal-backdrop {\n    align-items: end;\n    place-items: end center;\n    padding: 10px;\n  }\n  .calendario-modal,\n  .calendario-pessoas-modal {\n    width: 100%;\n    max-height: calc(100dvh - 20px);\n  }\n  .calendario-modal-header,\n  .calendario-form,\n  .calendario-person-list {\n    padding-inline: 16px;\n  }\n}\n/*# sourceMappingURL=calendario.component.css.map */\n"] }]
  }], () => [{ type: CalendarioService }, { type: ToastService }, { type: ChangeDetectorRef }], null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(CalendarioComponent, { className: "CalendarioComponent", filePath: "src/app/pages/calendario/calendario.component.ts", lineNumber: 46 });
})();
export {
  CalendarioComponent
};
//# sourceMappingURL=chunk-HISOSW2O.js.map
