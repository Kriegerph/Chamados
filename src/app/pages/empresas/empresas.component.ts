import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, NgZone } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BehaviorSubject, combineLatest, map, Observable } from "rxjs";
import { DataState } from "../../models/data-state.model";
import { Empresa, Funcionario } from "../../models/empresa.model";
import { Sistema } from "../../models/sistema.model";
import { EmpresasService } from "../../services/empresas.service";
import { SistemasService } from "../../services/sistemas.service";
import { ToastService } from "../../services/toast.service";

type EmpresaItemView = Empresa & {
  totalFuncionariosLabel: number;
  sistemas: string[];
  sistemasNomes: string[];
  sistemasVisiveis: string[];
  sistemasExtras: number;
  sistemasTooltip: string;
  sistemasQuantidadeLabel: string;
};

type SistemaOptionView = Sistema & {
  id: string;
};

type EmpresasViewModel = {
  carregando: boolean;
  erro: string | null;
  empresas: EmpresaItemView[];
  empresaSelecionada: EmpresaItemView | null;
  sistemas: SistemaOptionView[];
  sistemasErro: string | null;
  funcionarios: Funcionario[];
  funcionariosCarregando: boolean;
  funcionariosErro: string | null;
};

type FuncionarioFormModel = {
  nomeFuncionario: string;
  telefone: string;
  criarChamadoAutomatico: boolean;
};

