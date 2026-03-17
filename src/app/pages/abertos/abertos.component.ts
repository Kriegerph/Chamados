import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, NgZone } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { Timestamp } from "firebase/firestore";
import { combineLatest, map, Observable } from "rxjs";
import { Chamado, OrigemChamado } from "../../models/chamado.model";
import { Cliente } from "../../models/cliente.model";
import { DataState } from "../../models/data-state.model";
import { Empresa, Funcionario } from "../../models/empresa.model";
import { ChamadosService } from "../../services/chamados.service";
import { ClientesService } from "../../services/clientes.service";
import { EmpresasService } from "../../services/empresas.service";
import { ToastService } from "../../services/toast.service";

type AbertoItemView = Chamado & {
  principalLabel: string;
  secondaryLabel: string;
  isLegacy: boolean;
};

type AbertosViewModel = {
  carregando: boolean;
  erro: string | null;
  abertos: AbertoItemView[];
  clientes: Cliente[];
  empresas: Empresa[];
};

@Component({
  selector: "app-abertos",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./abertos.component.html",
  styleUrl: "./abertos.component.css",
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AbertosComponent {
  modoCadastro: "novo" | "antigo" = "novo";
  motivo = "";
  empresaId = "";
  funcionarioId = "";
  data = "";
  resolucao = "";
  funcionariosFormulario: Funcionario[] = [];
  carregandoFuncionariosFormulario = false;

  modalAberto = false;
  finalizarId: string | null = null;
  finalizarOrigem: OrigemChamado = "manual";
  motivoFinalizar = "";
  resolucaoFinalizar = "";

  editando = false;
  editId: string | null = null;
  editMotivo = "";
  editData = "";
  editResolucao = "";
  editStatus: "aberto" | "concluido" = "aberto";
  editUsaEmpresa = false;
  editClienteNomeOriginal = "";
  editEmpresaId = "";
  editEmpresaNomeOriginal = "";
  editFuncionarioId = "";
  editFuncionarioNomeOriginal = "";
  editFuncionarios: Funcionario[] = [];
  editCarregandoFuncionarios = false;

  readonly vm$: Observable<AbertosViewModel>;

  constructor(
    private readonly chamadosService: ChamadosService,
    private readonly clientesService: ClientesService,
    private readonly empresasService: EmpresasService,
    private readonly toast: ToastService,
    private readonly router: Router,
    private readonly zone: NgZone,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.data = this.getToday();
    this.vm$ = combineLatest([
      this.chamadosService.todosState$,
      this.clientesService.clientesState$,
      this.empresasService.empresasState$
    ]).pipe(
      map(([chamadosState, clientesState, empresasState]) =>
        this.buildViewModel(chamadosState, clientesState, empresasState)
      )
    );
  }

  onModoChange() {
    if (this.modoCadastro === "novo") {
      this.resolucao = "";
    }
    if (!this.data) {
      this.data = this.getToday();
    }
  }

  async onEmpresaChange(empresaId: string) {
    this.iniciarCarregamentoFuncionariosFormulario(empresaId);

    if (empresaId === "__nova_empresa__") {
      this.runInZone(() => {
        this.empresaId = "";
        this.carregandoFuncionariosFormulario = false;
        this.forcarAtualizacaoFormulario();
      });
      await this.router.navigate(["/empresas"]);
      return;
    }

    if (!empresaId) {
      this.finalizarCarregamentoFuncionariosFormulario([]);
      return;
    }

    await this.carregarFuncionariosFormulario(empresaId);
  }

  async salvar() {
    const motivo = this.motivo.trim();
    const empresaId = this.empresaId;
    const empresa = this.getEmpresaNomeById(empresaId);
    const funcionarioId = this.funcionarioId;
    const funcionario = this.getFuncionarioNomeById(funcionarioId, this.funcionariosFormulario);
    const data = this.data;
    const resolucao = this.resolucao.trim();

    if (!motivo || !empresaId || !empresa || !funcionarioId || !funcionario || !data) {
      this.toast.show("Preencha motivo, empresa, funcionario e data.", "error");
      return;
    }

    if (this.modoCadastro === "antigo" && !resolucao) {
      this.toast.show("Informe como foi resolvido.", "error");
      return;
    }

    try {
      if (this.modoCadastro === "novo") {
        await this.chamadosService.addChamadoNovo({
          motivo,
          empresaId,
          empresa,
          funcionarioId,
          funcionario,
          data
        });
      } else {
        await this.chamadosService.addChamadoAntigo({
          motivo,
          empresaId,
          empresa,
          funcionarioId,
          funcionario,
          data,
          resolucao
        });
      }
      this.runInZone(() => {
        this.toast.show("Chamado salvo com sucesso.", "success");
        this.motivo = "";
        this.empresaId = "";
        this.funcionarioId = "";
        this.funcionariosFormulario = [];
        this.resolucao = "";
        this.data = this.getToday();
      });
    } catch (err: any) {
      this.toast.show(`Erro ao salvar: ${err.message}`, "error");
    }
  }

  abrirModalFinalizar(item: AbertoItemView) {
    this.finalizarId = item.id ?? null;
    this.finalizarOrigem = item.origem === "whatsapp" ? "whatsapp" : "manual";
    this.motivoFinalizar = this.finalizarOrigem === "whatsapp" ? item.motivo || "" : "";
    this.resolucaoFinalizar = "";
    this.modalAberto = true;
  }

  cancelarModal() {
    this.modalAberto = false;
    this.finalizarId = null;
    this.finalizarOrigem = "manual";
    this.motivoFinalizar = "";
    this.resolucaoFinalizar = "";
  }

  async confirmarFinalizacao() {
    const resolucao = this.resolucaoFinalizar.trim();
    const motivo = this.motivoFinalizar.trim();

    if (this.finalizarOrigem === "whatsapp" && !motivo) {
      this.toast.show("Informe o motivo do chamado.", "error");
      return;
    }

    if (!resolucao) {
      this.toast.show("Informe como foi resolvido.", "error");
      return;
    }

    if (!this.finalizarId) return;

    try {
      await this.chamadosService.finalizarChamado(this.finalizarId, {
        resolucao,
        motivo: this.finalizarOrigem === "whatsapp" ? motivo : undefined
      });
      this.runInZone(() => {
        this.toast.show("Chamado finalizado.", "success");
        this.cancelarModal();
      });
    } catch (err: any) {
      this.toast.show(`Erro ao finalizar: ${err.message}`, "error");
    }
  }

  async abrirModalEditar(item: AbertoItemView) {
    this.editando = true;
    this.editId = item.id ?? null;
    this.editMotivo = item.motivo || "";
    this.editData = item.data || "";
    this.editResolucao = item.resolucao || "";
    this.editStatus = item.status;
    this.editUsaEmpresa = this.isChamadoEmpresa(item);
    this.editClienteNomeOriginal = this.editUsaEmpresa ? "" : item.principalLabel;
    this.editEmpresaId = "";
    this.editEmpresaNomeOriginal = "";
    this.editFuncionarioId = "";
    this.editFuncionarioNomeOriginal = "";
    this.editFuncionarios = [];

    this.editEmpresaId = item.empresaId || this.getEmpresaIdByNome(item.empresa || "");
    this.editEmpresaNomeOriginal = item.empresa || "";
    this.editFuncionarioId = item.funcionarioId || "";
    this.editFuncionarioNomeOriginal = item.funcionario || "";
    if (this.editEmpresaId) {
      await this.carregarFuncionariosEdicao(this.editEmpresaId);
      if (!this.editFuncionarioId && this.editFuncionarioNomeOriginal) {
        this.runInZone(() => {
          this.editFuncionarioId =
            this.editFuncionarios.find(
              (funcionario) => funcionario.nomeFuncionario === this.editFuncionarioNomeOriginal
            )?.id || "";
        });
      }
    }
  }

  cancelarEdicao() {
    this.editando = false;
    this.editId = null;
    this.editMotivo = "";
    this.editData = "";
    this.editResolucao = "";
    this.editClienteNomeOriginal = "";
    this.editEmpresaId = "";
    this.editEmpresaNomeOriginal = "";
    this.editFuncionarioId = "";
    this.editFuncionarioNomeOriginal = "";
    this.editFuncionarios = [];
    this.editUsaEmpresa = false;
  }

  async onEditEmpresaChange(empresaId: string) {
    this.iniciarCarregamentoFuncionariosEdicao(empresaId);

    if (!empresaId) {
      this.finalizarCarregamentoFuncionariosEdicao([]);
      return;
    }

    await this.carregarFuncionariosEdicao(empresaId);
  }

  async salvarEdicao() {
    if (!this.editId) return;
    const motivo = this.editMotivo.trim();
    const data = this.editData;
    const resolucao = this.editResolucao.trim();
    const empresa = this.getEmpresaNomeById(this.editEmpresaId) || this.editEmpresaNomeOriginal;
    const funcionario =
      this.getFuncionarioNomeById(this.editFuncionarioId, this.editFuncionarios) ||
      this.editFuncionarioNomeOriginal;

    if (!motivo || !data || !this.editEmpresaId || !empresa || !this.editFuncionarioId || !funcionario) {
      this.toast.show("Preencha motivo, empresa, funcionario e data.", "error");
      return;
    }
    if (this.editStatus === "concluido" && !resolucao) {
      this.toast.show("Informe como foi resolvido.", "error");
      return;
    }

    try {
      const payload: Partial<Chamado> = {
        motivo,
        data,
        empresa,
        empresaId: this.editEmpresaId,
        funcionario,
        funcionarioId: this.editFuncionarioId
      };
      if (this.editUsaEmpresa) {
        payload.cliente = empresa;
        payload.clienteNome = empresa;
      }
      if (this.editStatus === "concluido") {
        payload.resolucao = resolucao;
      }
      await this.chamadosService.updateChamado(this.editId, payload);
      this.runInZone(() => {
        this.toast.show("Chamado atualizado.", "success");
        this.cancelarEdicao();
      });
    } catch (err: any) {
      this.toast.show(`Erro ao atualizar: ${err.message}`, "error");
    }
  }

  async excluirChamado(item: Chamado) {
    if (!item.id) return;
    const ok = window.confirm("Tem certeza que deseja excluir este chamado?");
    if (!ok) return;
    try {
      await this.chamadosService.deleteChamado(item.id);
      this.toast.show("Chamado excluido.", "success");
    } catch (err: any) {
      this.toast.show(`Erro ao excluir: ${err.message}`, "error");
    }
  }

  private buildViewModel(
    chamadosState: DataState<Chamado[]>,
    clientesState: DataState<Cliente[]>,
    empresasState: DataState<Empresa[]>
  ): AbertosViewModel {
    const clientes = this.sortClientes(clientesState.data);
    const clientesMap = new Map(
      clientes.filter((item) => !!item.id).map((item) => [item.id as string, item])
    );
    const empresas = this.sortEmpresas(empresasState.data);
    const empresasMap = new Map(
      empresas.filter((item) => !!item.id).map((item) => [item.id as string, item])
    );
    const abertos = this.sortByDataDesc(
      chamadosState.data.filter((item) => item.status === "aberto")
    ).map((item) => this.buildAbertoItemView(item, clientesMap, empresasMap));

    return {
      carregando:
        chamadosState.status === "loading" ||
        clientesState.status === "loading" ||
        empresasState.status === "loading",
      erro: chamadosState.error || clientesState.error || empresasState.error,
      abertos,
      clientes,
      empresas
    };
  }

  private buildAbertoItemView(
    item: Chamado,
    clientesMap: Map<string, Cliente>,
    empresasMap: Map<string, Empresa>
  ): AbertoItemView {
    const principalLabel = this.getPrincipalLabel(item, clientesMap, empresasMap);
    return {
      ...item,
      principalLabel,
      secondaryLabel: item.funcionario || "",
      isLegacy: !this.isChamadoEmpresa(item)
    };
  }

  private isChamadoEmpresa(item: Chamado): boolean {
    return !!(item.empresaId || item.empresa || item.funcionarioId || item.funcionario);
  }

  private getPrincipalLabel(
    item: Chamado,
    clientesMap: Map<string, Cliente>,
    empresasMap: Map<string, Empresa>
  ): string {
    if (item.empresa) return item.empresa;
    if (item.empresaId) {
      const nomeEmpresa = empresasMap.get(item.empresaId)?.nomeEmpresa;
      if (nomeEmpresa) return nomeEmpresa;
    }
    if (item.clienteNome) return item.clienteNome;
    if (item.clienteId) {
      const nome = clientesMap.get(item.clienteId)?.nome;
      if (nome) return nome;
    }
    return item.cliente || "Cliente nao informado";
  }

  private async carregarFuncionariosFormulario(empresaId: string) {
    try {
      const funcionarios = await this.empresasService.listFuncionarios(empresaId);
      this.finalizarCarregamentoFuncionariosFormulario(
        this.sortFuncionarios(funcionarios.filter((item) => item.ativo !== false))
      );
    } catch (err: any) {
      this.runInZone(() => {
        this.toast.show(`Erro ao carregar funcionarios: ${err.message}`, "error");
        this.finalizarCarregamentoFuncionariosFormulario([]);
      });
    }
  }

  private async carregarFuncionariosEdicao(empresaId: string) {
    try {
      const funcionarios = await this.empresasService.listFuncionarios(empresaId);
      this.finalizarCarregamentoFuncionariosEdicao(
        this.sortFuncionarios(funcionarios.filter((item) => item.ativo !== false))
      );
    } catch (err: any) {
      this.runInZone(() => {
        this.toast.show(`Erro ao carregar funcionarios: ${err.message}`, "error");
        this.finalizarCarregamentoFuncionariosEdicao([]);
      });
    }
  }

  private getToday(): string {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
  }

  private sortByDataDesc(items: Chamado[]): Chamado[] {
    return [...items].sort((a, b) => {
      const dataCmp = (b.data || "").localeCompare(a.data || "");
      if (dataCmp !== 0) return dataCmp;
      const timeA = this.getTimestampMillis(a.criadoEm ?? a.concluidoEm);
      const timeB = this.getTimestampMillis(b.criadoEm ?? b.concluidoEm);
      return timeB - timeA;
    });
  }

  private getTimestampMillis(value?: Timestamp | null): number {
    if (value && typeof value.toDate === "function") {
      return value.toDate().getTime();
    }
    return 0;
  }

  private getEmpresaNomeById(id: string): string {
    if (!id) return "";
    return this.empresasService.getEmpresasSnapshot().find((item) => item.id === id)?.nomeEmpresa ?? "";
  }

  private getEmpresaIdByNome(nomeEmpresa: string): string {
    return (
      this.empresasService.getEmpresasSnapshot().find((item) => item.nomeEmpresa === nomeEmpresa)?.id ??
      ""
    );
  }

  private getFuncionarioNomeById(id: string, funcionarios: Funcionario[]): string {
    if (!id) return "";
    return funcionarios.find((item) => item.id === id)?.nomeFuncionario ?? "";
  }

  getFuncionarioOptionLabel(funcionario: Funcionario): string {
    return funcionario.nomeFuncionario || "";
  }

  private sortClientes(items: Cliente[]): Cliente[] {
    return [...items].sort((a, b) => (a.nome || "").localeCompare(b.nome || ""));
  }

  private sortEmpresas(items: Empresa[]): Empresa[] {
    return [...items].sort((a, b) =>
      (a.nomeEmpresa || "").localeCompare(b.nomeEmpresa || "")
    );
  }

  private sortFuncionarios(items: Funcionario[]): Funcionario[] {
    return [...items].sort((a, b) =>
      (a.nomeFuncionario || "").localeCompare(b.nomeFuncionario || "")
    );
  }

  private iniciarCarregamentoFuncionariosFormulario(empresaId: string) {
    this.runInZone(() => {
      this.empresaId = empresaId;
      this.funcionarioId = "";
      this.funcionariosFormulario = [];
      this.carregandoFuncionariosFormulario = !!empresaId;
      this.forcarAtualizacaoFormulario();
    });
  }

  private finalizarCarregamentoFuncionariosFormulario(funcionarios: Funcionario[]) {
    this.runInZone(() => {
      this.funcionariosFormulario = [...funcionarios];
      this.carregandoFuncionariosFormulario = false;
      this.forcarAtualizacaoFormulario();
    });
  }

  private iniciarCarregamentoFuncionariosEdicao(empresaId: string) {
    this.runInZone(() => {
      this.editEmpresaId = empresaId;
      this.editFuncionarioId = "";
      this.editFuncionarios = [];
      this.editCarregandoFuncionarios = !!empresaId;
      this.forcarAtualizacaoFormulario();
    });
  }

  private finalizarCarregamentoFuncionariosEdicao(funcionarios: Funcionario[]) {
    this.runInZone(() => {
      this.editFuncionarios = [...funcionarios];
      this.editCarregandoFuncionarios = false;
      this.forcarAtualizacaoFormulario();
    });
  }

  private forcarAtualizacaoFormulario() {
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  private runInZone<T>(callback: () => T): T {
    return NgZone.isInAngularZone() ? callback() : this.zone.run(callback);
  }
}
