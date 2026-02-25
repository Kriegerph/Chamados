import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Timestamp } from "firebase/firestore";
import { BehaviorSubject, combineLatest, map, Observable, tap } from "rxjs";
import { Chamado } from "../../models/chamado.model";
import { Cliente } from "../../models/cliente.model";
import { DataState } from "../../models/data-state.model";
import { ChamadosService } from "../../services/chamados.service";
import { ClientesService } from "../../services/clientes.service";
import { ToastService } from "../../services/toast.service";

interface GrupoConcluidos {
  data: string;
  items: ConcluidoItemView[];
}

type ConcluidoItemView = Chamado & {
  clienteLabel: string;
};

type ConcluidosFiltros = {
  ano: string;
  mes: string;
  data: string;
  clienteId: string;
  texto: string;
};

type MesFiltroOption = {
  valor: string;
  label: string;
};

type ConcluidosViewModel = {
  carregando: boolean;
  erro: string | null;
  clientes: Cliente[];
  grupos: GrupoConcluidos[];
  totalConcluidos: number;
  totalFiltrados: number;
  totalExibidos: number;
};

const FILTROS_INICIAIS: ConcluidosFiltros = {
  ano: "",
  mes: "",
  data: "",
  clienteId: "",
  texto: ""
};

const MESES_ABREV = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez"
];

