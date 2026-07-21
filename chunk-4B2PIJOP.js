import {
  ChamadosService
} from "./chunk-F7YXGS3T.js";
import {
  EmpresasService
} from "./chunk-E7I6VKBJ.js";
import {
  SistemasService
} from "./chunk-KBJR2FPL.js";
import {
  AsyncPipe,
  BehaviorSubject,
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
  NgSelectOption,
  RadioControlValueAccessor,
  SelectControlValueAccessor,
  ToastService,
  combineLatest,
  map,
  setClassMetadata,
  tap,
  ɵNgNoValidate,
  ɵNgSelectMultipleOption,
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

// src/app/pages/relatorios/relatorios.component.ts
function RelatoriosComponent_section_0_div_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 6);
    \u0275\u0275element(1, "div", 7);
    \u0275\u0275elementStart(2, "div", 8);
    \u0275\u0275element(3, "div", 9)(4, "div", 10);
    \u0275\u0275elementEnd()();
  }
}
function RelatoriosComponent_section_0_div_2_div_10_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 32);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const vm_r2 = \u0275\u0275nextContext(2).ngIf;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(vm_r2.erro);
  }
}
function RelatoriosComponent_section_0_div_2_form_11_div_13_label_1_Template(rf, ctx) {
  if (rf & 1) {
    const _r5 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "label", 54)(1, "input", 55);
    \u0275\u0275listener("change", function RelatoriosComponent_section_0_div_2_form_11_div_13_label_1_Template_input_change_1_listener($event) {
      const empresa_r6 = \u0275\u0275restoreView(_r5).$implicit;
      const ctx_r3 = \u0275\u0275nextContext(5);
      return \u0275\u0275resetView(ctx_r3.onEmpresaCheckboxChange(empresa_r6.id, $event));
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(2, "span");
    \u0275\u0275text(3);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const empresa_r6 = ctx.$implicit;
    const ctx_r3 = \u0275\u0275nextContext(5);
    \u0275\u0275advance();
    \u0275\u0275property("checked", ctx_r3.isEmpresaSelecionada(empresa_r6.id));
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(empresa_r6.nomeEmpresa);
  }
}
function RelatoriosComponent_section_0_div_2_form_11_div_13_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 52);
    \u0275\u0275template(1, RelatoriosComponent_section_0_div_2_form_11_div_13_label_1_Template, 4, 2, "label", 53);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const vm_r2 = \u0275\u0275nextContext(3).ngIf;
    const ctx_r3 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275property("ngForOf", vm_r2.empresas)("ngForTrackBy", ctx_r3.trackByEmpresa);
  }
}
function RelatoriosComponent_section_0_div_2_form_11_ng_template_14_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 32);
    \u0275\u0275text(1, "Nenhuma empresa cadastrada.");
    \u0275\u0275elementEnd();
  }
}
function RelatoriosComponent_section_0_div_2_form_11_Template(rf, ctx) {
  if (rf & 1) {
    const _r3 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "form", 33)(1, "div", 34)(2, "div", 35)(3, "div")(4, "span", 36);
    \u0275\u0275text(5, "Empresas");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "div", 31);
    \u0275\u0275text(7, "Empresas marcadas entram no relat\xF3rio.");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(8, "div", 37)(9, "button", 38);
    \u0275\u0275listener("click", function RelatoriosComponent_section_0_div_2_form_11_Template_button_click_9_listener() {
      \u0275\u0275restoreView(_r3);
      const vm_r2 = \u0275\u0275nextContext(2).ngIf;
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.selecionarTodasEmpresas(vm_r2.empresas));
    });
    \u0275\u0275text(10, " Selecionar todos ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(11, "button", 38);
    \u0275\u0275listener("click", function RelatoriosComponent_section_0_div_2_form_11_Template_button_click_11_listener() {
      \u0275\u0275restoreView(_r3);
      const ctx_r3 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r3.desmarcarTodasEmpresas());
    });
    \u0275\u0275text(12, " Desmarcar todos ");
    \u0275\u0275elementEnd()()();
    \u0275\u0275template(13, RelatoriosComponent_section_0_div_2_form_11_div_13_Template, 2, 2, "div", 39);
    \u0275\u0275elementEnd();
    \u0275\u0275template(14, RelatoriosComponent_section_0_div_2_form_11_ng_template_14_Template, 2, 0, "ng-template", null, 0, \u0275\u0275templateRefExtractor);
    \u0275\u0275elementStart(16, "div", 40)(17, "label")(18, "span");
    \u0275\u0275text(19, "Data inicial");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(20, "input", 41);
    \u0275\u0275twoWayListener("ngModelChange", function RelatoriosComponent_section_0_div_2_form_11_Template_input_ngModelChange_20_listener($event) {
      \u0275\u0275restoreView(_r3);
      const ctx_r3 = \u0275\u0275nextContext(3);
      \u0275\u0275twoWayBindingSet(ctx_r3.filtros.dataInicial, $event) || (ctx_r3.filtros.dataInicial = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275listener("ngModelChange", function RelatoriosComponent_section_0_div_2_form_11_Template_input_ngModelChange_20_listener() {
      \u0275\u0275restoreView(_r3);
      const ctx_r3 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r3.onFiltroChange());
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(21, "label")(22, "span");
    \u0275\u0275text(23, "Data final");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(24, "input", 42);
    \u0275\u0275twoWayListener("ngModelChange", function RelatoriosComponent_section_0_div_2_form_11_Template_input_ngModelChange_24_listener($event) {
      \u0275\u0275restoreView(_r3);
      const ctx_r3 = \u0275\u0275nextContext(3);
      \u0275\u0275twoWayBindingSet(ctx_r3.filtros.dataFinal, $event) || (ctx_r3.filtros.dataFinal = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275listener("ngModelChange", function RelatoriosComponent_section_0_div_2_form_11_Template_input_ngModelChange_24_listener() {
      \u0275\u0275restoreView(_r3);
      const ctx_r3 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r3.onFiltroChange());
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(25, "label")(26, "span");
    \u0275\u0275text(27, "Status do chamado");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(28, "select", 43);
    \u0275\u0275twoWayListener("ngModelChange", function RelatoriosComponent_section_0_div_2_form_11_Template_select_ngModelChange_28_listener($event) {
      \u0275\u0275restoreView(_r3);
      const ctx_r3 = \u0275\u0275nextContext(3);
      \u0275\u0275twoWayBindingSet(ctx_r3.filtros.status, $event) || (ctx_r3.filtros.status = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275listener("ngModelChange", function RelatoriosComponent_section_0_div_2_form_11_Template_select_ngModelChange_28_listener() {
      \u0275\u0275restoreView(_r3);
      const ctx_r3 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r3.onFiltroChange());
    });
    \u0275\u0275elementStart(29, "option", 44);
    \u0275\u0275text(30, "Abertos e conclu\xEDdos");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(31, "option", 45);
    \u0275\u0275text(32, "Abertos");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(33, "option", 46);
    \u0275\u0275text(34, "Conclu\xEDdos");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(35, "label")(36, "span");
    \u0275\u0275text(37, "Considerar tempo de atendimento");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(38, "select", 47);
    \u0275\u0275twoWayListener("ngModelChange", function RelatoriosComponent_section_0_div_2_form_11_Template_select_ngModelChange_38_listener($event) {
      \u0275\u0275restoreView(_r3);
      const ctx_r3 = \u0275\u0275nextContext(3);
      \u0275\u0275twoWayBindingSet(ctx_r3.filtros.tempo, $event) || (ctx_r3.filtros.tempo = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275listener("ngModelChange", function RelatoriosComponent_section_0_div_2_form_11_Template_select_ngModelChange_38_listener() {
      \u0275\u0275restoreView(_r3);
      const ctx_r3 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r3.onFiltroChange());
    });
    \u0275\u0275elementStart(39, "option", 48);
    \u0275\u0275text(40, "Todos");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(41, "option", 49);
    \u0275\u0275text(42, "Apenas chamados com tempo registrado");
    \u0275\u0275elementEnd()()()();
    \u0275\u0275elementStart(43, "div", 50)(44, "button", 51);
    \u0275\u0275listener("click", function RelatoriosComponent_section_0_div_2_form_11_Template_button_click_44_listener() {
      \u0275\u0275restoreView(_r3);
      const ctx_r3 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r3.limparFiltros());
    });
    \u0275\u0275text(45, " Limpar filtros ");
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const semEmpresas_r7 = \u0275\u0275reference(15);
    const vm_r2 = \u0275\u0275nextContext(2).ngIf;
    const ctx_r3 = \u0275\u0275nextContext();
    \u0275\u0275advance(9);
    \u0275\u0275property("disabled", vm_r2.empresas.length === 0 || ctx_r3.todasEmpresasSelecionadas(vm_r2.empresas));
    \u0275\u0275advance(2);
    \u0275\u0275property("disabled", ctx_r3.filtros.empresaIds.length === 0);
    \u0275\u0275advance(2);
    \u0275\u0275property("ngIf", vm_r2.empresas.length > 0)("ngIfElse", semEmpresas_r7);
    \u0275\u0275advance(7);
    \u0275\u0275twoWayProperty("ngModel", ctx_r3.filtros.dataInicial);
    \u0275\u0275advance(4);
    \u0275\u0275twoWayProperty("ngModel", ctx_r3.filtros.dataFinal);
    \u0275\u0275advance(4);
    \u0275\u0275twoWayProperty("ngModel", ctx_r3.filtros.status);
    \u0275\u0275advance(10);
    \u0275\u0275twoWayProperty("ngModel", ctx_r3.filtros.tempo);
  }
}
function RelatoriosComponent_section_0_div_2_label_21_Template(rf, ctx) {
  if (rf & 1) {
    const _r8 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "label", 56)(1, "input", 57);
    \u0275\u0275twoWayListener("ngModelChange", function RelatoriosComponent_section_0_div_2_label_21_Template_input_ngModelChange_1_listener($event) {
      \u0275\u0275restoreView(_r8);
      const ctx_r3 = \u0275\u0275nextContext(3);
      \u0275\u0275twoWayBindingSet(ctx_r3.tipoRelatorio, $event) || (ctx_r3.tipoRelatorio = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275listener("ngModelChange", function RelatoriosComponent_section_0_div_2_label_21_Template_input_ngModelChange_1_listener() {
      \u0275\u0275restoreView(_r8);
      const ctx_r3 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r3.onTipoRelatorioChange());
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(2, "span", 58);
    \u0275\u0275text(3);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "span", 59);
    \u0275\u0275text(5);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const item_r9 = ctx.$implicit;
    const ctx_r3 = \u0275\u0275nextContext(3);
    \u0275\u0275classProp("active", ctx_r3.tipoRelatorio === item_r9.valor);
    \u0275\u0275advance();
    \u0275\u0275property("value", item_r9.valor);
    \u0275\u0275twoWayProperty("ngModel", ctx_r3.tipoRelatorio);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(item_r9.titulo);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(item_r9.descricao);
  }
}
function RelatoriosComponent_section_0_div_2_div_55_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 32);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const vm_r2 = \u0275\u0275nextContext(2).ngIf;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", vm_r2.mensagemResultado, " ");
  }
}
function RelatoriosComponent_section_0_div_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 11)(1, "article", 12)(2, "div", 13)(3, "div")(4, "h3", 14);
    \u0275\u0275text(5, "Filtros gerais");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "p", 15);
    \u0275\u0275text(7, "Selecione os dados que ser\xE3o considerados na exporta\xE7\xE3o.");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(8, "span", 16);
    \u0275\u0275text(9);
    \u0275\u0275elementEnd()();
    \u0275\u0275template(10, RelatoriosComponent_section_0_div_2_div_10_Template, 2, 1, "div", 17)(11, RelatoriosComponent_section_0_div_2_form_11_Template, 46, 8, "form", 18);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(12, "div", 8)(13, "article", 19)(14, "div", 20)(15, "div")(16, "h3", 14);
    \u0275\u0275text(17, "Tipo de relat\xF3rio");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(18, "p", 15);
    \u0275\u0275text(19, "Escolha como os dados devem ser organizados no Excel.");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(20, "div", 21);
    \u0275\u0275template(21, RelatoriosComponent_section_0_div_2_label_21_Template, 6, 6, "label", 22);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(22, "article", 23)(23, "div", 20)(24, "div")(25, "h3", 14);
    \u0275\u0275text(26, "Exporta\xE7\xE3o");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(27, "p", 15);
    \u0275\u0275text(28, "Os filtros s\xE3o aplicados antes de gerar o arquivo Excel.");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(29, "div", 24)(30, "div", 25)(31, "span", 26);
    \u0275\u0275text(32, "Chamados filtrados");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(33, "strong");
    \u0275\u0275text(34);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(35, "div", 25)(36, "span", 26);
    \u0275\u0275text(37, "Empresas no resultado");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(38, "strong");
    \u0275\u0275text(39);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(40, "div", 25)(41, "span", 26);
    \u0275\u0275text(42, "Chamados com tempo");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(43, "strong");
    \u0275\u0275text(44);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(45, "div", 25)(46, "span", 26);
    \u0275\u0275text(47, "Tempo total");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(48, "strong");
    \u0275\u0275text(49);
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(50, "div", 27)(51, "div", 28);
    \u0275\u0275text(52, "Relat\xF3rio selecionado");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(53, "div", 29);
    \u0275\u0275text(54);
    \u0275\u0275elementEnd()();
    \u0275\u0275template(55, RelatoriosComponent_section_0_div_2_div_55_Template, 2, 1, "div", 17);
    \u0275\u0275elementStart(56, "button", 30);
    \u0275\u0275listener("click", function RelatoriosComponent_section_0_div_2_Template_button_click_56_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r3 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r3.exportarParaExcel());
    });
    \u0275\u0275text(57, " Exportar para Excel ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(58, "div", 31);
    \u0275\u0275text(59, "Arquivo gerado em formato .xlsx com a data atual.");
    \u0275\u0275elementEnd()()()();
  }
  if (rf & 2) {
    const vm_r2 = \u0275\u0275nextContext().ngIf;
    const ctx_r3 = \u0275\u0275nextContext();
    \u0275\u0275advance(9);
    \u0275\u0275textInterpolate1("Linhas: ", vm_r2.dataset.rows.length);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", !!vm_r2.erro);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", !vm_r2.erro);
    \u0275\u0275advance(10);
    \u0275\u0275property("ngForOf", ctx_r3.tipoRelatorioOptions)("ngForTrackBy", ctx_r3.trackByTipoRelatorio);
    \u0275\u0275advance(13);
    \u0275\u0275textInterpolate(vm_r2.totalChamadosFiltrados);
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(vm_r2.totalEmpresasFiltradas);
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(vm_r2.totalChamadosComTempo);
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(vm_r2.tempoTotalLabel);
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(ctx_r3.getTipoRelatorioTitulo());
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", !!vm_r2.mensagemResultado);
    \u0275\u0275advance();
    \u0275\u0275property("disabled", !!vm_r2.erro || !!vm_r2.mensagemResultado);
  }
}
function RelatoriosComponent_section_0_article_3_div_7_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 32);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const vm_r2 = \u0275\u0275nextContext(2).ngIf;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", vm_r2.mensagemResultado, " ");
  }
}
function RelatoriosComponent_section_0_article_3_div_8_th_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "th");
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const column_r10 = ctx.$implicit;
    \u0275\u0275classProp("align-right", column_r10.align === "right");
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", column_r10.label, " ");
  }
}
function RelatoriosComponent_section_0_article_3_div_8_tr_6_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "tr")(1, "td");
    \u0275\u0275text(2, "Nenhum dado corresponde aos filtros selecionados.");
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const vm_r2 = \u0275\u0275nextContext(3).ngIf;
    \u0275\u0275advance();
    \u0275\u0275attribute("colspan", vm_r2.dataset.columns.length);
  }
}
function RelatoriosComponent_section_0_article_3_div_8_tr_7_td_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "td");
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const column_r11 = ctx.$implicit;
    const row_r12 = \u0275\u0275nextContext().$implicit;
    const ctx_r3 = \u0275\u0275nextContext(4);
    \u0275\u0275classProp("align-right", column_r11.align === "right");
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", ctx_r3.getCellValue(row_r12, column_r11) || "-", " ");
  }
}
function RelatoriosComponent_section_0_article_3_div_8_tr_7_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "tr");
    \u0275\u0275template(1, RelatoriosComponent_section_0_article_3_div_8_tr_7_td_1_Template, 2, 3, "td", 64);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const vm_r2 = \u0275\u0275nextContext(3).ngIf;
    const ctx_r3 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275property("ngForOf", vm_r2.dataset.columns)("ngForTrackBy", ctx_r3.trackByColumn);
  }
}
function RelatoriosComponent_section_0_article_3_div_8_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 62)(1, "table", 63)(2, "thead")(3, "tr");
    \u0275\u0275template(4, RelatoriosComponent_section_0_article_3_div_8_th_4_Template, 2, 3, "th", 64);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(5, "tbody");
    \u0275\u0275template(6, RelatoriosComponent_section_0_article_3_div_8_tr_6_Template, 3, 1, "tr", 65)(7, RelatoriosComponent_section_0_article_3_div_8_tr_7_Template, 2, 2, "tr", 66);
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const vm_r2 = \u0275\u0275nextContext(2).ngIf;
    const ctx_r3 = \u0275\u0275nextContext();
    \u0275\u0275advance(4);
    \u0275\u0275property("ngForOf", vm_r2.dataset.columns)("ngForTrackBy", ctx_r3.trackByColumn);
    \u0275\u0275advance(2);
    \u0275\u0275property("ngIf", vm_r2.dataset.rows.length === 0);
    \u0275\u0275advance();
    \u0275\u0275property("ngForOf", ctx_r3.getPreviewRows(vm_r2.dataset.rows));
  }
}
function RelatoriosComponent_section_0_article_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "article", 60)(1, "div", 13)(2, "div")(3, "h3", 14);
    \u0275\u0275text(4, "Pr\xE9via do relat\xF3rio");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "p", 15);
    \u0275\u0275text(6);
    \u0275\u0275elementEnd()()();
    \u0275\u0275template(7, RelatoriosComponent_section_0_article_3_div_7_Template, 2, 1, "div", 17)(8, RelatoriosComponent_section_0_article_3_div_8_Template, 8, 4, "div", 61);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const vm_r2 = \u0275\u0275nextContext().ngIf;
    const ctx_r3 = \u0275\u0275nextContext();
    \u0275\u0275advance(6);
    \u0275\u0275textInterpolate2(" Exibindo ", ctx_r3.getPreviewRows(vm_r2.dataset.rows).length, " de ", vm_r2.dataset.rows.length, " linhas. ");
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", !!vm_r2.mensagemResultado);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", !vm_r2.mensagemResultado);
  }
}
function RelatoriosComponent_section_0_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "section", 2);
    \u0275\u0275template(1, RelatoriosComponent_section_0_div_1_Template, 5, 0, "div", 3)(2, RelatoriosComponent_section_0_div_2_Template, 60, 12, "div", 4)(3, RelatoriosComponent_section_0_article_3_Template, 9, 4, "article", 5);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const vm_r2 = ctx.ngIf;
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", vm_r2.carregando);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", !vm_r2.carregando);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", !vm_r2.carregando && !vm_r2.erro);
  }
}
var FILTROS_INICIAIS = {
  empresaIds: [],
  dataInicial: "",
  dataFinal: "",
  status: "ambos",
  tempo: "todos"
};
var RelatoriosComponent = class _RelatoriosComponent {
  chamadosService;
  empresasService;
  sistemasService;
  toast;
  filtros = this.cloneFiltros(FILTROS_INICIAIS);
  tipoRelatorio = "detalhado-chamados";
  tipoRelatorioOptions = [
    {
      valor: "detalhado-chamados",
      titulo: "Relat\xF3rio detalhado de chamados",
      descricao: "Exporta um chamado por linha com in\xEDcio, fim, empresa, sistema principal, motivo, descri\xE7\xE3o e tempo."
    },
    {
      valor: "tempo-por-empresa",
      titulo: "Relat\xF3rio de tempo por empresa",
      descricao: "Agrupa chamados por empresa com totais de chamados, tempo total e tempo m\xE9dio."
    },
    {
      valor: "ranking-empresas",
      titulo: "Ranking de empresas por chamados",
      descricao: "Ordena as empresas do maior para o menor volume de chamados no per\xEDodo filtrado."
    }
  ];
  previewLimit = 12;
  currentViewModel = null;
  empresasSelecionadasInicializadas = false;
  empresaIdsSelecionadosSet = /* @__PURE__ */ new Set();
  filtrosSubject = new BehaviorSubject(this.cloneFiltros(FILTROS_INICIAIS));
  tipoRelatorioSubject = new BehaviorSubject(this.tipoRelatorio);
  vm$;
  constructor(chamadosService, empresasService, sistemasService, toast) {
    this.chamadosService = chamadosService;
    this.empresasService = empresasService;
    this.sistemasService = sistemasService;
    this.toast = toast;
    this.vm$ = combineLatest([
      this.chamadosService.todosState$,
      this.empresasService.empresasState$,
      this.sistemasService.sistemasState$,
      this.filtrosSubject,
      this.tipoRelatorioSubject
    ]).pipe(map(([chamadosState, empresasState, sistemasState, filtros, tipoRelatorio]) => this.buildViewModel(chamadosState, empresasState, sistemasState, filtros, tipoRelatorio)), tap((viewModel) => {
      this.currentViewModel = viewModel;
      this.inicializarSelecaoEmpresas(viewModel.empresas);
    }));
  }
  onFiltroChange() {
    this.empresaIdsSelecionadosSet = new Set(this.filtros.empresaIds);
    this.filtrosSubject.next(this.cloneFiltros(this.filtros));
  }
  selecionarTodasEmpresas(empresas) {
    this.atualizarEmpresasSelecionadas(this.getEmpresaIds(empresas));
  }
  desmarcarTodasEmpresas() {
    this.atualizarEmpresasSelecionadas([]);
  }
  onEmpresaCheckboxChange(empresaId, event) {
    if (!empresaId)
      return;
    const checked = event.target?.checked ?? false;
    const empresaIds = checked ? [...this.filtros.empresaIds.filter((id) => id !== empresaId), empresaId] : this.filtros.empresaIds.filter((id) => id !== empresaId);
    this.atualizarEmpresasSelecionadas(empresaIds);
  }
  onTipoRelatorioChange() {
    this.tipoRelatorioSubject.next(this.tipoRelatorio);
  }
  limparFiltros() {
    const empresaIds = this.currentViewModel ? this.getEmpresaIds(this.currentViewModel.empresas) : [];
    this.filtros = __spreadProps(__spreadValues({}, this.cloneFiltros(FILTROS_INICIAIS)), {
      empresaIds
    });
    this.tipoRelatorio = "detalhado-chamados";
    this.onFiltroChange();
    this.tipoRelatorioSubject.next(this.tipoRelatorio);
  }
  async exportarParaExcel() {
    const vm = this.currentViewModel;
    if (!vm)
      return;
    if (vm.mensagemResultado) {
      this.toast.show(vm.mensagemResultado, "error");
      return;
    }
    if (vm.dataset.rows.length === 0) {
      this.toast.show("Nenhum dado corresponde aos filtros selecionados.", "error");
      return;
    }
    try {
      const XLSX = await import("./chunk-DFNFGMYB.js");
      const workbook = XLSX.utils.book_new();
      const header = vm.dataset.columns.map((column) => column.label);
      const body = vm.dataset.rows.map((row) => vm.dataset.columns.map((column) => row[column.key] ?? ""));
      const worksheet = XLSX.utils.aoa_to_sheet([header, ...body]);
      worksheet["!cols"] = vm.dataset.columns.map((column) => ({
        wch: this.getColumnWidth(column, vm.dataset.rows)
      }));
      XLSX.utils.book_append_sheet(workbook, worksheet, vm.dataset.sheetName);
      XLSX.writeFile(workbook, this.buildFileName());
      this.toast.show("Relat\xF3rio exportado com sucesso.", "success");
    } catch (err) {
      this.toast.show(`Erro ao exportar: ${err.message || err}`, "error");
    }
  }
  trackByTipoRelatorio(_, item) {
    return item.valor;
  }
  trackByEmpresa(_, item) {
    return item.id ?? item.nomeEmpresa;
  }
  trackByColumn(_, item) {
    return item.key;
  }
  getPreviewRows(rows) {
    return rows.slice(0, this.previewLimit);
  }
  getCellValue(row, column) {
    return row[column.key] ?? "";
  }
  getTipoRelatorioTitulo() {
    return this.tipoRelatorioOptions.find((item) => item.valor === this.tipoRelatorio)?.titulo ?? "Relat\xF3rio";
  }
  isEmpresaSelecionada(empresaId) {
    return !!empresaId && this.empresaIdsSelecionadosSet.has(empresaId);
  }
  todasEmpresasSelecionadas(empresas) {
    const empresaIds = this.getEmpresaIds(empresas);
    return empresaIds.length > 0 && empresaIds.every((id) => this.empresaIdsSelecionadosSet.has(id));
  }
  buildViewModel(chamadosState, empresasState, sistemasState, filtros, tipoRelatorio) {
    const empresas = this.sortEmpresas(empresasState.data);
    const sistemasMap = new Map(this.sortSistemas(sistemasState.data).filter((item) => !!item.id).map((item) => [item.id, item.nome?.trim() || item.id]));
    const filtrosEfetivos = this.resolveFiltrosEmpresas(filtros, empresas);
    const empresasMap = new Map(empresas.filter((item) => !!item.id).map((item) => [item.id, item]));
    const empresaIdsDisponiveis = this.getEmpresaIds(empresas);
    const chamados = this.sortByDataDesc(chamadosState.data);
    const mensagemResultado = this.getMensagemResultado(filtrosEfetivos);
    const filtrados = mensagemResultado ? [] : this.aplicarFiltrosFrontend(chamados, filtrosEfetivos, empresasMap, empresaIdsDisponiveis);
    const dataset = this.buildDataset(filtrados, tipoRelatorio, empresasMap, sistemasMap);
    const empresasNosResultados = new Set(filtrados.map((item) => this.getEmpresaLabel(item, empresasMap)));
    const temposRegistrados = filtrados.filter((item) => this.hasTempoAtendimento(item.tempoAtendimentoMinutos));
    return {
      carregando: chamadosState.status === "loading" || empresasState.status === "loading" || sistemasState.status === "loading",
      erro: chamadosState.error || empresasState.error || sistemasState.error,
      empresas,
      dataset,
      totalChamadosFiltrados: filtrados.length,
      totalEmpresasFiltradas: empresasNosResultados.size,
      totalChamadosComTempo: temposRegistrados.length,
      tempoTotalLabel: this.formatTempoMinutos(temposRegistrados.reduce((total, item) => total + this.getTempoAtendimentoMinutos(item.tempoAtendimentoMinutos), 0), "Sem tempo registrado"),
      mensagemResultado: mensagemResultado || (dataset.rows.length === 0 ? "Nenhum dado corresponde aos filtros selecionados." : null)
    };
  }
  aplicarFiltrosFrontend(items, filtros, empresasMap, empresaIdsDisponiveis) {
    const empresaNomesPermitidos = new Set(filtros.empresaIds.map((id) => this.normalizarTexto(empresasMap.get(id)?.nomeEmpresa || "")).filter((nome) => !!nome));
    const todasEmpresasSelecionadas = empresaIdsDisponiveis.length > 0 && filtros.empresaIds.length === empresaIdsDisponiveis.length;
    return items.filter((item) => {
      const data = item.data || "";
      if (filtros.dataInicial && (!data || data < filtros.dataInicial)) {
        return false;
      }
      if (filtros.dataFinal && (!data || data > filtros.dataFinal)) {
        return false;
      }
      if (filtros.status !== "ambos" && item.status !== filtros.status) {
        return false;
      }
      if (filtros.tempo === "com-tempo" && !this.hasTempoAtendimento(item.tempoAtendimentoMinutos)) {
        return false;
      }
      if (item.empresaId) {
        return filtros.empresaIds.includes(item.empresaId);
      }
      if (item.empresa) {
        return empresaNomesPermitidos.has(this.normalizarTexto(item.empresa));
      }
      return todasEmpresasSelecionadas;
    });
  }
  buildDataset(chamados, tipoRelatorio, empresasMap, sistemasMap) {
    switch (tipoRelatorio) {
      case "tempo-por-empresa":
        return this.buildTempoPorEmpresaDataset(chamados, empresasMap);
      case "ranking-empresas":
        return this.buildRankingEmpresasDataset(chamados, empresasMap);
      case "detalhado-chamados":
      default:
        return this.buildDetalhadoDataset(chamados, empresasMap, sistemasMap);
    }
  }
  buildDetalhadoDataset(chamados, empresasMap, sistemasMap) {
    return {
      sheetName: "Chamados",
      columns: [
        { key: "empresa", label: "Empresa" },
        { key: "funcionario", label: "Funcion\xE1rio" },
        { key: "sistemaPrincipal", label: "Sistema principal" },
        { key: "motivo", label: "Motivo" },
        { key: "resolucao", label: "Descri\xE7\xE3o / resolu\xE7\xE3o" },
        { key: "tempoAtendimento", label: "Tempo total" },
        { key: "dataHoraInicio", label: "Data/Hora in\xEDcio", width: 18 },
        { key: "dataHoraFim", label: "Data/Hora fim", width: 18 }
      ],
      rows: chamados.map((item) => ({
        dataHoraInicio: this.formatDataHoraRelatorio(this.getHorarioInicio(item)),
        dataHoraFim: this.formatDataHoraRelatorio(this.getHorarioFim(item)),
        empresa: this.getEmpresaLabel(item, empresasMap),
        funcionario: item.funcionario || "",
        sistemaPrincipal: this.getSistemaNome(item.contextoSistemaId, sistemasMap),
        motivo: item.motivo || "",
        resolucao: item.resolucao || "",
        tempoAtendimento: this.formatTempoMinutos(item.tempoAtendimentoMinutos ?? item.tempoAtendimento ?? null, "")
      }))
    };
  }
  buildTempoPorEmpresaDataset(chamados, empresasMap) {
    const grupos = /* @__PURE__ */ new Map();
    chamados.forEach((item) => {
      const empresa = this.getEmpresaLabel(item, empresasMap);
      const atual = grupos.get(empresa) ?? {
        empresa,
        totalChamados: 0,
        totalMinutos: 0,
        totalChamadosComTempo: 0
      };
      atual.totalChamados += 1;
      if (this.hasTempoAtendimento(item.tempoAtendimentoMinutos)) {
        atual.totalMinutos += this.getTempoAtendimentoMinutos(item.tempoAtendimentoMinutos);
        atual.totalChamadosComTempo += 1;
      }
      grupos.set(empresa, atual);
    });
    const rows = Array.from(grupos.values()).sort((a, b) => {
      if (b.totalMinutos !== a.totalMinutos)
        return b.totalMinutos - a.totalMinutos;
      return a.empresa.localeCompare(b.empresa);
    }).map((item) => ({
      empresa: item.empresa,
      totalChamados: item.totalChamados,
      tempoTotalAtendimento: item.totalChamadosComTempo > 0 ? this.formatTempoMinutos(item.totalMinutos, "") : "",
      tempoMedioPorChamado: item.totalChamadosComTempo > 0 ? this.formatTempoMinutos(Math.floor(item.totalMinutos / item.totalChamadosComTempo), "") : ""
    }));
    return {
      sheetName: "Tempo por Empresa",
      columns: [
        { key: "empresa", label: "Nome da Empresa" },
        { key: "totalChamados", label: "Total de Chamados", align: "right" },
        { key: "tempoTotalAtendimento", label: "Tempo Total de Atendimento", align: "right" },
        { key: "tempoMedioPorChamado", label: "Tempo M\xE9dio por Chamado", align: "right" }
      ],
      rows
    };
  }
  buildRankingEmpresasDataset(chamados, empresasMap) {
    const grupos = /* @__PURE__ */ new Map();
    chamados.forEach((item) => {
      const empresa = this.getEmpresaLabel(item, empresasMap);
      grupos.set(empresa, (grupos.get(empresa) ?? 0) + 1);
    });
    const totalChamados = chamados.length;
    const rows = Array.from(grupos.entries()).sort((a, b) => {
      if (b[1] !== a[1])
        return b[1] - a[1];
      return a[0].localeCompare(b[0]);
    }).map(([empresa, quantidadeChamados]) => ({
      empresa,
      quantidadeChamados,
      percentualTotal: totalChamados > 0 ? `${(quantidadeChamados / totalChamados * 100).toFixed(1).replace(".", ",")}%` : "0,0%"
    }));
    return {
      sheetName: "Ranking de Empresas",
      columns: [
        { key: "empresa", label: "Empresa" },
        { key: "quantidadeChamados", label: "Quantidade de Chamados", align: "right" },
        { key: "percentualTotal", label: "Percentual em Rela\xE7\xE3o ao Total", align: "right" }
      ],
      rows
    };
  }
  getMensagemResultado(filtros) {
    if (filtros.empresaIds.length === 0) {
      return "Selecione pelo menos uma empresa para gerar o relat\xF3rio.";
    }
    if (filtros.dataInicial && filtros.dataFinal && filtros.dataInicial > filtros.dataFinal) {
      return "Per\xEDodo inv\xE1lido. Ajuste a data inicial e final.";
    }
    return null;
  }
  getEmpresaLabel(item, empresasMap) {
    if (item.empresa)
      return item.empresa;
    if (item.empresaId) {
      const nome = empresasMap.get(item.empresaId)?.nomeEmpresa;
      if (nome)
        return nome;
    }
    if (item.clienteNome)
      return item.clienteNome;
    return item.cliente || "Empresa n\xE3o informada";
  }
  sortEmpresas(items) {
    return [...items].sort((a, b) => (a.nomeEmpresa || "").localeCompare(b.nomeEmpresa || ""));
  }
  sortSistemas(items) {
    return [...items].sort((a, b) => (a.nome || "").localeCompare(b.nome || "", "pt-BR"));
  }
  sortByDataDesc(items) {
    return [...items].sort((a, b) => {
      const dataCmp = (b.data || "").localeCompare(a.data || "");
      if (dataCmp !== 0)
        return dataCmp;
      const timeA = this.getTimestampMillis(a.dataFimAtendimento ?? a.concluidoEm ?? a.dataInicioAtendimento ?? a.criadoEm);
      const timeB = this.getTimestampMillis(b.dataFimAtendimento ?? b.concluidoEm ?? b.dataInicioAtendimento ?? b.criadoEm);
      return timeB - timeA;
    });
  }
  getTimestampMillis(value) {
    if (value && typeof value.toDate === "function") {
      return value.toDate().getTime();
    }
    return 0;
  }
  formatTempoMinutos(value, emptyText = "") {
    if (!this.hasTempoAtendimento(value)) {
      return emptyText;
    }
    const totalMinutos = this.getTempoAtendimentoMinutos(value);
    if (totalMinutos < 60) {
      return `${totalMinutos} min`;
    }
    const horas = Math.floor(totalMinutos / 60);
    const minutosRestantes = totalMinutos % 60;
    return `${horas}h ${minutosRestantes.toString().padStart(2, "0")}m`;
  }
  hasTempoAtendimento(value) {
    return typeof value === "number" && Number.isFinite(value) && value >= 0;
  }
  getTempoAtendimentoMinutos(value) {
    return this.hasTempoAtendimento(value) ? Math.floor(value) : 0;
  }
  buildFileName() {
    const now = /* @__PURE__ */ new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 6e4);
    return `relatorio-chamados-${local.toISOString().slice(0, 10)}.xlsx`;
  }
  cloneFiltros(filtros) {
    return __spreadProps(__spreadValues({}, filtros), {
      empresaIds: [...filtros.empresaIds]
    });
  }
  resolveFiltrosEmpresas(filtros, empresas) {
    if (this.empresasSelecionadasInicializadas || filtros.empresaIds.length > 0) {
      return filtros;
    }
    const empresaIds = this.getEmpresaIds(empresas);
    if (empresaIds.length === 0) {
      return filtros;
    }
    return __spreadProps(__spreadValues({}, filtros), {
      empresaIds
    });
  }
  inicializarSelecaoEmpresas(empresas) {
    if (this.empresasSelecionadasInicializadas)
      return;
    const empresaIds = this.getEmpresaIds(empresas);
    if (empresaIds.length === 0)
      return;
    this.empresasSelecionadasInicializadas = true;
    this.atualizarEmpresasSelecionadas(empresaIds);
  }
  atualizarEmpresasSelecionadas(empresaIds) {
    this.filtros = __spreadProps(__spreadValues({}, this.filtros), {
      empresaIds: [...empresaIds]
    });
    this.onFiltroChange();
  }
  getEmpresaIds(empresas) {
    return empresas.filter((empresa) => !!empresa.id).map((empresa) => empresa.id);
  }
  normalizarTexto(value) {
    return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }
  getColumnWidth(column, rows) {
    const maxRowLength = rows.reduce((maxLength, row) => {
      const value = String(row[column.key] ?? "");
      return Math.max(maxLength, value.length);
    }, column.label.length);
    const minWidth = column.width ?? 14;
    return Math.min(Math.max(maxRowLength + 2, minWidth), 42);
  }
  getSistemaNome(sistemaId, sistemasMap) {
    if (typeof sistemaId !== "string") {
      return "";
    }
    const id = sistemaId.trim();
    if (!id) {
      return "";
    }
    return sistemasMap.get(id) || id;
  }
  getHorarioInicio(item) {
    if (item.tipoCadastro === "antigo") {
      const horarioFim = this.getHorarioFim(item);
      const tempoInformado = item.tempoAtendimentoMinutos ?? item.tempoAtendimento ?? null;
      if (!horarioFim || !this.hasTempoAtendimento(tempoInformado)) {
        return null;
      }
      const tempoAtendimentoMinutos = this.getTempoAtendimentoMinutos(tempoInformado);
      return new Date(horarioFim.getTime() - tempoAtendimentoMinutos * 6e4);
    }
    return this.getDateFromTimestamp(item.dataInicioAtendimento) ?? this.getDateFromTimestamp(item.criadoEm);
  }
  getHorarioFim(item) {
    if (item.tipoCadastro === "antigo") {
      return this.getDateFromTimestamp(item.criadoEm) ?? this.getDateFromTimestamp(item.concluidoEm) ?? this.getDateFromTimestamp(item.dataFechamento) ?? this.getDateFromTimestamp(item.dataFimAtendimento);
    }
    if (item.status !== "concluido") {
      return null;
    }
    return this.getDateFromTimestamp(item.dataFimAtendimento) ?? this.getDateFromTimestamp(item.dataFechamento) ?? this.getDateFromTimestamp(item.concluidoEm) ?? this.getDateFromTimestamp(item.criadoEm);
  }
  getDateFromTimestamp(value) {
    if (value && typeof value.toDate === "function") {
      return value.toDate();
    }
    return null;
  }
  formatDataHoraRelatorio(value) {
    if (!value) {
      return "";
    }
    const dia = value.getDate().toString().padStart(2, "0");
    const mes = (value.getMonth() + 1).toString().padStart(2, "0");
    const ano = value.getFullYear();
    const hora = value.getHours().toString().padStart(2, "0");
    const minuto = value.getMinutes().toString().padStart(2, "0");
    return `${dia}/${mes}/${ano} ${hora}:${minuto}`;
  }
  static \u0275fac = function RelatoriosComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _RelatoriosComponent)(\u0275\u0275directiveInject(ChamadosService), \u0275\u0275directiveInject(EmpresasService), \u0275\u0275directiveInject(SistemasService), \u0275\u0275directiveInject(ToastService));
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _RelatoriosComponent, selectors: [["app-relatorios"]], decls: 2, vars: 3, consts: [["semEmpresas", ""], ["class", "page-section", 4, "ngIf"], [1, "page-section"], ["class", "relatorios-layout relatorios-layout-loading", 4, "ngIf"], ["class", "relatorios-layout", 4, "ngIf"], ["class", "card", 4, "ngIf"], [1, "relatorios-layout", "relatorios-layout-loading"], [1, "skeleton", 2, "min-height", "560px"], [1, "relatorios-side-column"], [1, "skeleton", 2, "min-height", "260px"], [1, "skeleton", 2, "min-height", "284px"], [1, "relatorios-layout"], [1, "card", "relatorios-card", "relatorios-card-filtros"], [1, "card-title-row"], [1, "card-title"], [1, "card-subtitle"], [1, "status-chip"], ["class", "empty-state", 4, "ngIf"], ["class", "form relatorios-form", 4, "ngIf"], [1, "card", "relatorios-card", "relatorios-card-tipos"], [1, "card-title-row", "relatorios-card-head-compact"], [1, "relatorio-tipos"], ["class", "tipo-card", 3, "active", 4, "ngFor", "ngForOf", "ngForTrackBy"], [1, "card", "relatorios-card", "relatorios-export-card"], [1, "grid-2", "relatorios-stats"], [1, "stat-mini"], [1, "stat-mini-label"], [1, "export-summary"], [1, "export-summary-label"], [1, "export-summary-value"], ["type", "button", 1, "btn", "primary", "export-btn", 3, "click", "disabled"], [1, "helper-text"], [1, "empty-state"], [1, "form", "relatorios-form"], [1, "empresas-selector"], [1, "empresas-selector-header"], [1, "field-label"], [1, "btn-group", "empresas-selector-actions"], ["type", "button", 1, "btn", "secondary", "empresas-selector-btn", 3, "click", "disabled"], ["class", "empresas-selector-list", 4, "ngIf", "ngIfElse"], [1, "relatorios-fields-grid"], ["name", "dataInicial", "type", "date", 3, "ngModelChange", "ngModel"], ["name", "dataFinal", "type", "date", 3, "ngModelChange", "ngModel"], ["name", "status", 3, "ngModelChange", "ngModel"], ["value", "ambos"], ["value", "aberto"], ["value", "concluido"], ["name", "tempo", 3, "ngModelChange", "ngModel"], ["value", "todos"], ["value", "com-tempo"], [1, "relatorios-actions"], ["type", "button", 1, "btn", "secondary", 3, "click"], [1, "empresas-selector-list"], ["class", "empresa-selector-item", 4, "ngFor", "ngForOf", "ngForTrackBy"], [1, "empresa-selector-item"], ["type", "checkbox", 3, "change", "checked"], [1, "tipo-card"], ["type", "radio", "name", "tipoRelatorio", 3, "ngModelChange", "value", "ngModel"], [1, "tipo-card-title"], [1, "tipo-card-description"], [1, "card"], ["class", "table-wrap", 4, "ngIf"], [1, "table-wrap"], [1, "table", "relatorios-table"], [3, "align-right", 4, "ngFor", "ngForOf", "ngForTrackBy"], [4, "ngIf"], [4, "ngFor", "ngForOf"]], template: function RelatoriosComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275template(0, RelatoriosComponent_section_0_Template, 4, 3, "section", 1);
      \u0275\u0275pipe(1, "async");
    }
    if (rf & 2) {
      \u0275\u0275property("ngIf", \u0275\u0275pipeBind1(1, 1, ctx.vm$));
    }
  }, dependencies: [CommonModule, NgForOf, NgIf, FormsModule, \u0275NgNoValidate, NgSelectOption, \u0275NgSelectMultipleOption, DefaultValueAccessor, SelectControlValueAccessor, RadioControlValueAccessor, NgControlStatus, NgControlStatusGroup, NgModel, NgForm, AsyncPipe], styles: ["\n\n.relatorios-layout[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: minmax(0, 1.16fr) minmax(340px, 0.94fr);\n  gap: 16px;\n  align-items: stretch;\n}\n.relatorios-page-title[_ngcontent-%COMP%] {\n  margin-top: -2px;\n}\n.relatorios-layout-loading[_ngcontent-%COMP%] {\n  align-items: stretch;\n}\n.relatorios-card[_ngcontent-%COMP%] {\n  min-width: 0;\n}\n.relatorios-card-filtros[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  height: 100%;\n}\n.relatorios-form[_ngcontent-%COMP%] {\n  display: grid;\n  gap: 14px;\n  flex: 1 1 auto;\n  align-content: start;\n}\n.relatorios-side-column[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-rows: auto 1fr;\n  gap: 16px;\n  min-width: 0;\n  height: 100%;\n}\n.relatorios-card-tipos[_ngcontent-%COMP%], \n.relatorios-export-card[_ngcontent-%COMP%] {\n  display: grid;\n  align-content: start;\n}\n.relatorios-card-tipos[_ngcontent-%COMP%] {\n  gap: 10px;\n}\n.relatorios-card-head-compact[_ngcontent-%COMP%] {\n  margin-bottom: -2px;\n}\n.relatorios-card-head-compact[_ngcontent-%COMP%]   .card-title[_ngcontent-%COMP%] {\n  line-height: 1.15;\n}\n.relatorios-card-head-compact[_ngcontent-%COMP%]   .card-subtitle[_ngcontent-%COMP%] {\n  margin-top: 3px;\n  line-height: 1.35;\n}\n.empresas-selector[_ngcontent-%COMP%] {\n  display: grid;\n  gap: 10px;\n}\n.empresas-selector-header[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: flex-start;\n  gap: 12px;\n  flex-wrap: wrap;\n}\n.empresas-selector-actions[_ngcontent-%COMP%] {\n  justify-content: flex-end;\n}\n.empresas-selector-btn[_ngcontent-%COMP%] {\n  height: 34px;\n  padding: 0 12px;\n}\n.empresas-selector-list[_ngcontent-%COMP%] {\n  max-height: 364px;\n  overflow-y: auto;\n  border: 1px solid #dbe3ee;\n  border-radius: 12px;\n  background: #ffffff;\n  padding: 8px 0;\n  box-shadow: inset 0 8px 14px -18px rgba(15, 23, 42, 0.6);\n}\n.empresa-selector-item[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  padding: 11px 14px;\n  border-bottom: 1px solid #e2e8f0;\n  cursor: pointer;\n}\n.empresa-selector-item[_ngcontent-%COMP%]:last-child {\n  border-bottom: 0;\n}\n.empresa-selector-item[_ngcontent-%COMP%]:hover {\n  background: #f8fafc;\n}\n.empresa-selector-item[_ngcontent-%COMP%]   input[_ngcontent-%COMP%] {\n  width: 16px;\n  height: 16px;\n  margin: 0;\n  flex: 0 0 auto;\n}\n.empresa-selector-item[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] {\n  font-size: 13.5px;\n  color: var(--text-main);\n}\n.empresas-selector-list[_ngcontent-%COMP%]::-webkit-scrollbar {\n  width: 10px;\n}\n.empresas-selector-list[_ngcontent-%COMP%]::-webkit-scrollbar-thumb {\n  background: #cbd5e1;\n  border-radius: 999px;\n  border: 2px solid #ffffff;\n}\n.empresas-selector-list[_ngcontent-%COMP%]::-webkit-scrollbar-track {\n  background: #f8fafc;\n}\n.relatorios-fields-grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(2, minmax(0, 1fr));\n  gap: 12px;\n  align-items: start;\n}\n.relatorios-fields-grid[_ngcontent-%COMP%]   label[_ngcontent-%COMP%] {\n  min-width: 0;\n}\n.relatorios-actions[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: flex-end;\n  margin-top: auto;\n}\n.relatorio-tipos[_ngcontent-%COMP%] {\n  display: grid;\n  gap: 12px;\n}\n.tipo-card[_ngcontent-%COMP%] {\n  position: relative;\n  display: grid;\n  gap: 4px;\n  padding: 14px 14px 14px 42px;\n  border: 1px solid #dbe3ee;\n  border-radius: 13px;\n  background: #ffffff;\n  cursor: pointer;\n  transition:\n    border-color var(--transition-fast),\n    box-shadow var(--transition-fast),\n    transform var(--transition-fast);\n}\n.tipo-card[_ngcontent-%COMP%]:hover {\n  border-color: #bfdbfe;\n  box-shadow: var(--shadow-soft);\n  transform: translateY(-1px);\n}\n.tipo-card.active[_ngcontent-%COMP%] {\n  border-color: #93c5fd;\n  background:\n    linear-gradient(\n      180deg,\n      #ffffff 0%,\n      #eff6ff 100%);\n  box-shadow: 0 12px 22px rgba(37, 99, 235, 0.10);\n}\n.tipo-card[_ngcontent-%COMP%]   input[_ngcontent-%COMP%] {\n  position: absolute;\n  left: 14px;\n  top: 16px;\n  width: 16px;\n  height: 16px;\n  margin: 0;\n}\n.tipo-card-title[_ngcontent-%COMP%] {\n  font-size: 14px;\n  font-weight: 700;\n  color: var(--text-main);\n}\n.tipo-card-description[_ngcontent-%COMP%] {\n  font-size: 12.5px;\n  line-height: 1.45;\n  color: var(--text-muted);\n}\n.relatorios-export-card[_ngcontent-%COMP%] {\n  display: grid;\n  gap: 12px;\n  align-content: start;\n}\n.relatorios-stats[_ngcontent-%COMP%] {\n  gap: 10px;\n}\n.stat-mini[_ngcontent-%COMP%] {\n  display: grid;\n  gap: 4px;\n  padding: 12px;\n  border: 1px solid #dbe3ee;\n  border-radius: 12px;\n  background: #f8fafc;\n}\n.stat-mini[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] {\n  font-size: 18px;\n  color: var(--text-main);\n}\n.stat-mini-label[_ngcontent-%COMP%] {\n  font-size: 11px;\n  font-weight: 700;\n  letter-spacing: 0.04em;\n  text-transform: uppercase;\n  color: #667895;\n}\n.export-summary[_ngcontent-%COMP%] {\n  display: grid;\n  gap: 4px;\n  padding: 12px 13px;\n  border: 1px dashed #cbd5e1;\n  border-radius: 12px;\n  background: #f8fafc;\n}\n.export-summary-label[_ngcontent-%COMP%] {\n  font-size: 11px;\n  font-weight: 700;\n  letter-spacing: 0.04em;\n  text-transform: uppercase;\n  color: #647690;\n}\n.export-summary-value[_ngcontent-%COMP%] {\n  font-size: 14px;\n  font-weight: 700;\n  color: var(--text-main);\n}\n.export-btn[_ngcontent-%COMP%] {\n  width: 100%;\n}\n.relatorios-table[_ngcontent-%COMP%]   th.align-right[_ngcontent-%COMP%], \n.relatorios-table[_ngcontent-%COMP%]   td.align-right[_ngcontent-%COMP%] {\n  text-align: right;\n}\n@media (max-width: 1200px) {\n  .relatorios-layout[_ngcontent-%COMP%] {\n    grid-template-columns: minmax(0, 1fr);\n  }\n}\n@media (max-width: 780px) {\n  .relatorios-layout[_ngcontent-%COMP%], \n   .relatorios-fields-grid[_ngcontent-%COMP%] {\n    grid-template-columns: 1fr;\n  }\n  .empresas-selector-header[_ngcontent-%COMP%] {\n    flex-direction: column;\n    align-items: stretch;\n  }\n  .empresas-selector-actions[_ngcontent-%COMP%] {\n    justify-content: flex-start;\n  }\n  .relatorios-side-column[_ngcontent-%COMP%] {\n    grid-template-rows: auto;\n  }\n}\n.relatorios-card[_ngcontent-%COMP%], \n.page-section[_ngcontent-%COMP%]    > article.card[_ngcontent-%COMP%] {\n  background:\n    linear-gradient(\n      180deg,\n      #ffffff 0%,\n      #f8fbff 100%);\n}\n.empresas-selector-list[_ngcontent-%COMP%], \n.tipo-card[_ngcontent-%COMP%], \n.stat-mini[_ngcontent-%COMP%], \n.export-summary[_ngcontent-%COMP%] {\n  border-radius: var(--radius-md);\n}\n.tipo-card[_ngcontent-%COMP%] {\n  background: #ffffff;\n}\n.tipo-card[_ngcontent-%COMP%]:hover {\n  transform: none;\n}\n.tipo-card.active[_ngcontent-%COMP%] {\n  background: #eef5ff;\n}\n.stat-mini[_ngcontent-%COMP%] {\n  background: #ffffff;\n}\n.relatorios-table[_ngcontent-%COMP%]   tbody[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%]:hover   td[_ngcontent-%COMP%] {\n  background: #f8fbff;\n}\n@media (max-width: 780px) {\n  .relatorios-layout[_ngcontent-%COMP%] {\n    gap: 12px;\n  }\n  .relatorios-card[_ngcontent-%COMP%], \n   .page-section[_ngcontent-%COMP%]    > article.card[_ngcontent-%COMP%] {\n    padding: 14px;\n  }\n  .empresas-selector-actions[_ngcontent-%COMP%], \n   .relatorios-actions[_ngcontent-%COMP%] {\n    display: grid;\n    grid-template-columns: 1fr;\n    width: 100%;\n  }\n  .empresas-selector-actions[_ngcontent-%COMP%]   .btn[_ngcontent-%COMP%], \n   .relatorios-actions[_ngcontent-%COMP%]   .btn[_ngcontent-%COMP%], \n   .export-btn[_ngcontent-%COMP%] {\n    width: 100%;\n  }\n  .relatorios-stats[_ngcontent-%COMP%] {\n    grid-template-columns: repeat(2, minmax(0, 1fr));\n  }\n  .table-wrap[_ngcontent-%COMP%] {\n    overflow-x: auto;\n    -webkit-overflow-scrolling: touch;\n  }\n  .relatorios-table[_ngcontent-%COMP%] {\n    min-width: 720px;\n  }\n}\n@media (max-width: 460px) {\n  .empresas-selector-actions[_ngcontent-%COMP%], \n   .relatorios-actions[_ngcontent-%COMP%], \n   .relatorios-stats[_ngcontent-%COMP%] {\n    grid-template-columns: 1fr;\n  }\n}\n/*# sourceMappingURL=relatorios.component.css.map */"], changeDetection: 0 });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(RelatoriosComponent, [{
    type: Component,
    args: [{ selector: "app-relatorios", standalone: true, imports: [CommonModule, FormsModule], changeDetection: ChangeDetectionStrategy.OnPush, template: `<section class="page-section" *ngIf="vm$ | async as vm">\r
  <div class="relatorios-layout relatorios-layout-loading" *ngIf="vm.carregando">\r
    <div class="skeleton" style="min-height: 560px;"></div>\r
    <div class="relatorios-side-column">\r
      <div class="skeleton" style="min-height: 260px;"></div>\r
      <div class="skeleton" style="min-height: 284px;"></div>\r
    </div>\r
  </div>\r
\r
  <div class="relatorios-layout" *ngIf="!vm.carregando">\r
    <article class="card relatorios-card relatorios-card-filtros">\r
      <div class="card-title-row">\r
        <div>\r
          <h3 class="card-title">Filtros gerais</h3>\r
          <p class="card-subtitle">Selecione os dados que ser\xE3o considerados na exporta\xE7\xE3o.</p>\r
        </div>\r
        <span class="status-chip">Linhas: {{ vm.dataset.rows.length }}</span>\r
      </div>\r
\r
      <div class="empty-state" *ngIf="!!vm.erro">{{ vm.erro }}</div>\r
\r
      <form class="form relatorios-form" *ngIf="!vm.erro">\r
        <div class="empresas-selector">\r
          <div class="empresas-selector-header">\r
            <div>\r
              <span class="field-label">Empresas</span>\r
              <div class="helper-text">Empresas marcadas entram no relat\xF3rio.</div>\r
            </div>\r
\r
            <div class="btn-group empresas-selector-actions">\r
              <button\r
                class="btn secondary empresas-selector-btn"\r
                type="button"\r
                (click)="selecionarTodasEmpresas(vm.empresas)"\r
                [disabled]="vm.empresas.length === 0 || todasEmpresasSelecionadas(vm.empresas)"\r
              >\r
                Selecionar todos\r
              </button>\r
              <button\r
                class="btn secondary empresas-selector-btn"\r
                type="button"\r
                (click)="desmarcarTodasEmpresas()"\r
                [disabled]="filtros.empresaIds.length === 0"\r
              >\r
                Desmarcar todos\r
              </button>\r
            </div>\r
          </div>\r
\r
          <div class="empresas-selector-list" *ngIf="vm.empresas.length > 0; else semEmpresas">\r
            <label\r
              class="empresa-selector-item"\r
              *ngFor="let empresa of vm.empresas; trackBy: trackByEmpresa"\r
            >\r
              <input\r
                type="checkbox"\r
                [checked]="isEmpresaSelecionada(empresa.id)"\r
                (change)="onEmpresaCheckboxChange(empresa.id, $event)"\r
              />\r
              <span>{{ empresa.nomeEmpresa }}</span>\r
            </label>\r
          </div>\r
        </div>\r
\r
        <ng-template #semEmpresas>\r
          <div class="empty-state">Nenhuma empresa cadastrada.</div>\r
        </ng-template>\r
\r
        <div class="relatorios-fields-grid">\r
          <label>\r
            <span>Data inicial</span>\r
            <input\r
              name="dataInicial"\r
              type="date"\r
              [(ngModel)]="filtros.dataInicial"\r
              (ngModelChange)="onFiltroChange()"\r
            />\r
          </label>\r
\r
          <label>\r
            <span>Data final</span>\r
            <input\r
              name="dataFinal"\r
              type="date"\r
              [(ngModel)]="filtros.dataFinal"\r
              (ngModelChange)="onFiltroChange()"\r
            />\r
          </label>\r
\r
          <label>\r
            <span>Status do chamado</span>\r
            <select\r
              name="status"\r
              [(ngModel)]="filtros.status"\r
              (ngModelChange)="onFiltroChange()"\r
            >\r
              <option value="ambos">Abertos e conclu\xEDdos</option>\r
              <option value="aberto">Abertos</option>\r
              <option value="concluido">Conclu\xEDdos</option>\r
            </select>\r
          </label>\r
\r
          <label>\r
            <span>Considerar tempo de atendimento</span>\r
            <select\r
              name="tempo"\r
              [(ngModel)]="filtros.tempo"\r
              (ngModelChange)="onFiltroChange()"\r
            >\r
              <option value="todos">Todos</option>\r
              <option value="com-tempo">Apenas chamados com tempo registrado</option>\r
            </select>\r
          </label>\r
        </div>\r
\r
        <div class="relatorios-actions">\r
          <button class="btn secondary" type="button" (click)="limparFiltros()">\r
            Limpar filtros\r
          </button>\r
        </div>\r
      </form>\r
    </article>\r
\r
    <div class="relatorios-side-column">\r
      <article class="card relatorios-card relatorios-card-tipos">\r
        <div class="card-title-row relatorios-card-head-compact">\r
          <div>\r
            <h3 class="card-title">Tipo de relat\xF3rio</h3>\r
            <p class="card-subtitle">Escolha como os dados devem ser organizados no Excel.</p>\r
          </div>\r
        </div>\r
\r
        <div class="relatorio-tipos">\r
          <label\r
            class="tipo-card"\r
            *ngFor="let item of tipoRelatorioOptions; trackBy: trackByTipoRelatorio"\r
            [class.active]="tipoRelatorio === item.valor"\r
          >\r
            <input\r
              type="radio"\r
              name="tipoRelatorio"\r
              [value]="item.valor"\r
              [(ngModel)]="tipoRelatorio"\r
              (ngModelChange)="onTipoRelatorioChange()"\r
            />\r
            <span class="tipo-card-title">{{ item.titulo }}</span>\r
            <span class="tipo-card-description">{{ item.descricao }}</span>\r
          </label>\r
        </div>\r
      </article>\r
\r
      <article class="card relatorios-card relatorios-export-card">\r
        <div class="card-title-row relatorios-card-head-compact">\r
          <div>\r
            <h3 class="card-title">Exporta\xE7\xE3o</h3>\r
            <p class="card-subtitle">Os filtros s\xE3o aplicados antes de gerar o arquivo Excel.</p>\r
          </div>\r
        </div>\r
\r
        <div class="grid-2 relatorios-stats">\r
          <div class="stat-mini">\r
            <span class="stat-mini-label">Chamados filtrados</span>\r
            <strong>{{ vm.totalChamadosFiltrados }}</strong>\r
          </div>\r
          <div class="stat-mini">\r
            <span class="stat-mini-label">Empresas no resultado</span>\r
            <strong>{{ vm.totalEmpresasFiltradas }}</strong>\r
          </div>\r
          <div class="stat-mini">\r
            <span class="stat-mini-label">Chamados com tempo</span>\r
            <strong>{{ vm.totalChamadosComTempo }}</strong>\r
          </div>\r
          <div class="stat-mini">\r
            <span class="stat-mini-label">Tempo total</span>\r
            <strong>{{ vm.tempoTotalLabel }}</strong>\r
          </div>\r
        </div>\r
\r
        <div class="export-summary">\r
          <div class="export-summary-label">Relat\xF3rio selecionado</div>\r
          <div class="export-summary-value">{{ getTipoRelatorioTitulo() }}</div>\r
        </div>\r
\r
        <div class="empty-state" *ngIf="!!vm.mensagemResultado">\r
          {{ vm.mensagemResultado }}\r
        </div>\r
\r
        <button\r
          class="btn primary export-btn"\r
          type="button"\r
          (click)="exportarParaExcel()"\r
          [disabled]="!!vm.erro || !!vm.mensagemResultado"\r
        >\r
          Exportar para Excel\r
        </button>\r
\r
        <div class="helper-text">Arquivo gerado em formato .xlsx com a data atual.</div>\r
      </article>\r
    </div>\r
  </div>\r
\r
  <article class="card" *ngIf="!vm.carregando && !vm.erro">\r
    <div class="card-title-row">\r
      <div>\r
        <h3 class="card-title">Pr\xE9via do relat\xF3rio</h3>\r
        <p class="card-subtitle">\r
          Exibindo {{ getPreviewRows(vm.dataset.rows).length }} de {{ vm.dataset.rows.length }} linhas.\r
        </p>\r
      </div>\r
    </div>\r
\r
    <div class="empty-state" *ngIf="!!vm.mensagemResultado">\r
      {{ vm.mensagemResultado }}\r
    </div>\r
\r
    <div class="table-wrap" *ngIf="!vm.mensagemResultado">\r
      <table class="table relatorios-table">\r
        <thead>\r
          <tr>\r
            <th\r
              *ngFor="let column of vm.dataset.columns; trackBy: trackByColumn"\r
              [class.align-right]="column.align === 'right'"\r
            >\r
              {{ column.label }}\r
            </th>\r
          </tr>\r
        </thead>\r
        <tbody>\r
          <tr *ngIf="vm.dataset.rows.length === 0">\r
            <td [attr.colspan]="vm.dataset.columns.length">Nenhum dado corresponde aos filtros selecionados.</td>\r
          </tr>\r
          <tr *ngFor="let row of getPreviewRows(vm.dataset.rows)">\r
            <td\r
              *ngFor="let column of vm.dataset.columns; trackBy: trackByColumn"\r
              [class.align-right]="column.align === 'right'"\r
            >\r
              {{ getCellValue(row, column) || "-" }}\r
            </td>\r
          </tr>\r
        </tbody>\r
      </table>\r
    </div>\r
  </article>\r
</section>\r
`, styles: ["/* src/app/pages/relatorios/relatorios.component.css */\n.relatorios-layout {\n  display: grid;\n  grid-template-columns: minmax(0, 1.16fr) minmax(340px, 0.94fr);\n  gap: 16px;\n  align-items: stretch;\n}\n.relatorios-page-title {\n  margin-top: -2px;\n}\n.relatorios-layout-loading {\n  align-items: stretch;\n}\n.relatorios-card {\n  min-width: 0;\n}\n.relatorios-card-filtros {\n  display: flex;\n  flex-direction: column;\n  height: 100%;\n}\n.relatorios-form {\n  display: grid;\n  gap: 14px;\n  flex: 1 1 auto;\n  align-content: start;\n}\n.relatorios-side-column {\n  display: grid;\n  grid-template-rows: auto 1fr;\n  gap: 16px;\n  min-width: 0;\n  height: 100%;\n}\n.relatorios-card-tipos,\n.relatorios-export-card {\n  display: grid;\n  align-content: start;\n}\n.relatorios-card-tipos {\n  gap: 10px;\n}\n.relatorios-card-head-compact {\n  margin-bottom: -2px;\n}\n.relatorios-card-head-compact .card-title {\n  line-height: 1.15;\n}\n.relatorios-card-head-compact .card-subtitle {\n  margin-top: 3px;\n  line-height: 1.35;\n}\n.empresas-selector {\n  display: grid;\n  gap: 10px;\n}\n.empresas-selector-header {\n  display: flex;\n  justify-content: space-between;\n  align-items: flex-start;\n  gap: 12px;\n  flex-wrap: wrap;\n}\n.empresas-selector-actions {\n  justify-content: flex-end;\n}\n.empresas-selector-btn {\n  height: 34px;\n  padding: 0 12px;\n}\n.empresas-selector-list {\n  max-height: 364px;\n  overflow-y: auto;\n  border: 1px solid #dbe3ee;\n  border-radius: 12px;\n  background: #ffffff;\n  padding: 8px 0;\n  box-shadow: inset 0 8px 14px -18px rgba(15, 23, 42, 0.6);\n}\n.empresa-selector-item {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  padding: 11px 14px;\n  border-bottom: 1px solid #e2e8f0;\n  cursor: pointer;\n}\n.empresa-selector-item:last-child {\n  border-bottom: 0;\n}\n.empresa-selector-item:hover {\n  background: #f8fafc;\n}\n.empresa-selector-item input {\n  width: 16px;\n  height: 16px;\n  margin: 0;\n  flex: 0 0 auto;\n}\n.empresa-selector-item span {\n  font-size: 13.5px;\n  color: var(--text-main);\n}\n.empresas-selector-list::-webkit-scrollbar {\n  width: 10px;\n}\n.empresas-selector-list::-webkit-scrollbar-thumb {\n  background: #cbd5e1;\n  border-radius: 999px;\n  border: 2px solid #ffffff;\n}\n.empresas-selector-list::-webkit-scrollbar-track {\n  background: #f8fafc;\n}\n.relatorios-fields-grid {\n  display: grid;\n  grid-template-columns: repeat(2, minmax(0, 1fr));\n  gap: 12px;\n  align-items: start;\n}\n.relatorios-fields-grid label {\n  min-width: 0;\n}\n.relatorios-actions {\n  display: flex;\n  justify-content: flex-end;\n  margin-top: auto;\n}\n.relatorio-tipos {\n  display: grid;\n  gap: 12px;\n}\n.tipo-card {\n  position: relative;\n  display: grid;\n  gap: 4px;\n  padding: 14px 14px 14px 42px;\n  border: 1px solid #dbe3ee;\n  border-radius: 13px;\n  background: #ffffff;\n  cursor: pointer;\n  transition:\n    border-color var(--transition-fast),\n    box-shadow var(--transition-fast),\n    transform var(--transition-fast);\n}\n.tipo-card:hover {\n  border-color: #bfdbfe;\n  box-shadow: var(--shadow-soft);\n  transform: translateY(-1px);\n}\n.tipo-card.active {\n  border-color: #93c5fd;\n  background:\n    linear-gradient(\n      180deg,\n      #ffffff 0%,\n      #eff6ff 100%);\n  box-shadow: 0 12px 22px rgba(37, 99, 235, 0.10);\n}\n.tipo-card input {\n  position: absolute;\n  left: 14px;\n  top: 16px;\n  width: 16px;\n  height: 16px;\n  margin: 0;\n}\n.tipo-card-title {\n  font-size: 14px;\n  font-weight: 700;\n  color: var(--text-main);\n}\n.tipo-card-description {\n  font-size: 12.5px;\n  line-height: 1.45;\n  color: var(--text-muted);\n}\n.relatorios-export-card {\n  display: grid;\n  gap: 12px;\n  align-content: start;\n}\n.relatorios-stats {\n  gap: 10px;\n}\n.stat-mini {\n  display: grid;\n  gap: 4px;\n  padding: 12px;\n  border: 1px solid #dbe3ee;\n  border-radius: 12px;\n  background: #f8fafc;\n}\n.stat-mini strong {\n  font-size: 18px;\n  color: var(--text-main);\n}\n.stat-mini-label {\n  font-size: 11px;\n  font-weight: 700;\n  letter-spacing: 0.04em;\n  text-transform: uppercase;\n  color: #667895;\n}\n.export-summary {\n  display: grid;\n  gap: 4px;\n  padding: 12px 13px;\n  border: 1px dashed #cbd5e1;\n  border-radius: 12px;\n  background: #f8fafc;\n}\n.export-summary-label {\n  font-size: 11px;\n  font-weight: 700;\n  letter-spacing: 0.04em;\n  text-transform: uppercase;\n  color: #647690;\n}\n.export-summary-value {\n  font-size: 14px;\n  font-weight: 700;\n  color: var(--text-main);\n}\n.export-btn {\n  width: 100%;\n}\n.relatorios-table th.align-right,\n.relatorios-table td.align-right {\n  text-align: right;\n}\n@media (max-width: 1200px) {\n  .relatorios-layout {\n    grid-template-columns: minmax(0, 1fr);\n  }\n}\n@media (max-width: 780px) {\n  .relatorios-layout,\n  .relatorios-fields-grid {\n    grid-template-columns: 1fr;\n  }\n  .empresas-selector-header {\n    flex-direction: column;\n    align-items: stretch;\n  }\n  .empresas-selector-actions {\n    justify-content: flex-start;\n  }\n  .relatorios-side-column {\n    grid-template-rows: auto;\n  }\n}\n.relatorios-card,\n.page-section > article.card {\n  background:\n    linear-gradient(\n      180deg,\n      #ffffff 0%,\n      #f8fbff 100%);\n}\n.empresas-selector-list,\n.tipo-card,\n.stat-mini,\n.export-summary {\n  border-radius: var(--radius-md);\n}\n.tipo-card {\n  background: #ffffff;\n}\n.tipo-card:hover {\n  transform: none;\n}\n.tipo-card.active {\n  background: #eef5ff;\n}\n.stat-mini {\n  background: #ffffff;\n}\n.relatorios-table tbody tr:hover td {\n  background: #f8fbff;\n}\n@media (max-width: 780px) {\n  .relatorios-layout {\n    gap: 12px;\n  }\n  .relatorios-card,\n  .page-section > article.card {\n    padding: 14px;\n  }\n  .empresas-selector-actions,\n  .relatorios-actions {\n    display: grid;\n    grid-template-columns: 1fr;\n    width: 100%;\n  }\n  .empresas-selector-actions .btn,\n  .relatorios-actions .btn,\n  .export-btn {\n    width: 100%;\n  }\n  .relatorios-stats {\n    grid-template-columns: repeat(2, minmax(0, 1fr));\n  }\n  .table-wrap {\n    overflow-x: auto;\n    -webkit-overflow-scrolling: touch;\n  }\n  .relatorios-table {\n    min-width: 720px;\n  }\n}\n@media (max-width: 460px) {\n  .empresas-selector-actions,\n  .relatorios-actions,\n  .relatorios-stats {\n    grid-template-columns: 1fr;\n  }\n}\n/*# sourceMappingURL=relatorios.component.css.map */\n"] }]
  }], () => [{ type: ChamadosService }, { type: EmpresasService }, { type: SistemasService }, { type: ToastService }], null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(RelatoriosComponent, { className: "RelatoriosComponent", filePath: "src/app/pages/relatorios/relatorios.component.ts", lineNumber: 79 });
})();
export {
  RelatoriosComponent
};
//# sourceMappingURL=chunk-4B2PIJOP.js.map
