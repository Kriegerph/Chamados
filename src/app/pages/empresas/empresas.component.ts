import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, NgZone } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BehaviorSubject, combineLatest, map, Observable } from "rxjs";
import { DataState } from "../../models/data-state.model";
import { Empresa, Funcionario } from "../../models/empresa.model";
import { EmpresasService } from "../../services/empresas.service";
import { ToastService } from "../../services/toast.service";

type EmpresaItemView = Empresa & {
  totalFuncionariosLabel: number;
};

type EmpresasViewModel = {
  carregando: boolean;
  erro: string | null;
  empresas: EmpresaItemView[];
  empresaSelecionada: EmpresaItemView | null;
  funcionarios: Funcionario[];
  funcionariosCarregando: boolean;
  funcionariosErro: string | null;
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

  cadastrandoFuncionario = false;
  funcionarioNome = "";
  funcionarioTelefone = "";

  editandoEmpresa = false;
  editEmpresaId: string | null = null;
  editEmpresaNome = "";
  editEmpresaObservacoes = "";

  editandoFuncionario = false;
  editFuncionarioId: string | null = null;
  editFuncionarioEmpresaId: string | null = null;
  editFuncionarioNome = "";
  editFuncionarioTelefone = "";

  private readonly empresaSelecionadaIdSubject = new BehaviorSubject<string | null>(null);
  private readonly funcionariosStateSubject = new BehaviorSubject<DataState<Funcionario[]>>({
    status: "ready",
    data: [],
    error: null
  });

  readonly vm$: Observable<EmpresasViewModel>;

  constructor(
    private readonly empresasService: EmpresasService,
    private readonly toast: ToastService,
    private readonly zone: NgZone
  ) {
    this.vm$ = combineLatest([
      this.empresasService.empresasState$,
      this.empresaSelecionadaIdSubject,
      this.funcionariosStateSubject
    ]).pipe(
      map(([empresasState, empresaSelecionadaId, funcionariosState]) =>
        this.buildViewModel(empresasState, empresaSelecionadaId, funcionariosState)
      )
    );
  }

  trackByEmpresa(_: number, item: EmpresaItemView): string {
    return item.id ?? item.nomeEmpresa;
  }

  trackByFuncionario(_: number, item: Funcionario): string {
    return item.id ?? item.nomeFuncionario;
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
        observacoes: this.observacoesEmpresa
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
  }

  cancelarCadastroEmpresa() {
    this.cadastrandoEmpresa = false;
    this.nomeEmpresa = "";
    this.observacoesEmpresa = "";
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
  }

  cancelarEdicaoEmpresa() {
    this.editandoEmpresa = false;
    this.editEmpresaId = null;
    this.editEmpresaNome = "";
    this.editEmpresaObservacoes = "";
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
        observacoes: this.editEmpresaObservacoes.trim()
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
    const nomeFuncionario = this.funcionarioNome.trim();
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
        telefone: this.funcionarioTelefone
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
    this.funcionarioNome = "";
    this.funcionarioTelefone = "";
  }

  cancelarCadastroFuncionario() {
    this.cadastrandoFuncionario = false;
    this.funcionarioNome = "";
    this.funcionarioTelefone = "";
  }

  abrirEdicaoFuncionario(item: Funcionario) {
    const empresaId = this.empresaSelecionadaIdSubject.value;
    if (!empresaId) return;

    this.editandoFuncionario = true;
    this.editFuncionarioId = item.id ?? null;
    this.editFuncionarioEmpresaId = empresaId;
    this.editFuncionarioNome = item.nomeFuncionario || "";
    this.editFuncionarioTelefone = item.telefone || "";
  }

  cancelarEdicaoFuncionario() {
    this.editandoFuncionario = false;
    this.editFuncionarioId = null;
    this.editFuncionarioEmpresaId = null;
    this.editFuncionarioNome = "";
    this.editFuncionarioTelefone = "";
  }

  async salvarEdicaoFuncionario() {
    if (!this.editFuncionarioId || !this.editFuncionarioEmpresaId) return;
    const nomeFuncionario = this.editFuncionarioNome.trim();
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
          telefone: this.editFuncionarioTelefone.trim()
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
    empresaSelecionadaId: string | null,
    funcionariosState: DataState<Funcionario[]>
  ): EmpresasViewModel {
    const empresas = this.sortEmpresas(empresasState.data).map((item) => ({
      ...item,
      totalFuncionariosLabel: item.totalFuncionarios ?? 0
    }));
    const empresaSelecionada =
      empresas.find((item) => item.id === empresaSelecionadaId) ?? null;

    return {
      carregando:
        empresasState.status === "loading" ||
        (!!empresaSelecionadaId && funcionariosState.status === "loading"),
      erro: empresasState.error,
      empresas,
      empresaSelecionada,
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

  private emitFuncionariosState(state: DataState<Funcionario[]>) {
    this.runInZone(() => this.funcionariosStateSubject.next(state));
  }

  private runInZone<T>(callback: () => T): T {
    return NgZone.isInAngularZone() ? callback() : this.zone.run(callback);
  }
}