@Component({
  selector: "app-concluidos",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./concluidos.component.html",
  styleUrl: "./concluidos.component.css",
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConcluidosComponent {
  filtrosDraft: ConcluidosFiltros = this.cloneFiltros(FILTROS_INICIAIS);
  anosDisponiveis: string[] = [];
  limiteExibicao = 10;
  readonly limitesExibicao = [10, 20, 50, 100];

  editando = false;
  editId: string | null = null;
  editMotivo = "";
  editClienteId = "";
  editClienteNomeOriginal = "";
  editData = "";
  editResolucao = "";

  private filtrosAplicados: ConcluidosFiltros = this.cloneFiltros(FILTROS_INICIAIS);
  private mesesDisponiveisPorAno = new Map<string, MesFiltroOption[]>();
  private readonly filtrosAplicadosSubject = new BehaviorSubject<ConcluidosFiltros>(
    this.cloneFiltros(FILTROS_INICIAIS)
  );
  private readonly limiteExibicaoSubject = new BehaviorSubject<number>(this.limiteExibicao);

  readonly vm$: Observable<ConcluidosViewModel>;

  constructor(
    private readonly chamadosService: ChamadosService,
    private readonly clientesService: ClientesService,
    private readonly toast: ToastService
  ) {
    this.vm$ = combineLatest([
      this.chamadosService.todosState$,
      this.clientesService.clientesState$,
      this.filtrosAplicadosSubject,
      this.limiteExibicaoSubject
    ]).pipe(
      map(([chamadosState, clientesState, filtros, limiteExibicao]) =>
        this.buildViewModel(chamadosState, clientesState, filtros, limiteExibicao)
      ),
      tap((viewModel) =>
        console.debug(
          `[Concluidos] exibindo ${viewModel.totalExibidos}/${viewModel.totalFiltrados} de ${viewModel.totalConcluidos}`
        )
      )
    );
  }

  get mesesDisponiveisDraft(): MesFiltroOption[] {
    if (!this.filtrosDraft.ano) return [];
    return this.mesesDisponiveisPorAno.get(this.filtrosDraft.ano) ?? [];
  }

  onAnoDraftChange() {
    this.filtrosDraft.mes = "";
  }

  aplicarFiltros() {
    this.filtrosAplicados = this.cloneFiltros(this.filtrosDraft);
    this.filtrosAplicadosSubject.next(this.cloneFiltros(this.filtrosAplicados));
  }

  limparFiltros() {
    this.filtrosDraft = this.cloneFiltros(FILTROS_INICIAIS);
    this.filtrosAplicados = this.cloneFiltros(FILTROS_INICIAIS);
    this.filtrosAplicadosSubject.next(this.cloneFiltros(this.filtrosAplicados));
  }

  onLimiteExibicaoChange() {
    this.limiteExibicaoSubject.next(this.limiteExibicao);
  }

  formatHora(item: Chamado): string {
    if (item.concluidoEm && typeof (item.concluidoEm as any).toDate === "function") {
      const dt = (item.concluidoEm as any).toDate() as Date;
      return dt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    }
    return "-";
  }

  abrirModalEditar(item: ConcluidoItemView) {
    this.editando = true;
    this.editId = item.id ?? null;
    this.editMotivo = item.motivo || "";
    this.editClienteId = item.clienteId || "";
    this.editClienteNomeOriginal = item.clienteLabel;
    this.editData = item.data || "";
    this.editResolucao = item.resolucao || "";
  }

  cancelarEdicao() {
    this.editando = false;
    this.editId = null;
    this.editMotivo = "";
    this.editClienteId = "";
    this.editClienteNomeOriginal = "";
    this.editData = "";
    this.editResolucao = "";
  }

  async salvarEdicao() {
    if (!this.editId) return;
    const motivo = this.editMotivo.trim();
    const clienteId = this.editClienteId;
    const clienteNome = clienteId
      ? this.getClienteNomeById(clienteId)
      : this.editClienteNomeOriginal;
    const data = this.editData;
    const resolucao = this.editResolucao.trim();

    if (!motivo || !clienteNome || !data) {
      this.toast.show("Preencha motivo, cliente e data.", "error");
      return;
    }
    if (!resolucao) {
      this.toast.show("Informe a resolucao.", "error");
      return;
    }

    try {
      const payload: Partial<Chamado> = {
        motivo,
        data,
        clienteNome,
        cliente: clienteNome,
        resolucao
      };
      if (clienteId) {
        payload.clienteId = clienteId;
      }
      await this.chamadosService.updateChamado(this.editId, payload);
      this.toast.show("Chamado atualizado.", "success");
      this.cancelarEdicao();
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
    filtros: ConcluidosFiltros,
    limiteExibicao: number
  ): ConcluidosViewModel {
    const clientes = this.sortClientes(clientesState.data);
    const clientesMap = new Map(
      clientes.filter((item) => !!item.id).map((item) => [item.id as string, item])
    );
    const concluidos = this.sortByDataDesc(
      chamadosState.data.filter((item) => item.status === "concluido")
    ).map((item) => ({
      ...item,
      clienteLabel: this.getClienteLabelFromMap(item, clientesMap)
    }));

    this.atualizarOpcoesData(concluidos);
    const filtrados = this.filtrarConcluidos(concluidos, filtros, clientesMap);
    const filtradosLimitados = filtrados.slice(0, limiteExibicao);
    const grupos = this.agruparPorData(filtradosLimitados);

    return {
      carregando: chamadosState.status === "loading" || clientesState.status === "loading",
      erro: chamadosState.error || clientesState.error,
      clientes,
      grupos,
      totalConcluidos: concluidos.length,
      totalFiltrados: filtrados.length,
      totalExibidos: filtradosLimitados.length
    };
  }

  private filtrarConcluidos(
    items: ConcluidoItemView[],
    filtros: ConcluidosFiltros,
    clientesMap: Map<string, Cliente>
  ): ConcluidoItemView[] {
    const textoBusca = this.normalizarTexto(filtros.texto.trim());
    const clienteFiltroNome = filtros.clienteId
      ? this.normalizarTexto(clientesMap.get(filtros.clienteId)?.nome || "")
      : "";

    return items.filter((item) => {
      const data = item.data || "";

      if (filtros.data) {
        if (data !== filtros.data) return false;
      } else {
        if (filtros.ano && !data.startsWith(`${filtros.ano}-`)) return false;
        if (filtros.mes && data.slice(5, 7) !== filtros.mes) return false;
      }

      if (filtros.clienteId) {
        if (item.clienteId) {
          if (item.clienteId !== filtros.clienteId) return false;
        } else {
          if (!clienteFiltroNome) return false;
          const nomeItem = this.normalizarTexto(item.clienteLabel || item.cliente || "");
          if (nomeItem !== clienteFiltroNome) return false;
        }
      }

      if (textoBusca) {
        const descricaoExtra = this.getDescricaoCampo(item);
        const alvo = this.normalizarTexto(
          `${item.motivo || ""} ${item.resolucao || ""} ${descricaoExtra} ${item.clienteLabel || ""}`
        );
        if (!alvo.includes(textoBusca)) return false;
      }

      return true;
    });
  }

  private agruparPorData(items: ConcluidoItemView[]): GrupoConcluidos[] {
    const agrupados = new Map<string, ConcluidoItemView[]>();
    items.forEach((item) => {
      const data = item.data || "Sem data";
      const atual = agrupados.get(data) || [];
      agrupados.set(data, [...atual, item]);
    });

    return Array.from(agrupados.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([data, groupedItems]) => ({ data, items: groupedItems }));
  }

  private atualizarOpcoesData(items: ConcluidoItemView[]) {
    const anosSet = new Set<string>();
    const mesesSetPorAno = new Map<string, Set<string>>();

    items.forEach((item) => {
      if (!this.isDataIso(item.data)) return;
      const ano = item.data.slice(0, 4);
      const mes = item.data.slice(5, 7);
      anosSet.add(ano);
      const mesesAno = mesesSetPorAno.get(ano) ?? new Set<string>();
      mesesAno.add(mes);
      mesesSetPorAno.set(ano, mesesAno);
    });

    this.anosDisponiveis = Array.from(anosSet).sort((a, b) => b.localeCompare(a));
    const novoMapa = new Map<string, MesFiltroOption[]>();
    mesesSetPorAno.forEach((meses, ano) => {
      novoMapa.set(ano, this.converterMeses(Array.from(meses)));
    });
    this.mesesDisponiveisPorAno = novoMapa;

    if (this.filtrosDraft.ano && !this.anosDisponiveis.includes(this.filtrosDraft.ano)) {
      this.filtrosDraft.ano = "";
      this.filtrosDraft.mes = "";
      return;
    }

    if (this.filtrosDraft.ano && this.filtrosDraft.mes) {
      const meses = this.mesesDisponiveisPorAno.get(this.filtrosDraft.ano) ?? [];
      if (!meses.some((item) => item.valor === this.filtrosDraft.mes)) {
        this.filtrosDraft.mes = "";
      }
    }
  }

  private converterMeses(meses: string[]): MesFiltroOption[] {
    return meses
      .sort((a, b) => a.localeCompare(b))
      .map((mes) => ({
        valor: mes,
        label: MESES_ABREV[Number(mes) - 1] || mes
      }));
  }

  private isDataIso(data?: string): data is string {
    return typeof data === "string" && /^\d{4}-\d{2}-\d{2}$/.test(data);
  }

  private getDescricaoCampo(item: ConcluidoItemView): string {
    const value = (item as unknown as { descricao?: unknown }).descricao;
    return typeof value === "string" ? value : "";
  }

  private normalizarTexto(value: string): string {
    return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }

  private cloneFiltros(filtros: ConcluidosFiltros): ConcluidosFiltros {
    return { ...filtros };
  }

  private sortByDataDesc(items: Chamado[]): Chamado[] {
    return [...items].sort((a, b) => {
      const dataCmp = (b.data || "").localeCompare(a.data || "");
      if (dataCmp !== 0) return dataCmp;
      const timeA = this.getTimestampMillis(a.concluidoEm ?? a.criadoEm);
      const timeB = this.getTimestampMillis(b.concluidoEm ?? b.criadoEm);
      return timeB - timeA;
    });
  }

  private getTimestampMillis(value?: Timestamp | null): number {
    if (value && typeof value.toDate === "function") {
      return value.toDate().getTime();
    }
    return 0;
  }

  private getClienteLabelFromMap(item: Chamado, clientesMap: Map<string, Cliente>): string {
    if (item.clienteNome) return item.clienteNome;
    if (item.clienteId) {
      const nome = clientesMap.get(item.clienteId)?.nome;
      if (nome) return nome;
    }
    return item.cliente || "Cliente nao informado";
  }

  private getClienteNomeById(id: string): string {
    if (!id) return "";
    return this.clientesService.getClientesSnapshot().find((item) => item.id === id)?.nome ?? "";
  }

  private sortClientes(items: Cliente[]): Cliente[] {
    return [...items].sort((a, b) => (a.nome || "").localeCompare(b.nome || ""));
  }
}
