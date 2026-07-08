import {
  EmpresasService
} from "./chunk-E7I6VKBJ.js";
import {
  SistemasService
} from "./chunk-KBJR2FPL.js";
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
  ɵɵclassMap,
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
  ɵɵtemplate,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵtextInterpolate1,
  ɵɵtextInterpolate2,
  ɵɵtwoWayBindingSet,
  ɵɵtwoWayListener,
  ɵɵtwoWayProperty
} from "./chunk-SRMKRKBP.js";
import {
  __spreadProps,
  __spreadValues
} from "./chunk-GOMI4DH3.js";

// src/app/services/tarefas.service.ts
var TarefasService = class _TarefasService {
  firebase;
  auth;
  zone;
  tarefasStateSubject = new BehaviorSubject({
    status: "loading",
    data: [],
    error: null
  });
  tarefasState$ = this.tarefasStateSubject.asObservable();
  tarefas$ = this.tarefasState$.pipe(map((state) => state.data));
  unsubscribeTarefas;
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
  async createTarefa(data) {
    const uid = this.getUidOrThrow();
    const payload = {
      titulo: data.titulo.trim(),
      descricao: data.descricao.trim(),
      empresaId: data.empresaId.trim(),
      nomeEmpresa: data.nomeEmpresa.trim(),
      clienteId: data.clienteId.trim(),
      nomeCliente: data.nomeCliente.trim(),
      sistemaId: data.sistemaId.trim(),
      nomeSistema: data.nomeSistema.trim(),
      status: data.status,
      prioridade: data.prioridade,
      prazo: data.prazo.trim(),
      dataCriacao: serverTimestamp(),
      dataAtualizacao: serverTimestamp()
    };
    const ref = await addDoc(this.getTarefasCol(uid), payload);
    const now = Timestamp.now();
    this.applyLocalUpsert(__spreadProps(__spreadValues({
      id: ref.id
    }, payload), {
      dataCriacao: now,
      dataAtualizacao: now
    }));
    return ref.id;
  }
  async updateTarefa(id, data) {
    const uid = this.getUidOrThrow();
    const ref = doc(this.firebase.db, "users", uid, "tarefas", id);
    const patch = {
      titulo: data.titulo.trim(),
      descricao: data.descricao.trim(),
      empresaId: data.empresaId.trim(),
      nomeEmpresa: data.nomeEmpresa.trim(),
      clienteId: data.clienteId.trim(),
      nomeCliente: data.nomeCliente.trim(),
      sistemaId: data.sistemaId.trim(),
      nomeSistema: data.nomeSistema.trim(),
      status: data.status,
      prioridade: data.prioridade,
      prazo: data.prazo.trim(),
      dataAtualizacao: serverTimestamp()
    };
    await updateDoc(ref, patch);
    this.applyLocalPatch(id, __spreadProps(__spreadValues({}, patch), {
      dataAtualizacao: Timestamp.now()
    }));
  }
  async deleteTarefa(id) {
    const uid = this.getUidOrThrow();
    const ref = doc(this.firebase.db, "users", uid, "tarefas", id);
    await deleteDoc(ref);
    this.applyLocalRemove(id);
  }
  getTarefasCol(uid) {
    return collection(this.firebase.db, "users", uid, "tarefas");
  }
  getUidOrThrow() {
    const uid = this.auth.getUid();
    if (!uid) {
      throw new Error("Fa\xE7a login.");
    }
    return uid;
  }
  handleAuthChange(authState) {
    if (authState.status === "loading") {
      this.emitState({
        status: "loading",
        data: this.tarefasStateSubject.value.data,
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
    this.unsubscribeTarefas = onSnapshot(this.getTarefasCol(uid), (snapshot) => {
      const items = snapshot.docs.map((docSnap) => __spreadValues({
        id: docSnap.id
      }, this.normalizeTarefa(docSnap.data())));
      this.emitState({
        status: "ready",
        data: items,
        error: null
      });
    }, (error) => {
      console.error("Erro ao escutar tarefas", error);
      this.emitState({
        status: "error",
        data: [],
        error: this.toErrorMessage(error)
      });
    });
  }
  stopListener() {
    if (this.unsubscribeTarefas) {
      this.unsubscribeTarefas();
      this.unsubscribeTarefas = void 0;
    }
    this.currentUid = null;
  }
  emitState(state) {
    this.zone.run(() => this.tarefasStateSubject.next(state));
  }
  applyLocalUpsert(tarefa) {
    const current = this.tarefasStateSubject.value;
    const filtered = current.data.filter((item) => item.id !== tarefa.id);
    this.emitState(__spreadProps(__spreadValues({}, current), {
      data: [...filtered, tarefa]
    }));
  }
  applyLocalPatch(id, patch) {
    const current = this.tarefasStateSubject.value;
    this.emitState(__spreadProps(__spreadValues({}, current), {
      data: current.data.map((item) => item.id === id ? __spreadValues(__spreadValues({}, item), patch) : item)
    }));
  }
  applyLocalRemove(id) {
    const current = this.tarefasStateSubject.value;
    this.emitState(__spreadProps(__spreadValues({}, current), {
      data: current.data.filter((item) => item.id !== id)
    }));
  }
  normalizeTarefa(tarefa) {
    const dataCriacao = this.getTimestamp(tarefa.dataCriacao);
    const dataAtualizacao = this.getTimestamp(tarefa.dataAtualizacao) ?? dataCriacao;
    return __spreadProps(__spreadValues({}, tarefa), {
      titulo: tarefa.titulo || "",
      descricao: tarefa.descricao || "",
      empresaId: tarefa.empresaId || "",
      nomeEmpresa: tarefa.nomeEmpresa || "",
      clienteId: tarefa.clienteId || "",
      nomeCliente: tarefa.nomeCliente || "",
      sistemaId: tarefa.sistemaId || "",
      nomeSistema: tarefa.nomeSistema || "",
      status: this.normalizeStatus(tarefa.status),
      prioridade: this.normalizePrioridade(tarefa.prioridade),
      prazo: tarefa.prazo || "",
      dataCriacao,
      dataAtualizacao
    });
  }
  normalizeStatus(status) {
    return status === "andamento" || status === "concluida" || status === "pendente" ? status : "pendente";
  }
  normalizePrioridade(prioridade) {
    return prioridade === "baixa" || prioridade === "alta" || prioridade === "media" ? prioridade : "media";
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
    return "Erro ao carregar tarefas.";
  }
  static \u0275fac = function TarefasService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _TarefasService)(\u0275\u0275inject(FirebaseService), \u0275\u0275inject(AuthService), \u0275\u0275inject(NgZone));
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _TarefasService, factory: _TarefasService.\u0275fac, providedIn: "root" });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(TarefasService, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], () => [{ type: FirebaseService }, { type: AuthService }, { type: NgZone }], null);
})();