@Component({
  selector: "app-empresas",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./empresas.component.html",
  styleUrl: "./empresas.component.css",
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmpresasComponent {
  cadastrandoEmpresa = false;
  nomeEmpresa = "";
  observacoesEmpresa = "";
  sistemasEmpresaSelecionados: string[] = [];

  cadastrandoFuncionario = false;
  funcionario: FuncionarioFormModel = this.createEmptyFuncionarioForm();

  editandoEmpresa = false;
  editEmpresaId: string | null = null;
  editEmpresaNome = "";
  editEmpresaObservacoes = "";
  editEmpresaSistemasSelecionados: string[] = [];

  editandoFuncionario = false;
  editFuncionarioId: string | null = null;
  editFuncionarioEmpresaId: string | null = null;
  editFuncionario: FuncionarioFormModel = this.createEmptyFuncionarioForm();

  private readonly empresaSelecionadaIdSubject = new BehaviorSubject<string | null>(null);
  private readonly funcionariosStateSubject = new BehaviorSubject<DataState<Funcionario[]>>({
    status: "ready",
    data: [],
    error: null
  });

  readonly vm$: Observable<EmpresasViewModel>;

  constructor(
    private readonly empresasService: EmpresasService,
    private readonly sistemasService: SistemasService,
    private readonly toast: ToastService,
    private readonly zone: NgZone
  ) {
    this.vm$ = combineLatest([
      this.empresasService.empresasState$,
      this.sistemasService.sistemasState$,
      this.empresaSelecionadaIdSubject,
      this.funcionariosStateSubject
    ]).pipe(
      map(([empresasState, sistemasState, empresaSelecionadaId, funcionariosState]) =>
        this.buildViewModel(empresasState, sistemasState, empresaSelecionadaId, funcionariosState)
      )
    );
  }

  trackByEmpresa(_: number, item: EmpresaItemView): string {
    return item.id ?? item.nomeEmpresa;
  }

  trackByFuncionario(_: number, item: Funcionario): string {
    return item.id ?? item.nomeFuncionario;
  }

  trackBySistema(_: number, item: SistemaOptionView): string {
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
    } catch (err: any) {
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

  alternarEmpresa(empresaId?: string | null) {
    const id = empresaId ?? null;
    const empresaAtual = this.empresaSelecionadaIdSubject.value;
    this.selecionarEmpresa(empresaAtual === id ? null : id);
  }

  selecionarEmpresa(empresaId?: string | null) {
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

  abrirEdicaoEmpresa(item: EmpresaItemView) {
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
    if (!this.editEmpresaId) return;
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
    } catch (err: any) {
      this.toast.show(`Erro ao atualizar empresa: ${err.message}`, "error");
    }
  }

  async excluirEmpresa(item: EmpresaItemView) {
    if (!item.id) return;
    const ok = window.confirm("Tem certeza que deseja excluir esta empresa e seus funcionarios?");
    if (!ok) return;

    try {
      await this.empresasService.deleteEmpresa(item.id);
      if (this.empresaSelecionadaIdSubject.value === item.id) {
        this.selecionarEmpresa(null);
      }
      this.toast.show("Empresa excluida.", "success");
    } catch (err: any) {
      this.toast.show(`Erro ao excluir empresa: ${err.message}`, "error");
    }
  }

  async cadastrarFuncionario() {
    const empresaId = this.empresaSelecionadaIdSubject.value;
    const nomeFuncionario = this.funcionario.nomeFuncionario.trim();
    if (!empresaId) {
      this.toast.show("Selecione uma empresa primeiro.", "error");
      return;
    }
    if (!nomeFuncionario) {
      this.toast.show("Informe o nome do funcionario.", "error");
      return;
    }

    try {
      await this.empresasService.addFuncionario(empresaId, {
        nomeFuncionario,
        telefone: this.funcionario.telefone,
        criarChamadoAutomatico: this.funcionario.criarChamadoAutomatico
      });
      await this.carregarFuncionarios(empresaId);
      this.runInZone(() => {
        this.toast.show("Funcionario cadastrado.", "success");
        this.cancelarCadastroFuncionario();
      });
    } catch (err: any) {
      this.toast.show(`Erro ao cadastrar funcionario: ${err.message}`, "error");
    }
  }

  abrirCadastroFuncionario() {
    if (!this.empresaSelecionadaIdSubject.value) return;
    this.cadastrandoFuncionario = true;
    this.funcionario = this.createEmptyFuncionarioForm();
  }

  cancelarCadastroFuncionario() {
    this.cadastrandoFuncionario = false;
    this.funcionario = this.createEmptyFuncionarioForm();
  }

  abrirEdicaoFuncionario(item: Funcionario) {
    const empresaId = this.empresaSelecionadaIdSubject.value;
    if (!empresaId) return;

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
    if (!this.editFuncionarioId || !this.editFuncionarioEmpresaId) return;
    const nomeFuncionario = this.editFuncionario.nomeFuncionario.trim();
    if (!nomeFuncionario) {
      this.toast.show("Informe o nome do funcionario.", "error");
      return;
    }

    try {
      await this.empresasService.updateFuncionario(
        this.editFuncionarioEmpresaId,
        this.editFuncionarioId,
        {
          nomeFuncionario,
          telefone: this.editFuncionario.telefone,
          criarChamadoAutomatico: this.editFuncionario.criarChamadoAutomatico
        }
      );
      await this.carregarFuncionarios(this.editFuncionarioEmpresaId);
      this.runInZone(() => {
        this.toast.show("Funcionario atualizado.", "success");
        this.cancelarEdicaoFuncionario();
      });
    } catch (err: any) {
      this.toast.show(`Erro ao atualizar funcionario: ${err.message}`, "error");
    }
  }

  async excluirFuncionario(item: Funcionario) {
    const empresaId = this.empresaSelecionadaIdSubject.value;
    if (!empresaId || !item.id) return;
    const ok = window.confirm("Tem certeza que deseja excluir este funcionario?");
    if (!ok) return;

    try {
      await this.empresasService.deleteFuncionario(empresaId, item.id);
      await this.carregarFuncionarios(empresaId);
      this.toast.show("Funcionario excluido.", "success");
    } catch (err: any) {
      this.toast.show(`Erro ao excluir funcionario: ${err.message}`, "error");
    }
  }

  isSistemaSelecionado(sistemaId: string, editando = false): boolean {
    const selecionados = editando
      ? this.editEmpresaSistemasSelecionados
      : this.sistemasEmpresaSelecionados;

    return selecionados.includes(sistemaId);
  }

  alternarSistemaEmpresa(sistemaId: string, selecionado: boolean, editando = false) {
    const atuais = editando ? this.editEmpresaSistemasSelecionados : this.sistemasEmpresaSelecionados;
    const atualizados = selecionado
      ? [...atuais, sistemaId]
      : atuais.filter((item) => item !== sistemaId);
    const normalizados = this.sanitizeSistemaIds(atualizados);

    if (editando) {
      this.editEmpresaSistemasSelecionados = normalizados;
      return;
    }

    this.sistemasEmpresaSelecionados = normalizados;
  }

  private async carregarFuncionarios(empresaId: string) {
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
    } catch (err: any) {
      this.emitFuncionariosState({
        status: "error",
        data: [],
        error: err?.message || "Erro ao carregar funcionarios."
      });
    }
  }

  private buildViewModel(
    empresasState: DataState<Empresa[]>,
    sistemasState: DataState<Sistema[]>,
    empresaSelecionadaId: string | null,
    funcionariosState: DataState<Funcionario[]>
  ): EmpresasViewModel {
    const sistemas = this.sortSistemas(sistemasState.data)
      .filter((item): item is SistemaOptionView => !!item.id)
      .map((item) => ({
        ...item,
        id: item.id!
      }));
    const sistemasMap = new Map(sistemas.map((item) => [item.id, item]));
    const empresas = this.sortEmpresas(empresasState.data).map((item) => {
      const sistemasIds = this.sanitizeSistemaIds(item.sistemas);
      const sistemasNomes = this.resolveEmpresaSistemaNomes(sistemasIds, sistemasMap);

      return {
        ...item,
        sistemas: sistemasIds,
        sistemasNomes,
        sistemasVisiveis: sistemasNomes.slice(0, 2),
        sistemasExtras: Math.max(0, sistemasNomes.length - 2),
        sistemasTooltip: sistemasNomes.join(", "),
        sistemasQuantidadeLabel: this.buildEmpresaSistemasQuantidadeLabel(sistemasNomes.length),
        totalFuncionariosLabel: item.totalFuncionarios ?? 0
      };
    });
    const empresaSelecionada =
      empresas.find((item) => item.id === empresaSelecionadaId) ?? null;

    return {
      carregando:
        empresasState.status === "loading" ||
        sistemasState.status === "loading" ||
        (!!empresaSelecionadaId && funcionariosState.status === "loading"),
      erro: empresasState.error,
      empresas,
      empresaSelecionada,
      sistemas,
      sistemasErro: sistemasState.error,
      funcionarios: funcionariosState.data,
      funcionariosCarregando: !!empresaSelecionadaId && funcionariosState.status === "loading",
      funcionariosErro: funcionariosState.error
    };
  }

  private sortEmpresas(items: Empresa[]): Empresa[] {
    return [...items].sort((a, b) => (a.nomeEmpresa || "").localeCompare(b.nomeEmpresa || ""));
  }

  private sortFuncionarios(items: Funcionario[]): Funcionario[] {
    return [...items].sort((a, b) =>
      (a.nomeFuncionario || "").localeCompare(b.nomeFuncionario || "")
    );
  }

  private sortSistemas(items: Sistema[]): Sistema[] {
    return [...items].sort((a, b) => (a.nome || "").localeCompare(b.nome || "", "pt-BR"));
  }

  private sanitizeSistemaIds(value: unknown): string[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return [...new Set(
      value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
    )];
  }

  private resolveEmpresaSistemaNomes(
    sistemaIds: string[],
    sistemasMap: Map<string, SistemaOptionView>
  ): string[] {
    return [...new Set(
      sistemaIds
        .map((sistemaId) => sistemasMap.get(sistemaId)?.nome?.trim() || sistemaId)
        .filter(Boolean)
    )];
  }

  private buildEmpresaSistemasQuantidadeLabel(total: number): string {
    if (total <= 0) {
      return "Nenhum sistema vinculado";
    }

    if (total === 1) {
      return "1 sistema vinculado";
    }

    return `${total} sistemas vinculados`;
  }

  private createEmptyFuncionarioForm(): FuncionarioFormModel {
    return {
      nomeFuncionario: "",
      telefone: "",
      criarChamadoAutomatico: true
    };
  }

  private createFuncionarioForm(funcionario?: Partial<Funcionario> | null): FuncionarioFormModel {
    return {
      nomeFuncionario: funcionario?.nomeFuncionario || "",
      telefone: funcionario?.telefone || "",
      criarChamadoAutomatico:
        funcionario?.criarChamadoAutomatico ?? true
    };
  }

  private emitFuncionariosState(state: DataState<Funcionario[]>) {
    this.runInZone(() => this.funcionariosStateSubject.next(state));
  }

  private runInZone<T>(callback: () => T): T {
    return NgZone.isInAngularZone() ? callback() : this.zone.run(callback);
  }
}
