import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, NgZone } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Timestamp } from "firebase/firestore";
import { BehaviorSubject, combineLatest, map, Observable, tap } from "rxjs";
import { DataState } from "../../models/data-state.model";
import { Empresa, Funcionario } from "../../models/empresa.model";
import { Sistema } from "../../models/sistema.model";
import { Tarefa, TarefaPrioridade, TarefaStatus } from "../../models/tarefa.model";
import { EmpresasService } from "../../services/empresas.service";
import { SistemasService } from "../../services/sistemas.service";
import { TarefaPayload, TarefasService } from "../../services/tarefas.service";
import { ToastService } from "../../services/toast.service";

type EmpresaOption = Empresa & {
  id: string;
};

type SistemaOption = Sistema & {
  id: string;
};

type TarefaView = Tarefa & {
  statusLabel: string;
  prioridadeLabel: string;
  dataLabel: string | null;
};

type AfazerViewModel = {
  carregando: boolean;
  erro: string | null;
  tarefas: TarefaView[];
  total: number;
  pendentes: number;
  emAndamento: number;
  concluidas: number;
  mostrandoConcluidas: boolean;
  tituloLista: string;
  subtituloLista: string;
  mensagemVazia: string;
  empresas: EmpresaOption[];
  sistemas: SistemaOption[];
  vinculosCarregando: boolean;
  vinculosErro: string | null;
};

const STATUS_OPTIONS: Array<{ valor: TarefaStatus; label: string }> = [
  { valor: "pendente", label: "Pendente" },
  { valor: "andamento", label: "Em andamento" },
  { valor: "concluida", label: "Concluída" }
];

const PRIORIDADE_OPTIONS: Array<{ valor: TarefaPrioridade; label: string }> = [
  { valor: "baixa", label: "Baixa" },
  { valor: "media", label: "Média" },
  { valor: "alta", label: "Alta" }
];