// src/app/pages/afazer/afazer.component.ts
function AfazerComponent_section_0_div_17_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "div", 9);
  }
}
function AfazerComponent_section_0_article_18_div_14_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 20);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const vm_r3 = \u0275\u0275nextContext(2).ngIf;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(vm_r3.erro);
  }
}
function AfazerComponent_section_0_article_18_div_15_div_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 20);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const vm_r3 = \u0275\u0275nextContext(3).ngIf;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", vm_r3.mensagemVazia, " ");
  }
}
function AfazerComponent_section_0_article_18_div_15_article_2_p_12_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "p", 37);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const tarefa_r5 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(tarefa_r5.descricao);
  }
}
function AfazerComponent_section_0_article_18_div_15_article_2_span_14_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span");
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const tarefa_r5 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("Empresa: ", tarefa_r5.nomeEmpresa);
  }
}
function AfazerComponent_section_0_article_18_div_15_article_2_span_15_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span");
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const tarefa_r5 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("Cliente: ", tarefa_r5.nomeCliente);
  }
}
function AfazerComponent_section_0_article_18_div_15_article_2_span_16_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span");
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const tarefa_r5 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("Sistema: ", tarefa_r5.nomeSistema);
  }
}
function AfazerComponent_section_0_article_18_div_15_article_2_span_17_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span");
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const tarefa_r5 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("Atualizada em ", tarefa_r5.dataLabel);
  }
}
function AfazerComponent_section_0_article_18_div_15_article_2_button_19_Template(rf, ctx) {
  if (rf & 1) {
    const _r6 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 38);
    \u0275\u0275listener("click", function AfazerComponent_section_0_article_18_div_15_article_2_button_19_Template_button_click_0_listener() {
      \u0275\u0275restoreView(_r6);
      const tarefa_r5 = \u0275\u0275nextContext().$implicit;
      const ctx_r1 = \u0275\u0275nextContext(4);
      return \u0275\u0275resetView(ctx_r1.concluirTarefa(tarefa_r5));
    });
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const tarefa_r5 = \u0275\u0275nextContext().$implicit;
    const ctx_r1 = \u0275\u0275nextContext(4);
    \u0275\u0275property("disabled", ctx_r1.concluindoId === tarefa_r5.id);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", ctx_r1.getConcluirLabel(tarefa_r5), " ");
  }
}
function AfazerComponent_section_0_article_18_div_15_article_2_button_20_Template(rf, ctx) {
  if (rf & 1) {
    const _r7 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 38);
    \u0275\u0275listener("click", function AfazerComponent_section_0_article_18_div_15_article_2_button_20_Template_button_click_0_listener() {
      \u0275\u0275restoreView(_r7);
      const tarefa_r5 = \u0275\u0275nextContext().$implicit;
      const ctx_r1 = \u0275\u0275nextContext(4);
      return \u0275\u0275resetView(ctx_r1.voltarParaPendente(tarefa_r5));
    });
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const tarefa_r5 = \u0275\u0275nextContext().$implicit;
    const ctx_r1 = \u0275\u0275nextContext(4);
    \u0275\u0275property("disabled", ctx_r1.reabrindoId === tarefa_r5.id);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", ctx_r1.getVoltarPendenteLabel(tarefa_r5), " ");
  }
}
function AfazerComponent_section_0_article_18_div_15_article_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r4 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "article", 23)(1, "aside", 24)(2, "span", 25);
    \u0275\u0275text(3, "Status");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "strong", 26);
    \u0275\u0275text(5);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "span", 27);
    \u0275\u0275text(7);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(8, "div", 28)(9, "div", 29)(10, "h4");
    \u0275\u0275text(11);
    \u0275\u0275elementEnd()();
    \u0275\u0275template(12, AfazerComponent_section_0_article_18_div_15_article_2_p_12_Template, 2, 1, "p", 30);
    \u0275\u0275elementStart(13, "div", 31);
    \u0275\u0275template(14, AfazerComponent_section_0_article_18_div_15_article_2_span_14_Template, 2, 1, "span", 32)(15, AfazerComponent_section_0_article_18_div_15_article_2_span_15_Template, 2, 1, "span", 32)(16, AfazerComponent_section_0_article_18_div_15_article_2_span_16_Template, 2, 1, "span", 32)(17, AfazerComponent_section_0_article_18_div_15_article_2_span_17_Template, 2, 1, "span", 32);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(18, "div", 33);
    \u0275\u0275template(19, AfazerComponent_section_0_article_18_div_15_article_2_button_19_Template, 2, 2, "button", 34)(20, AfazerComponent_section_0_article_18_div_15_article_2_button_20_Template, 2, 2, "button", 34);
    \u0275\u0275elementStart(21, "button", 35);
    \u0275\u0275listener("click", function AfazerComponent_section_0_article_18_div_15_article_2_Template_button_click_21_listener() {
      const tarefa_r5 = \u0275\u0275restoreView(_r4).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(4);
      return \u0275\u0275resetView(ctx_r1.abrirModalEditarTarefa(tarefa_r5));
    });
    \u0275\u0275text(22, " Editar ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(23, "button", 36);
    \u0275\u0275listener("click", function AfazerComponent_section_0_article_18_div_15_article_2_Template_button_click_23_listener() {
      const tarefa_r5 = \u0275\u0275restoreView(_r4).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(4);
      return \u0275\u0275resetView(ctx_r1.excluirTarefa(tarefa_r5));
    });
    \u0275\u0275text(24);
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const tarefa_r5 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext(4);
    \u0275\u0275classProp("tarefa-concluida", tarefa_r5.status === "concluida");
    \u0275\u0275advance(4);
    \u0275\u0275classMap("status-text-" + tarefa_r5.status);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", tarefa_r5.statusLabel, " ");
    \u0275\u0275advance();
    \u0275\u0275classMap("prioridade-text-" + tarefa_r5.prioridade);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" Prioridade ", tarefa_r5.prioridadeLabel, " ");
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate(tarefa_r5.titulo);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", !!tarefa_r5.descricao);
    \u0275\u0275advance(2);
    \u0275\u0275property("ngIf", !!tarefa_r5.nomeEmpresa);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", !!tarefa_r5.nomeCliente);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", !!tarefa_r5.nomeSistema);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", !!tarefa_r5.dataLabel);
    \u0275\u0275advance(2);
    \u0275\u0275property("ngIf", tarefa_r5.status !== "concluida");
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", tarefa_r5.status === "concluida");
    \u0275\u0275advance(3);
    \u0275\u0275property("disabled", ctx_r1.excluindoId === tarefa_r5.id);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", ctx_r1.getExcluirLabel(tarefa_r5), " ");
  }
}
function AfazerComponent_section_0_article_18_div_15_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 21);
    \u0275\u0275template(1, AfazerComponent_section_0_article_18_div_15_div_1_Template, 2, 1, "div", 18)(2, AfazerComponent_section_0_article_18_div_15_article_2_Template, 25, 18, "article", 22);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const vm_r3 = \u0275\u0275nextContext(2).ngIf;
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", vm_r3.tarefas.length === 0);
    \u0275\u0275advance();
    \u0275\u0275property("ngForOf", vm_r3.tarefas)("ngForTrackBy", ctx_r1.trackByTarefa);
  }
}
function AfazerComponent_section_0_article_18_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "article", 10)(1, "div", 11)(2, "div")(3, "h3", 12);
    \u0275\u0275text(4);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "p", 13);
    \u0275\u0275text(6);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(7, "div", 14)(8, "button", 15);
    \u0275\u0275listener("click", function AfazerComponent_section_0_article_18_Template_button_click_8_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.abrirModalNovaTarefa());
    });
    \u0275\u0275text(9, " Nova tarefa ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(10, "button", 16);
    \u0275\u0275listener("click", function AfazerComponent_section_0_article_18_Template_button_click_10_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.alternarTarefasConcluidas());
    });
    \u0275\u0275text(11);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(12, "span", 17);
    \u0275\u0275text(13);
    \u0275\u0275elementEnd()()();
    \u0275\u0275template(14, AfazerComponent_section_0_article_18_div_14_Template, 2, 1, "div", 18)(15, AfazerComponent_section_0_article_18_div_15_Template, 3, 3, "div", 19);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const vm_r3 = \u0275\u0275nextContext().ngIf;
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate(vm_r3.tituloLista);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(vm_r3.subtituloLista);
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate1(" ", vm_r3.mostrandoConcluidas ? "Ver tarefas a fazer" : "Ver conclu\xEDdas", " ");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate2(" ", vm_r3.tarefas.length, " tarefa", vm_r3.tarefas.length === 1 ? "" : "s", " ");
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", !!vm_r3.erro);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", !vm_r3.erro);
  }
}
function AfazerComponent_section_0_div_19_div_19_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 58);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const vm_r3 = \u0275\u0275nextContext(2).ngIf;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(vm_r3.vinculosErro);
  }
}
function AfazerComponent_section_0_div_19_option_23_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "option", 59);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const empresa_r9 = ctx.$implicit;
    \u0275\u0275property("value", empresa_r9.id);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", empresa_r9.nomeEmpresa, " ");
  }
}
function AfazerComponent_section_0_div_19_div_27_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 58);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(ctx_r1.funcionariosErro);
  }
}
function AfazerComponent_section_0_div_19_option_31_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "option", 59);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const funcionario_r10 = ctx.$implicit;
    \u0275\u0275property("value", funcionario_r10.id);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", funcionario_r10.nomeFuncionario, " ");
  }
}
function AfazerComponent_section_0_div_19_option_38_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "option", 59);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const sistema_r11 = ctx.$implicit;
    \u0275\u0275property("value", sistema_r11.id);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", sistema_r11.nome, " ");
  }
}
function AfazerComponent_section_0_div_19_option_43_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "option", 60);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const item_r12 = ctx.$implicit;
    \u0275\u0275property("ngValue", item_r12.valor);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", item_r12.label, " ");
  }
}
function AfazerComponent_section_0_div_19_Template(rf, ctx) {
  if (rf & 1) {
    const _r8 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 39);
    \u0275\u0275listener("click", function AfazerComponent_section_0_div_19_Template_div_click_0_listener() {
      \u0275\u0275restoreView(_r8);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.fecharModal());
    });
    \u0275\u0275elementStart(1, "section", 40);
    \u0275\u0275listener("click", function AfazerComponent_section_0_div_19_Template_section_click_1_listener($event) {
      \u0275\u0275restoreView(_r8);
      return \u0275\u0275resetView($event.stopPropagation());
    });
    \u0275\u0275elementStart(2, "header", 41)(3, "div")(4, "h3");
    \u0275\u0275text(5);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "p");
    \u0275\u0275text(7, "Defina os dados principais da tarefa.");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(8, "button", 42);
    \u0275\u0275listener("click", function AfazerComponent_section_0_div_19_Template_button_click_8_listener() {
      \u0275\u0275restoreView(_r8);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.fecharModal());
    });
    \u0275\u0275text(9, " \xD7 ");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(10, "form", 43);
    \u0275\u0275listener("ngSubmit", function AfazerComponent_section_0_div_19_Template_form_ngSubmit_10_listener() {
      \u0275\u0275restoreView(_r8);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.salvarTarefa());
    });
    \u0275\u0275elementStart(11, "label")(12, "span");
    \u0275\u0275text(13, "T\xEDtulo");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(14, "input", 44);
    \u0275\u0275twoWayListener("ngModelChange", function AfazerComponent_section_0_div_19_Template_input_ngModelChange_14_listener($event) {
      \u0275\u0275restoreView(_r8);
      const ctx_r1 = \u0275\u0275nextContext(2);
      \u0275\u0275twoWayBindingSet(ctx_r1.form.titulo, $event) || (ctx_r1.form.titulo = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(15, "div", 45)(16, "label")(17, "span");
    \u0275\u0275text(18, "Empresa");
    \u0275\u0275elementEnd();
    \u0275\u0275template(19, AfazerComponent_section_0_div_19_div_19_Template, 2, 1, "div", 46);
    \u0275\u0275elementStart(20, "select", 47);
    \u0275\u0275twoWayListener("ngModelChange", function AfazerComponent_section_0_div_19_Template_select_ngModelChange_20_listener($event) {
      \u0275\u0275restoreView(_r8);
      const ctx_r1 = \u0275\u0275nextContext(2);
      \u0275\u0275twoWayBindingSet(ctx_r1.form.empresaId, $event) || (ctx_r1.form.empresaId = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275listener("ngModelChange", function AfazerComponent_section_0_div_19_Template_select_ngModelChange_20_listener() {
      \u0275\u0275restoreView(_r8);
      const vm_r3 = \u0275\u0275nextContext().ngIf;
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.onEmpresaChange(vm_r3.empresas));
    });
    \u0275\u0275elementStart(21, "option", 48);
    \u0275\u0275text(22);
    \u0275\u0275elementEnd();
    \u0275\u0275template(23, AfazerComponent_section_0_div_19_option_23_Template, 2, 2, "option", 49);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(24, "label")(25, "span");
    \u0275\u0275text(26, "Cliente");
    \u0275\u0275elementEnd();
    \u0275\u0275template(27, AfazerComponent_section_0_div_19_div_27_Template, 2, 1, "div", 46);
    \u0275\u0275elementStart(28, "select", 50);
    \u0275\u0275twoWayListener("ngModelChange", function AfazerComponent_section_0_div_19_Template_select_ngModelChange_28_listener($event) {
      \u0275\u0275restoreView(_r8);
      const ctx_r1 = \u0275\u0275nextContext(2);
      \u0275\u0275twoWayBindingSet(ctx_r1.form.clienteId, $event) || (ctx_r1.form.clienteId = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275listener("ngModelChange", function AfazerComponent_section_0_div_19_Template_select_ngModelChange_28_listener() {
      \u0275\u0275restoreView(_r8);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.onClienteChange());
    });
    \u0275\u0275elementStart(29, "option", 48);
    \u0275\u0275text(30);
    \u0275\u0275elementEnd();
    \u0275\u0275template(31, AfazerComponent_section_0_div_19_option_31_Template, 2, 2, "option", 49);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(32, "label")(33, "span");
    \u0275\u0275text(34, "Sistema");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(35, "select", 51);
    \u0275\u0275twoWayListener("ngModelChange", function AfazerComponent_section_0_div_19_Template_select_ngModelChange_35_listener($event) {
      \u0275\u0275restoreView(_r8);
      const ctx_r1 = \u0275\u0275nextContext(2);
      \u0275\u0275twoWayBindingSet(ctx_r1.form.sistemaId, $event) || (ctx_r1.form.sistemaId = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275listener("ngModelChange", function AfazerComponent_section_0_div_19_Template_select_ngModelChange_35_listener() {
      \u0275\u0275restoreView(_r8);
      const vm_r3 = \u0275\u0275nextContext().ngIf;
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.onSistemaChange(vm_r3.sistemas));
    });
    \u0275\u0275elementStart(36, "option", 48);
    \u0275\u0275text(37);
    \u0275\u0275elementEnd();
    \u0275\u0275template(38, AfazerComponent_section_0_div_19_option_38_Template, 2, 2, "option", 49);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(39, "label")(40, "span");
    \u0275\u0275text(41, "Prioridade");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(42, "select", 52);
    \u0275\u0275twoWayListener("ngModelChange", function AfazerComponent_section_0_div_19_Template_select_ngModelChange_42_listener($event) {
      \u0275\u0275restoreView(_r8);
      const ctx_r1 = \u0275\u0275nextContext(2);
      \u0275\u0275twoWayBindingSet(ctx_r1.form.prioridade, $event) || (ctx_r1.form.prioridade = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275template(43, AfazerComponent_section_0_div_19_option_43_Template, 2, 2, "option", 53);
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(44, "label")(45, "span");
    \u0275\u0275text(46, "Descri\xE7\xE3o");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(47, "textarea", 54);
    \u0275\u0275twoWayListener("ngModelChange", function AfazerComponent_section_0_div_19_Template_textarea_ngModelChange_47_listener($event) {
      \u0275\u0275restoreView(_r8);
      const ctx_r1 = \u0275\u0275nextContext(2);
      \u0275\u0275twoWayBindingSet(ctx_r1.form.descricao, $event) || (ctx_r1.form.descricao = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(48, "div", 55)(49, "button", 56);
    \u0275\u0275listener("click", function AfazerComponent_section_0_div_19_Template_button_click_49_listener() {
      \u0275\u0275restoreView(_r8);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.fecharModal());
    });
    \u0275\u0275text(50, " Cancelar ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(51, "button", 57);
    \u0275\u0275text(52);
    \u0275\u0275elementEnd()()()()();
  }
  if (rf & 2) {
    const vm_r3 = \u0275\u0275nextContext().ngIf;
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(ctx_r1.getTituloModal());
    \u0275\u0275advance(9);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.form.titulo);
    \u0275\u0275advance(5);
    \u0275\u0275property("ngIf", vm_r3.vinculosErro);
    \u0275\u0275advance();
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.form.empresaId);
    \u0275\u0275property("disabled", vm_r3.vinculosCarregando);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(vm_r3.vinculosCarregando ? "Carregando empresas" : "Selecione a empresa");
    \u0275\u0275advance();
    \u0275\u0275property("ngForOf", vm_r3.empresas);
    \u0275\u0275advance(4);
    \u0275\u0275property("ngIf", ctx_r1.funcionariosErro);
    \u0275\u0275advance();
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.form.clienteId);
    \u0275\u0275property("disabled", !ctx_r1.form.empresaId || ctx_r1.funcionariosCarregando);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1(" ", !ctx_r1.form.empresaId ? "Selecione a empresa" : ctx_r1.funcionariosCarregando ? "Carregando clientes" : ctx_r1.funcionariosEmpresa.length === 0 ? "Empresa sem clientes" : "Selecione o cliente", " ");
    \u0275\u0275advance();
    \u0275\u0275property("ngForOf", ctx_r1.funcionariosEmpresa);
    \u0275\u0275advance(4);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.form.sistemaId);
    \u0275\u0275property("disabled", !ctx_r1.form.empresaId);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1(" ", !ctx_r1.form.empresaId ? "Selecione a empresa" : ctx_r1.getSistemasEmpresaOptions(ctx_r1.form.empresaId, vm_r3.empresas, vm_r3.sistemas).length === 0 ? "Empresa sem sistemas" : "Selecione o sistema", " ");
    \u0275\u0275advance();
    \u0275\u0275property("ngForOf", ctx_r1.getSistemasEmpresaOptions(ctx_r1.form.empresaId, vm_r3.empresas, vm_r3.sistemas));
    \u0275\u0275advance(4);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.form.prioridade);
    \u0275\u0275advance();
    \u0275\u0275property("ngForOf", ctx_r1.prioridadeOptions);
    \u0275\u0275advance(4);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.form.descricao);
    \u0275\u0275advance(2);
    \u0275\u0275property("disabled", ctx_r1.salvando);
    \u0275\u0275advance(2);
    \u0275\u0275property("disabled", ctx_r1.salvando);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", ctx_r1.getSalvarLabel(), " ");
  }
}
function AfazerComponent_section_0_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "section", 1)(1, "div", 2)(2, "article", 3)(3, "span", 4);
    \u0275\u0275text(4, "Pendentes");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "strong", 5);
    \u0275\u0275text(6);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(7, "article", 3)(8, "span", 4);
    \u0275\u0275text(9, "Total");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(10, "strong", 5);
    \u0275\u0275text(11);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(12, "article", 3)(13, "span", 4);
    \u0275\u0275text(14, "Conclu\xEDdas");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(15, "strong", 5);
    \u0275\u0275text(16);
    \u0275\u0275elementEnd()()();
    \u0275\u0275template(17, AfazerComponent_section_0_div_17_Template, 1, 0, "div", 6)(18, AfazerComponent_section_0_article_18_Template, 16, 7, "article", 7)(19, AfazerComponent_section_0_div_19_Template, 53, 22, "div", 8);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const vm_r3 = ctx.ngIf;
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(6);
    \u0275\u0275textInterpolate(vm_r3.pendentes);
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(vm_r3.total);
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(vm_r3.concluidas);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", vm_r3.carregando && vm_r3.tarefas.length === 0);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", !vm_r3.carregando || vm_r3.tarefas.length > 0);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r1.modalAberto);
  }
}
var STATUS_OPTIONS = [
  { valor: "pendente", label: "Pendente" },
  { valor: "andamento", label: "Em andamento" },
  { valor: "concluida", label: "Conclu\xEDda" }
];
var PRIORIDADE_OPTIONS = [
  { valor: "baixa", label: "Baixa" },
  { valor: "media", label: "M\xE9dia" },
  { valor: "alta", label: "Alta" }
];
var AfazerComponent = class _AfazerComponent {
  tarefasService;
  empresasService;
  sistemasService;
  toast;
  zone;
  cdr;
  prioridadeOptions = PRIORIDADE_OPTIONS;
  vm$;
  modalAberto = false;
  salvando = false;
  excluindoId = null;
  concluindoId = null;
  reabrindoId = null;
  tarefaEditandoId = null;
  funcionariosEmpresa = [];
  funcionariosCarregando = false;
  funcionariosErro = null;
  form = this.getFormInicial();
  mostrarConcluidasSubject = new BehaviorSubject(false);
  dateFormatter = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
  constructor(tarefasService, empresasService, sistemasService, toast, zone, cdr) {
    this.tarefasService = tarefasService;
    this.empresasService = empresasService;
    this.sistemasService = sistemasService;
    this.toast = toast;
    this.zone = zone;
    this.cdr = cdr;
    this.vm$ = combineLatest([
      this.tarefasService.tarefasState$,
      this.mostrarConcluidasSubject,
      this.empresasService.empresasState$,
      this.sistemasService.sistemasState$
    ]).pipe(map(([state, mostrarConcluidas, empresasState, sistemasState]) => this.buildViewModel(state, mostrarConcluidas, empresasState, sistemasState)), tap(() => this.cdr.markForCheck()));
  }
  trackByTarefa(_, item) {
    return item.id ?? item.titulo;
  }
  abrirModalNovaTarefa() {
    this.tarefaEditandoId = null;
    this.form = this.getFormInicial();
    this.funcionariosEmpresa = [];
    this.funcionariosErro = null;
    this.funcionariosCarregando = false;
    this.modalAberto = true;
    this.forcarAtualizacaoTela();
  }
  async abrirModalEditarTarefa(item) {
    this.tarefaEditandoId = item.id ?? null;
    this.form = {
      titulo: item.titulo || "",
      descricao: item.descricao || "",
      empresaId: item.empresaId || "",
      nomeEmpresa: item.nomeEmpresa || "",
      clienteId: item.clienteId || "",
      nomeCliente: item.nomeCliente || "",
      sistemaId: item.sistemaId || "",
      nomeSistema: item.nomeSistema || "",
      status: item.status || "pendente",
      prioridade: item.prioridade || "media",
      prazo: item.prazo || ""
    };
    this.modalAberto = true;
    this.forcarAtualizacaoTela();
    await this.carregarFuncionariosEmpresa(this.form.empresaId, false);
  }
  fecharModal(forcar = false) {
    if (this.salvando && !forcar)
      return;
    this.modalAberto = false;
    this.tarefaEditandoId = null;
    this.form = this.getFormInicial();
    this.funcionariosEmpresa = [];
    this.funcionariosErro = null;
    this.funcionariosCarregando = false;
    this.forcarAtualizacaoTela();
  }
  async salvarTarefa() {
    if (this.salvando)
      return;
    const payload = this.getPayloadSanitizado();
    if (!payload.titulo) {
      this.toast.show("Informe o t\xEDtulo da tarefa.", "error");
      return;
    }
    this.salvando = true;
    this.forcarAtualizacaoTela();
    try {
      if (this.tarefaEditandoId) {
        await this.tarefasService.updateTarefa(this.tarefaEditandoId, payload);
        this.toast.show("Tarefa atualizada.", "success");
      } else {
        await this.tarefasService.createTarefa(__spreadProps(__spreadValues({}, payload), {
          status: "pendente"
        }));
        this.toast.show("Tarefa cadastrada.", "success");
      }
      this.fecharModal(true);
    } catch (err) {
      this.toast.show(`Erro ao salvar tarefa: ${err?.message || err}`, "error");
    } finally {
      this.salvando = false;
      this.forcarAtualizacaoTela();
    }
  }
  async excluirTarefa(item) {
    if (!item.id || this.excluindoId === item.id)
      return;
    const ok = window.confirm("Deseja excluir esta tarefa?");
    if (!ok)
      return;
    this.excluindoId = item.id;
    this.forcarAtualizacaoTela();
    try {
      await this.tarefasService.deleteTarefa(item.id);
      this.toast.show("Tarefa exclu\xEDda.", "success");
    } catch (err) {
      this.toast.show(`Erro ao excluir tarefa: ${err?.message || err}`, "error");
    } finally {
      if (this.excluindoId === item.id) {
        this.excluindoId = null;
        this.forcarAtualizacaoTela();
      }
    }
  }
  async concluirTarefa(item) {
    if (!item.id || this.concluindoId === item.id || item.status === "concluida")
      return;
    this.concluindoId = item.id;
    this.forcarAtualizacaoTela();
    try {
      await this.tarefasService.updateTarefa(item.id, this.buildStatusUpdatePayload(item, "concluida"));
      this.toast.show("Tarefa conclu\xEDda.", "success");
    } catch (err) {
      this.toast.show(`Erro ao concluir tarefa: ${err?.message || err}`, "error");
    } finally {
      if (this.concluindoId === item.id) {
        this.concluindoId = null;
        this.forcarAtualizacaoTela();
      }
    }
  }
  async voltarParaPendente(item) {
    if (!item.id || this.reabrindoId === item.id || item.status !== "concluida")
      return;
    this.reabrindoId = item.id;
    this.forcarAtualizacaoTela();
    try {
      await this.tarefasService.updateTarefa(item.id, this.buildStatusUpdatePayload(item, "pendente"));
      this.toast.show("Tarefa voltou para pendente.", "success");
    } catch (err) {
      this.toast.show(`Erro ao voltar tarefa: ${err?.message || err}`, "error");
    } finally {
      if (this.reabrindoId === item.id) {
        this.reabrindoId = null;
        this.forcarAtualizacaoTela();
      }
    }
  }
  getTituloModal() {
    return this.tarefaEditandoId ? "Editar tarefa" : "Nova tarefa";
  }
  getSalvarLabel() {
    if (this.salvando)
      return "Salvando...";
    return this.tarefaEditandoId ? "Atualizar tarefa" : "Cadastrar tarefa";
  }
  getExcluirLabel(item) {
    return this.excluindoId === item.id ? "Excluindo..." : "Excluir";
  }
  getConcluirLabel(item) {
    return this.concluindoId === item.id ? "Concluindo..." : "Concluir";
  }
  getVoltarPendenteLabel(item) {
    return this.reabrindoId === item.id ? "Voltando..." : "Voltar para pendente";
  }
  alternarTarefasConcluidas() {
    this.mostrarConcluidasSubject.next(!this.mostrarConcluidasSubject.value);
    this.forcarAtualizacaoTela();
  }
  async onEmpresaChange(empresas) {
    this.form.nomeEmpresa = this.getEmpresaNomeById(this.form.empresaId, empresas);
    this.form.clienteId = "";
    this.form.nomeCliente = "";
    this.form.sistemaId = "";
    this.form.nomeSistema = "";
    this.forcarAtualizacaoTela();
    await this.carregarFuncionariosEmpresa(this.form.empresaId, true);
  }
  onClienteChange() {
    this.form.nomeCliente = this.funcionariosEmpresa.find((item) => item.id === this.form.clienteId)?.nomeFuncionario || "";
    this.forcarAtualizacaoTela();
  }
  onSistemaChange(sistemas) {
    this.form.nomeSistema = sistemas.find((item) => item.id === this.form.sistemaId)?.nome || "";
    this.forcarAtualizacaoTela();
  }
  getSistemasEmpresaOptions(empresaId, empresas, sistemas) {
    if (!empresaId)
      return [];
    const empresa = empresas.find((item) => item.id === empresaId);
    const sistemaIds = this.sanitizeSistemaIds(empresa?.sistemas);
    if (sistemaIds.length === 0)
      return [];
    const sistemasMap = new Map(sistemas.map((item) => [item.id, item]));
    return sistemaIds.map((id) => sistemasMap.get(id) ?? null).filter((item) => !!item);
  }
  buildViewModel(state, mostrarConcluidas, empresasState, sistemasState) {
    const todas = this.sortTarefas(state.data).map((item) => this.toTarefaView(item));
    const tarefas = todas.filter((item) => mostrarConcluidas ? item.status === "concluida" : item.status !== "concluida");
    const empresas = this.sortEmpresas(empresasState.data).filter((item) => !!item.id).map((item) => __spreadProps(__spreadValues({}, item), {
      id: item.id
    }));
    const sistemas = this.sortSistemas(sistemasState.data).filter((item) => !!item.id).map((item) => __spreadProps(__spreadValues({}, item), {
      id: item.id
    }));
    return {
      carregando: state.status === "loading" || empresasState.status === "loading" || sistemasState.status === "loading",
      erro: state.error,
      tarefas,
      total: todas.length,
      empresas,
      sistemas,
      vinculosCarregando: empresasState.status === "loading" || sistemasState.status === "loading",
      vinculosErro: empresasState.error || sistemasState.error,
      pendentes: todas.filter((item) => item.status === "pendente").length,
      emAndamento: todas.filter((item) => item.status === "andamento").length,
      concluidas: todas.filter((item) => item.status === "concluida").length,
      mostrandoConcluidas: mostrarConcluidas,
      tituloLista: mostrarConcluidas ? "Tarefas conclu\xEDdas" : "Minhas tarefas",
      subtituloLista: mostrarConcluidas ? "Tarefas finalizadas aparecem separadas da lista principal." : "Itens em andamento e pendentes aparecem primeiro.",
      mensagemVazia: mostrarConcluidas ? "Nenhuma tarefa conclu\xEDda." : "Nenhuma tarefa pendente ou em andamento."
    };
  }
  sortTarefas(items) {
    const statusOrder = {
      andamento: 0,
      pendente: 1,
      concluida: 2
    };
    const prioridadeOrder = {
      alta: 0,
      media: 1,
      baixa: 2
    };
    return [...items].sort((a, b) => {
      const statusDiff = statusOrder[a.status] - statusOrder[b.status];
      if (statusDiff !== 0)
        return statusDiff;
      const prioridadeDiff = prioridadeOrder[a.prioridade] - prioridadeOrder[b.prioridade];
      if (prioridadeDiff !== 0)
        return prioridadeDiff;
      const atualizacaoDiff = this.getTimestampMillis(b.dataAtualizacao ?? b.dataCriacao) - this.getTimestampMillis(a.dataAtualizacao ?? a.dataCriacao);
      if (atualizacaoDiff !== 0)
        return atualizacaoDiff;
      return (a.titulo || "").localeCompare(b.titulo || "", "pt-BR");
    });
  }
  toTarefaView(item) {
    return __spreadProps(__spreadValues({}, item), {
      statusLabel: this.getStatusLabel(item.status),
      prioridadeLabel: this.getPrioridadeLabel(item.prioridade),
      dataLabel: this.formatTimestamp(item.dataAtualizacao ?? item.dataCriacao ?? null)
    });
  }
  getPayloadSanitizado() {
    return {
      titulo: this.form.titulo.trim(),
      descricao: this.form.descricao.trim(),
      empresaId: this.form.empresaId.trim(),
      nomeEmpresa: this.form.nomeEmpresa.trim(),
      clienteId: this.form.clienteId.trim(),
      nomeCliente: this.form.nomeCliente.trim(),
      sistemaId: this.form.sistemaId.trim(),
      nomeSistema: this.form.nomeSistema.trim(),
      status: this.form.status,
      prioridade: this.form.prioridade,
      prazo: ""
    };
  }
  buildStatusUpdatePayload(item, status) {
    return {
      titulo: item.titulo || "",
      descricao: item.descricao || "",
      empresaId: item.empresaId || "",
      nomeEmpresa: item.nomeEmpresa || "",
      clienteId: item.clienteId || "",
      nomeCliente: item.nomeCliente || "",
      sistemaId: item.sistemaId || "",
      nomeSistema: item.nomeSistema || "",
      status,
      prioridade: item.prioridade || "media",
      prazo: ""
    };
  }
  getFormInicial() {
    return {
      titulo: "",
      descricao: "",
      empresaId: "",
      nomeEmpresa: "",
      clienteId: "",
      nomeCliente: "",
      sistemaId: "",
      nomeSistema: "",
      status: "pendente",
      prioridade: "media",
      prazo: ""
    };
  }
  getStatusLabel(status) {
    return STATUS_OPTIONS.find((item) => item.valor === status)?.label ?? "Pendente";
  }
  getPrioridadeLabel(prioridade) {
    return PRIORIDADE_OPTIONS.find((item) => item.valor === prioridade)?.label ?? "M\xE9dia";
  }
  async carregarFuncionariosEmpresa(empresaId, limparSeVazio) {
    this.funcionariosEmpresa = [];
    this.funcionariosErro = null;
    this.forcarAtualizacaoTela();
    if (!empresaId) {
      if (limparSeVazio) {
        this.form.clienteId = "";
        this.form.nomeCliente = "";
      }
      this.forcarAtualizacaoTela();
      return;
    }
    this.funcionariosCarregando = true;
    this.forcarAtualizacaoTela();
    try {
      const funcionarios = await this.empresasService.listFuncionarios(empresaId);
      this.runInZone(() => {
        this.funcionariosEmpresa = this.sortFuncionarios(funcionarios.filter((item) => item.ativo !== false));
        if (this.form.clienteId && !this.funcionariosEmpresa.some((item) => item.id === this.form.clienteId)) {
          this.form.clienteId = "";
          this.form.nomeCliente = "";
        }
        this.forcarAtualizacaoTela();
      });
    } catch (err) {
      this.runInZone(() => {
        this.funcionariosErro = err?.message || "Erro ao carregar clientes.";
        this.forcarAtualizacaoTela();
      });
    } finally {
      this.runInZone(() => {
        this.funcionariosCarregando = false;
        this.forcarAtualizacaoTela();
      });
    }
  }
  forcarAtualizacaoTela() {
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }
  runInZone(callback) {
    return NgZone.isInAngularZone() ? callback() : this.zone.run(callback);
  }
  getEmpresaNomeById(empresaId, empresas) {
    return empresas.find((item) => item.id === empresaId)?.nomeEmpresa || "";
  }
  sortEmpresas(items) {
    return [...items].sort((a, b) => (a.nomeEmpresa || "").localeCompare(b.nomeEmpresa || "", "pt-BR"));
  }
  sortFuncionarios(items) {
    return [...items].sort((a, b) => (a.nomeFuncionario || "").localeCompare(b.nomeFuncionario || "", "pt-BR"));
  }
  sortSistemas(items) {
    return [...items].sort((a, b) => (a.nome || "").localeCompare(b.nome || "", "pt-BR"));
  }
  sanitizeSistemaIds(value) {
    if (!Array.isArray(value))
      return [];
    return [...new Set(value.filter((item) => typeof item === "string").map((item) => item.trim()).filter(Boolean))];
  }
  formatTimestamp(value) {
    if (!value)
      return null;
    return this.dateFormatter.format(value.toDate());
  }
  getTimestampMillis(value) {
    if (value && typeof value.toDate === "function") {
      return value.toDate().getTime();
    }
    return 0;
  }
  static \u0275fac = function AfazerComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _AfazerComponent)(\u0275\u0275directiveInject(TarefasService), \u0275\u0275directiveInject(EmpresasService), \u0275\u0275directiveInject(SistemasService), \u0275\u0275directiveInject(ToastService), \u0275\u0275directiveInject(NgZone), \u0275\u0275directiveInject(ChangeDetectorRef));
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _AfazerComponent, selectors: [["app-afazer"]], decls: 2, vars: 3, consts: [["class", "page-section afazer-page", 4, "ngIf"], [1, "page-section", "afazer-page"], [1, "afazer-summary"], [1, "summary-card"], [1, "summary-label"], [1, "summary-value"], ["class", "skeleton", "style", "min-height: 220px;", 4, "ngIf"], ["class", "card afazer-list-card", 4, "ngIf"], ["class", "afazer-modal-backdrop", 3, "click", 4, "ngIf"], [1, "skeleton", 2, "min-height", "220px"], [1, "card", "afazer-list-card"], [1, "card-title-row", "afazer-list-header"], [1, "card-title"], [1, "card-subtitle"], [1, "afazer-list-actions"], ["type", "button", 1, "btn", "primary", 3, "click"], ["type", "button", 1, "btn", "secondary", 3, "click"], [1, "status-chip", "neutral"], ["class", "empty-state", 4, "ngIf"], ["class", "afazer-list", 4, "ngIf"], [1, "empty-state"], [1, "afazer-list"], ["class", "tarefa-item", 3, "tarefa-concluida", 4, "ngFor", "ngForOf", "ngForTrackBy"], [1, "tarefa-item"], [1, "tarefa-status-panel"], [1, "tarefa-status-label"], [1, "tarefa-status-value"], [1, "tarefa-prioridade-value"], [1, "tarefa-main"], [1, "tarefa-title-row"], ["class", "tarefa-descricao", 4, "ngIf"], [1, "tarefa-meta"], [4, "ngIf"], [1, "tarefa-actions"], ["class", "btn primary btn-sm", "type", "button", 3, "disabled", "click", 4, "ngIf"], ["type", "button", 1, "btn", "secondary", "btn-sm", 3, "click"], ["type", "button", 1, "btn", "danger", "btn-sm", 3, "click", "disabled"], [1, "tarefa-descricao"], ["type", "button", 1, "btn", "primary", "btn-sm", 3, "click", "disabled"], [1, "afazer-modal-backdrop", 3, "click"], ["role", "dialog", "aria-modal", "true", 1, "afazer-modal", 3, "click"], [1, "afazer-modal-header"], ["type", "button", "aria-label", "Fechar", 1, "modal-close", 3, "click"], [1, "form", "afazer-form", 3, "ngSubmit"], ["name", "tituloTarefa", "type", "text", "placeholder", "Ex: Revisar chamados pendentes", "required", "", 3, "ngModelChange", "ngModel"], [1, "afazer-form-grid"], ["class", "helper-text", 4, "ngIf"], ["name", "empresaTarefa", 3, "ngModelChange", "ngModel", "disabled"], ["value", ""], [3, "value", 4, "ngFor", "ngForOf"], ["name", "clienteTarefa", 3, "ngModelChange", "ngModel", "disabled"], ["name", "sistemaTarefa", 3, "ngModelChange", "ngModel", "disabled"], ["name", "prioridadeTarefa", 3, "ngModelChange", "ngModel"], [3, "ngValue", 4, "ngFor", "ngForOf"], ["name", "descricaoTarefa", "rows", "5", "placeholder", "Detalhes, contexto ou pr\xF3ximos passos", 3, "ngModelChange", "ngModel"], [1, "afazer-modal-actions"], ["type", "button", 1, "btn", "secondary", 3, "click", "disabled"], ["type", "submit", 1, "btn", "primary", 3, "disabled"], [1, "helper-text"], [3, "value"], [3, "ngValue"]], template: function AfazerComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275template(0, AfazerComponent_section_0_Template, 20, 6, "section", 0);
      \u0275\u0275pipe(1, "async");
    }
    if (rf & 2) {
      \u0275\u0275property("ngIf", \u0275\u0275pipeBind1(1, 1, ctx.vm$));
    }
  }, dependencies: [CommonModule, NgForOf, NgIf, FormsModule, \u0275NgNoValidate, NgSelectOption, \u0275NgSelectMultipleOption, DefaultValueAccessor, SelectControlValueAccessor, NgControlStatus, NgControlStatusGroup, RequiredValidator, NgModel, NgForm, AsyncPipe], styles: ["\n\n.afazer-page[_ngcontent-%COMP%] {\n  display: grid;\n  gap: 18px;\n}\n.afazer-header[_ngcontent-%COMP%] {\n  align-items: center;\n}\n.afazer-summary[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(3, minmax(0, 1fr));\n  gap: 12px;\n}\n.summary-card[_ngcontent-%COMP%] {\n  min-width: 0;\n  padding: 16px;\n  border: 1px solid #dbe3ee;\n  border-radius: 12px;\n  background: #ffffff;\n  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.05);\n}\n.summary-label[_ngcontent-%COMP%] {\n  display: block;\n  color: var(--text-muted);\n  font-size: 12px;\n  font-weight: 700;\n}\n.summary-value[_ngcontent-%COMP%] {\n  display: block;\n  margin-top: 8px;\n  color: var(--text-main);\n  font-size: 28px;\n  line-height: 1;\n}\n.afazer-list-card[_ngcontent-%COMP%]:hover {\n  transform: none;\n}\n.afazer-list-header[_ngcontent-%COMP%] {\n  align-items: center;\n}\n.afazer-list-actions[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: flex-end;\n  gap: 10px;\n  flex-wrap: wrap;\n}\n.afazer-list[_ngcontent-%COMP%] {\n  display: grid;\n  gap: 8px;\n}\n.tarefa-item[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: minmax(132px, 0.24fr) minmax(0, 1fr) auto;\n  gap: 10px;\n  align-items: center;\n  padding: 10px 12px;\n  border: 1px solid #dbe3ee;\n  border-radius: 12px;\n  background: #ffffff;\n}\n.tarefa-status-panel[_ngcontent-%COMP%] {\n  display: grid;\n  align-content: center;\n  gap: 5px;\n  padding: 10px;\n  border: 1px solid #e2e8f0;\n  border-radius: 10px;\n  background: #f8fafc;\n}\n.tarefa-status-label[_ngcontent-%COMP%] {\n  color: var(--text-soft);\n  font-size: 10px;\n  font-weight: 800;\n  letter-spacing: 0.08em;\n  text-transform: uppercase;\n}\n.tarefa-status-value[_ngcontent-%COMP%] {\n  font-size: 14px;\n  line-height: 1.2;\n}\n.tarefa-prioridade-value[_ngcontent-%COMP%] {\n  width: fit-content;\n  min-height: 22px;\n  padding: 4px 8px;\n  border-radius: 999px;\n  font-size: 11px;\n  font-weight: 800;\n}\n.status-text-pendente[_ngcontent-%COMP%] {\n  color: #92400e;\n}\n.status-text-andamento[_ngcontent-%COMP%] {\n  color: #1d4ed8;\n}\n.status-text-concluida[_ngcontent-%COMP%] {\n  color: #166534;\n}\n.prioridade-text-baixa[_ngcontent-%COMP%] {\n  background: #f1f5f9;\n  color: #475569;\n}\n.prioridade-text-media[_ngcontent-%COMP%] {\n  background: #ffedd5;\n  color: #c2410c;\n}\n.prioridade-text-alta[_ngcontent-%COMP%] {\n  background: #fee2e2;\n  color: #b91c1c;\n}\n.tarefa-main[_ngcontent-%COMP%] {\n  min-width: 0;\n  align-self: center;\n}\n.tarefa-title-row[_ngcontent-%COMP%] {\n  display: block;\n}\n.tarefa-title-row[_ngcontent-%COMP%]   h4[_ngcontent-%COMP%] {\n  margin: 0;\n  color: var(--text-main);\n  font-size: 15px;\n  line-height: 1.25;\n  overflow-wrap: anywhere;\n}\n.tarefa-descricao[_ngcontent-%COMP%] {\n  margin: 5px 0 0;\n  color: var(--text-muted);\n  font-size: 13px;\n  line-height: 1.35;\n  white-space: pre-wrap;\n  overflow-wrap: anywhere;\n}\n.tarefa-meta[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 5px 12px;\n  margin-top: 7px;\n  color: var(--text-soft);\n  font-size: 12px;\n  font-weight: 700;\n}\n.tarefa-actions[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: row;\n  align-items: stretch;\n  justify-content: center;\n  gap: 6px;\n  min-width: 0;\n}\n.btn-sm[_ngcontent-%COMP%] {\n  height: 30px;\n  padding: 0 10px;\n  border-radius: 9px;\n  font-size: 11px;\n}\n.afazer-modal-backdrop[_ngcontent-%COMP%] {\n  position: fixed;\n  inset: 0;\n  z-index: 50;\n  display: grid;\n  place-items: center;\n  padding: 24px;\n  background: rgba(15, 23, 42, 0.48);\n}\n.afazer-modal[_ngcontent-%COMP%] {\n  width: min(640px, 100%);\n  max-height: calc(100dvh - 48px);\n  overflow: auto;\n  border-radius: 14px;\n  background: #ffffff;\n  box-shadow: 0 24px 70px rgba(15, 23, 42, 0.28);\n}\n.afazer-modal-header[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  gap: 16px;\n  align-items: flex-start;\n  padding: 20px 22px 14px;\n  border-bottom: 1px solid #e2e8f0;\n}\n.afazer-modal-header[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%] {\n  margin: 0;\n  color: var(--text-main);\n  font-size: 20px;\n}\n.afazer-modal-header[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n  margin: 6px 0 0;\n  color: var(--text-muted);\n  font-size: 13px;\n}\n.modal-close[_ngcontent-%COMP%] {\n  display: inline-grid;\n  place-items: center;\n  width: 34px;\n  height: 34px;\n  border: 1px solid #dbe3ee;\n  border-radius: 10px;\n  background: #ffffff;\n  color: var(--text-muted);\n  font-size: 22px;\n  line-height: 1;\n  cursor: pointer;\n}\n.modal-close[_ngcontent-%COMP%]:hover {\n  border-color: #bfdbfe;\n  color: var(--text-main);\n}\n.afazer-form[_ngcontent-%COMP%] {\n  padding: 20px 22px 22px;\n}\n.afazer-form-grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(3, minmax(0, 1fr));\n  gap: 12px;\n}\n.afazer-form[_ngcontent-%COMP%]   textarea[_ngcontent-%COMP%] {\n  min-height: 120px;\n  resize: vertical;\n}\n.afazer-modal-actions[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: flex-end;\n  gap: 10px;\n  padding-top: 4px;\n}\n@media (max-width: 900px) {\n  .afazer-summary[_ngcontent-%COMP%] {\n    grid-template-columns: repeat(2, minmax(0, 1fr));\n  }\n  .afazer-list-actions[_ngcontent-%COMP%] {\n    justify-content: flex-start;\n  }\n}\n@media (max-width: 640px) {\n  .afazer-header[_ngcontent-%COMP%] {\n    align-items: stretch;\n  }\n  .afazer-header[_ngcontent-%COMP%]   .btn[_ngcontent-%COMP%] {\n    width: 100%;\n  }\n  .afazer-summary[_ngcontent-%COMP%], \n   .afazer-form-grid[_ngcontent-%COMP%] {\n    grid-template-columns: 1fr;\n  }\n  .tarefa-item[_ngcontent-%COMP%] {\n    grid-template-columns: 1fr;\n  }\n  .tarefa-status-panel[_ngcontent-%COMP%] {\n    min-height: auto;\n  }\n  .tarefa-actions[_ngcontent-%COMP%], \n   .afazer-list-actions[_ngcontent-%COMP%], \n   .afazer-modal-actions[_ngcontent-%COMP%] {\n    flex-direction: column;\n  }\n  .tarefa-actions[_ngcontent-%COMP%] {\n    justify-content: stretch;\n  }\n  .afazer-list-actions[_ngcontent-%COMP%] {\n    align-items: stretch;\n  }\n  .afazer-modal-backdrop[_ngcontent-%COMP%] {\n    padding: 14px;\n  }\n}\n/*# sourceMappingURL=afazer.component.css.map */"], changeDetection: 0 });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(AfazerComponent, [{
    type: Component,
    args: [{ selector: "app-afazer", standalone: true, imports: [CommonModule, FormsModule], changeDetection: ChangeDetectionStrategy.OnPush, template: `<section class="page-section afazer-page" *ngIf="vm$ | async as vm">\r
  <div class="afazer-summary">
    <article class="summary-card">
      <span class="summary-label">Pendentes</span>
      <strong class="summary-value">{{ vm.pendentes }}</strong>
    </article>
    <article class="summary-card">
      <span class="summary-label">Total</span>
      <strong class="summary-value">{{ vm.total }}</strong>
    </article>
    <article class="summary-card">
      <span class="summary-label">Conclu\xEDdas</span>
      <strong class="summary-value">{{ vm.concluidas }}</strong>\r
    </article>\r
  </div>\r
\r
  <div class="skeleton" style="min-height: 220px;" *ngIf="vm.carregando && vm.tarefas.length === 0"></div>\r
\r
  <article class="card afazer-list-card" *ngIf="!vm.carregando || vm.tarefas.length > 0">\r
    <div class="card-title-row afazer-list-header">\r
      <div>\r
        <h3 class="card-title">{{ vm.tituloLista }}</h3>\r
        <p class="card-subtitle">{{ vm.subtituloLista }}</p>\r
      </div>\r
      <div class="afazer-list-actions">\r
        <button class="btn primary" type="button" (click)="abrirModalNovaTarefa()">\r
          Nova tarefa\r
        </button>\r
        <button class="btn secondary" type="button" (click)="alternarTarefasConcluidas()">\r
          {{ vm.mostrandoConcluidas ? "Ver tarefas a fazer" : "Ver conclu\xEDdas" }}\r
        </button>\r
        <span class="status-chip neutral">\r
          {{ vm.tarefas.length }} tarefa{{ vm.tarefas.length === 1 ? "" : "s" }}\r
        </span>\r
      </div>\r
    </div>\r
\r
    <div class="empty-state" *ngIf="!!vm.erro">{{ vm.erro }}</div>\r
\r
    <div class="afazer-list" *ngIf="!vm.erro">\r
      <div class="empty-state" *ngIf="vm.tarefas.length === 0">\r
        {{ vm.mensagemVazia }}\r
      </div>\r
\r
      <article\r
        class="tarefa-item"\r
        *ngFor="let tarefa of vm.tarefas; trackBy: trackByTarefa"\r
        [class.tarefa-concluida]="tarefa.status === 'concluida'"\r
      >\r
        <aside class="tarefa-status-panel">\r
          <span class="tarefa-status-label">Status</span>\r
          <strong class="tarefa-status-value" [class]="'status-text-' + tarefa.status">\r
            {{ tarefa.statusLabel }}\r
          </strong>\r
          <span class="tarefa-prioridade-value" [class]="'prioridade-text-' + tarefa.prioridade">\r
            Prioridade {{ tarefa.prioridadeLabel }}\r
          </span>\r
        </aside>\r
\r
        <div class="tarefa-main">\r
          <div class="tarefa-title-row">\r
            <h4>{{ tarefa.titulo }}</h4>\r
          </div>\r
\r
          <p class="tarefa-descricao" *ngIf="!!tarefa.descricao">{{ tarefa.descricao }}</p>\r
\r
          <div class="tarefa-meta">\r
            <span *ngIf="!!tarefa.nomeEmpresa">Empresa: {{ tarefa.nomeEmpresa }}</span>\r
            <span *ngIf="!!tarefa.nomeCliente">Cliente: {{ tarefa.nomeCliente }}</span>\r
            <span *ngIf="!!tarefa.nomeSistema">Sistema: {{ tarefa.nomeSistema }}</span>\r
            <span *ngIf="!!tarefa.dataLabel">Atualizada em {{ tarefa.dataLabel }}</span>\r
          </div>\r
        </div>\r
\r
        <div class="tarefa-actions">\r
          <button\r
            class="btn primary btn-sm"\r
            type="button"\r
            *ngIf="tarefa.status !== 'concluida'"\r
            (click)="concluirTarefa(tarefa)"\r
            [disabled]="concluindoId === tarefa.id"\r
          >\r
            {{ getConcluirLabel(tarefa) }}\r
          </button>\r
          <button\r
            class="btn primary btn-sm"\r
            type="button"\r
            *ngIf="tarefa.status === 'concluida'"\r
            (click)="voltarParaPendente(tarefa)"\r
            [disabled]="reabrindoId === tarefa.id"\r
          >\r
            {{ getVoltarPendenteLabel(tarefa) }}\r
          </button>\r
          <button class="btn secondary btn-sm" type="button" (click)="abrirModalEditarTarefa(tarefa)">\r
            Editar\r
          </button>\r
          <button\r
            class="btn danger btn-sm"\r
            type="button"\r
            (click)="excluirTarefa(tarefa)"\r
            [disabled]="excluindoId === tarefa.id"\r
          >\r
            {{ getExcluirLabel(tarefa) }}\r
          </button>\r
        </div>\r
      </article>\r
    </div>\r
  </article>\r
\r
  <div class="afazer-modal-backdrop" *ngIf="modalAberto" (click)="fecharModal()">\r
    <section class="afazer-modal" role="dialog" aria-modal="true" (click)="$event.stopPropagation()">\r
      <header class="afazer-modal-header">\r
        <div>\r
          <h3>{{ getTituloModal() }}</h3>\r
          <p>Defina os dados principais da tarefa.</p>\r
        </div>\r
        <button class="modal-close" type="button" (click)="fecharModal()" aria-label="Fechar">\r
          \xD7\r
        </button>\r
      </header>\r
\r
      <form class="form afazer-form" (ngSubmit)="salvarTarefa()">\r
        <label>\r
          <span>T\xEDtulo</span>\r
          <input\r
            name="tituloTarefa"\r
            type="text"\r
            [(ngModel)]="form.titulo"\r
            placeholder="Ex: Revisar chamados pendentes"\r
            required\r
          />\r
        </label>\r
\r
        <div class="afazer-form-grid">\r
          <label>\r
            <span>Empresa</span>\r
            <div class="helper-text" *ngIf="vm.vinculosErro">{{ vm.vinculosErro }}</div>\r
            <select\r
              name="empresaTarefa"\r
              [(ngModel)]="form.empresaId"\r
              (ngModelChange)="onEmpresaChange(vm.empresas)"\r
              [disabled]="vm.vinculosCarregando"\r
            >\r
              <option value="">{{ vm.vinculosCarregando ? "Carregando empresas" : "Selecione a empresa" }}</option>\r
              <option *ngFor="let empresa of vm.empresas" [value]="empresa.id">\r
                {{ empresa.nomeEmpresa }}\r
              </option>\r
            </select>\r
          </label>\r
\r
          <label>\r
            <span>Cliente</span>\r
            <div class="helper-text" *ngIf="funcionariosErro">{{ funcionariosErro }}</div>\r
            <select\r
              name="clienteTarefa"\r
              [(ngModel)]="form.clienteId"\r
              (ngModelChange)="onClienteChange()"\r
              [disabled]="!form.empresaId || funcionariosCarregando"\r
            >\r
              <option value="">\r
                {{\r
                  !form.empresaId\r
                    ? "Selecione a empresa"\r
                    : funcionariosCarregando\r
                      ? "Carregando clientes"\r
                      : funcionariosEmpresa.length === 0\r
                        ? "Empresa sem clientes"\r
                        : "Selecione o cliente"\r
                }}\r
              </option>\r
              <option *ngFor="let funcionario of funcionariosEmpresa" [value]="funcionario.id">\r
                {{ funcionario.nomeFuncionario }}\r
              </option>\r
            </select>\r
          </label>\r
\r
          <label>\r
            <span>Sistema</span>\r
            <select\r
              name="sistemaTarefa"\r
              [(ngModel)]="form.sistemaId"\r
              (ngModelChange)="onSistemaChange(vm.sistemas)"\r
              [disabled]="!form.empresaId"\r
            >\r
              <option value="">\r
                {{\r
                  !form.empresaId\r
                    ? "Selecione a empresa"\r
                    : getSistemasEmpresaOptions(form.empresaId, vm.empresas, vm.sistemas).length === 0\r
                      ? "Empresa sem sistemas"\r
                      : "Selecione o sistema"\r
                }}\r
              </option>\r
              <option\r
                *ngFor="let sistema of getSistemasEmpresaOptions(form.empresaId, vm.empresas, vm.sistemas)"\r
                [value]="sistema.id"\r
              >\r
                {{ sistema.nome }}\r
              </option>\r
            </select>\r
          </label>\r
\r
          <label>\r
            <span>Prioridade</span>\r
            <select name="prioridadeTarefa" [(ngModel)]="form.prioridade">\r
              <option *ngFor="let item of prioridadeOptions" [ngValue]="item.valor">\r
                {{ item.label }}\r
              </option>\r
            </select>\r
          </label>\r
\r
        </div>\r
\r
        <label>\r
          <span>Descri\xE7\xE3o</span>\r
          <textarea\r
            name="descricaoTarefa"\r
            rows="5"\r
            [(ngModel)]="form.descricao"\r
            placeholder="Detalhes, contexto ou pr\xF3ximos passos"\r
          ></textarea>\r
        </label>\r
\r
        <div class="afazer-modal-actions">\r
          <button class="btn secondary" type="button" (click)="fecharModal()" [disabled]="salvando">\r
            Cancelar\r
          </button>\r
          <button class="btn primary" type="submit" [disabled]="salvando">\r
            {{ getSalvarLabel() }}\r
          </button>\r
        </div>\r
      </form>\r
    </section>\r
  </div>\r
</section>\r
`, styles: ["/* src/app/pages/afazer/afazer.component.css */\n.afazer-page {\n  display: grid;\n  gap: 18px;\n}\n.afazer-header {\n  align-items: center;\n}\n.afazer-summary {\n  display: grid;\n  grid-template-columns: repeat(3, minmax(0, 1fr));\n  gap: 12px;\n}\n.summary-card {\n  min-width: 0;\n  padding: 16px;\n  border: 1px solid #dbe3ee;\n  border-radius: 12px;\n  background: #ffffff;\n  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.05);\n}\n.summary-label {\n  display: block;\n  color: var(--text-muted);\n  font-size: 12px;\n  font-weight: 700;\n}\n.summary-value {\n  display: block;\n  margin-top: 8px;\n  color: var(--text-main);\n  font-size: 28px;\n  line-height: 1;\n}\n.afazer-list-card:hover {\n  transform: none;\n}\n.afazer-list-header {\n  align-items: center;\n}\n.afazer-list-actions {\n  display: flex;\n  align-items: center;\n  justify-content: flex-end;\n  gap: 10px;\n  flex-wrap: wrap;\n}\n.afazer-list {\n  display: grid;\n  gap: 8px;\n}\n.tarefa-item {\n  display: grid;\n  grid-template-columns: minmax(132px, 0.24fr) minmax(0, 1fr) auto;\n  gap: 10px;\n  align-items: center;\n  padding: 10px 12px;\n  border: 1px solid #dbe3ee;\n  border-radius: 12px;\n  background: #ffffff;\n}\n.tarefa-status-panel {\n  display: grid;\n  align-content: center;\n  gap: 5px;\n  padding: 10px;\n  border: 1px solid #e2e8f0;\n  border-radius: 10px;\n  background: #f8fafc;\n}\n.tarefa-status-label {\n  color: var(--text-soft);\n  font-size: 10px;\n  font-weight: 800;\n  letter-spacing: 0.08em;\n  text-transform: uppercase;\n}\n.tarefa-status-value {\n  font-size: 14px;\n  line-height: 1.2;\n}\n.tarefa-prioridade-value {\n  width: fit-content;\n  min-height: 22px;\n  padding: 4px 8px;\n  border-radius: 999px;\n  font-size: 11px;\n  font-weight: 800;\n}\n.status-text-pendente {\n  color: #92400e;\n}\n.status-text-andamento {\n  color: #1d4ed8;\n}\n.status-text-concluida {\n  color: #166534;\n}\n.prioridade-text-baixa {\n  background: #f1f5f9;\n  color: #475569;\n}\n.prioridade-text-media {\n  background: #ffedd5;\n  color: #c2410c;\n}\n.prioridade-text-alta {\n  background: #fee2e2;\n  color: #b91c1c;\n}\n.tarefa-main {\n  min-width: 0;\n  align-self: center;\n}\n.tarefa-title-row {\n  display: block;\n}\n.tarefa-title-row h4 {\n  margin: 0;\n  color: var(--text-main);\n  font-size: 15px;\n  line-height: 1.25;\n  overflow-wrap: anywhere;\n}\n.tarefa-descricao {\n  margin: 5px 0 0;\n  color: var(--text-muted);\n  font-size: 13px;\n  line-height: 1.35;\n  white-space: pre-wrap;\n  overflow-wrap: anywhere;\n}\n.tarefa-meta {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 5px 12px;\n  margin-top: 7px;\n  color: var(--text-soft);\n  font-size: 12px;\n  font-weight: 700;\n}\n.tarefa-actions {\n  display: flex;\n  flex-direction: row;\n  align-items: stretch;\n  justify-content: center;\n  gap: 6px;\n  min-width: 0;\n}\n.btn-sm {\n  height: 30px;\n  padding: 0 10px;\n  border-radius: 9px;\n  font-size: 11px;\n}\n.afazer-modal-backdrop {\n  position: fixed;\n  inset: 0;\n  z-index: 50;\n  display: grid;\n  place-items: center;\n  padding: 24px;\n  background: rgba(15, 23, 42, 0.48);\n}\n.afazer-modal {\n  width: min(640px, 100%);\n  max-height: calc(100dvh - 48px);\n  overflow: auto;\n  border-radius: 14px;\n  background: #ffffff;\n  box-shadow: 0 24px 70px rgba(15, 23, 42, 0.28);\n}\n.afazer-modal-header {\n  display: flex;\n  justify-content: space-between;\n  gap: 16px;\n  align-items: flex-start;\n  padding: 20px 22px 14px;\n  border-bottom: 1px solid #e2e8f0;\n}\n.afazer-modal-header h3 {\n  margin: 0;\n  color: var(--text-main);\n  font-size: 20px;\n}\n.afazer-modal-header p {\n  margin: 6px 0 0;\n  color: var(--text-muted);\n  font-size: 13px;\n}\n.modal-close {\n  display: inline-grid;\n  place-items: center;\n  width: 34px;\n  height: 34px;\n  border: 1px solid #dbe3ee;\n  border-radius: 10px;\n  background: #ffffff;\n  color: var(--text-muted);\n  font-size: 22px;\n  line-height: 1;\n  cursor: pointer;\n}\n.modal-close:hover {\n  border-color: #bfdbfe;\n  color: var(--text-main);\n}\n.afazer-form {\n  padding: 20px 22px 22px;\n}\n.afazer-form-grid {\n  display: grid;\n  grid-template-columns: repeat(3, minmax(0, 1fr));\n  gap: 12px;\n}\n.afazer-form textarea {\n  min-height: 120px;\n  resize: vertical;\n}\n.afazer-modal-actions {\n  display: flex;\n  justify-content: flex-end;\n  gap: 10px;\n  padding-top: 4px;\n}\n@media (max-width: 900px) {\n  .afazer-summary {\n    grid-template-columns: repeat(2, minmax(0, 1fr));\n  }\n  .afazer-list-actions {\n    justify-content: flex-start;\n  }\n}\n@media (max-width: 640px) {\n  .afazer-header {\n    align-items: stretch;\n  }\n  .afazer-header .btn {\n    width: 100%;\n  }\n  .afazer-summary,\n  .afazer-form-grid {\n    grid-template-columns: 1fr;\n  }\n  .tarefa-item {\n    grid-template-columns: 1fr;\n  }\n  .tarefa-status-panel {\n    min-height: auto;\n  }\n  .tarefa-actions,\n  .afazer-list-actions,\n  .afazer-modal-actions {\n    flex-direction: column;\n  }\n  .tarefa-actions {\n    justify-content: stretch;\n  }\n  .afazer-list-actions {\n    align-items: stretch;\n  }\n  .afazer-modal-backdrop {\n    padding: 14px;\n  }\n}\n/*# sourceMappingURL=afazer.component.css.map */\n"] }]
  }], () => [{ type: TarefasService }, { type: EmpresasService }, { type: SistemasService }, { type: ToastService }, { type: NgZone }, { type: ChangeDetectorRef }], null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(AfazerComponent, { className: "AfazerComponent", filePath: "src/app/pages/afazer/afazer.component.ts", lineNumber: 67 });
})();
export {
  AfazerComponent
};
//# sourceMappingURL=chunk-ULWXBDLE.js.map
