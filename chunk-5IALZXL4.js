import {
  ChamadosService
} from "./chunk-F7YXGS3T.js";
import {
  EmpresasService,
  isValidPhone12Digits,
  normalizePhoneTo12Digits
} from "./chunk-E7I6VKBJ.js";
import {
  SistemasService
} from "./chunk-KBJR2FPL.js";
import {
  AsyncPipe,
  BehaviorSubject,
  ChangeDetectionStrategy,
  CheckboxControlValueAccessor,
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
  NgZone,
  RequiredValidator,
  ToastService,
  combineLatest,
  map,
  setClassMetadata,
  ɵNgNoValidate,
  ɵsetClassDebugInfo,
  ɵɵadvance,
  ɵɵattribute,
  ɵɵclassProp,
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
  ɵɵreference,
  ɵɵresetView,
  ɵɵrestoreView,
  ɵɵtemplate,
  ɵɵtemplateRefExtractor,
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

// src/app/pages/empresas/empresas.component.ts
function EmpresasComponent_section_0_div_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 5);
    \u0275\u0275element(1, "div", 6);
    \u0275\u0275elementEnd();
  }
}
function EmpresasComponent_section_0_div_2_div_13_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 16);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const vm_r3 = \u0275\u0275nextContext(2).ngIf;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(vm_r3.erro);
  }
}
function EmpresasComponent_section_0_div_2_div_14_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 16);
    \u0275\u0275text(1, " Nenhuma empresa cadastrada. ");
    \u0275\u0275elementEnd();
  }
}
function EmpresasComponent_section_0_div_2_div_15_article_1_div_7_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 37);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const item_r5 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(item_r5.observacoes);
  }
}
function EmpresasComponent_section_0_div_2_div_15_article_1_div_11_span_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 41);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const sistema_r6 = ctx.$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", sistema_r6, " ");
  }
}
function EmpresasComponent_section_0_div_2_div_15_article_1_div_11_span_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 42);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const item_r5 = \u0275\u0275nextContext(2).$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" +", item_r5.sistemasExtras, " ");
  }
}
function EmpresasComponent_section_0_div_2_div_15_article_1_div_11_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 38);
    \u0275\u0275template(1, EmpresasComponent_section_0_div_2_div_15_article_1_div_11_span_1_Template, 2, 1, "span", 39)(2, EmpresasComponent_section_0_div_2_div_15_article_1_div_11_span_2_Template, 2, 1, "span", 40);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const item_r5 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275property("ngForOf", item_r5.sistemasVisiveis);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", item_r5.sistemasExtras > 0);
  }
}
function EmpresasComponent_section_0_div_2_div_15_article_1_ng_template_12_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 43);
    \u0275\u0275text(1, "Sem sistemas");
    \u0275\u0275elementEnd();
  }
}
function EmpresasComponent_section_0_div_2_div_15_article_1_div_26_div_9_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 16);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const vm_r3 = \u0275\u0275nextContext(5).ngIf;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(vm_r3.funcionariosErro);
  }
}
function EmpresasComponent_section_0_div_2_div_15_article_1_div_26_div_10_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "div", 49);
  }
}
function EmpresasComponent_section_0_div_2_div_15_article_1_div_26_div_11_div_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 16);
    \u0275\u0275text(1, " Nenhum funcion\xE1rio cadastrado. ");
    \u0275\u0275elementEnd();
  }
}
function EmpresasComponent_section_0_div_2_div_15_article_1_div_26_div_11_div_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r8 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 52)(1, "div", 53)(2, "div", 54);
    \u0275\u0275text(3);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "div", 55);
    \u0275\u0275text(5);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(6, "div", 56)(7, "span", 12);
    \u0275\u0275text(8);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(9, "div", 31)(10, "button", 32);
    \u0275\u0275listener("click", function EmpresasComponent_section_0_div_2_div_15_article_1_div_26_div_11_div_2_Template_button_click_10_listener($event) {
      const funcionario_r9 = \u0275\u0275restoreView(_r8).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(7);
      ctx_r1.abrirEdicaoFuncionario(funcionario_r9);
      return \u0275\u0275resetView($event.stopPropagation());
    });
    \u0275\u0275text(11, " Editar ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(12, "button", 33);
    \u0275\u0275listener("click", function EmpresasComponent_section_0_div_2_div_15_article_1_div_26_div_11_div_2_Template_button_click_12_listener($event) {
      const funcionario_r9 = \u0275\u0275restoreView(_r8).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(7);
      ctx_r1.excluirFuncionario(funcionario_r9);
      return \u0275\u0275resetView($event.stopPropagation());
    });
    \u0275\u0275text(13, " Excluir ");
    \u0275\u0275elementEnd()()()();
  }
  if (rf & 2) {
    const funcionario_r9 = ctx.$implicit;
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(funcionario_r9.nomeFuncionario);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1(" ", funcionario_r9.telefone || "Telefone n\xE3o informado", " ");
    \u0275\u0275advance(2);
    \u0275\u0275classProp("warning", (funcionario_r9 == null ? null : funcionario_r9.criarChamadoAutomatico) === false);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", (funcionario_r9 == null ? null : funcionario_r9.criarChamadoAutomatico) === false ? "WhatsApp desativado" : "WhatsApp ativado", " ");
  }
}
function EmpresasComponent_section_0_div_2_div_15_article_1_div_26_div_11_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 50);
    \u0275\u0275template(1, EmpresasComponent_section_0_div_2_div_15_article_1_div_26_div_11_div_1_Template, 2, 0, "div", 14)(2, EmpresasComponent_section_0_div_2_div_15_article_1_div_26_div_11_div_2_Template, 14, 5, "div", 51);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const vm_r3 = \u0275\u0275nextContext(5).ngIf;
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", vm_r3.funcionarios.length === 0);
    \u0275\u0275advance();
    \u0275\u0275property("ngForOf", vm_r3.funcionarios)("ngForTrackBy", ctx_r1.trackByFuncionario);
  }
}
function EmpresasComponent_section_0_div_2_div_15_article_1_div_26_Template(rf, ctx) {
  if (rf & 1) {
    const _r7 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 44)(1, "div", 45)(2, "div")(3, "h3", 9);
    \u0275\u0275text(4, "Funcion\xE1rios");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "p", 10);
    \u0275\u0275text(6, "Gerencie os vinculados sem sair desta empresa.");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(7, "button", 46);
    \u0275\u0275listener("click", function EmpresasComponent_section_0_div_2_div_15_article_1_div_26_Template_button_click_7_listener($event) {
      \u0275\u0275restoreView(_r7);
      const ctx_r1 = \u0275\u0275nextContext(5);
      ctx_r1.abrirCadastroFuncionario();
      return \u0275\u0275resetView($event.stopPropagation());
    });
    \u0275\u0275text(8, " Adicionar funcion\xE1rio ");
    \u0275\u0275elementEnd()();
    \u0275\u0275template(9, EmpresasComponent_section_0_div_2_div_15_article_1_div_26_div_9_Template, 2, 1, "div", 14)(10, EmpresasComponent_section_0_div_2_div_15_article_1_div_26_div_10_Template, 1, 0, "div", 47)(11, EmpresasComponent_section_0_div_2_div_15_article_1_div_26_div_11_Template, 3, 3, "div", 48);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const vm_r3 = \u0275\u0275nextContext(4).ngIf;
    \u0275\u0275advance(9);
    \u0275\u0275property("ngIf", vm_r3.funcionariosErro);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", vm_r3.funcionariosCarregando);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", !vm_r3.funcionariosCarregando && !vm_r3.funcionariosErro);
  }
}
function EmpresasComponent_section_0_div_2_div_15_article_1_Template(rf, ctx) {
  if (rf & 1) {
    const _r4 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "article", 19)(1, "div", 20);
    \u0275\u0275listener("click", function EmpresasComponent_section_0_div_2_div_15_article_1_Template_div_click_1_listener() {
      const item_r5 = \u0275\u0275restoreView(_r4).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(4);
      return \u0275\u0275resetView(ctx_r1.alternarEmpresa(item_r5.id));
    })("keydown.enter", function EmpresasComponent_section_0_div_2_div_15_article_1_Template_div_keydown_enter_1_listener() {
      const item_r5 = \u0275\u0275restoreView(_r4).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(4);
      return \u0275\u0275resetView(ctx_r1.alternarEmpresa(item_r5.id));
    })("keydown.space", function EmpresasComponent_section_0_div_2_div_15_article_1_Template_div_keydown_space_1_listener($event) {
      const item_r5 = \u0275\u0275restoreView(_r4).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(4);
      ctx_r1.alternarEmpresa(item_r5.id);
      return \u0275\u0275resetView($event.preventDefault());
    });
    \u0275\u0275elementStart(2, "div", 21)(3, "div", 22);
    \u0275\u0275text(4);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "div", 23);
    \u0275\u0275text(6);
    \u0275\u0275elementEnd();
    \u0275\u0275template(7, EmpresasComponent_section_0_div_2_div_15_article_1_div_7_Template, 2, 1, "div", 24);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "div", 25)(9, "div", 26);
    \u0275\u0275text(10, "Sistemas");
    \u0275\u0275elementEnd();
    \u0275\u0275template(11, EmpresasComponent_section_0_div_2_div_15_article_1_div_11_Template, 3, 2, "div", 27)(12, EmpresasComponent_section_0_div_2_div_15_article_1_ng_template_12_Template, 2, 0, "ng-template", null, 0, \u0275\u0275templateRefExtractor);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(14, "div", 28)(15, "span", 29)(16, "span", 30);
    \u0275\u0275text(17, "\u{1F464}");
    \u0275\u0275elementEnd();
    \u0275\u0275text(18);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(19, "div", 31)(20, "button", 32);
    \u0275\u0275listener("click", function EmpresasComponent_section_0_div_2_div_15_article_1_Template_button_click_20_listener($event) {
      const item_r5 = \u0275\u0275restoreView(_r4).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(4);
      ctx_r1.abrirEdicaoEmpresa(item_r5);
      return \u0275\u0275resetView($event.stopPropagation());
    });
    \u0275\u0275text(21, " Editar ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(22, "button", 33);
    \u0275\u0275listener("click", function EmpresasComponent_section_0_div_2_div_15_article_1_Template_button_click_22_listener($event) {
      const item_r5 = \u0275\u0275restoreView(_r4).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(4);
      ctx_r1.excluirEmpresa(item_r5);
      return \u0275\u0275resetView($event.stopPropagation());
    });
    \u0275\u0275text(23, " Excluir ");
    \u0275\u0275elementEnd()()()();
    \u0275\u0275elementStart(24, "div", 34)(25, "div", 35);
    \u0275\u0275template(26, EmpresasComponent_section_0_div_2_div_15_article_1_div_26_Template, 12, 3, "div", 36);
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const item_r5 = ctx.$implicit;
    const semSistemas_r10 = \u0275\u0275reference(13);
    const vm_r3 = \u0275\u0275nextContext(3).ngIf;
    \u0275\u0275classProp("is-open", item_r5.id === (vm_r3.empresaSelecionada == null ? null : vm_r3.empresaSelecionada.id));
    \u0275\u0275advance();
    \u0275\u0275attribute("aria-expanded", item_r5.id === (vm_r3.empresaSelecionada == null ? null : vm_r3.empresaSelecionada.id));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(item_r5.nomeEmpresa);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate2(" ", item_r5.sistemasQuantidadeLabel, " \u2022 ", item_r5.chamadosQuantidadeLabel, " ");
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", !!item_r5.observacoes);
    \u0275\u0275advance();
    \u0275\u0275attribute("title", item_r5.sistemasTooltip || null);
    \u0275\u0275advance(3);
    \u0275\u0275property("ngIf", item_r5.sistemasNomes.length > 0)("ngIfElse", semSistemas_r10);
    \u0275\u0275advance(7);
    \u0275\u0275textInterpolate1(" ", item_r5.totalFuncionariosLabel, " func. ");
    \u0275\u0275advance(8);
    \u0275\u0275property("ngIf", item_r5.id === (vm_r3.empresaSelecionada == null ? null : vm_r3.empresaSelecionada.id));
  }
}
function EmpresasComponent_section_0_div_2_div_15_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 17);
    \u0275\u0275template(1, EmpresasComponent_section_0_div_2_div_15_article_1_Template, 27, 12, "article", 18);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const vm_r3 = \u0275\u0275nextContext(2).ngIf;
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275property("ngForOf", vm_r3.empresas)("ngForTrackBy", ctx_r1.trackByEmpresa);
  }
}
function EmpresasComponent_section_0_div_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 5)(1, "article", 7)(2, "div", 8)(3, "div")(4, "h3", 9);
    \u0275\u0275text(5, "Lista de empresas");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "p", 10);
    \u0275\u0275text(7, "Clique no card para abrir ou recolher os funcion\xE1rios vinculados.");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(8, "div", 11)(9, "span", 12);
    \u0275\u0275text(10);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(11, "button", 13);
    \u0275\u0275listener("click", function EmpresasComponent_section_0_div_2_Template_button_click_11_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.abrirCadastroEmpresa());
    });
    \u0275\u0275text(12, "Nova empresa");
    \u0275\u0275elementEnd()()();
    \u0275\u0275template(13, EmpresasComponent_section_0_div_2_div_13_Template, 2, 1, "div", 14)(14, EmpresasComponent_section_0_div_2_div_14_Template, 2, 0, "div", 14)(15, EmpresasComponent_section_0_div_2_div_15_Template, 2, 2, "div", 15);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const vm_r3 = \u0275\u0275nextContext().ngIf;
    \u0275\u0275advance(10);
    \u0275\u0275textInterpolate1("Total: ", vm_r3.empresas.length);
    \u0275\u0275advance(3);
    \u0275\u0275property("ngIf", !!vm_r3.erro);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", !vm_r3.erro && vm_r3.empresas.length === 0);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", !vm_r3.erro && vm_r3.empresas.length > 0);
  }
}
function EmpresasComponent_section_0_div_3_div_18_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 70);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const vm_r3 = \u0275\u0275nextContext(2).ngIf;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(vm_r3.sistemasErro);
  }
}
function EmpresasComponent_section_0_div_3_div_19_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 70);
    \u0275\u0275text(1, " Nenhum sistema cadastrado. Cadastre primeiro na aba Sistemas. ");
    \u0275\u0275elementEnd();
  }
}
function EmpresasComponent_section_0_div_3_div_20_label_1_Template(rf, ctx) {
  if (rf & 1) {
    const _r12 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "label", 73)(1, "input", 74);
    \u0275\u0275listener("change", function EmpresasComponent_section_0_div_3_div_20_label_1_Template_input_change_1_listener($event) {
      const sistema_r13 = \u0275\u0275restoreView(_r12).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(4);
      return \u0275\u0275resetView(ctx_r1.alternarSistemaEmpresa(sistema_r13.id, $event.target.checked));
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(2, "span");
    \u0275\u0275text(3);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const sistema_r13 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext(4);
    \u0275\u0275advance();
    \u0275\u0275property("checked", ctx_r1.isSistemaSelecionado(sistema_r13.id));
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(sistema_r13.nome);
  }
}
function EmpresasComponent_section_0_div_3_div_20_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 71);
    \u0275\u0275template(1, EmpresasComponent_section_0_div_3_div_20_label_1_Template, 4, 2, "label", 72);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const vm_r3 = \u0275\u0275nextContext(2).ngIf;
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275property("ngForOf", vm_r3.sistemas)("ngForTrackBy", ctx_r1.trackBySistema);
  }
}
function EmpresasComponent_section_0_div_3_Template(rf, ctx) {
  if (rf & 1) {
    const _r11 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 57)(1, "div", 58)(2, "h3");
    \u0275\u0275text(3, "Nova empresa");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "p", 59);
    \u0275\u0275text(5, "Cadastre uma empresa para vincular chamados e funcion\xE1rios.");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "form", 60);
    \u0275\u0275listener("ngSubmit", function EmpresasComponent_section_0_div_3_Template_form_ngSubmit_6_listener() {
      \u0275\u0275restoreView(_r11);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.cadastrarEmpresa());
    });
    \u0275\u0275elementStart(7, "label")(8, "span");
    \u0275\u0275text(9, "Nome da empresa");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(10, "input", 61);
    \u0275\u0275twoWayListener("ngModelChange", function EmpresasComponent_section_0_div_3_Template_input_ngModelChange_10_listener($event) {
      \u0275\u0275restoreView(_r11);
      const ctx_r1 = \u0275\u0275nextContext(2);
      \u0275\u0275twoWayBindingSet(ctx_r1.nomeEmpresa, $event) || (ctx_r1.nomeEmpresa = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(11, "label")(12, "span");
    \u0275\u0275text(13, "Observa\xE7\xF5es");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(14, "textarea", 62);
    \u0275\u0275twoWayListener("ngModelChange", function EmpresasComponent_section_0_div_3_Template_textarea_ngModelChange_14_listener($event) {
      \u0275\u0275restoreView(_r11);
      const ctx_r1 = \u0275\u0275nextContext(2);
      \u0275\u0275twoWayBindingSet(ctx_r1.observacoesEmpresa, $event) || (ctx_r1.observacoesEmpresa = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(15, "div", 63)(16, "span", 64);
    \u0275\u0275text(17, "Sistemas utilizados");
    \u0275\u0275elementEnd();
    \u0275\u0275template(18, EmpresasComponent_section_0_div_3_div_18_Template, 2, 1, "div", 65)(19, EmpresasComponent_section_0_div_3_div_19_Template, 2, 0, "div", 65)(20, EmpresasComponent_section_0_div_3_div_20_Template, 2, 2, "div", 66);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(21, "div", 67)(22, "button", 68);
    \u0275\u0275listener("click", function EmpresasComponent_section_0_div_3_Template_button_click_22_listener() {
      \u0275\u0275restoreView(_r11);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.cancelarCadastroEmpresa());
    });
    \u0275\u0275text(23, "Cancelar");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(24, "button", 69);
    \u0275\u0275text(25, "Salvar");
    \u0275\u0275elementEnd()()()()();
  }
  if (rf & 2) {
    const vm_r3 = \u0275\u0275nextContext().ngIf;
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(10);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.nomeEmpresa);
    \u0275\u0275advance(4);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.observacoesEmpresa);
    \u0275\u0275advance(4);
    \u0275\u0275property("ngIf", vm_r3.sistemasErro);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", !vm_r3.sistemasErro && vm_r3.sistemas.length === 0);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", vm_r3.sistemas.length > 0);
  }
}
function EmpresasComponent_section_0_div_4_div_18_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 70);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const vm_r3 = \u0275\u0275nextContext(2).ngIf;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(vm_r3.sistemasErro);
  }
}
function EmpresasComponent_section_0_div_4_div_19_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 70);
    \u0275\u0275text(1, " Nenhum sistema cadastrado. Cadastre primeiro na aba Sistemas. ");
    \u0275\u0275elementEnd();
  }
}
function EmpresasComponent_section_0_div_4_div_20_label_1_Template(rf, ctx) {
  if (rf & 1) {
    const _r15 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "label", 73)(1, "input", 74);
    \u0275\u0275listener("change", function EmpresasComponent_section_0_div_4_div_20_label_1_Template_input_change_1_listener($event) {
      const sistema_r16 = \u0275\u0275restoreView(_r15).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(4);
      return \u0275\u0275resetView(ctx_r1.alternarSistemaEmpresa(sistema_r16.id, $event.target.checked, true));
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(2, "span");
    \u0275\u0275text(3);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const sistema_r16 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext(4);
    \u0275\u0275advance();
    \u0275\u0275property("checked", ctx_r1.isSistemaSelecionado(sistema_r16.id, true));
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(sistema_r16.nome);
  }
}
function EmpresasComponent_section_0_div_4_div_20_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 71);
    \u0275\u0275template(1, EmpresasComponent_section_0_div_4_div_20_label_1_Template, 4, 2, "label", 72);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const vm_r3 = \u0275\u0275nextContext(2).ngIf;
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275property("ngForOf", vm_r3.sistemas)("ngForTrackBy", ctx_r1.trackBySistema);
  }
}
function EmpresasComponent_section_0_div_4_Template(rf, ctx) {
  if (rf & 1) {
    const _r14 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 57)(1, "div", 58)(2, "h3");
    \u0275\u0275text(3, "Editar empresa");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "p", 59);
    \u0275\u0275text(5, "Atualize os dados exibidos na listagem de empresas.");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "form", 60);
    \u0275\u0275listener("ngSubmit", function EmpresasComponent_section_0_div_4_Template_form_ngSubmit_6_listener() {
      \u0275\u0275restoreView(_r14);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.salvarEdicaoEmpresa());
    });
    \u0275\u0275elementStart(7, "label")(8, "span");
    \u0275\u0275text(9, "Empresa");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(10, "input", 75);
    \u0275\u0275twoWayListener("ngModelChange", function EmpresasComponent_section_0_div_4_Template_input_ngModelChange_10_listener($event) {
      \u0275\u0275restoreView(_r14);
      const ctx_r1 = \u0275\u0275nextContext(2);
      \u0275\u0275twoWayBindingSet(ctx_r1.editEmpresaNome, $event) || (ctx_r1.editEmpresaNome = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(11, "label")(12, "span");
    \u0275\u0275text(13, "Observa\xE7\xF5es");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(14, "textarea", 76);
    \u0275\u0275twoWayListener("ngModelChange", function EmpresasComponent_section_0_div_4_Template_textarea_ngModelChange_14_listener($event) {
      \u0275\u0275restoreView(_r14);
      const ctx_r1 = \u0275\u0275nextContext(2);
      \u0275\u0275twoWayBindingSet(ctx_r1.editEmpresaObservacoes, $event) || (ctx_r1.editEmpresaObservacoes = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(15, "div", 63)(16, "span", 64);
    \u0275\u0275text(17, "Sistemas utilizados");
    \u0275\u0275elementEnd();
    \u0275\u0275template(18, EmpresasComponent_section_0_div_4_div_18_Template, 2, 1, "div", 65)(19, EmpresasComponent_section_0_div_4_div_19_Template, 2, 0, "div", 65)(20, EmpresasComponent_section_0_div_4_div_20_Template, 2, 2, "div", 66);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(21, "div", 67)(22, "button", 68);
    \u0275\u0275listener("click", function EmpresasComponent_section_0_div_4_Template_button_click_22_listener() {
      \u0275\u0275restoreView(_r14);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.cancelarEdicaoEmpresa());
    });
    \u0275\u0275text(23, "Cancelar");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(24, "button", 69);
    \u0275\u0275text(25, "Salvar");
    \u0275\u0275elementEnd()()()()();
  }
  if (rf & 2) {
    const vm_r3 = \u0275\u0275nextContext().ngIf;
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(10);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.editEmpresaNome);
    \u0275\u0275advance(4);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.editEmpresaObservacoes);
    \u0275\u0275advance(4);
    \u0275\u0275property("ngIf", vm_r3.sistemasErro);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", !vm_r3.sistemasErro && vm_r3.sistemas.length === 0);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", vm_r3.sistemas.length > 0);
  }
}
function EmpresasComponent_section_0_div_5_Template(rf, ctx) {
  if (rf & 1) {
    const _r17 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 57)(1, "div", 58)(2, "h3");
    \u0275\u0275text(3, "Editar funcion\xE1rio");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "p", 59);
    \u0275\u0275text(5, "Ajuste os dados do funcion\xE1rio selecionado.");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "form", 60);
    \u0275\u0275listener("ngSubmit", function EmpresasComponent_section_0_div_5_Template_form_ngSubmit_6_listener() {
      \u0275\u0275restoreView(_r17);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.salvarEdicaoFuncionario());
    });
    \u0275\u0275elementStart(7, "label")(8, "span");
    \u0275\u0275text(9, "Nome do funcion\xE1rio");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(10, "input", 77);
    \u0275\u0275twoWayListener("ngModelChange", function EmpresasComponent_section_0_div_5_Template_input_ngModelChange_10_listener($event) {
      \u0275\u0275restoreView(_r17);
      const ctx_r1 = \u0275\u0275nextContext(2);
      \u0275\u0275twoWayBindingSet(ctx_r1.editFuncionario.nomeFuncionario, $event) || (ctx_r1.editFuncionario.nomeFuncionario = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(11, "label")(12, "span");
    \u0275\u0275text(13, "Telefone");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(14, "input", 78);
    \u0275\u0275twoWayListener("ngModelChange", function EmpresasComponent_section_0_div_5_Template_input_ngModelChange_14_listener($event) {
      \u0275\u0275restoreView(_r17);
      const ctx_r1 = \u0275\u0275nextContext(2);
      \u0275\u0275twoWayBindingSet(ctx_r1.editFuncionario.telefone, $event) || (ctx_r1.editFuncionario.telefone = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275listener("keydown", function EmpresasComponent_section_0_div_5_Template_input_keydown_14_listener($event) {
      \u0275\u0275restoreView(_r17);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.onTelefoneKeydown($event));
    })("paste", function EmpresasComponent_section_0_div_5_Template_input_paste_14_listener($event) {
      \u0275\u0275restoreView(_r17);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.onTelefonePaste($event));
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(15, "div", 70);
    \u0275\u0275text(16, " Telefone salvo no banco: 55 + DDD + 8 digitos (ex.: 554791904429). ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(17, "label", 73)(18, "input", 79);
    \u0275\u0275twoWayListener("ngModelChange", function EmpresasComponent_section_0_div_5_Template_input_ngModelChange_18_listener($event) {
      \u0275\u0275restoreView(_r17);
      const ctx_r1 = \u0275\u0275nextContext(2);
      \u0275\u0275twoWayBindingSet(ctx_r1.editFuncionario.criarChamadoAutomatico, $event) || (ctx_r1.editFuncionario.criarChamadoAutomatico = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(19, "span");
    \u0275\u0275text(20, "Criar chamado automaticamente via WhatsApp");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(21, "div", 70);
    \u0275\u0275text(22, " Desmarcado: mensagens desse funcion\xE1rio ser\xE3o ignoradas sem erro. ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(23, "div", 67)(24, "button", 68);
    \u0275\u0275listener("click", function EmpresasComponent_section_0_div_5_Template_button_click_24_listener() {
      \u0275\u0275restoreView(_r17);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.cancelarEdicaoFuncionario());
    });
    \u0275\u0275text(25, "Cancelar");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(26, "button", 69);
    \u0275\u0275text(27, "Salvar");
    \u0275\u0275elementEnd()()()()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(10);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.editFuncionario.nomeFuncionario);
    \u0275\u0275advance(4);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.editFuncionario.telefone);
    \u0275\u0275advance(4);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.editFuncionario.criarChamadoAutomatico);
  }
}
function EmpresasComponent_section_0_div_6_p_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "p", 59);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const vm_r3 = \u0275\u0275nextContext(2).ngIf;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" Vinculado a ", vm_r3.empresaSelecionada.nomeEmpresa, " ");
  }
}
function EmpresasComponent_section_0_div_6_Template(rf, ctx) {
  if (rf & 1) {
    const _r18 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 57)(1, "div", 58)(2, "h3");
    \u0275\u0275text(3, "Novo funcion\xE1rio");
    \u0275\u0275elementEnd();
    \u0275\u0275template(4, EmpresasComponent_section_0_div_6_p_4_Template, 2, 1, "p", 80);
    \u0275\u0275elementStart(5, "form", 60);
    \u0275\u0275listener("ngSubmit", function EmpresasComponent_section_0_div_6_Template_form_ngSubmit_5_listener() {
      \u0275\u0275restoreView(_r18);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.cadastrarFuncionario());
    });
    \u0275\u0275elementStart(6, "label")(7, "span");
    \u0275\u0275text(8, "Nome");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(9, "input", 81);
    \u0275\u0275twoWayListener("ngModelChange", function EmpresasComponent_section_0_div_6_Template_input_ngModelChange_9_listener($event) {
      \u0275\u0275restoreView(_r18);
      const ctx_r1 = \u0275\u0275nextContext(2);
      \u0275\u0275twoWayBindingSet(ctx_r1.funcionario.nomeFuncionario, $event) || (ctx_r1.funcionario.nomeFuncionario = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(10, "label")(11, "span");
    \u0275\u0275text(12, "Telefone");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(13, "input", 82);
    \u0275\u0275twoWayListener("ngModelChange", function EmpresasComponent_section_0_div_6_Template_input_ngModelChange_13_listener($event) {
      \u0275\u0275restoreView(_r18);
      const ctx_r1 = \u0275\u0275nextContext(2);
      \u0275\u0275twoWayBindingSet(ctx_r1.funcionario.telefone, $event) || (ctx_r1.funcionario.telefone = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275listener("keydown", function EmpresasComponent_section_0_div_6_Template_input_keydown_13_listener($event) {
      \u0275\u0275restoreView(_r18);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.onTelefoneKeydown($event));
    })("paste", function EmpresasComponent_section_0_div_6_Template_input_paste_13_listener($event) {
      \u0275\u0275restoreView(_r18);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.onTelefonePaste($event));
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(14, "div", 70);
    \u0275\u0275text(15, " Telefone salvo no banco: 55 + DDD + 8 digitos (ex.: 554791904429). ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(16, "label", 73)(17, "input", 83);
    \u0275\u0275twoWayListener("ngModelChange", function EmpresasComponent_section_0_div_6_Template_input_ngModelChange_17_listener($event) {
      \u0275\u0275restoreView(_r18);
      const ctx_r1 = \u0275\u0275nextContext(2);
      \u0275\u0275twoWayBindingSet(ctx_r1.funcionario.criarChamadoAutomatico, $event) || (ctx_r1.funcionario.criarChamadoAutomatico = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(18, "span");
    \u0275\u0275text(19, "Criar chamado automaticamente via WhatsApp");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(20, "div", 70);
    \u0275\u0275text(21, " Desmarcado: mensagens desse funcion\xE1rio ser\xE3o ignoradas sem erro. ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(22, "div", 67)(23, "button", 68);
    \u0275\u0275listener("click", function EmpresasComponent_section_0_div_6_Template_button_click_23_listener() {
      \u0275\u0275restoreView(_r18);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.cancelarCadastroFuncionario());
    });
    \u0275\u0275text(24, "Cancelar");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(25, "button", 69);
    \u0275\u0275text(26, "Salvar funcion\xE1rio");
    \u0275\u0275elementEnd()()()()();
  }
  if (rf & 2) {
    const vm_r3 = \u0275\u0275nextContext().ngIf;
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(4);
    \u0275\u0275property("ngIf", vm_r3.empresaSelecionada);
    \u0275\u0275advance(5);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.funcionario.nomeFuncionario);
    \u0275\u0275advance(4);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.funcionario.telefone);
    \u0275\u0275advance(4);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.funcionario.criarChamadoAutomatico);
  }
}
function EmpresasComponent_section_0_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "section", 2);
    \u0275\u0275template(1, EmpresasComponent_section_0_div_1_Template, 2, 0, "div", 3)(2, EmpresasComponent_section_0_div_2_Template, 16, 4, "div", 3)(3, EmpresasComponent_section_0_div_3_Template, 26, 5, "div", 4)(4, EmpresasComponent_section_0_div_4_Template, 26, 5, "div", 4)(5, EmpresasComponent_section_0_div_5_Template, 28, 3, "div", 4)(6, EmpresasComponent_section_0_div_6_Template, 27, 4, "div", 4);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const vm_r3 = ctx.ngIf;
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", vm_r3.carregando && vm_r3.empresas.length === 0);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", !vm_r3.carregando || vm_r3.empresas.length > 0);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r1.cadastrandoEmpresa);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r1.editandoEmpresa);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r1.editandoFuncionario && ctx_r1.editFuncionario);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r1.cadastrandoFuncionario && ctx_r1.funcionario);
  }
}
var EmpresasComponent = class _EmpresasComponent {
  chamadosService;
  empresasService;
  sistemasService;
  toast;
  zone;
  cadastrandoEmpresa = false;
  nomeEmpresa = "";
  observacoesEmpresa = "";
  sistemasEmpresaSelecionados = [];
  cadastrandoFuncionario = false;
  funcionario = this.createEmptyFuncionarioForm();
  editandoEmpresa = false;
  editEmpresaId = null;
  editEmpresaNome = "";
  editEmpresaObservacoes = "";
  editEmpresaSistemasSelecionados = [];
  editandoFuncionario = false;
  editFuncionarioId = null;
  editFuncionarioEmpresaId = null;
  editFuncionario = this.createEmptyFuncionarioForm();
  empresaSelecionadaIdSubject = new BehaviorSubject(null);
  funcionariosStateSubject = new BehaviorSubject({
    status: "ready",
    data: [],
    error: null
  });
  vm$;
  constructor(chamadosService, empresasService, sistemasService, toast, zone) {
    this.chamadosService = chamadosService;
    this.empresasService = empresasService;
    this.sistemasService = sistemasService;
    this.toast = toast;
    this.zone = zone;
    this.vm$ = combineLatest([
      this.chamadosService.todosState$,
      this.empresasService.empresasState$,
      this.sistemasService.sistemasState$,
      this.empresaSelecionadaIdSubject,
      this.funcionariosStateSubject
    ]).pipe(map(([chamadosState, empresasState, sistemasState, empresaSelecionadaId, funcionariosState]) => this.buildViewModel(chamadosState, empresasState, sistemasState, empresaSelecionadaId, funcionariosState)));
  }
  trackByEmpresa(_, item) {
    return item.id ?? item.nomeEmpresa;
  }
  trackByFuncionario(_, item) {
    return item.id ?? item.nomeFuncionario;
  }
  trackBySistema(_, item) {
    return item.id;
  }
  async cadastrarEmpresa() {
    const nomeEmpresa = this.nomeEmpresa.trim();
    if (!nomeEmpresa) {
      this.toast.show("Informe o nome da empresa.", "error");
      return;
    }
    try {
      await this.empresasService.addEmpresa({
        nomeEmpresa,
        observacoes: this.observacoesEmpresa,
        sistemas: this.sanitizeSistemaIds(this.sistemasEmpresaSelecionados)
      });
      this.runInZone(() => {
        this.toast.show("Empresa cadastrada com sucesso.", "success");
        this.cancelarCadastroEmpresa();
      });
    } catch (err) {
      this.toast.show(`Erro ao cadastrar empresa: ${err.message}`, "error");
    }
  }
  abrirCadastroEmpresa() {
    this.cadastrandoEmpresa = true;
    this.nomeEmpresa = "";
    this.observacoesEmpresa = "";
    this.sistemasEmpresaSelecionados = [];
  }
  cancelarCadastroEmpresa() {
    this.cadastrandoEmpresa = false;
    this.nomeEmpresa = "";
    this.observacoesEmpresa = "";
    this.sistemasEmpresaSelecionados = [];
  }
  alternarEmpresa(empresaId) {
    const id = empresaId ?? null;
    const empresaAtual = this.empresaSelecionadaIdSubject.value;
    this.selecionarEmpresa(empresaAtual === id ? null : id);
  }
  selecionarEmpresa(empresaId) {
    const id = empresaId ?? null;
    this.cancelarCadastroFuncionario();
    this.empresaSelecionadaIdSubject.next(id);
    if (!id) {
      this.emitFuncionariosState({
        status: "ready",
        data: [],
        error: null
      });
      return;
    }
    void this.carregarFuncionarios(id);
  }
  abrirEdicaoEmpresa(item) {
    this.editandoEmpresa = true;
    this.editEmpresaId = item.id ?? null;
    this.editEmpresaNome = item.nomeEmpresa || "";
    this.editEmpresaObservacoes = item.observacoes || "";
    this.editEmpresaSistemasSelecionados = this.sanitizeSistemaIds(item.sistemas);
  }
  cancelarEdicaoEmpresa() {
    this.editandoEmpresa = false;
    this.editEmpresaId = null;
    this.editEmpresaNome = "";
    this.editEmpresaObservacoes = "";
    this.editEmpresaSistemasSelecionados = [];
  }
  async salvarEdicaoEmpresa() {
    if (!this.editEmpresaId)
      return;
    const nomeEmpresa = this.editEmpresaNome.trim();
    if (!nomeEmpresa) {
      this.toast.show("Informe o nome da empresa.", "error");
      return;
    }
    try {
      await this.empresasService.updateEmpresa(this.editEmpresaId, {
        nomeEmpresa,
        observacoes: this.editEmpresaObservacoes.trim(),
        sistemas: this.sanitizeSistemaIds(this.editEmpresaSistemasSelecionados)
      });
      this.runInZone(() => {
        this.toast.show("Empresa atualizada.", "success");
        this.cancelarEdicaoEmpresa();
      });
    } catch (err) {
      this.toast.show(`Erro ao atualizar empresa: ${err.message}`, "error");
    }
  }
  async excluirEmpresa(item) {
    if (!item.id)
      return;
    const ok = window.confirm("Tem certeza que deseja excluir esta empresa e seus funcion\xE1rios?");
    if (!ok)
      return;
    try {
      await this.empresasService.deleteEmpresa(item.id);
      if (this.empresaSelecionadaIdSubject.value === item.id) {
        this.selecionarEmpresa(null);
      }
      this.toast.show("Empresa exclu\xEDda.", "success");
    } catch (err) {
      this.toast.show(`Erro ao excluir empresa: ${err.message}`, "error");
    }
  }
  async cadastrarFuncionario() {
    const empresaId = this.empresaSelecionadaIdSubject.value;
    const nomeFuncionario = this.funcionario.nomeFuncionario.trim();
    const telefone = normalizePhoneTo12Digits(this.funcionario.telefone);
    if (!empresaId) {
      this.toast.show("Selecione uma empresa primeiro.", "error");
      return;
    }
    if (!nomeFuncionario) {
      this.toast.show("Informe o nome do funcion\xE1rio.", "error");
      return;
    }
    if (!isValidPhone12Digits(this.funcionario.telefone)) {
      this.toast.show("Telefone inv\xE1lido. Informe DDD + 8 d\xEDgitos. O valor salvo deve gerar exatamente 12 d\xEDgitos com 55.", "error");
      return;
    }
    try {
      await this.empresasService.addFuncionario(empresaId, {
        nomeFuncionario,
        telefone,
        criarChamadoAutomatico: this.funcionario.criarChamadoAutomatico
      });
      await this.carregarFuncionarios(empresaId);
      this.runInZone(() => {
        this.toast.show("Funcion\xE1rio cadastrado.", "success");
        this.cancelarCadastroFuncionario();
      });
    } catch (err) {
      this.toast.show(`Erro ao cadastrar funcion\xE1rio: ${err.message}`, "error");
    }
  }
  abrirCadastroFuncionario() {
    if (!this.empresaSelecionadaIdSubject.value)
      return;
    this.cadastrandoFuncionario = true;
    this.funcionario = this.createEmptyFuncionarioForm();
  }
  cancelarCadastroFuncionario() {
    this.cadastrandoFuncionario = false;
    this.funcionario = this.createEmptyFuncionarioForm();
  }
  abrirEdicaoFuncionario(item) {
    const empresaId = this.empresaSelecionadaIdSubject.value;
    if (!empresaId)
      return;
    this.editandoFuncionario = true;
    this.editFuncionarioId = item.id ?? null;
    this.editFuncionarioEmpresaId = empresaId;
    this.editFuncionario = this.createFuncionarioForm(item);
  }
  cancelarEdicaoFuncionario() {
    this.editandoFuncionario = false;
    this.editFuncionarioId = null;
    this.editFuncionarioEmpresaId = null;
    this.editFuncionario = this.createEmptyFuncionarioForm();
  }
  async salvarEdicaoFuncionario() {
    if (!this.editFuncionarioId || !this.editFuncionarioEmpresaId)
      return;
    const nomeFuncionario = this.editFuncionario.nomeFuncionario.trim();
    const telefone = normalizePhoneTo12Digits(this.editFuncionario.telefone);
    if (!nomeFuncionario) {
      this.toast.show("Informe o nome do funcion\xE1rio.", "error");
      return;
    }
    if (!isValidPhone12Digits(this.editFuncionario.telefone)) {
      this.toast.show("Telefone inv\xE1lido. Informe DDD + 8 d\xEDgitos. O valor salvo deve gerar exatamente 12 d\xEDgitos com 55.", "error");
      return;
    }
    try {
      await this.empresasService.updateFuncionario(this.editFuncionarioEmpresaId, this.editFuncionarioId, {
        nomeFuncionario,
        telefone,
        criarChamadoAutomatico: this.editFuncionario.criarChamadoAutomatico
      });
      await this.carregarFuncionarios(this.editFuncionarioEmpresaId);
      this.runInZone(() => {
        this.toast.show("Funcion\xE1rio atualizado.", "success");
        this.cancelarEdicaoFuncionario();
      });
    } catch (err) {
      this.toast.show(`Erro ao atualizar funcion\xE1rio: ${err.message}`, "error");
    }
  }
  async excluirFuncionario(item) {
    const empresaId = this.empresaSelecionadaIdSubject.value;
    if (!empresaId || !item.id)
      return;
    const ok = window.confirm("Tem certeza que deseja excluir este funcion\xE1rio?");
    if (!ok)
      return;
    try {
      await this.empresasService.deleteFuncionario(empresaId, item.id);
      await this.carregarFuncionarios(empresaId);
      this.toast.show("Funcion\xE1rio exclu\xEDdo.", "success");
    } catch (err) {
      this.toast.show(`Erro ao excluir funcion\xE1rio: ${err.message}`, "error");
    }
  }
  isSistemaSelecionado(sistemaId, editando = false) {
    const selecionados = editando ? this.editEmpresaSistemasSelecionados : this.sistemasEmpresaSelecionados;
    return selecionados.includes(sistemaId);
  }
  alternarSistemaEmpresa(sistemaId, selecionado, editando = false) {
    const atuais = editando ? this.editEmpresaSistemasSelecionados : this.sistemasEmpresaSelecionados;
    const atualizados = selecionado ? [...atuais, sistemaId] : atuais.filter((item) => item !== sistemaId);
    const normalizados = this.sanitizeSistemaIds(atualizados);
    if (editando) {
      this.editEmpresaSistemasSelecionados = normalizados;
      return;
    }
    this.sistemasEmpresaSelecionados = normalizados;
  }
  onTelefoneKeydown(event) {
    if (event.ctrlKey || event.metaKey || event.altKey || [
      "Backspace",
      "Delete",
      "Tab",
      "Escape",
      "Enter",
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "Home",
      "End"
    ].includes(event.key)) {
      return;
    }
    if (event.key.length === 1 && !/^\d$/.test(event.key)) {
      event.preventDefault();
    }
  }
  onTelefonePaste(event) {
    const pastedText = event.clipboardData?.getData("text") ?? "";
    if (pastedText && /\D/.test(pastedText)) {
      event.preventDefault();
    }
  }
  async carregarFuncionarios(empresaId) {
    this.emitFuncionariosState({
      status: "loading",
      data: this.funcionariosStateSubject.value.data,
      error: null
    });
    try {
      const funcionarios = this.sortFuncionarios(await this.empresasService.listFuncionarios(empresaId));
      this.emitFuncionariosState({
        status: "ready",
        data: funcionarios,
        error: null
      });
    } catch (err) {
      this.emitFuncionariosState({
        status: "error",
        data: [],
        error: err?.message || "Erro ao carregar funcion\xE1rios."
      });
    }
  }
  buildViewModel(chamadosState, empresasState, sistemasState, empresaSelecionadaId, funcionariosState) {
    const chamadosPorEmpresa = this.countChamadosPorEmpresa(chamadosState.data);
    const sistemas = this.sortSistemas(sistemasState.data).filter((item) => !!item.id).map((item) => __spreadProps(__spreadValues({}, item), {
      id: item.id
    }));
    const sistemasMap = new Map(sistemas.map((item) => [item.id, item]));
    const empresas = this.sortEmpresas(empresasState.data).map((item) => {
      const sistemasIds = this.sanitizeSistemaIds(item.sistemas);
      const sistemasNomes = this.resolveEmpresaSistemaNomes(sistemasIds, sistemasMap);
      return __spreadProps(__spreadValues({}, item), {
        sistemas: sistemasIds,
        sistemasNomes,
        sistemasVisiveis: sistemasNomes.slice(0, 2),
        sistemasExtras: Math.max(0, sistemasNomes.length - 2),
        sistemasTooltip: sistemasNomes.join(", "),
        sistemasQuantidadeLabel: this.buildEmpresaSistemasQuantidadeLabel(sistemasNomes.length),
        totalChamados: chamadosPorEmpresa.get(item.id ?? "") ?? 0,
        chamadosQuantidadeLabel: this.buildEmpresaChamadosQuantidadeLabel(chamadosPorEmpresa.get(item.id ?? "") ?? 0),
        totalFuncionariosLabel: item.totalFuncionarios ?? 0
      });
    });
    const empresaSelecionada = empresas.find((item) => item.id === empresaSelecionadaId) ?? null;
    return {
      carregando: chamadosState.status === "loading" || empresasState.status === "loading" || sistemasState.status === "loading" || !!empresaSelecionadaId && funcionariosState.status === "loading",
      erro: empresasState.error || chamadosState.error,
      empresas,
      empresaSelecionada,
      sistemas,
      sistemasErro: sistemasState.error,
      funcionarios: funcionariosState.data,
      funcionariosCarregando: !!empresaSelecionadaId && funcionariosState.status === "loading",
      funcionariosErro: funcionariosState.error
    };
  }
  sortEmpresas(items) {
    return [...items].sort((a, b) => (a.nomeEmpresa || "").localeCompare(b.nomeEmpresa || ""));
  }
  sortFuncionarios(items) {
    return [...items].sort((a, b) => (a.nomeFuncionario || "").localeCompare(b.nomeFuncionario || ""));
  }
  sortSistemas(items) {
    return [...items].sort((a, b) => (a.nome || "").localeCompare(b.nome || "", "pt-BR"));
  }
  sanitizeSistemaIds(value) {
    if (!Array.isArray(value)) {
      return [];
    }
    return [...new Set(value.filter((item) => typeof item === "string").map((item) => item.trim()).filter(Boolean))];
  }
  resolveEmpresaSistemaNomes(sistemaIds, sistemasMap) {
    return [...new Set(sistemaIds.map((sistemaId) => sistemasMap.get(sistemaId)?.nome?.trim() || sistemaId).filter(Boolean))];
  }
  buildEmpresaSistemasQuantidadeLabel(total) {
    if (total <= 0) {
      return "Nenhum sistema vinculado";
    }
    if (total === 1) {
      return "1 sistema vinculado";
    }
    return `${total} sistemas vinculados`;
  }
  buildEmpresaChamadosQuantidadeLabel(total) {
    if (total === 1) {
      return "1 chamado";
    }
    return `${total} chamados`;
  }
  countChamadosPorEmpresa(chamados) {
    const totals = /* @__PURE__ */ new Map();
    for (const chamado of chamados) {
      const empresaId = typeof chamado.empresaId === "string" ? chamado.empresaId.trim() : "";
      if (!empresaId) {
        continue;
      }
      totals.set(empresaId, (totals.get(empresaId) ?? 0) + 1);
    }
    return totals;
  }
  createEmptyFuncionarioForm() {
    return {
      nomeFuncionario: "",
      telefone: "",
      criarChamadoAutomatico: true
    };
  }
  createFuncionarioForm(funcionario) {
    return {
      nomeFuncionario: funcionario?.nomeFuncionario || "",
      telefone: String(funcionario?.telefone || ""),
      criarChamadoAutomatico: funcionario?.criarChamadoAutomatico ?? true
    };
  }
  emitFuncionariosState(state) {
    this.runInZone(() => this.funcionariosStateSubject.next(state));
  }
  runInZone(callback) {
    return NgZone.isInAngularZone() ? callback() : this.zone.run(callback);
  }
  static \u0275fac = function EmpresasComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _EmpresasComponent)(\u0275\u0275directiveInject(ChamadosService), \u0275\u0275directiveInject(EmpresasService), \u0275\u0275directiveInject(SistemasService), \u0275\u0275directiveInject(ToastService), \u0275\u0275directiveInject(NgZone));
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _EmpresasComponent, selectors: [["app-empresas"]], decls: 2, vars: 3, consts: [["semSistemas", ""], ["class", "page-section", 4, "ngIf"], [1, "page-section"], ["class", "stack-md", 4, "ngIf"], ["class", "modal empresas-modal", 4, "ngIf"], [1, "stack-md"], [1, "skeleton", 2, "min-height", "300px"], [1, "card", "empresas-list-card"], [1, "card-title-row"], [1, "card-title"], [1, "card-subtitle"], [1, "empresas-hero-actions"], [1, "status-chip"], ["type", "button", 1, "btn", "primary", 3, "click"], ["class", "empty-state", 4, "ngIf"], ["class", "empresas-list", 4, "ngIf"], [1, "empty-state"], [1, "empresas-list"], ["class", "empresa-card", 3, "is-open", 4, "ngFor", "ngForOf", "ngForTrackBy"], [1, "empresa-card"], ["role", "button", "tabindex", "0", 1, "empresa-card-header", 3, "click", "keydown.enter", "keydown.space"], [1, "empresa-card-primary"], [1, "empresa-name"], [1, "empresa-card-subtitle"], ["class", "empresa-card-note", 4, "ngIf"], [1, "empresa-card-sistemas"], [1, "empresa-card-label"], ["class", "empresa-badges", 4, "ngIf", "ngIfElse"], [1, "empresa-card-side"], [1, "empresa-funcionarios-badge"], ["aria-hidden", "true"], [1, "btn-group", "empresas-row-actions"], ["type", "button", 1, "btn", "secondary", "btn-sm", 3, "click"], ["type", "button", 1, "btn", "danger", "btn-sm", 3, "click"], [1, "empresa-expand-shell"], [1, "empresa-expand-inner"], ["class", "empresa-expand-panel", 4, "ngIf"], [1, "empresa-card-note"], [1, "empresa-badges"], ["class", "empresa-system-badge", 4, "ngFor", "ngForOf"], ["class", "empresa-system-badge empresa-system-badge-extra", 4, "ngIf"], [1, "empresa-system-badge"], [1, "empresa-system-badge", "empresa-system-badge-extra"], [1, "empresa-system-empty"], [1, "empresa-expand-panel"], [1, "card-title-row", "empresas-funcionarios-header"], ["type", "button", 1, "btn", "secondary", "btn-sm", "empresa-add-funcionario-btn", 3, "click"], ["class", "skeleton", "style", "min-height: 180px;", 4, "ngIf"], ["class", "empresa-funcionarios-list", 4, "ngIf"], [1, "skeleton", 2, "min-height", "180px"], [1, "empresa-funcionarios-list"], ["class", "empresa-funcionario-row", 4, "ngFor", "ngForOf", "ngForTrackBy"], [1, "empresa-funcionario-row"], [1, "empresa-funcionario-main"], [1, "empresa-funcionario-name"], [1, "empresa-funcionario-detail"], [1, "empresa-funcionario-actions"], [1, "modal", "empresas-modal"], [1, "modal-content", "empresas-modal-panel"], [1, "card-subtitle", "empresas-modal-subtitle"], [1, "form", 3, "ngSubmit"], ["name", "nomeEmpresa", "type", "text", "required", "", 3, "ngModelChange", "ngModel"], ["name", "observacoesEmpresa", "rows", "3", "placeholder", "Opcional", 3, "ngModelChange", "ngModel"], [1, "field"], [1, "field-label"], ["class", "helper-text", 4, "ngIf"], ["class", "empresas-sistemas-list", 4, "ngIf"], [1, "modal-actions"], ["type", "button", 1, "btn", 3, "click"], ["type", "submit", 1, "btn", "primary"], [1, "helper-text"], [1, "empresas-sistemas-list"], ["class", "empresas-checkbox", 4, "ngFor", "ngForOf", "ngForTrackBy"], [1, "empresas-checkbox"], ["type", "checkbox", 3, "change", "checked"], ["name", "editEmpresaNome", "type", "text", "required", "", 3, "ngModelChange", "ngModel"], ["name", "editEmpresaObservacoes", "rows", "3", 3, "ngModelChange", "ngModel"], ["name", "editFuncionarioNome", "type", "text", "required", "", 3, "ngModelChange", "ngModel"], ["name", "editFuncionarioTelefone", "type", "text", "inputmode", "numeric", "placeholder", "554791904429", 3, "ngModelChange", "keydown", "paste", "ngModel"], ["name", "editFuncionarioCriarChamadoAutomatico", "type", "checkbox", 3, "ngModelChange", "ngModel"], ["class", "card-subtitle empresas-modal-subtitle", 4, "ngIf"], ["name", "funcionarioNome", "type", "text", "required", "", 3, "ngModelChange", "ngModel"], ["name", "funcionarioTelefone", "type", "text", "inputmode", "numeric", "placeholder", "554791904429", 3, "ngModelChange", "keydown", "paste", "ngModel"], ["name", "funcionarioCriarChamadoAutomatico", "type", "checkbox", 3, "ngModelChange", "ngModel"]], template: function EmpresasComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275template(0, EmpresasComponent_section_0_Template, 7, 6, "section", 1);
      \u0275\u0275pipe(1, "async");
    }
    if (rf & 2) {
      \u0275\u0275property("ngIf", \u0275\u0275pipeBind1(1, 1, ctx.vm$));
    }
  }, dependencies: [CommonModule, NgForOf, NgIf, FormsModule, \u0275NgNoValidate, DefaultValueAccessor, CheckboxControlValueAccessor, NgControlStatus, NgControlStatusGroup, RequiredValidator, NgModel, NgForm, AsyncPipe], styles: ['\n\n.empresas-hero[_ngcontent-%COMP%], \n.empresas-list-card[_ngcontent-%COMP%] {\n  min-width: 0;\n}\n.empresas-hero[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 18px;\n  padding: 28px;\n  background:\n    radial-gradient(\n      circle at top right,\n      rgba(59, 130, 246, 0.18),\n      transparent 32%),\n    linear-gradient(\n      180deg,\n      #ffffff 0%,\n      #f8fafc 100%);\n}\n.empresas-hero-copy[_ngcontent-%COMP%] {\n  min-width: 0;\n}\n.empresas-kicker[_ngcontent-%COMP%] {\n  display: inline-flex;\n  margin-bottom: 8px;\n  padding: 5px 10px;\n  border-radius: 999px;\n  border: 1px solid #bfdbfe;\n  background: #eff6ff;\n  color: #1d4ed8;\n  font-size: 11px;\n  font-weight: 700;\n  letter-spacing: 0.08em;\n  text-transform: uppercase;\n}\n.empresas-title[_ngcontent-%COMP%] {\n  font-size: 28px;\n  line-height: 1.1;\n}\n.empresas-subtitle[_ngcontent-%COMP%] {\n  margin-top: 8px;\n  max-width: 620px;\n  font-size: 14px;\n  line-height: 1.55;\n}\n.empresas-hero-actions[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  justify-content: flex-end;\n  flex-wrap: wrap;\n}\n.empresas-list-card[_ngcontent-%COMP%] {\n  padding: 22px 24px;\n}\n.empresas-list[_ngcontent-%COMP%] {\n  display: grid;\n  gap: 14px;\n}\n.empresa-card[_ngcontent-%COMP%] {\n  border: 1px solid #dbe3ee;\n  border-radius: 18px;\n  background:\n    linear-gradient(\n      180deg,\n      rgba(255, 255, 255, 0.98) 0%,\n      rgba(248, 250, 252, 0.96) 100%);\n  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05);\n  overflow: hidden;\n  transition:\n    transform var(--transition-fast),\n    border-color var(--transition-fast),\n    box-shadow var(--transition-fast),\n    background var(--transition-fast);\n}\n.empresa-card[_ngcontent-%COMP%]:hover {\n  transform: translateY(-1px);\n  border-color: #bfd5f5;\n  box-shadow: 0 18px 34px rgba(15, 23, 42, 0.08);\n}\n.empresa-card.is-open[_ngcontent-%COMP%] {\n  border-color: #93c5fd;\n  background:\n    linear-gradient(\n      180deg,\n      rgba(239, 246, 255, 0.96) 0%,\n      rgba(255, 255, 255, 0.98) 32%);\n  box-shadow: 0 22px 38px rgba(37, 99, 235, 0.12);\n}\n.empresa-card-header[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr) auto;\n  gap: 18px;\n  align-items: center;\n  padding: 18px 20px;\n  cursor: pointer;\n}\n.empresa-card-header[_ngcontent-%COMP%]:focus-visible {\n  outline: none;\n  box-shadow: inset 0 0 0 2px rgba(59, 130, 246, 0.35);\n}\n.empresa-card-primary[_ngcontent-%COMP%], \n.empresa-card-sistemas[_ngcontent-%COMP%] {\n  min-width: 0;\n}\n.empresa-name[_ngcontent-%COMP%] {\n  font-size: 17px;\n  font-weight: 800;\n  color: var(--text-main);\n  line-height: 1.25;\n  letter-spacing: -0.01em;\n}\n.empresa-card-subtitle[_ngcontent-%COMP%] {\n  margin-top: 5px;\n  font-size: 12px;\n  color: var(--text-muted);\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n.empresa-card-note[_ngcontent-%COMP%] {\n  margin-top: 4px;\n  font-size: 12px;\n  color: var(--text-soft);\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n.empresa-card-label[_ngcontent-%COMP%] {\n  margin-bottom: 7px;\n  font-size: 11px;\n  font-weight: 700;\n  color: var(--text-soft);\n  letter-spacing: 0.06em;\n  text-transform: uppercase;\n}\n.empresa-badges[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  min-width: 0;\n  flex-wrap: nowrap;\n}\n.empresa-system-badge[_ngcontent-%COMP%], \n.empresa-funcionarios-badge[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  gap: 6px;\n  max-width: 100%;\n  min-height: 28px;\n  padding: 0 10px;\n  border-radius: 999px;\n  border: 1px solid #dbe3ee;\n  background: rgba(248, 250, 252, 0.95);\n  color: #475569;\n  font-size: 12px;\n  font-weight: 700;\n  white-space: nowrap;\n}\n.empresa-system-badge[_ngcontent-%COMP%] {\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n.empresa-system-badge-extra[_ngcontent-%COMP%] {\n  background: rgba(226, 232, 240, 0.92);\n  color: #334155;\n}\n.empresa-system-empty[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  min-height: 28px;\n  color: var(--text-muted);\n  font-size: 12px;\n  font-weight: 600;\n}\n.empresa-card-side[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: flex-end;\n  gap: 12px;\n  min-width: 0;\n}\n.empresa-funcionarios-badge[_ngcontent-%COMP%] {\n  background: rgba(219, 234, 254, 0.88);\n  border-color: rgba(147, 197, 253, 0.9);\n  color: #1d4ed8;\n}\n.empresa-expand-shell[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-rows: 0fr;\n  opacity: 0;\n  transition: grid-template-rows 260ms ease, opacity 180ms ease;\n}\n.empresa-card.is-open[_ngcontent-%COMP%]   .empresa-expand-shell[_ngcontent-%COMP%] {\n  grid-template-rows: 1fr;\n  opacity: 1;\n}\n.empresa-expand-inner[_ngcontent-%COMP%] {\n  overflow: hidden;\n}\n.empresa-expand-panel[_ngcontent-%COMP%] {\n  position: relative;\n  margin: 0 14px 14px 14px;\n  padding: 18px 18px 12px 28px;\n  border: 1px solid #dbe7f5;\n  border-radius: 16px;\n  background:\n    linear-gradient(\n      180deg,\n      #f8fbff 0%,\n      #ffffff 100%);\n}\n.empresa-expand-panel[_ngcontent-%COMP%]::before {\n  content: "";\n  position: absolute;\n  left: 14px;\n  top: 16px;\n  bottom: 16px;\n  width: 2px;\n  border-radius: 999px;\n  background:\n    linear-gradient(\n      180deg,\n      rgba(59, 130, 246, 0.42),\n      rgba(148, 163, 184, 0.18));\n}\n.empresas-funcionarios-header[_ngcontent-%COMP%] {\n  align-items: center;\n  margin-bottom: 6px;\n}\n.empresa-add-funcionario-btn[_ngcontent-%COMP%] {\n  border-color: #c7d8f5;\n  background: rgba(255, 255, 255, 0.92);\n  color: #1e40af;\n  box-shadow: none;\n}\n.empresa-add-funcionario-btn[_ngcontent-%COMP%]:hover:not(:disabled) {\n  background: #eff6ff;\n  border-color: #93c5fd;\n  box-shadow: 0 10px 18px rgba(59, 130, 246, 0.12);\n}\n.empresa-funcionarios-list[_ngcontent-%COMP%] {\n  display: grid;\n}\n.empresa-funcionario-row[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: minmax(0, 1fr) auto;\n  gap: 14px;\n  align-items: center;\n  padding: 14px 4px;\n  border-bottom: 1px solid #e2e8f0;\n  transition: background var(--transition-fast);\n}\n.empresa-funcionario-row[_ngcontent-%COMP%]:last-child {\n  border-bottom: none;\n}\n.empresa-funcionario-row[_ngcontent-%COMP%]:hover {\n  background: rgba(239, 246, 255, 0.55);\n}\n.empresa-funcionario-main[_ngcontent-%COMP%] {\n  min-width: 0;\n}\n.empresa-funcionario-name[_ngcontent-%COMP%] {\n  font-size: 14px;\n  font-weight: 700;\n  color: var(--text-main);\n}\n.empresa-funcionario-detail[_ngcontent-%COMP%] {\n  margin-top: 4px;\n  font-size: 12px;\n  color: var(--text-muted);\n}\n.empresa-funcionario-actions[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: flex-end;\n  gap: 10px;\n}\n.btn-sm[_ngcontent-%COMP%] {\n  height: 32px;\n  padding: 0 12px;\n  font-size: 12px;\n  border-radius: 9px;\n}\n.empresas-row-actions[_ngcontent-%COMP%] {\n  justify-content: flex-end;\n  gap: 10px;\n  flex-wrap: nowrap;\n}\n.empresas-modal[_ngcontent-%COMP%] {\n  animation: _ngcontent-%COMP%_empresas-modal-fade 180ms ease;\n}\n.empresas-modal-panel[_ngcontent-%COMP%] {\n  width: min(460px, 100%);\n  padding: 22px;\n  animation: _ngcontent-%COMP%_empresas-modal-rise 220ms ease;\n}\n.empresas-modal-subtitle[_ngcontent-%COMP%] {\n  margin-bottom: 16px;\n}\n.empresas-checkbox[_ngcontent-%COMP%] {\n  grid-template-columns: auto 1fr;\n  align-items: center;\n  gap: 10px;\n  padding: 12px 14px;\n  border: 1px solid #dbe3ee;\n  border-radius: var(--radius-sm);\n  background: #f8fafc;\n}\n.empresas-checkbox[_ngcontent-%COMP%]   input[_ngcontent-%COMP%] {\n  width: 16px;\n  height: 16px;\n  margin: 0;\n  accent-color: var(--primary-500);\n}\n.empresas-checkbox[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] {\n  font-size: 13px;\n  color: var(--text-main);\n  font-weight: 600;\n}\n.empresas-sistemas-list[_ngcontent-%COMP%] {\n  display: grid;\n  gap: 8px;\n  max-height: 220px;\n  overflow-y: auto;\n  padding-right: 4px;\n}\n@media (max-width: 980px) {\n  .empresa-card-header[_ngcontent-%COMP%] {\n    grid-template-columns: 1fr;\n    align-items: stretch;\n  }\n  .empresa-card-side[_ngcontent-%COMP%] {\n    justify-content: space-between;\n  }\n}\n@media (max-width: 720px) {\n  .empresas-hero[_ngcontent-%COMP%] {\n    flex-direction: column;\n    align-items: stretch;\n  }\n  .empresas-hero-actions[_ngcontent-%COMP%] {\n    justify-content: space-between;\n  }\n  .empresa-card-header[_ngcontent-%COMP%] {\n    padding: 16px;\n  }\n  .empresa-badges[_ngcontent-%COMP%] {\n    flex-wrap: wrap;\n  }\n  .empresa-card-subtitle[_ngcontent-%COMP%], \n   .empresa-card-note[_ngcontent-%COMP%] {\n    white-space: normal;\n  }\n  .empresa-card-side[_ngcontent-%COMP%], \n   .empresa-funcionario-actions[_ngcontent-%COMP%], \n   .empresas-funcionarios-header[_ngcontent-%COMP%] {\n    flex-direction: column;\n    align-items: stretch;\n  }\n  .empresa-funcionario-row[_ngcontent-%COMP%] {\n    grid-template-columns: 1fr;\n  }\n  .empresas-row-actions[_ngcontent-%COMP%] {\n    justify-content: flex-start;\n    flex-wrap: wrap;\n  }\n  .empresas-funcionarios-header[_ngcontent-%COMP%]   .btn[_ngcontent-%COMP%], \n   .empresa-funcionario-actions[_ngcontent-%COMP%]   .status-chip[_ngcontent-%COMP%] {\n    width: 100%;\n    justify-content: center;\n  }\n  .empresa-expand-panel[_ngcontent-%COMP%] {\n    margin: 0 10px 10px 10px;\n    padding: 16px 16px 10px 24px;\n  }\n  .empresa-expand-panel[_ngcontent-%COMP%]::before {\n    left: 11px;\n  }\n}\n@keyframes _ngcontent-%COMP%_empresas-modal-fade {\n  from {\n    opacity: 0;\n  }\n  to {\n    opacity: 1;\n  }\n}\n@keyframes _ngcontent-%COMP%_empresas-modal-rise {\n  from {\n    opacity: 0;\n    transform: translateY(12px) scale(0.98);\n  }\n  to {\n    opacity: 1;\n    transform: translateY(0) scale(1);\n  }\n}\n.empresas-list-card.empresas-list-card[_ngcontent-%COMP%] {\n  background:\n    linear-gradient(\n      180deg,\n      #ffffff 0%,\n      #f8fbff 100%);\n}\n.empresa-card.empresa-card[_ngcontent-%COMP%] {\n  border-radius: var(--radius-lg);\n  background: #ffffff;\n}\n.empresa-card.empresa-card[_ngcontent-%COMP%]:hover {\n  transform: none;\n}\n.empresa-card.empresa-card.is-open[_ngcontent-%COMP%] {\n  border-color: #9ec5fe;\n  background: #fbfdff;\n}\n.empresa-expand-panel.empresa-expand-panel[_ngcontent-%COMP%], \n.empresas-checkbox.empresas-checkbox[_ngcontent-%COMP%] {\n  border-radius: var(--radius-md);\n}\n.empresa-system-badge.empresa-system-badge[_ngcontent-%COMP%], \n.empresa-funcionarios-badge.empresa-funcionarios-badge[_ngcontent-%COMP%] {\n  border-radius: 999px;\n  background: #ffffff;\n}\n.empresa-funcionario-row.empresa-funcionario-row[_ngcontent-%COMP%]:hover {\n  background: #f8fbff;\n}\n/*# sourceMappingURL=empresas.component.css.map */'], changeDetection: 0 });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(EmpresasComponent, [{
    type: Component,
    args: [{ selector: "app-empresas", standalone: true, imports: [CommonModule, FormsModule], changeDetection: ChangeDetectionStrategy.OnPush, template: '<section class="page-section" *ngIf="vm$ | async as vm">\r\n  <div class="stack-md" *ngIf="vm.carregando && vm.empresas.length === 0">\r\n    <div class="skeleton" style="min-height: 300px;"></div>\r\n  </div>\r\n\r\n  <div class="stack-md" *ngIf="!vm.carregando || vm.empresas.length > 0">\r\n    <article class="card empresas-list-card">\r\n      <div class="card-title-row">\r\n        <div>\r\n          <h3 class="card-title">Lista de empresas</h3>\r\n          <p class="card-subtitle">Clique no card para abrir ou recolher os funcion\xE1rios vinculados.</p>\r\n        </div>\r\n        <div class="empresas-hero-actions">\r\n          <span class="status-chip">Total: {{ vm.empresas.length }}</span>\r\n          <button class="btn primary" type="button" (click)="abrirCadastroEmpresa()">Nova empresa</button>\r\n        </div>\r\n      </div>\r\n\r\n      <div class="empty-state" *ngIf="!!vm.erro">{{ vm.erro }}</div>\r\n\r\n      <div class="empty-state" *ngIf="!vm.erro && vm.empresas.length === 0">\r\n        Nenhuma empresa cadastrada.\r\n      </div>\r\n\r\n      <div class="empresas-list" *ngIf="!vm.erro && vm.empresas.length > 0">\r\n        <article\r\n          class="empresa-card"\r\n          *ngFor="let item of vm.empresas; trackBy: trackByEmpresa"\r\n          [class.is-open]="item.id === vm.empresaSelecionada?.id"\r\n        >\r\n          <div\r\n            class="empresa-card-header"\r\n            role="button"\r\n            tabindex="0"\r\n            [attr.aria-expanded]="item.id === vm.empresaSelecionada?.id"\r\n            (click)="alternarEmpresa(item.id)"\r\n            (keydown.enter)="alternarEmpresa(item.id)"\r\n            (keydown.space)="alternarEmpresa(item.id); $event.preventDefault()"\r\n          >\r\n            <div class="empresa-card-primary">\r\n              <div class="empresa-name">{{ item.nomeEmpresa }}</div>\r\n              <div class="empresa-card-subtitle">\r\n                {{ item.sistemasQuantidadeLabel }} \u2022 {{ item.chamadosQuantidadeLabel }}\r\n              </div>\r\n              <div class="empresa-card-note" *ngIf="!!item.observacoes">{{ item.observacoes }}</div>\r\n            </div>\r\n\r\n            <div\r\n              class="empresa-card-sistemas"\r\n              [attr.title]="item.sistemasTooltip || null"\r\n            >\r\n              <div class="empresa-card-label">Sistemas</div>\r\n              <div class="empresa-badges" *ngIf="item.sistemasNomes.length > 0; else semSistemas">\r\n                <span\r\n                  class="empresa-system-badge"\r\n                  *ngFor="let sistema of item.sistemasVisiveis"\r\n                >\r\n                  {{ sistema }}\r\n                </span>\r\n                <span class="empresa-system-badge empresa-system-badge-extra" *ngIf="item.sistemasExtras > 0">\r\n                  +{{ item.sistemasExtras }}\r\n                </span>\r\n              </div>\r\n              <ng-template #semSistemas>\r\n                <span class="empresa-system-empty">Sem sistemas</span>\r\n              </ng-template>\r\n            </div>\r\n\r\n            <div class="empresa-card-side">\r\n              <span class="empresa-funcionarios-badge">\r\n                <span aria-hidden="true">&#128100;</span>\r\n                {{ item.totalFuncionariosLabel }} func.\r\n              </span>\r\n\r\n              <div class="btn-group empresas-row-actions">\r\n                <button\r\n                  class="btn secondary btn-sm"\r\n                  type="button"\r\n                  (click)="abrirEdicaoEmpresa(item); $event.stopPropagation()"\r\n                >\r\n                  Editar\r\n                </button>\r\n                <button\r\n                  class="btn danger btn-sm"\r\n                  type="button"\r\n                  (click)="excluirEmpresa(item); $event.stopPropagation()"\r\n                >\r\n                  Excluir\r\n                </button>\r\n              </div>\r\n            </div>\r\n          </div>\r\n\r\n          <div class="empresa-expand-shell">\r\n            <div class="empresa-expand-inner">\r\n              <div class="empresa-expand-panel" *ngIf="item.id === vm.empresaSelecionada?.id">\r\n                <div class="card-title-row empresas-funcionarios-header">\r\n                  <div>\r\n                    <h3 class="card-title">Funcion\xE1rios</h3>\r\n                    <p class="card-subtitle">Gerencie os vinculados sem sair desta empresa.</p>\r\n                  </div>\r\n                  <button\r\n                    class="btn secondary btn-sm empresa-add-funcionario-btn"\r\n                    type="button"\r\n                    (click)="abrirCadastroFuncionario(); $event.stopPropagation()"\r\n                  >\r\n                    Adicionar funcion\xE1rio\r\n                  </button>\r\n                </div>\r\n\r\n                <div class="empty-state" *ngIf="vm.funcionariosErro">{{ vm.funcionariosErro }}</div>\r\n                <div class="skeleton" style="min-height: 180px;" *ngIf="vm.funcionariosCarregando"></div>\r\n\r\n                <div class="empresa-funcionarios-list" *ngIf="!vm.funcionariosCarregando && !vm.funcionariosErro">\r\n                  <div class="empty-state" *ngIf="vm.funcionarios.length === 0">\r\n                    Nenhum funcion\xE1rio cadastrado.\r\n                  </div>\r\n\r\n                  <div\r\n                    class="empresa-funcionario-row"\r\n                    *ngFor="let funcionario of vm.funcionarios; trackBy: trackByFuncionario"\r\n                  >\r\n                    <div class="empresa-funcionario-main">\r\n                      <div class="empresa-funcionario-name">{{ funcionario.nomeFuncionario }}</div>\r\n                      <div class="empresa-funcionario-detail">\r\n                        {{ funcionario.telefone || "Telefone n\xE3o informado" }}\r\n                      </div>\r\n                    </div>\r\n\r\n                    <div class="empresa-funcionario-actions">\r\n                      <span\r\n                        class="status-chip"\r\n                        [class.warning]="funcionario?.criarChamadoAutomatico === false"\r\n                      >\r\n                        {{\r\n                          funcionario?.criarChamadoAutomatico === false\r\n                            ? "WhatsApp desativado"\r\n                            : "WhatsApp ativado"\r\n                        }}\r\n                      </span>\r\n\r\n                      <div class="btn-group empresas-row-actions">\r\n                        <button\r\n                          class="btn secondary btn-sm"\r\n                          type="button"\r\n                          (click)="abrirEdicaoFuncionario(funcionario); $event.stopPropagation()"\r\n                        >\r\n                          Editar\r\n                        </button>\r\n                        <button\r\n                          class="btn danger btn-sm"\r\n                          type="button"\r\n                          (click)="excluirFuncionario(funcionario); $event.stopPropagation()"\r\n                        >\r\n                          Excluir\r\n                        </button>\r\n                      </div>\r\n                    </div>\r\n                  </div>\r\n                </div>\r\n              </div>\r\n            </div>\r\n          </div>\r\n        </article>\r\n      </div>\r\n    </article>\r\n  </div>\r\n\r\n  <div class="modal empresas-modal" *ngIf="cadastrandoEmpresa">\r\n    <div class="modal-content empresas-modal-panel">\r\n      <h3>Nova empresa</h3>\r\n      <p class="card-subtitle empresas-modal-subtitle">Cadastre uma empresa para vincular chamados e funcion\xE1rios.</p>\r\n      <form class="form" (ngSubmit)="cadastrarEmpresa()">\r\n        <label>\r\n          <span>Nome da empresa</span>\r\n          <input name="nomeEmpresa" type="text" [(ngModel)]="nomeEmpresa" required />\r\n        </label>\r\n        <label>\r\n          <span>Observa\xE7\xF5es</span>\r\n          <textarea\r\n            name="observacoesEmpresa"\r\n            rows="3"\r\n            [(ngModel)]="observacoesEmpresa"\r\n            placeholder="Opcional"\r\n          ></textarea>\r\n        </label>\r\n\r\n        <div class="field">\r\n          <span class="field-label">Sistemas utilizados</span>\r\n          <div class="helper-text" *ngIf="vm.sistemasErro">{{ vm.sistemasErro }}</div>\r\n          <div class="helper-text" *ngIf="!vm.sistemasErro && vm.sistemas.length === 0">\r\n            Nenhum sistema cadastrado. Cadastre primeiro na aba Sistemas.\r\n          </div>\r\n          <div class="empresas-sistemas-list" *ngIf="vm.sistemas.length > 0">\r\n            <label\r\n              class="empresas-checkbox"\r\n              *ngFor="let sistema of vm.sistemas; trackBy: trackBySistema"\r\n            >\r\n              <input\r\n                type="checkbox"\r\n                [checked]="isSistemaSelecionado(sistema.id)"\r\n                (change)="alternarSistemaEmpresa(sistema.id, $any($event.target).checked)"\r\n              />\r\n              <span>{{ sistema.nome }}</span>\r\n            </label>\r\n          </div>\r\n        </div>\r\n\r\n        <div class="modal-actions">\r\n          <button class="btn" type="button" (click)="cancelarCadastroEmpresa()">Cancelar</button>\r\n          <button class="btn primary" type="submit">Salvar</button>\r\n        </div>\r\n      </form>\r\n    </div>\r\n  </div>\r\n\r\n  <div class="modal empresas-modal" *ngIf="editandoEmpresa">\r\n    <div class="modal-content empresas-modal-panel">\r\n      <h3>Editar empresa</h3>\r\n      <p class="card-subtitle empresas-modal-subtitle">Atualize os dados exibidos na listagem de empresas.</p>\r\n      <form class="form" (ngSubmit)="salvarEdicaoEmpresa()">\r\n        <label>\r\n          <span>Empresa</span>\r\n          <input name="editEmpresaNome" type="text" [(ngModel)]="editEmpresaNome" required />\r\n        </label>\r\n        <label>\r\n          <span>Observa\xE7\xF5es</span>\r\n          <textarea name="editEmpresaObservacoes" rows="3" [(ngModel)]="editEmpresaObservacoes"></textarea>\r\n        </label>\r\n\r\n        <div class="field">\r\n          <span class="field-label">Sistemas utilizados</span>\r\n          <div class="helper-text" *ngIf="vm.sistemasErro">{{ vm.sistemasErro }}</div>\r\n          <div class="helper-text" *ngIf="!vm.sistemasErro && vm.sistemas.length === 0">\r\n            Nenhum sistema cadastrado. Cadastre primeiro na aba Sistemas.\r\n          </div>\r\n          <div class="empresas-sistemas-list" *ngIf="vm.sistemas.length > 0">\r\n            <label\r\n              class="empresas-checkbox"\r\n              *ngFor="let sistema of vm.sistemas; trackBy: trackBySistema"\r\n            >\r\n              <input\r\n                type="checkbox"\r\n                [checked]="isSistemaSelecionado(sistema.id, true)"\r\n                (change)="alternarSistemaEmpresa(sistema.id, $any($event.target).checked, true)"\r\n              />\r\n              <span>{{ sistema.nome }}</span>\r\n            </label>\r\n          </div>\r\n        </div>\r\n\r\n        <div class="modal-actions">\r\n          <button class="btn" type="button" (click)="cancelarEdicaoEmpresa()">Cancelar</button>\r\n          <button class="btn primary" type="submit">Salvar</button>\r\n        </div>\r\n      </form>\r\n    </div>\r\n  </div>\r\n\r\n  <div class="modal empresas-modal" *ngIf="editandoFuncionario && editFuncionario">\r\n    <div class="modal-content empresas-modal-panel">\r\n      <h3>Editar funcion\xE1rio</h3>\r\n      <p class="card-subtitle empresas-modal-subtitle">Ajuste os dados do funcion\xE1rio selecionado.</p>\r\n      <form class="form" (ngSubmit)="salvarEdicaoFuncionario()">\r\n        <label>\r\n          <span>Nome do funcion\xE1rio</span>\r\n          <input\r\n            name="editFuncionarioNome"\r\n            type="text"\r\n            [(ngModel)]="editFuncionario.nomeFuncionario"\r\n            required\r\n          />\r\n        </label>\r\n        <label>\r\n          <span>Telefone</span>\r\n          <input\r\n            name="editFuncionarioTelefone"\r\n            type="text"\r\n            inputmode="numeric"\r\n            [(ngModel)]="editFuncionario.telefone"\r\n            (keydown)="onTelefoneKeydown($event)"\r\n            (paste)="onTelefonePaste($event)"\r\n            placeholder="554791904429"\r\n          />\r\n        </label>\r\n        <div class="helper-text">\r\n          Telefone salvo no banco: 55 + DDD + 8 digitos (ex.: 554791904429).\r\n        </div>\r\n        <label class="empresas-checkbox">\r\n          <input\r\n            name="editFuncionarioCriarChamadoAutomatico"\r\n            type="checkbox"\r\n            [(ngModel)]="editFuncionario.criarChamadoAutomatico"\r\n          />\r\n          <span>Criar chamado automaticamente via WhatsApp</span>\r\n        </label>\r\n        <div class="helper-text">\r\n          Desmarcado: mensagens desse funcion\xE1rio ser\xE3o ignoradas sem erro.\r\n        </div>\r\n        <div class="modal-actions">\r\n          <button class="btn" type="button" (click)="cancelarEdicaoFuncionario()">Cancelar</button>\r\n          <button class="btn primary" type="submit">Salvar</button>\r\n        </div>\r\n      </form>\r\n    </div>\r\n  </div>\r\n\r\n  <div class="modal empresas-modal" *ngIf="cadastrandoFuncionario && funcionario">\r\n    <div class="modal-content empresas-modal-panel">\r\n      <h3>Novo funcion\xE1rio</h3>\r\n      <p class="card-subtitle empresas-modal-subtitle" *ngIf="vm.empresaSelecionada">\r\n        Vinculado a {{ vm.empresaSelecionada.nomeEmpresa }}\r\n      </p>\r\n      <form class="form" (ngSubmit)="cadastrarFuncionario()">\r\n        <label>\r\n          <span>Nome</span>\r\n          <input\r\n            name="funcionarioNome"\r\n            type="text"\r\n            [(ngModel)]="funcionario.nomeFuncionario"\r\n            required\r\n          />\r\n        </label>\r\n        <label>\r\n          <span>Telefone</span>\r\n          <input\r\n            name="funcionarioTelefone"\r\n            type="text"\r\n            inputmode="numeric"\r\n            [(ngModel)]="funcionario.telefone"\r\n            (keydown)="onTelefoneKeydown($event)"\r\n            (paste)="onTelefonePaste($event)"\r\n            placeholder="554791904429"\r\n          />\r\n        </label>\r\n        <div class="helper-text">\r\n          Telefone salvo no banco: 55 + DDD + 8 digitos (ex.: 554791904429).\r\n        </div>\r\n        <label class="empresas-checkbox">\r\n          <input\r\n            name="funcionarioCriarChamadoAutomatico"\r\n            type="checkbox"\r\n            [(ngModel)]="funcionario.criarChamadoAutomatico"\r\n          />\r\n          <span>Criar chamado automaticamente via WhatsApp</span>\r\n        </label>\r\n        <div class="helper-text">\r\n          Desmarcado: mensagens desse funcion\xE1rio ser\xE3o ignoradas sem erro.\r\n        </div>\r\n        <div class="modal-actions">\r\n          <button class="btn" type="button" (click)="cancelarCadastroFuncionario()">Cancelar</button>\r\n          <button class="btn primary" type="submit">Salvar funcion\xE1rio</button>\r\n        </div>\r\n      </form>\r\n    </div>\r\n  </div>\r\n</section>\r\n', styles: ['/* src/app/pages/empresas/empresas.component.css */\n.empresas-hero,\n.empresas-list-card {\n  min-width: 0;\n}\n.empresas-hero {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 18px;\n  padding: 28px;\n  background:\n    radial-gradient(\n      circle at top right,\n      rgba(59, 130, 246, 0.18),\n      transparent 32%),\n    linear-gradient(\n      180deg,\n      #ffffff 0%,\n      #f8fafc 100%);\n}\n.empresas-hero-copy {\n  min-width: 0;\n}\n.empresas-kicker {\n  display: inline-flex;\n  margin-bottom: 8px;\n  padding: 5px 10px;\n  border-radius: 999px;\n  border: 1px solid #bfdbfe;\n  background: #eff6ff;\n  color: #1d4ed8;\n  font-size: 11px;\n  font-weight: 700;\n  letter-spacing: 0.08em;\n  text-transform: uppercase;\n}\n.empresas-title {\n  font-size: 28px;\n  line-height: 1.1;\n}\n.empresas-subtitle {\n  margin-top: 8px;\n  max-width: 620px;\n  font-size: 14px;\n  line-height: 1.55;\n}\n.empresas-hero-actions {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  justify-content: flex-end;\n  flex-wrap: wrap;\n}\n.empresas-list-card {\n  padding: 22px 24px;\n}\n.empresas-list {\n  display: grid;\n  gap: 14px;\n}\n.empresa-card {\n  border: 1px solid #dbe3ee;\n  border-radius: 18px;\n  background:\n    linear-gradient(\n      180deg,\n      rgba(255, 255, 255, 0.98) 0%,\n      rgba(248, 250, 252, 0.96) 100%);\n  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05);\n  overflow: hidden;\n  transition:\n    transform var(--transition-fast),\n    border-color var(--transition-fast),\n    box-shadow var(--transition-fast),\n    background var(--transition-fast);\n}\n.empresa-card:hover {\n  transform: translateY(-1px);\n  border-color: #bfd5f5;\n  box-shadow: 0 18px 34px rgba(15, 23, 42, 0.08);\n}\n.empresa-card.is-open {\n  border-color: #93c5fd;\n  background:\n    linear-gradient(\n      180deg,\n      rgba(239, 246, 255, 0.96) 0%,\n      rgba(255, 255, 255, 0.98) 32%);\n  box-shadow: 0 22px 38px rgba(37, 99, 235, 0.12);\n}\n.empresa-card-header {\n  display: grid;\n  grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr) auto;\n  gap: 18px;\n  align-items: center;\n  padding: 18px 20px;\n  cursor: pointer;\n}\n.empresa-card-header:focus-visible {\n  outline: none;\n  box-shadow: inset 0 0 0 2px rgba(59, 130, 246, 0.35);\n}\n.empresa-card-primary,\n.empresa-card-sistemas {\n  min-width: 0;\n}\n.empresa-name {\n  font-size: 17px;\n  font-weight: 800;\n  color: var(--text-main);\n  line-height: 1.25;\n  letter-spacing: -0.01em;\n}\n.empresa-card-subtitle {\n  margin-top: 5px;\n  font-size: 12px;\n  color: var(--text-muted);\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n.empresa-card-note {\n  margin-top: 4px;\n  font-size: 12px;\n  color: var(--text-soft);\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n.empresa-card-label {\n  margin-bottom: 7px;\n  font-size: 11px;\n  font-weight: 700;\n  color: var(--text-soft);\n  letter-spacing: 0.06em;\n  text-transform: uppercase;\n}\n.empresa-badges {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  min-width: 0;\n  flex-wrap: nowrap;\n}\n.empresa-system-badge,\n.empresa-funcionarios-badge {\n  display: inline-flex;\n  align-items: center;\n  gap: 6px;\n  max-width: 100%;\n  min-height: 28px;\n  padding: 0 10px;\n  border-radius: 999px;\n  border: 1px solid #dbe3ee;\n  background: rgba(248, 250, 252, 0.95);\n  color: #475569;\n  font-size: 12px;\n  font-weight: 700;\n  white-space: nowrap;\n}\n.empresa-system-badge {\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n.empresa-system-badge-extra {\n  background: rgba(226, 232, 240, 0.92);\n  color: #334155;\n}\n.empresa-system-empty {\n  display: inline-flex;\n  align-items: center;\n  min-height: 28px;\n  color: var(--text-muted);\n  font-size: 12px;\n  font-weight: 600;\n}\n.empresa-card-side {\n  display: flex;\n  align-items: center;\n  justify-content: flex-end;\n  gap: 12px;\n  min-width: 0;\n}\n.empresa-funcionarios-badge {\n  background: rgba(219, 234, 254, 0.88);\n  border-color: rgba(147, 197, 253, 0.9);\n  color: #1d4ed8;\n}\n.empresa-expand-shell {\n  display: grid;\n  grid-template-rows: 0fr;\n  opacity: 0;\n  transition: grid-template-rows 260ms ease, opacity 180ms ease;\n}\n.empresa-card.is-open .empresa-expand-shell {\n  grid-template-rows: 1fr;\n  opacity: 1;\n}\n.empresa-expand-inner {\n  overflow: hidden;\n}\n.empresa-expand-panel {\n  position: relative;\n  margin: 0 14px 14px 14px;\n  padding: 18px 18px 12px 28px;\n  border: 1px solid #dbe7f5;\n  border-radius: 16px;\n  background:\n    linear-gradient(\n      180deg,\n      #f8fbff 0%,\n      #ffffff 100%);\n}\n.empresa-expand-panel::before {\n  content: "";\n  position: absolute;\n  left: 14px;\n  top: 16px;\n  bottom: 16px;\n  width: 2px;\n  border-radius: 999px;\n  background:\n    linear-gradient(\n      180deg,\n      rgba(59, 130, 246, 0.42),\n      rgba(148, 163, 184, 0.18));\n}\n.empresas-funcionarios-header {\n  align-items: center;\n  margin-bottom: 6px;\n}\n.empresa-add-funcionario-btn {\n  border-color: #c7d8f5;\n  background: rgba(255, 255, 255, 0.92);\n  color: #1e40af;\n  box-shadow: none;\n}\n.empresa-add-funcionario-btn:hover:not(:disabled) {\n  background: #eff6ff;\n  border-color: #93c5fd;\n  box-shadow: 0 10px 18px rgba(59, 130, 246, 0.12);\n}\n.empresa-funcionarios-list {\n  display: grid;\n}\n.empresa-funcionario-row {\n  display: grid;\n  grid-template-columns: minmax(0, 1fr) auto;\n  gap: 14px;\n  align-items: center;\n  padding: 14px 4px;\n  border-bottom: 1px solid #e2e8f0;\n  transition: background var(--transition-fast);\n}\n.empresa-funcionario-row:last-child {\n  border-bottom: none;\n}\n.empresa-funcionario-row:hover {\n  background: rgba(239, 246, 255, 0.55);\n}\n.empresa-funcionario-main {\n  min-width: 0;\n}\n.empresa-funcionario-name {\n  font-size: 14px;\n  font-weight: 700;\n  color: var(--text-main);\n}\n.empresa-funcionario-detail {\n  margin-top: 4px;\n  font-size: 12px;\n  color: var(--text-muted);\n}\n.empresa-funcionario-actions {\n  display: flex;\n  align-items: center;\n  justify-content: flex-end;\n  gap: 10px;\n}\n.btn-sm {\n  height: 32px;\n  padding: 0 12px;\n  font-size: 12px;\n  border-radius: 9px;\n}\n.empresas-row-actions {\n  justify-content: flex-end;\n  gap: 10px;\n  flex-wrap: nowrap;\n}\n.empresas-modal {\n  animation: empresas-modal-fade 180ms ease;\n}\n.empresas-modal-panel {\n  width: min(460px, 100%);\n  padding: 22px;\n  animation: empresas-modal-rise 220ms ease;\n}\n.empresas-modal-subtitle {\n  margin-bottom: 16px;\n}\n.empresas-checkbox {\n  grid-template-columns: auto 1fr;\n  align-items: center;\n  gap: 10px;\n  padding: 12px 14px;\n  border: 1px solid #dbe3ee;\n  border-radius: var(--radius-sm);\n  background: #f8fafc;\n}\n.empresas-checkbox input {\n  width: 16px;\n  height: 16px;\n  margin: 0;\n  accent-color: var(--primary-500);\n}\n.empresas-checkbox span {\n  font-size: 13px;\n  color: var(--text-main);\n  font-weight: 600;\n}\n.empresas-sistemas-list {\n  display: grid;\n  gap: 8px;\n  max-height: 220px;\n  overflow-y: auto;\n  padding-right: 4px;\n}\n@media (max-width: 980px) {\n  .empresa-card-header {\n    grid-template-columns: 1fr;\n    align-items: stretch;\n  }\n  .empresa-card-side {\n    justify-content: space-between;\n  }\n}\n@media (max-width: 720px) {\n  .empresas-hero {\n    flex-direction: column;\n    align-items: stretch;\n  }\n  .empresas-hero-actions {\n    justify-content: space-between;\n  }\n  .empresa-card-header {\n    padding: 16px;\n  }\n  .empresa-badges {\n    flex-wrap: wrap;\n  }\n  .empresa-card-subtitle,\n  .empresa-card-note {\n    white-space: normal;\n  }\n  .empresa-card-side,\n  .empresa-funcionario-actions,\n  .empresas-funcionarios-header {\n    flex-direction: column;\n    align-items: stretch;\n  }\n  .empresa-funcionario-row {\n    grid-template-columns: 1fr;\n  }\n  .empresas-row-actions {\n    justify-content: flex-start;\n    flex-wrap: wrap;\n  }\n  .empresas-funcionarios-header .btn,\n  .empresa-funcionario-actions .status-chip {\n    width: 100%;\n    justify-content: center;\n  }\n  .empresa-expand-panel {\n    margin: 0 10px 10px 10px;\n    padding: 16px 16px 10px 24px;\n  }\n  .empresa-expand-panel::before {\n    left: 11px;\n  }\n}\n@keyframes empresas-modal-fade {\n  from {\n    opacity: 0;\n  }\n  to {\n    opacity: 1;\n  }\n}\n@keyframes empresas-modal-rise {\n  from {\n    opacity: 0;\n    transform: translateY(12px) scale(0.98);\n  }\n  to {\n    opacity: 1;\n    transform: translateY(0) scale(1);\n  }\n}\n.empresas-list-card.empresas-list-card {\n  background:\n    linear-gradient(\n      180deg,\n      #ffffff 0%,\n      #f8fbff 100%);\n}\n.empresa-card.empresa-card {\n  border-radius: var(--radius-lg);\n  background: #ffffff;\n}\n.empresa-card.empresa-card:hover {\n  transform: none;\n}\n.empresa-card.empresa-card.is-open {\n  border-color: #9ec5fe;\n  background: #fbfdff;\n}\n.empresa-expand-panel.empresa-expand-panel,\n.empresas-checkbox.empresas-checkbox {\n  border-radius: var(--radius-md);\n}\n.empresa-system-badge.empresa-system-badge,\n.empresa-funcionarios-badge.empresa-funcionarios-badge {\n  border-radius: 999px;\n  background: #ffffff;\n}\n.empresa-funcionario-row.empresa-funcionario-row:hover {\n  background: #f8fbff;\n}\n/*# sourceMappingURL=empresas.component.css.map */\n'] }]
  }], () => [{ type: ChamadosService }, { type: EmpresasService }, { type: SistemasService }, { type: ToastService }, { type: NgZone }], null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(EmpresasComponent, { className: "EmpresasComponent", filePath: "src/app/pages/empresas/empresas.component.ts", lineNumber: 60 });
})();
export {
  EmpresasComponent
};
//# sourceMappingURL=chunk-5IALZXL4.js.map
