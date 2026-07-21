import {
  SistemasService
} from "./chunk-KBJR2FPL.js";
import {
  AsyncPipe,
  ChangeDetectionStrategy,
  CommonModule,
  Component,
  DefaultValueAccessor,
  FormsModule,
  NgControlStatus,
  NgControlStatusGroup,
  NgForOf,
  NgForm,
  NgIf,
  NgModel,
  RequiredValidator,
  ToastService,
  map,
  setClassMetadata,
  ɵNgNoValidate,
  ɵsetClassDebugInfo,
  ɵɵadvance,
  ɵɵdefineComponent,
  ɵɵdirectiveInject,
  ɵɵelement,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵgetCurrentView,
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
  ɵɵtwoWayBindingSet,
  ɵɵtwoWayListener,
  ɵɵtwoWayProperty
} from "./chunk-SRMKRKBP.js";
import "./chunk-GOMI4DH3.js";

// src/app/pages/sistemas/sistemas.component.ts
function SistemasComponent_section_0_div_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 4);
    \u0275\u0275element(1, "div", 5)(2, "div", 5);
    \u0275\u0275elementEnd();
  }
}
function SistemasComponent_section_0_div_2_div_35_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 26);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const vm_r3 = \u0275\u0275nextContext(2).ngIf;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(vm_r3.erro);
  }
}
function SistemasComponent_section_0_div_2_div_36_div_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 26);
    \u0275\u0275text(1, " Nenhum sistema cadastrado. ");
    \u0275\u0275elementEnd();
  }
}
function SistemasComponent_section_0_div_2_div_36_div_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r4 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 29)(1, "div", 30)(2, "div", 31);
    \u0275\u0275text(3);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "div", 32)(5, "span", 33);
    \u0275\u0275text(6, "ID");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "code", 34);
    \u0275\u0275text(8);
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(9, "button", 35);
    \u0275\u0275listener("click", function SistemasComponent_section_0_div_2_div_36_div_2_Template_button_click_9_listener() {
      const item_r5 = \u0275\u0275restoreView(_r4).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(4);
      return \u0275\u0275resetView(ctx_r1.excluirSistema(item_r5));
    });
    \u0275\u0275text(10);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const item_r5 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext(4);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(item_r5.nome);
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(item_r5.id);
    \u0275\u0275advance();
    \u0275\u0275property("disabled", ctx_r1.excluindoId === item_r5.id);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", ctx_r1.getExcluirLabel(item_r5), " ");
  }
}
function SistemasComponent_section_0_div_2_div_36_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 27);
    \u0275\u0275template(1, SistemasComponent_section_0_div_2_div_36_div_1_Template, 2, 0, "div", 24)(2, SistemasComponent_section_0_div_2_div_36_div_2_Template, 11, 4, "div", 28);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const vm_r3 = \u0275\u0275nextContext(2).ngIf;
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", vm_r3.sistemas.length === 0);
    \u0275\u0275advance();
    \u0275\u0275property("ngForOf", vm_r3.sistemas)("ngForTrackBy", ctx_r1.trackBySistema);
  }
}
function SistemasComponent_section_0_div_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 6)(1, "article", 7)(2, "div", 8)(3, "div")(4, "h3", 9);
    \u0275\u0275text(5, "Novo sistema");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "p", 10);
    \u0275\u0275text(7, "Preencha o nome e mantenha o cadastro sempre vis\xEDvel.");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(8, "form", 11);
    \u0275\u0275listener("ngSubmit", function SistemasComponent_section_0_div_2_Template_form_ngSubmit_8_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.adicionarSistema());
    });
    \u0275\u0275elementStart(9, "label")(10, "span");
    \u0275\u0275text(11, "Nome do sistema");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(12, "input", 12);
    \u0275\u0275twoWayListener("ngModelChange", function SistemasComponent_section_0_div_2_Template_input_ngModelChange_12_listener($event) {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext(2);
      \u0275\u0275twoWayBindingSet(ctx_r1.nome, $event) || (ctx_r1.nome = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(13, "div", 13)(14, "span", 14);
    \u0275\u0275text(15, "ID gerado automaticamente");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(16, "code", 15);
    \u0275\u0275text(17);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(18, "div", 16);
    \u0275\u0275text(19, " O ID \xE9 criado a partir do nome e ser\xE1 usado como refer\xEAncia interna. ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(20, "div", 17)(21, "button", 18);
    \u0275\u0275text(22);
    \u0275\u0275elementEnd()()()();
    \u0275\u0275elementStart(23, "article", 19)(24, "div", 20)(25, "div")(26, "h3", 9);
    \u0275\u0275text(27, "Lista de sistemas");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(28, "p", 10);
    \u0275\u0275text(29, "A lista rola internamente sem empurrar o formul\xE1rio.");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(30, "div", 21)(31, "span", 22);
    \u0275\u0275text(32);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(33, "span", 23);
    \u0275\u0275text(34, "IDs padronizados");
    \u0275\u0275elementEnd()()();
    \u0275\u0275template(35, SistemasComponent_section_0_div_2_div_35_Template, 2, 1, "div", 24)(36, SistemasComponent_section_0_div_2_div_36_Template, 3, 3, "div", 25);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const vm_r3 = \u0275\u0275nextContext().ngIf;
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(12);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.nome);
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(ctx_r1.getSistemaIdPreview() || "-");
    \u0275\u0275advance(4);
    \u0275\u0275property("disabled", ctx_r1.salvando);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", ctx_r1.salvando ? "Adicionando..." : "Adicionar sistema", " ");
    \u0275\u0275advance(10);
    \u0275\u0275textInterpolate1("Total: ", vm_r3.total);
    \u0275\u0275advance(3);
    \u0275\u0275property("ngIf", !!vm_r3.erro);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", !vm_r3.erro);
  }
}
function SistemasComponent_section_0_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "section", 1);
    \u0275\u0275template(1, SistemasComponent_section_0_div_1_Template, 3, 0, "div", 2)(2, SistemasComponent_section_0_div_2_Template, 37, 7, "div", 3);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const vm_r3 = ctx.ngIf;
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", vm_r3.carregando && vm_r3.sistemas.length === 0);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", !vm_r3.carregando || vm_r3.sistemas.length > 0);
  }
}
var SistemasComponent = class _SistemasComponent {
  sistemasService;
  toast;
  nome = "";
  salvando = false;
  excluindoId = null;
  vm$;
  constructor(sistemasService, toast) {
    this.sistemasService = sistemasService;
    this.toast = toast;
    this.vm$ = this.sistemasService.sistemasState$.pipe(map((state) => {
      const sistemas = this.sortSistemas(state.data);
      return {
        carregando: state.status === "loading",
        erro: state.error,
        sistemas,
        total: sistemas.length
      };
    }));
  }
  trackBySistema(_, item) {
    return item.id ?? item.nome;
  }
  getSistemaIdPreview() {
    return this.sistemasService.buildSistemaId(this.nome);
  }
  async adicionarSistema() {
    if (this.salvando) {
      return;
    }
    const nome = this.nome.trim();
    if (!nome) {
      this.toast.show("Informe o nome do sistema.", "error");
      return;
    }
    this.salvando = true;
    try {
      await this.sistemasService.createSistema(nome);
      this.toast.show("Sistema cadastrado com sucesso.", "success");
      this.nome = "";
    } catch (err) {
      this.toast.show(`Erro ao cadastrar sistema: ${err?.message || err}`, "error");
    } finally {
      this.salvando = false;
    }
  }
  async excluirSistema(item) {
    if (!item.id || this.excluindoId === item.id) {
      return;
    }
    const ok = window.confirm("Deseja excluir este sistema?");
    if (!ok) {
      return;
    }
    this.excluindoId = item.id;
    try {
      await this.sistemasService.deleteSistema(item);
      this.toast.show("Sistema exclu\xEDdo.", "success");
    } catch (err) {
      this.toast.show(`Erro ao excluir sistema: ${err?.message || err}`, "error");
    } finally {
      if (this.excluindoId === item.id) {
        this.excluindoId = null;
      }
    }
  }
  getExcluirLabel(item) {
    return this.excluindoId === item.id ? "Excluindo..." : "Excluir";
  }
  sortSistemas(items) {
    return [...items].sort((a, b) => (a.nome || "").localeCompare(b.nome || "", "pt-BR"));
  }
  static \u0275fac = function SistemasComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _SistemasComponent)(\u0275\u0275directiveInject(SistemasService), \u0275\u0275directiveInject(ToastService));
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _SistemasComponent, selectors: [["app-sistemas"]], decls: 2, vars: 3, consts: [["class", "page-section sistemas-page", 4, "ngIf"], [1, "page-section", "sistemas-page"], ["class", "grid-2", 4, "ngIf"], ["class", "sistemas-layout", 4, "ngIf"], [1, "grid-2"], [1, "skeleton", 2, "min-height", "280px"], [1, "sistemas-layout"], [1, "card", "sistemas-col", "sistemas-form-card"], [1, "card-title-row"], [1, "card-title"], [1, "card-subtitle"], [1, "form", "sistemas-form", 3, "ngSubmit"], ["name", "nomeSistema", "type", "text", "placeholder", "Ex: SG8, Transmissor SG8, Office", "required", "", 3, "ngModelChange", "ngModel"], [1, "sistemas-id-preview"], [1, "sistemas-id-preview-label"], [1, "sistemas-id-preview-value"], [1, "helper-text"], [1, "sistemas-form-actions"], ["type", "submit", 1, "btn", "primary", "sistemas-submit-btn", 3, "disabled"], [1, "card", "sistemas-col", "sistemas-list-card"], [1, "card-title-row", "sistemas-list-header"], [1, "sistemas-hero-actions"], [1, "status-chip"], [1, "status-chip", "neutral"], ["class", "empty-state", 4, "ngIf"], ["class", "sistemas-list-scroll", 4, "ngIf"], [1, "empty-state"], [1, "sistemas-list-scroll"], ["class", "sistema-item", 4, "ngFor", "ngForOf", "ngForTrackBy"], [1, "sistema-item"], [1, "sistema-item-main"], [1, "sistema-item-name"], [1, "sistema-item-meta"], [1, "sistema-item-id-label"], [1, "sistema-item-id"], ["type", "button", 1, "btn", "danger", "btn-sm", 3, "click", "disabled"]], template: function SistemasComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275template(0, SistemasComponent_section_0_Template, 3, 2, "section", 0);
      \u0275\u0275pipe(1, "async");
    }
    if (rf & 2) {
      \u0275\u0275property("ngIf", \u0275\u0275pipeBind1(1, 1, ctx.vm$));
    }
  }, dependencies: [CommonModule, NgForOf, NgIf, FormsModule, \u0275NgNoValidate, DefaultValueAccessor, NgControlStatus, NgControlStatusGroup, RequiredValidator, NgModel, NgForm, AsyncPipe], styles: ['\n\n.sistemas-page[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 18px;\n  margin: 0;\n}\n.sistemas-hero[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 18px;\n  padding: 28px;\n  background:\n    radial-gradient(\n      circle at top right,\n      rgba(59, 130, 246, 0.18),\n      transparent 32%),\n    linear-gradient(\n      180deg,\n      #ffffff 0%,\n      #f8fafc 100%);\n}\n.sistemas-hero-copy[_ngcontent-%COMP%] {\n  min-width: 0;\n}\n.sistemas-kicker[_ngcontent-%COMP%] {\n  display: inline-flex;\n  margin-bottom: 8px;\n  padding: 5px 10px;\n  border-radius: 999px;\n  border: 1px solid #bfdbfe;\n  background: #eff6ff;\n  color: #1d4ed8;\n  font-size: 11px;\n  font-weight: 700;\n  letter-spacing: 0.08em;\n  text-transform: uppercase;\n}\n.sistemas-title[_ngcontent-%COMP%] {\n  font-size: 28px;\n  line-height: 1.1;\n}\n.sistemas-subtitle[_ngcontent-%COMP%] {\n  margin-top: 8px;\n  max-width: 620px;\n  font-size: 14px;\n  line-height: 1.55;\n}\n.sistemas-hero-actions[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: flex-end;\n  gap: 12px;\n  flex-wrap: wrap;\n}\n.sistemas-layout[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: 360px minmax(0, 1fr);\n  gap: 18px;\n  align-items: stretch;\n  margin: 0;\n}\n.sistemas-col[_ngcontent-%COMP%] {\n  min-width: 0;\n  display: flex;\n  flex-direction: column;\n  overflow: hidden;\n}\n.sistemas-form-card[_ngcontent-%COMP%], \n.sistemas-list-card[_ngcontent-%COMP%] {\n  height: 100%;\n}\n.sistemas-form-card[_ngcontent-%COMP%]:hover, \n.sistemas-list-card[_ngcontent-%COMP%]:hover {\n  transform: none;\n}\n.sistemas-form[_ngcontent-%COMP%] {\n  flex: 1;\n  min-height: 0;\n  display: flex;\n  flex-direction: column;\n}\n.sistemas-id-preview[_ngcontent-%COMP%] {\n  display: grid;\n  gap: 8px;\n  padding: 14px;\n  border: 1px solid #dbe3ee;\n  border-radius: 14px;\n  background:\n    linear-gradient(\n      180deg,\n      #f8fafc 0%,\n      #ffffff 100%);\n}\n.sistemas-id-preview-label[_ngcontent-%COMP%] {\n  font-size: 11px;\n  font-weight: 700;\n  color: var(--text-soft);\n  letter-spacing: 0.06em;\n  text-transform: uppercase;\n}\n.sistemas-id-preview-value[_ngcontent-%COMP%] {\n  display: inline-flex;\n  width: fit-content;\n  max-width: 100%;\n  padding: 6px 10px;\n  border-radius: 999px;\n  background: #eff6ff;\n  color: #1d4ed8;\n  font-size: 12px;\n  font-weight: 700;\n  font-family:\n    "Consolas",\n    "Courier New",\n    monospace;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n.sistemas-form-actions[_ngcontent-%COMP%] {\n  margin-top: auto;\n  padding-top: 14px;\n}\n.sistemas-submit-btn[_ngcontent-%COMP%] {\n  width: 100%;\n  min-height: 44px;\n}\n.sistemas-list-header[_ngcontent-%COMP%] {\n  align-items: center;\n  flex: 0 0 auto;\n}\n.sistemas-list-scroll[_ngcontent-%COMP%] {\n  flex: 1;\n  min-height: 0;\n  overflow-y: auto;\n  display: grid;\n  align-content: start;\n  gap: 12px;\n  padding-right: 4px;\n  overscroll-behavior: contain;\n}\n.sistema-item[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: minmax(0, 1fr) auto;\n  align-items: center;\n  gap: 14px;\n  padding: 14px 16px;\n  border: 1px solid #dbe3ee;\n  border-radius: 14px;\n  background:\n    linear-gradient(\n      180deg,\n      #f8fafc 0%,\n      #ffffff 100%);\n  transition:\n    border-color var(--transition-fast),\n    box-shadow var(--transition-fast),\n    background var(--transition-fast),\n    transform var(--transition-fast);\n}\n.sistema-item[_ngcontent-%COMP%]:hover {\n  transform: translateY(-1px);\n  border-color: #bfdbfe;\n  background:\n    linear-gradient(\n      180deg,\n      #ffffff 0%,\n      #f8fbff 100%);\n  box-shadow: 0 12px 22px rgba(15, 23, 42, 0.08);\n}\n.sistema-item-main[_ngcontent-%COMP%] {\n  min-width: 0;\n}\n.sistema-item-name[_ngcontent-%COMP%] {\n  font-size: 15px;\n  font-weight: 800;\n  color: var(--text-main);\n  line-height: 1.35;\n}\n.sistema-item-meta[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  margin-top: 6px;\n  min-width: 0;\n}\n.sistema-item-id-label[_ngcontent-%COMP%] {\n  font-size: 11px;\n  font-weight: 700;\n  color: var(--text-soft);\n  letter-spacing: 0.05em;\n  text-transform: uppercase;\n}\n.sistema-item-id[_ngcontent-%COMP%] {\n  font-size: 12px;\n  color: var(--text-muted);\n  font-family:\n    "Consolas",\n    "Courier New",\n    monospace;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n.btn-sm[_ngcontent-%COMP%] {\n  height: 32px;\n  padding: 0 12px;\n  font-size: 12px;\n  border-radius: 9px;\n}\n.sistemas-list-scroll[_ngcontent-%COMP%]::-webkit-scrollbar {\n  width: 10px;\n}\n.sistemas-list-scroll[_ngcontent-%COMP%]::-webkit-scrollbar-thumb {\n  background: #cfdaec;\n  border-radius: 999px;\n  border: 2px solid #f8fbff;\n}\n.sistemas-list-scroll[_ngcontent-%COMP%]::-webkit-scrollbar-track {\n  background: #f3f7fd;\n}\n@media (min-width: 1025px) {\n  .sistemas-page[_ngcontent-%COMP%] {\n    height: calc(100dvh - var(--header-height) - 56px);\n    min-height: 0;\n    overflow: hidden;\n  }\n  .sistemas-layout[_ngcontent-%COMP%] {\n    flex: 1;\n    min-height: 0;\n    overflow: hidden;\n  }\n}\n@media (max-width: 1024px) {\n  .sistemas-layout[_ngcontent-%COMP%] {\n    grid-template-columns: 1fr;\n  }\n  .sistemas-form-card[_ngcontent-%COMP%], \n   .sistemas-list-card[_ngcontent-%COMP%] {\n    height: auto;\n  }\n  .sistemas-list-scroll[_ngcontent-%COMP%] {\n    max-height: 58vh;\n  }\n}\n@media (max-width: 720px) {\n  .sistemas-hero[_ngcontent-%COMP%] {\n    flex-direction: column;\n    align-items: stretch;\n  }\n  .sistemas-hero-actions[_ngcontent-%COMP%] {\n    justify-content: space-between;\n  }\n  .sistemas-list-header[_ngcontent-%COMP%], \n   .sistema-item[_ngcontent-%COMP%] {\n    grid-template-columns: 1fr;\n  }\n  .sistemas-list-header[_ngcontent-%COMP%] {\n    gap: 10px;\n  }\n  .sistema-item[_ngcontent-%COMP%]   .btn[_ngcontent-%COMP%] {\n    width: 100%;\n  }\n}\n.sistemas-form-card[_ngcontent-%COMP%], \n.sistemas-list-card[_ngcontent-%COMP%] {\n  background:\n    linear-gradient(\n      180deg,\n      #ffffff 0%,\n      #f8fbff 100%);\n}\n.sistemas-id-preview[_ngcontent-%COMP%], \n.sistema-item[_ngcontent-%COMP%] {\n  border-radius: var(--radius-md);\n  background: #ffffff;\n}\n.sistema-item[_ngcontent-%COMP%]:hover {\n  transform: none;\n}\n.sistemas-list-scroll[_ngcontent-%COMP%] {\n  padding-right: 6px;\n}\n/*# sourceMappingURL=sistemas.component.css.map */'], changeDetection: 0 });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(SistemasComponent, [{
    type: Component,
    args: [{ selector: "app-sistemas", standalone: true, imports: [CommonModule, FormsModule], changeDetection: ChangeDetectionStrategy.OnPush, template: '<section class="page-section sistemas-page" *ngIf="vm$ | async as vm">\r\n  <div class="grid-2" *ngIf="vm.carregando && vm.sistemas.length === 0">\r\n    <div class="skeleton" style="min-height: 280px;"></div>\r\n    <div class="skeleton" style="min-height: 280px;"></div>\r\n  </div>\r\n\r\n  <div class="sistemas-layout" *ngIf="!vm.carregando || vm.sistemas.length > 0">\r\n    <article class="card sistemas-col sistemas-form-card">\r\n      <div class="card-title-row">\r\n        <div>\r\n          <h3 class="card-title">Novo sistema</h3>\r\n          <p class="card-subtitle">Preencha o nome e mantenha o cadastro sempre vis\xEDvel.</p>\r\n        </div>\r\n      </div>\r\n\r\n      <form class="form sistemas-form" (ngSubmit)="adicionarSistema()">\r\n        <label>\r\n          <span>Nome do sistema</span>\r\n          <input\r\n            name="nomeSistema"\r\n            type="text"\r\n            [(ngModel)]="nome"\r\n            placeholder="Ex: SG8, Transmissor SG8, Office"\r\n            required\r\n          />\r\n        </label>\r\n\r\n        <div class="sistemas-id-preview">\r\n          <span class="sistemas-id-preview-label">ID gerado automaticamente</span>\r\n          <code class="sistemas-id-preview-value">{{ getSistemaIdPreview() || "-" }}</code>\r\n        </div>\r\n\r\n        <div class="helper-text">\r\n          O ID \xE9 criado a partir do nome e ser\xE1 usado como refer\xEAncia interna.\r\n        </div>\r\n\r\n        <div class="sistemas-form-actions">\r\n          <button class="btn primary sistemas-submit-btn" type="submit" [disabled]="salvando">\r\n            {{ salvando ? "Adicionando..." : "Adicionar sistema" }}\r\n          </button>\r\n        </div>\r\n      </form>\r\n    </article>\r\n\r\n    <article class="card sistemas-col sistemas-list-card">\r\n      <div class="card-title-row sistemas-list-header">\r\n        <div>\r\n          <h3 class="card-title">Lista de sistemas</h3>\r\n          <p class="card-subtitle">A lista rola internamente sem empurrar o formul\xE1rio.</p>\r\n        </div>\r\n        <div class="sistemas-hero-actions">\r\n          <span class="status-chip">Total: {{ vm.total }}</span>\r\n          <span class="status-chip neutral">IDs padronizados</span>\r\n        </div>\r\n      </div>\r\n\r\n      <div class="empty-state" *ngIf="!!vm.erro">{{ vm.erro }}</div>\r\n\r\n      <div class="sistemas-list-scroll" *ngIf="!vm.erro">\r\n        <div class="empty-state" *ngIf="vm.sistemas.length === 0">\r\n          Nenhum sistema cadastrado.\r\n        </div>\r\n\r\n        <div class="sistema-item" *ngFor="let item of vm.sistemas; trackBy: trackBySistema">\r\n          <div class="sistema-item-main">\r\n            <div class="sistema-item-name">{{ item.nome }}</div>\r\n            <div class="sistema-item-meta">\r\n              <span class="sistema-item-id-label">ID</span>\r\n              <code class="sistema-item-id">{{ item.id }}</code>\r\n            </div>\r\n          </div>\r\n\r\n          <button\r\n            class="btn danger btn-sm"\r\n            type="button"\r\n            (click)="excluirSistema(item)"\r\n            [disabled]="excluindoId === item.id"\r\n          >\r\n            {{ getExcluirLabel(item) }}\r\n          </button>\r\n        </div>\r\n      </div>\r\n    </article>\r\n  </div>\r\n</section>\r\n', styles: ['/* src/app/pages/sistemas/sistemas.component.css */\n.sistemas-page {\n  display: flex;\n  flex-direction: column;\n  gap: 18px;\n  margin: 0;\n}\n.sistemas-hero {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 18px;\n  padding: 28px;\n  background:\n    radial-gradient(\n      circle at top right,\n      rgba(59, 130, 246, 0.18),\n      transparent 32%),\n    linear-gradient(\n      180deg,\n      #ffffff 0%,\n      #f8fafc 100%);\n}\n.sistemas-hero-copy {\n  min-width: 0;\n}\n.sistemas-kicker {\n  display: inline-flex;\n  margin-bottom: 8px;\n  padding: 5px 10px;\n  border-radius: 999px;\n  border: 1px solid #bfdbfe;\n  background: #eff6ff;\n  color: #1d4ed8;\n  font-size: 11px;\n  font-weight: 700;\n  letter-spacing: 0.08em;\n  text-transform: uppercase;\n}\n.sistemas-title {\n  font-size: 28px;\n  line-height: 1.1;\n}\n.sistemas-subtitle {\n  margin-top: 8px;\n  max-width: 620px;\n  font-size: 14px;\n  line-height: 1.55;\n}\n.sistemas-hero-actions {\n  display: flex;\n  align-items: center;\n  justify-content: flex-end;\n  gap: 12px;\n  flex-wrap: wrap;\n}\n.sistemas-layout {\n  display: grid;\n  grid-template-columns: 360px minmax(0, 1fr);\n  gap: 18px;\n  align-items: stretch;\n  margin: 0;\n}\n.sistemas-col {\n  min-width: 0;\n  display: flex;\n  flex-direction: column;\n  overflow: hidden;\n}\n.sistemas-form-card,\n.sistemas-list-card {\n  height: 100%;\n}\n.sistemas-form-card:hover,\n.sistemas-list-card:hover {\n  transform: none;\n}\n.sistemas-form {\n  flex: 1;\n  min-height: 0;\n  display: flex;\n  flex-direction: column;\n}\n.sistemas-id-preview {\n  display: grid;\n  gap: 8px;\n  padding: 14px;\n  border: 1px solid #dbe3ee;\n  border-radius: 14px;\n  background:\n    linear-gradient(\n      180deg,\n      #f8fafc 0%,\n      #ffffff 100%);\n}\n.sistemas-id-preview-label {\n  font-size: 11px;\n  font-weight: 700;\n  color: var(--text-soft);\n  letter-spacing: 0.06em;\n  text-transform: uppercase;\n}\n.sistemas-id-preview-value {\n  display: inline-flex;\n  width: fit-content;\n  max-width: 100%;\n  padding: 6px 10px;\n  border-radius: 999px;\n  background: #eff6ff;\n  color: #1d4ed8;\n  font-size: 12px;\n  font-weight: 700;\n  font-family:\n    "Consolas",\n    "Courier New",\n    monospace;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n.sistemas-form-actions {\n  margin-top: auto;\n  padding-top: 14px;\n}\n.sistemas-submit-btn {\n  width: 100%;\n  min-height: 44px;\n}\n.sistemas-list-header {\n  align-items: center;\n  flex: 0 0 auto;\n}\n.sistemas-list-scroll {\n  flex: 1;\n  min-height: 0;\n  overflow-y: auto;\n  display: grid;\n  align-content: start;\n  gap: 12px;\n  padding-right: 4px;\n  overscroll-behavior: contain;\n}\n.sistema-item {\n  display: grid;\n  grid-template-columns: minmax(0, 1fr) auto;\n  align-items: center;\n  gap: 14px;\n  padding: 14px 16px;\n  border: 1px solid #dbe3ee;\n  border-radius: 14px;\n  background:\n    linear-gradient(\n      180deg,\n      #f8fafc 0%,\n      #ffffff 100%);\n  transition:\n    border-color var(--transition-fast),\n    box-shadow var(--transition-fast),\n    background var(--transition-fast),\n    transform var(--transition-fast);\n}\n.sistema-item:hover {\n  transform: translateY(-1px);\n  border-color: #bfdbfe;\n  background:\n    linear-gradient(\n      180deg,\n      #ffffff 0%,\n      #f8fbff 100%);\n  box-shadow: 0 12px 22px rgba(15, 23, 42, 0.08);\n}\n.sistema-item-main {\n  min-width: 0;\n}\n.sistema-item-name {\n  font-size: 15px;\n  font-weight: 800;\n  color: var(--text-main);\n  line-height: 1.35;\n}\n.sistema-item-meta {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  margin-top: 6px;\n  min-width: 0;\n}\n.sistema-item-id-label {\n  font-size: 11px;\n  font-weight: 700;\n  color: var(--text-soft);\n  letter-spacing: 0.05em;\n  text-transform: uppercase;\n}\n.sistema-item-id {\n  font-size: 12px;\n  color: var(--text-muted);\n  font-family:\n    "Consolas",\n    "Courier New",\n    monospace;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n.btn-sm {\n  height: 32px;\n  padding: 0 12px;\n  font-size: 12px;\n  border-radius: 9px;\n}\n.sistemas-list-scroll::-webkit-scrollbar {\n  width: 10px;\n}\n.sistemas-list-scroll::-webkit-scrollbar-thumb {\n  background: #cfdaec;\n  border-radius: 999px;\n  border: 2px solid #f8fbff;\n}\n.sistemas-list-scroll::-webkit-scrollbar-track {\n  background: #f3f7fd;\n}\n@media (min-width: 1025px) {\n  .sistemas-page {\n    height: calc(100dvh - var(--header-height) - 56px);\n    min-height: 0;\n    overflow: hidden;\n  }\n  .sistemas-layout {\n    flex: 1;\n    min-height: 0;\n    overflow: hidden;\n  }\n}\n@media (max-width: 1024px) {\n  .sistemas-layout {\n    grid-template-columns: 1fr;\n  }\n  .sistemas-form-card,\n  .sistemas-list-card {\n    height: auto;\n  }\n  .sistemas-list-scroll {\n    max-height: 58vh;\n  }\n}\n@media (max-width: 720px) {\n  .sistemas-hero {\n    flex-direction: column;\n    align-items: stretch;\n  }\n  .sistemas-hero-actions {\n    justify-content: space-between;\n  }\n  .sistemas-list-header,\n  .sistema-item {\n    grid-template-columns: 1fr;\n  }\n  .sistemas-list-header {\n    gap: 10px;\n  }\n  .sistema-item .btn {\n    width: 100%;\n  }\n}\n.sistemas-form-card,\n.sistemas-list-card {\n  background:\n    linear-gradient(\n      180deg,\n      #ffffff 0%,\n      #f8fbff 100%);\n}\n.sistemas-id-preview,\n.sistema-item {\n  border-radius: var(--radius-md);\n  background: #ffffff;\n}\n.sistema-item:hover {\n  transform: none;\n}\n.sistemas-list-scroll {\n  padding-right: 6px;\n}\n/*# sourceMappingURL=sistemas.component.css.map */\n'] }]
  }], () => [{ type: SistemasService }, { type: ToastService }], null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(SistemasComponent, { className: "SistemasComponent", filePath: "src/app/pages/sistemas/sistemas.component.ts", lineNumber: 24 });
})();
export {
  SistemasComponent
};
//# sourceMappingURL=chunk-QEZYVWLX.js.map
