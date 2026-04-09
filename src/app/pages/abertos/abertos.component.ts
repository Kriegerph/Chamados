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
import { Sistema } from "../../models/sistema.model";
import { ChamadosService } from "../../services/chamados.service";
import { ClientesService } from "../../services/clientes.service";
import { EmpresasService } from "../../services/empresas.service";
import { SistemasService } from "../../services/sistemas.service";
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
  sistemas: SistemaOptionView[];
  sistemasErro: string | null;
};

type SistemaOptionView = Sistema & {
  id: string;
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
  criandoChamado = false;
  modoCadastro: "novo" | "antigo" = "novo";
  motivo = "";
  empresaId = "";
  funcionarioId = "";
  data = "";
  resolucao = "";
  cadastroContextoSistemaId = "";
  cadastroSistemasRelacionados: string[] = [];
  funcionariosFormulario: Funcionario[] = [];
  carregandoFuncionariosFormulario = false;

  modalAberto = false;
  finalizarId: string | null = null;
  finalizarEmpresaId = "";
  finalizarOrigem: OrigemChamado = "manual";
  motivoFinalizar = "";
  resolucaoFinalizar = "";
  finalizarContextoSistemaId = "";
  finalizarSistemasRelacionados: string[] = [];

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
  editContextoSistemaId = "";
  editSistemasRelacionados: string[] = [];
  editFuncionarios: Funcionario[] = [];
  editCarregandoFuncionarios = false;

  readonly vm$: Observable<AbertosViewModel>;

  constructor(
    private readonly chamadosService: ChamadosService,
    private readonly clientesService: ClientesService,
    private readonly empresasService: EmpresasService,
    private readonly sistemasService: SistemasService,
    private readonly toast: ToastService,
    private readonly router: Router,
    private readonly zone: NgZone,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.data = this.getToday();
    this.vm$ = combineLatest([
      this.chamadosService.todosState$,
      this.clientesService.clientesState$,
      this.empresasService.empresasState$,
      this.sistemasService.sistemasState$
    ]).pipe(
      map(([chamadosState, clientesState, empresasState, sistemasState]) =>
        this.buildViewModel(chamadosState, clientesState, empresasState, sistemasState)
      )
    );
  }

  abrirModalCriacao() {
    this.resetFormularioCadastro();
    this.criandoChamado = true;
  }

  fecharModalCriacao() {
    this.criandoChamado = false;
  }

  onModoChange() {
    if (this.modoCadastro === "novo") {
      this.resolucao = "";
      this.cadastroContextoSistemaId = "";
      this.cadastroSistemasRelacionados = [];
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
    const contextoSistemaId = this.cadastroContextoSistemaId.trim();
    const sistemasRelacionados = this.sanitizeSistemaIds(
      this.cadastroSistemasRelacionados,
      contextoSistemaId,
      empresaId
    );

    if (!motivo || !empresaId || !empresa || !funcionarioId || !funcionario || !data) {
      this.toast.show("Preencha motivo, empresa, funcionário e data.", "error");
      return;
    }

    if (this.modoCadastro === "antigo" && !resolucao) {
      this.toast.show("Informe como foi resolvido.", "error");
      return;
    }

    if (this.modoCadastro === "antigo" && !contextoSistemaId) {
      this.toast.show("Selecione o sistema do problema.", "error");
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
          resolucao,
          contextoSistemaId,
          sistemasRelacionados
        });
      }
      this.runInZone(() => {
        this.toast.show("Chamado salvo com sucesso.", "success");
        this.resetFormularioCadastro();
        this.fecharModalCriacao();
      });
    } catch (err: any) {
      this.toast.show(`Erro ao salvar: ${err.message}`, "error");
    }
  }

  abrirModalFinalizar(item: AbertoItemView) {
    this.finalizarId = item.id ?? null;
    this.finalizarEmpresaId = item.empresaId || this.getEmpresaIdByNome(item.empresa || "");
    this.finalizarOrigem = item.origem === "whatsapp" ? "whatsapp" : "manual";
    this.motivoFinalizar = this.finalizarOrigem === "whatsapp" ? item.motivo || "" : "";
    this.resolucaoFinalizar = "";
    this.finalizarContextoSistemaId = "";
    this.finalizarSistemasRelacionados = [];
    this.modalAberto = true;
  }

  cancelarModal() {
    this.modalAberto = false;
    this.finalizarId = null;
    this.finalizarEmpresaId = "";
    this.finalizarOrigem = "manual";
    this.motivoFinalizar = "";
    this.resolucaoFinalizar = "";
    this.finalizarContextoSistemaId = "";
    this.finalizarSistemasRelacionados = [];
  }

  async confirmarFinalizacao() {
    const resolucao = this.resolucaoFinalizar.trim();
    const motivo = this.motivoFinalizar.trim();
    const contextoSistemaId = this.finalizarContextoSistemaId.trim();
    const sistemasRelacionados = this.sanitizeSistemaIds(
      this.finalizarSistemasRelacionados,
      contextoSistemaId,
      this.finalizarEmpresaId
    );

    if (this.finalizarOrigem === "whatsapp" && !motivo) {
      this.toast.show("Informe o motivo do chamado.", "error");
      return;
    }

    if (!resolucao) {
      this.toast.show("Informe como foi resolvido.", "error");
      return;
    }

    if (!contextoSistemaId) {
      this.toast.show("Selecione o sistema do problema.", "error");
      return;
    }

    if (!this.finalizarId) return;

    try {
      await this.chamadosService.finalizarChamado(this.finalizarId, {
        resolucao,
        motivo: this.finalizarOrigem === "whatsapp" ? motivo : undefined,
        contextoSistemaId,
        sistemasRelacionados
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
    this.forcarAtualizacaoFormulario();

    this.editEmpresaId = item.empresaId || this.getEmpresaIdByNome(item.empresa || "");
    this.editEmpresaNomeOriginal = item.empresa || "";
    this.editFuncionarioId = item.funcionarioId || "";
    this.editFuncionarioNomeOriginal = item.funcionario || "";
    this.editContextoSistemaId = item.contextoSistemaId || "";
    this.editSistemasRelacionados = this.sanitizeSistemaIds(
      item.sistemasRelacionados,
      item.contextoSistemaId,
      this.editEmpresaId
    );
    if (this.editEmpresaId) {
      await this.carregarFuncionariosEdicao(this.editEmpresaId);
      if (!this.editFuncionarioId && this.editFuncionarioNomeOriginal) {
        this.runInZone(() => {
          this.editFuncionarioId =
            this.editFuncionarios.find(
              (funcionario) => funcionario.nomeFuncionario === this.editFuncionarioNomeOriginal
            )?.id || "";
          this.forcarAtualizacaoFormulario();
        });
      }
    }

    this.forcarAtualizacaoFormulario();
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
    this.editContextoSistemaId = "";
    this.editSistemasRelacionados = [];
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
      this.toast.show("Preencha motivo, empresa, funcionário e data.", "error");
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
        payload.contextoSistemaId = this.editContextoSistemaId.trim();
        payload.sistemasRelacionados = this.sanitizeSistemaIds(
          this.editSistemasRelacionados,
          this.editContextoSistemaId,
          this.editEmpresaId
        );
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
      this.toast.show("Chamado excluído.", "success");
    } catch (err: any) {
      this.toast.show(`Erro ao excluir: ${err.message}`, "error");
    }
  }

  private buildViewModel(
    chamadosState: DataState<Chamado[]>,
    clientesState: DataState<Cliente[]>,
    empresasState: DataState<Empresa[]>,
    sistemasState: DataState<Sistema[]>
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

    const sistemas = this.sortSistemas(sistemasState.data)
      .filter((item): item is SistemaOptionView => !!item.id)
      .map((item) => ({
        ...item,
        id: item.id!
      }));

    return {
      carregando:
        chamadosState.status === "loading" ||
        clientesState.status === "loading" ||
        empresasState.status === "loading" ||
        sistemasState.status === "loading",
      erro: chamadosState.error || clientesState.error || empresasState.error,
      abertos,
      clientes,
      empresas,
      sistemas,
      sistemasErro: sistemasState.error
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
    return item.cliente || "Cliente não informado";
  }

  private async carregarFuncionariosFormulario(empresaId: string) {
    try {
      const funcionarios = await this.empresasService.listFuncionarios(empresaId);
      this.finalizarCarregamentoFuncionariosFormulario(
        this.sortFuncionarios(funcionarios.filter((item) => item.ativo !== false))
      );
    } catch (err: any) {
      this.runInZone(() => {
        this.toast.show(`Erro ao carregar funcionários: ${err.message}`, "error");
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
        this.toast.show(`Erro ao carregar funcionários: ${err.message}`, "error");
        this.finalizarCarregamentoFuncionariosEdicao([]);
      });
    }
  }

  private getToday(): string {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
  }

  private resetFormularioCadastro() {
    this.modoCadastro = "novo";
    this.motivo = "";
    this.empresaId = "";
    this.funcionarioId = "";
    this.data = this.getToday();
    this.resolucao = "";
    this.cadastroContextoSistemaId = "";
    this.cadastroSistemasRelacionados = [];
    this.funcionariosFormulario = [];
    this.carregandoFuncionariosFormulario = false;
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

  private sortSistemas(items: Sistema[]): Sistema[] {
    return [...items].sort((a, b) => (a.nome || "").localeCompare(b.nome || "", "pt-BR"));
  }

  getSistemasEmpresaOptions(empresaId: string, sistemas: SistemaOptionView[]): SistemaOptionView[] {
    if (!empresaId) return [];

    const empresa = this.empresasService.getEmpresasSnapshot().find((item) => item.id === empresaId);
    const sistemaIds = this.sanitizeSistemaIds(empresa?.sistemas);
    if (sistemaIds.length === 0) return [];

    const sistemasMap = new Map(
      sistemas.filter((item) => !!item.id).map((item) => [item.id, item])
    );

    return sistemaIds
      .map((id) => sistemasMap.get(id) ?? null)
      .filter((item): item is SistemaOptionView => !!item);
  }

  getSistemasRelacionadosOptions(
    empresaId: string,
    sistemas: SistemaOptionView[],
    contextoSistemaId: string
  ): SistemaOptionView[] {
    const contexto = contextoSistemaId.trim();
    return this.getSistemasEmpresaOptions(empresaId, sistemas).filter((item) => item.id !== contexto);
  }

  isSistemaRelacionadoSelecionado(sistemaId: string, editando = false): boolean {
    const selecionados = editando ? this.editSistemasRelacionados : this.finalizarSistemasRelacionados;
    return selecionados.includes(sistemaId);
  }

  isCadastroSistemaRelacionadoSelecionado(sistemaId: string): boolean {
    return this.cadastroSistemasRelacionados.includes(sistemaId);
  }

  onCadastroContextoSistemaChange() {
    this.cadastroSistemasRelacionados = this.sanitizeSistemaIds(
      this.cadastroSistemasRelacionados,
      this.cadastroContextoSistemaId,
      this.empresaId
    );
  }

  onContextoSistemaChange(editando = false) {
    if (editando) {
      this.editSistemasRelacionados = this.sanitizeSistemaIds(
        this.editSistemasRelacionados,
        this.editContextoSistemaId,
        this.editEmpresaId
      );
      return;
    }

    this.finalizarSistemasRelacionados = this.sanitizeSistemaIds(
      this.finalizarSistemasRelacionados,
      this.finalizarContextoSistemaId,
      this.finalizarEmpresaId
    );
  }

  alternarSistemaRelacionado(
    sistemaId: string,
    selecionado: boolean,
    empresaId: string,
    editando = false
  ) {
    const atuais = editando ? this.editSistemasRelacionados : this.finalizarSistemasRelacionados;
    const contextoSistemaId = editando ? this.editContextoSistemaId : this.finalizarContextoSistemaId;
    const atualizados = selecionado
      ? [...atuais, sistemaId]
      : atuais.filter((item) => item !== sistemaId);
    const normalizados = this.sanitizeSistemaIds(atualizados, contextoSistemaId, empresaId);

    if (editando) {
      this.editSistemasRelacionados = normalizados;
      return;
    }

    this.finalizarSistemasRelacionados = normalizados;
  }

  alternarCadastroSistemaRelacionado(sistemaId: string, selecionado: boolean) {
    const atualizados = selecionado
      ? [...this.cadastroSistemasRelacionados, sistemaId]
      : this.cadastroSistemasRelacionados.filter((item) => item !== sistemaId);

    this.cadastroSistemasRelacionados = this.sanitizeSistemaIds(
      atualizados,
      this.cadastroContextoSistemaId,
      this.empresaId
    );
  }

  private sanitizeSistemaIds(
    value: unknown,
    contextoSistemaId = "",
    empresaId = ""
  ): string[] {
    if (!Array.isArray(value)) {
      return [];
    }

    const permitidos = new Set(this.getEmpresaSistemaIds(empresaId));
    const contexto = contextoSistemaId.trim();

    return [...new Set(
      value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter((item) => !!item && item !== contexto && (!empresaId || permitidos.has(item)))
    )];
  }

  private getEmpresaSistemaIds(empresaId: string): string[] {
    if (!empresaId) return [];

    const empresa = this.empresasService.getEmpresasSnapshot().find((item) => item.id === empresaId);
    if (!empresa?.sistemas || !Array.isArray(empresa.sistemas)) {
      return [];
    }

    return [...new Set(
      empresa.sistemas
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
    )];
  }

  private iniciarCarregamentoFuncionariosFormulario(empresaId: string) {
    this.runInZone(() => {
      this.empresaId = empresaId;
      this.funcionarioId = "";
      this.cadastroContextoSistemaId = "";
      this.cadastroSistemasRelacionados = [];
      this.funcionariosFormulario = [];
      this.funcionariosFormulario = [...this.funcionariosFormulario];
      this.carregandoFuncionariosFormulario = !!empresaId;
      this.forcarAtualizacaoFormulario();
    });
  }

  private finalizarCarregamentoFuncionariosFormulario(funcionarios: Funcionario[]) {
    this.runInZone(() => {
      this.funcionariosFormulario = [];
      this.funcionariosFormulario = [...funcionarios];
      this.carregandoFuncionariosFormulario = false;
      this.forcarAtualizacaoFormulario();
    });
  }

  private iniciarCarregamentoFuncionariosEdicao(empresaId: string) {
    this.runInZone(() => {
      this.editEmpresaId = empresaId;
      this.editFuncionarioId = "";
      this.editContextoSistemaId = "";
      this.editSistemasRelacionados = [];
      this.editFuncionarios = [];
      this.editFuncionarios = [...this.editFuncionarios];
      this.editCarregandoFuncionarios = !!empresaId;
      this.forcarAtualizacaoFormulario();
    });
  }

  private finalizarCarregamentoFuncionariosEdicao(funcionarios: Funcionario[]) {
    this.runInZone(() => {
      this.editFuncionarios = [];
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