@Component({
  selector: "app-afazer",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./afazer.component.html",
  styleUrl: "./afazer.component.css",
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AfazerComponent {
  readonly prioridadeOptions = PRIORIDADE_OPTIONS;
  readonly vm$: Observable<AfazerViewModel>;

  modalAberto = false;
  salvando = false;
  excluindoId: string | null = null;
  concluindoId: string | null = null;
  reabrindoId: string | null = null;
  tarefaEditandoId: string | null = null;
  funcionariosEmpresa: Funcionario[] = [];
  funcionariosCarregando = false;
  funcionariosErro: string | null = null;

  form: TarefaPayload = this.getFormInicial();
  private readonly mostrarConcluidasSubject = new BehaviorSubject<boolean>(false);

  private readonly dateFormatter = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });

  constructor(
    private readonly tarefasService: TarefasService,
    private readonly empresasService: EmpresasService,
    private readonly sistemasService: SistemasService,
    private readonly toast: ToastService,
    private readonly zone: NgZone,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.vm$ = combineLatest([
      this.tarefasService.tarefasState$,
      this.mostrarConcluidasSubject,
      this.empresasService.empresasState$,
      this.sistemasService.sistemasState$
    ]).pipe(
      map(([state, mostrarConcluidas, empresasState, sistemasState]) =>
        this.buildViewModel(state, mostrarConcluidas, empresasState, sistemasState)
      ),
      tap(() => this.cdr.markForCheck())
    );
  }

  trackByTarefa(_: number, item: TarefaView): string {
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

  async abrirModalEditarTarefa(item: Tarefa) {
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
    if (this.salvando && !forcar) return;
    this.modalAberto = false;
    this.tarefaEditandoId = null;
    this.form = this.getFormInicial();
    this.funcionariosEmpresa = [];
    this.funcionariosErro = null;
    this.funcionariosCarregando = false;
    this.forcarAtualizacaoTela();
  }

  async salvarTarefa() {
    if (this.salvando) return;

    const payload = this.getPayloadSanitizado();
    if (!payload.titulo) {
      this.toast.show("Informe o título da tarefa.", "error");
      return;
    }

    this.salvando = true;
    this.forcarAtualizacaoTela();

    try {
      if (this.tarefaEditandoId) {
        await this.tarefasService.updateTarefa(this.tarefaEditandoId, payload);
        this.toast.show("Tarefa atualizada.", "success");
      } else {
        await this.tarefasService.createTarefa({
          ...payload,
          status: "pendente"
        });
        this.toast.show("Tarefa cadastrada.", "success");
      }

      this.fecharModal(true);
    } catch (err: any) {
      this.toast.show(`Erro ao salvar tarefa: ${err?.message || err}`, "error");
    } finally {
      this.salvando = false;
      this.forcarAtualizacaoTela();
    }
  }

  async excluirTarefa(item: Tarefa) {
    if (!item.id || this.excluindoId === item.id) return;

    const ok = window.confirm("Deseja excluir esta tarefa?");
    if (!ok) return;

    this.excluindoId = item.id;
    this.forcarAtualizacaoTela();

    try {
      await this.tarefasService.deleteTarefa(item.id);
      this.toast.show("Tarefa excluída.", "success");
    } catch (err: any) {
      this.toast.show(`Erro ao excluir tarefa: ${err?.message || err}`, "error");
    } finally {
      if (this.excluindoId === item.id) {
        this.excluindoId = null;
        this.forcarAtualizacaoTela();
      }
    }
  }

  async concluirTarefa(item: Tarefa) {
    if (!item.id || this.concluindoId === item.id || item.status === "concluida") return;

    this.concluindoId = item.id;
    this.forcarAtualizacaoTela();

    try {
      await this.tarefasService.updateTarefa(item.id, this.buildStatusUpdatePayload(item, "concluida"));
      this.toast.show("Tarefa concluída.", "success");
    } catch (err: any) {
      this.toast.show(`Erro ao concluir tarefa: ${err?.message || err}`, "error");
    } finally {
      if (this.concluindoId === item.id) {
        this.concluindoId = null;
        this.forcarAtualizacaoTela();
      }
    }
  }

  async voltarParaPendente(item: Tarefa) {
    if (!item.id || this.reabrindoId === item.id || item.status !== "concluida") return;

    this.reabrindoId = item.id;
    this.forcarAtualizacaoTela();

    try {
      await this.tarefasService.updateTarefa(item.id, this.buildStatusUpdatePayload(item, "pendente"));
      this.toast.show("Tarefa voltou para pendente.", "success");
    } catch (err: any) {
      this.toast.show(`Erro ao voltar tarefa: ${err?.message || err}`, "error");
    } finally {
      if (this.reabrindoId === item.id) {
        this.reabrindoId = null;
        this.forcarAtualizacaoTela();
      }
    }
  }

  getTituloModal(): string {
    return this.tarefaEditandoId ? "Editar tarefa" : "Nova tarefa";
  }

  getSalvarLabel(): string {
    if (this.salvando) return "Salvando...";
    return this.tarefaEditandoId ? "Atualizar tarefa" : "Cadastrar tarefa";
  }

  getExcluirLabel(item: Tarefa): string {
    return this.excluindoId === item.id ? "Excluindo..." : "Excluir";
  }

  getConcluirLabel(item: Tarefa): string {
    return this.concluindoId === item.id ? "Concluindo..." : "Concluir";
  }

  getVoltarPendenteLabel(item: Tarefa): string {
    return this.reabrindoId === item.id ? "Voltando..." : "Voltar para pendente";
  }

  alternarTarefasConcluidas() {
    this.mostrarConcluidasSubject.next(!this.mostrarConcluidasSubject.value);
    this.forcarAtualizacaoTela();
  }

  async onEmpresaChange(empresas: EmpresaOption[]) {
    this.form.nomeEmpresa = this.getEmpresaNomeById(this.form.empresaId, empresas);
    this.form.clienteId = "";
    this.form.nomeCliente = "";
    this.form.sistemaId = "";
    this.form.nomeSistema = "";
    this.forcarAtualizacaoTela();
    await this.carregarFuncionariosEmpresa(this.form.empresaId, true);
  }

  onClienteChange() {
    this.form.nomeCliente =
      this.funcionariosEmpresa.find((item) => item.id === this.form.clienteId)?.nomeFuncionario || "";
    this.forcarAtualizacaoTela();
  }

  onSistemaChange(sistemas: SistemaOption[]) {
    this.form.nomeSistema = sistemas.find((item) => item.id === this.form.sistemaId)?.nome || "";
    this.forcarAtualizacaoTela();
  }

  getSistemasEmpresaOptions(
    empresaId: string,
    empresas: EmpresaOption[],
    sistemas: SistemaOption[]
  ): SistemaOption[] {
    if (!empresaId) return [];

    const empresa = empresas.find((item) => item.id === empresaId);
    const sistemaIds = this.sanitizeSistemaIds(empresa?.sistemas);
    if (sistemaIds.length === 0) return [];

    const sistemasMap = new Map(sistemas.map((item) => [item.id, item]));
    return sistemaIds
      .map((id) => sistemasMap.get(id) ?? null)
      .filter((item): item is SistemaOption => !!item);
  }

  private buildViewModel(
    state: DataState<Tarefa[]>,
    mostrarConcluidas: boolean,
    empresasState: DataState<Empresa[]>,
    sistemasState: DataState<Sistema[]>
  ): AfazerViewModel {
    const todas = this.sortTarefas(state.data).map((item) => this.toTarefaView(item));
    const tarefas = todas.filter((item) =>
      mostrarConcluidas ? item.status === "concluida" : item.status !== "concluida"
    );
    const empresas = this.sortEmpresas(empresasState.data)
      .filter((item): item is EmpresaOption => !!item.id)
      .map((item) => ({
        ...item,
        id: item.id!
      }));
    const sistemas = this.sortSistemas(sistemasState.data)
      .filter((item): item is SistemaOption => !!item.id)
      .map((item) => ({
        ...item,
        id: item.id!
      }));

    return {
      carregando:
        state.status === "loading" ||
        empresasState.status === "loading" ||
        sistemasState.status === "loading",
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
      tituloLista: mostrarConcluidas ? "Tarefas concluídas" : "Minhas tarefas",
      subtituloLista: mostrarConcluidas
        ? "Tarefas finalizadas aparecem separadas da lista principal."
        : "Itens em andamento e pendentes aparecem primeiro.",
      mensagemVazia: mostrarConcluidas
        ? "Nenhuma tarefa concluída."
        : "Nenhuma tarefa pendente ou em andamento."
    };
  }

  private sortTarefas(items: Tarefa[]): Tarefa[] {
    const statusOrder: Record<TarefaStatus, number> = {
      andamento: 0,
      pendente: 1,
      concluida: 2
    };
    const prioridadeOrder: Record<TarefaPrioridade, number> = {
      alta: 0,
      media: 1,
      baixa: 2
    };

    return [...items].sort((a, b) => {
      const statusDiff = statusOrder[a.status] - statusOrder[b.status];
      if (statusDiff !== 0) return statusDiff;

      const prioridadeDiff = prioridadeOrder[a.prioridade] - prioridadeOrder[b.prioridade];
      if (prioridadeDiff !== 0) return prioridadeDiff;

      const atualizacaoDiff =
        this.getTimestampMillis(b.dataAtualizacao ?? b.dataCriacao) -
        this.getTimestampMillis(a.dataAtualizacao ?? a.dataCriacao);
      if (atualizacaoDiff !== 0) return atualizacaoDiff;

      return (a.titulo || "").localeCompare(b.titulo || "", "pt-BR");
    });
  }

  private toTarefaView(item: Tarefa): TarefaView {
    return {
      ...item,
      statusLabel: this.getStatusLabel(item.status),
      prioridadeLabel: this.getPrioridadeLabel(item.prioridade),
      dataLabel: this.formatTimestamp(item.dataAtualizacao ?? item.dataCriacao ?? null)
    };
  }

  private getPayloadSanitizado(): TarefaPayload {
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

  private buildStatusUpdatePayload(item: Tarefa, status: TarefaStatus): TarefaPayload {
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

  private getFormInicial(): TarefaPayload {
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

  private getStatusLabel(status: TarefaStatus): string {
    return STATUS_OPTIONS.find((item) => item.valor === status)?.label ?? "Pendente";
  }

  private getPrioridadeLabel(prioridade: TarefaPrioridade): string {
    return PRIORIDADE_OPTIONS.find((item) => item.valor === prioridade)?.label ?? "Média";
  }

  private async carregarFuncionariosEmpresa(empresaId: string, limparSeVazio: boolean) {
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
        this.funcionariosEmpresa = this.sortFuncionarios(
          funcionarios.filter((item) => item.ativo !== false)
        );

        if (this.form.clienteId && !this.funcionariosEmpresa.some((item) => item.id === this.form.clienteId)) {
          this.form.clienteId = "";
          this.form.nomeCliente = "";
        }
        this.forcarAtualizacaoTela();
      });
    } catch (err: any) {
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

  private forcarAtualizacaoTela() {
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  private runInZone<T>(callback: () => T): T {
    return NgZone.isInAngularZone() ? callback() : this.zone.run(callback);
  }

  private getEmpresaNomeById(empresaId: string, empresas: EmpresaOption[]): string {
    return empresas.find((item) => item.id === empresaId)?.nomeEmpresa || "";
  }

  private sortEmpresas(items: Empresa[]): Empresa[] {
    return [...items].sort((a, b) =>
      (a.nomeEmpresa || "").localeCompare(b.nomeEmpresa || "", "pt-BR")
    );
  }

  private sortFuncionarios(items: Funcionario[]): Funcionario[] {
    return [...items].sort((a, b) =>
      (a.nomeFuncionario || "").localeCompare(b.nomeFuncionario || "", "pt-BR")
    );
  }

  private sortSistemas(items: Sistema[]): Sistema[] {
    return [...items].sort((a, b) => (a.nome || "").localeCompare(b.nome || "", "pt-BR"));
  }

  private sanitizeSistemaIds(value: unknown): string[] {
    if (!Array.isArray(value)) return [];

    return [...new Set(
      value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
    )];
  }

  private formatTimestamp(value: Timestamp | null): string | null {
    if (!value) return null;
    return this.dateFormatter.format(value.toDate());
  }

  private getTimestampMillis(value?: Timestamp | null): number {
    if (value && typeof value.toDate === "function") {
      return value.toDate().getTime();
    }
    return 0;
  }
}
