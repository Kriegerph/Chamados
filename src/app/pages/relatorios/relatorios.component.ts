import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Timestamp } from "firebase/firestore";
import { BehaviorSubject, combineLatest, map, Observable, tap } from "rxjs";
import { Chamado, StatusChamado } from "../../models/chamado.model";
import { DataState } from "../../models/data-state.model";
import { Empresa } from "../../models/empresa.model";
import { Sistema } from "../../models/sistema.model";
import { ChamadosService } from "../../services/chamados.service";
import { EmpresasService } from "../../services/empresas.service";
import { SistemasService } from "../../services/sistemas.service";
import { ToastService } from "../../services/toast.service";

type StatusFiltroRelatorio = StatusChamado | "ambos";
type TempoFiltroRelatorio = "todos" | "com-tempo";
type TipoRelatorio =
  | "detalhado-chamados"
  | "tempo-por-empresa"
  | "ranking-empresas";

type RelatoriosFiltros = {
  empresaIds: string[];
  dataInicial: string;
  dataFinal: string;
  status: StatusFiltroRelatorio;
  tempo: TempoFiltroRelatorio;
};

type RelatorioColumn = {
  key: string;
  label: string;
  align?: "left" | "right";
};

type RelatorioRow = Record<string, string | number>;

type RelatorioDataset = {
  sheetName: string;
  columns: RelatorioColumn[];
  rows: RelatorioRow[];
};

type TipoRelatorioOption = {
  valor: TipoRelatorio;
  titulo: string;
  descricao: string;
};

type RelatoriosViewModel = {
  carregando: boolean;
  erro: string | null;
  empresas: Empresa[];
  dataset: RelatorioDataset;
  totalChamadosFiltrados: number;
  totalEmpresasFiltradas: number;
  totalChamadosComTempo: number;
  tempoTotalLabel: string;
  mensagemResultado: string | null;
};

const FILTROS_INICIAIS: RelatoriosFiltros = {
  empresaIds: [],
  dataInicial: "",
  dataFinal: "",
  status: "ambos",
  tempo: "todos"
};

@Component({
  selector: "app-relatorios",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./relatorios.component.html",
  styleUrl: "./relatorios.component.css",
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RelatoriosComponent {
  filtros: RelatoriosFiltros = this.cloneFiltros(FILTROS_INICIAIS);
  tipoRelatorio: TipoRelatorio = "detalhado-chamados";
  readonly tipoRelatorioOptions: TipoRelatorioOption[] = [
    {
      valor: "detalhado-chamados",
      titulo: "Relatorio detalhado de chamados",
      descricao: "Exporta um chamado por linha com empresa, motivo, data, resolucao, tempo e status."
    },
    {
      valor: "tempo-por-empresa",
      titulo: "Relatorio de tempo por empresa",
      descricao: "Agrupa chamados por empresa com totais de chamados, tempo total e tempo medio."
    },
    {
      valor: "ranking-empresas",
      titulo: "Ranking de empresas por chamados",
      descricao: "Ordena as empresas do maior para o menor volume de chamados no periodo filtrado."
    }
  ];

  readonly previewLimit = 12;
  private currentViewModel: RelatoriosViewModel | null = null;
  private empresasSelecionadasInicializadas = false;
  private empresaIdsSelecionadosSet = new Set<string>();

  private readonly filtrosSubject = new BehaviorSubject<RelatoriosFiltros>(
    this.cloneFiltros(FILTROS_INICIAIS)
  );
  private readonly tipoRelatorioSubject = new BehaviorSubject<TipoRelatorio>(this.tipoRelatorio);

  readonly vm$: Observable<RelatoriosViewModel>;

  constructor(
    private readonly chamadosService: ChamadosService,
    private readonly empresasService: EmpresasService,
    private readonly sistemasService: SistemasService,
    private readonly toast: ToastService
  ) {
    this.vm$ = combineLatest([
      this.chamadosService.todosState$,
      this.empresasService.empresasState$,
      this.sistemasService.sistemasState$,
      this.filtrosSubject,
      this.tipoRelatorioSubject
    ]).pipe(
      map(([chamadosState, empresasState, sistemasState, filtros, tipoRelatorio]) =>
        this.buildViewModel(chamadosState, empresasState, sistemasState, filtros, tipoRelatorio)
      ),
      tap((viewModel) => {
        this.currentViewModel = viewModel;
        this.inicializarSelecaoEmpresas(viewModel.empresas);
      })
    );
  }

  onFiltroChange() {
    this.empresaIdsSelecionadosSet = new Set(this.filtros.empresaIds);
    this.filtrosSubject.next(this.cloneFiltros(this.filtros));
  }

  selecionarTodasEmpresas(empresas: Empresa[]) {
    this.atualizarEmpresasSelecionadas(this.getEmpresaIds(empresas));
  }

  desmarcarTodasEmpresas() {
    this.atualizarEmpresasSelecionadas([]);
  }

  onEmpresaCheckboxChange(empresaId: string | undefined, event: Event) {
    if (!empresaId) return;

    const checked = (event.target as HTMLInputElement | null)?.checked ?? false;
    const empresaIds = checked
      ? [...this.filtros.empresaIds.filter((id) => id !== empresaId), empresaId]
      : this.filtros.empresaIds.filter((id) => id !== empresaId);

    this.atualizarEmpresasSelecionadas(empresaIds);
  }

  onTipoRelatorioChange() {
    this.tipoRelatorioSubject.next(this.tipoRelatorio);
  }

  limparFiltros() {
    const empresaIds = this.currentViewModel ? this.getEmpresaIds(this.currentViewModel.empresas) : [];
    this.filtros = {
      ...this.cloneFiltros(FILTROS_INICIAIS),
      empresaIds
    };
    this.tipoRelatorio = "detalhado-chamados";
    this.onFiltroChange();
    this.tipoRelatorioSubject.next(this.tipoRelatorio);
  }

  async exportarParaExcel() {
    const vm = this.currentViewModel;
    if (!vm) return;

    if (vm.mensagemResultado) {
      this.toast.show(vm.mensagemResultado, "error");
      return;
    }

    if (vm.dataset.rows.length === 0) {
      this.toast.show("Nenhum dado corresponde aos filtros selecionados.", "error");
      return;
    }

    try {
      const XLSX = await import("xlsx");
      const workbook = XLSX.utils.book_new();
      const header = vm.dataset.columns.map((column) => column.label);
      const body = vm.dataset.rows.map((row) =>
        vm.dataset.columns.map((column) => row[column.key] ?? "")
      );
      const worksheet = XLSX.utils.aoa_to_sheet([header, ...body]);
      worksheet["!cols"] = vm.dataset.columns.map((column) => ({
        wch: this.getColumnWidth(column, vm.dataset.rows)
      }));

      XLSX.utils.book_append_sheet(workbook, worksheet, vm.dataset.sheetName);
      XLSX.writeFile(workbook, this.buildFileName());
      this.toast.show("Relatorio exportado com sucesso.", "success");
    } catch (err: any) {
      this.toast.show(`Erro ao exportar: ${err.message || err}`, "error");
    }
  }

  trackByTipoRelatorio(_: number, item: TipoRelatorioOption): string {
    return item.valor;
  }

  trackByEmpresa(_: number, item: Empresa): string {
    return item.id ?? item.nomeEmpresa;
  }

  trackByColumn(_: number, item: RelatorioColumn): string {
    return item.key;
  }

  getPreviewRows(rows: RelatorioRow[]): RelatorioRow[] {
    return rows.slice(0, this.previewLimit);
  }

  getCellValue(row: RelatorioRow, column: RelatorioColumn): string | number {
    return row[column.key] ?? "";
  }

  getTipoRelatorioTitulo(): string {
    return (
      this.tipoRelatorioOptions.find((item) => item.valor === this.tipoRelatorio)?.titulo ??
      "Relatorio"
    );
  }

  isEmpresaSelecionada(empresaId?: string): boolean {
    return !!empresaId && this.empresaIdsSelecionadosSet.has(empresaId);
  }

  todasEmpresasSelecionadas(empresas: Empresa[]): boolean {
    const empresaIds = this.getEmpresaIds(empresas);
    return empresaIds.length > 0 && empresaIds.every((id) => this.empresaIdsSelecionadosSet.has(id));
  }

  private buildViewModel(
    chamadosState: DataState<Chamado[]>,
    empresasState: DataState<Empresa[]>,
    sistemasState: DataState<Sistema[]>,
    filtros: RelatoriosFiltros,
    tipoRelatorio: TipoRelatorio
  ): RelatoriosViewModel {
    const empresas = this.sortEmpresas(empresasState.data);
    const sistemasMap = new Map(
      this.sortSistemas(sistemasState.data)
        .filter((item): item is Sistema & { id: string } => !!item.id)
        .map((item) => [item.id, item.nome?.trim() || item.id])
    );
    const filtrosEfetivos = this.resolveFiltrosEmpresas(filtros, empresas);
    const empresasMap = new Map(
      empresas.filter((item) => !!item.id).map((item) => [item.id as string, item])
    );
    const empresaIdsDisponiveis = this.getEmpresaIds(empresas);
    const chamados = this.sortByDataDesc(chamadosState.data);
    const mensagemResultado = this.getMensagemResultado(filtrosEfetivos);
    const filtrados = mensagemResultado
      ? []
      : this.aplicarFiltrosFrontend(chamados, filtrosEfetivos, empresasMap, empresaIdsDisponiveis);
    const dataset = this.buildDataset(filtrados, tipoRelatorio, empresasMap, sistemasMap);
    const empresasNosResultados = new Set(
      filtrados.map((item) => this.getEmpresaLabel(item, empresasMap))
    );
    const temposRegistrados = filtrados.filter((item) =>
      this.hasTempoAtendimento(item.tempoAtendimentoMinutos)
    );

    return {
      carregando:
        chamadosState.status === "loading" ||
        empresasState.status === "loading" ||
        sistemasState.status === "loading",
      erro: chamadosState.error || empresasState.error || sistemasState.error,
      empresas,
      dataset,
      totalChamadosFiltrados: filtrados.length,
      totalEmpresasFiltradas: empresasNosResultados.size,
      totalChamadosComTempo: temposRegistrados.length,
      tempoTotalLabel: this.formatTempoMinutos(
        temposRegistrados.reduce(
          (total, item) => total + this.getTempoAtendimentoMinutos(item.tempoAtendimentoMinutos),
          0
        ),
        "Sem tempo registrado"
      ),
      mensagemResultado:
        mensagemResultado ||
        (dataset.rows.length === 0 ? "Nenhum dado corresponde aos filtros selecionados." : null)
    };
  }

  private aplicarFiltrosFrontend(
    items: Chamado[],
    filtros: RelatoriosFiltros,
    empresasMap: Map<string, Empresa>,
    empresaIdsDisponiveis: string[]
  ): Chamado[] {
    const empresaNomesPermitidos = new Set(
      filtros.empresaIds
        .map((id) => this.normalizarTexto(empresasMap.get(id)?.nomeEmpresa || ""))
        .filter((nome) => !!nome)
    );
    const todasEmpresasSelecionadas =
      empresaIdsDisponiveis.length > 0 && filtros.empresaIds.length === empresaIdsDisponiveis.length;

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

  private buildDataset(
    chamados: Chamado[],
    tipoRelatorio: TipoRelatorio,
    empresasMap: Map<string, Empresa>,
    sistemasMap: Map<string, string>
  ): RelatorioDataset {
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

  private buildDetalhadoDataset(
    chamados: Chamado[],
    empresasMap: Map<string, Empresa>,
    sistemasMap: Map<string, string>
  ): RelatorioDataset {
    return {
      sheetName: "Chamados",
      columns: [
        { key: "empresa", label: "Empresa" },
        { key: "funcionario", label: "Funcionario" },
        { key: "motivo", label: "Motivo" },
        { key: "dataChamado", label: "Data do Chamado" },
        { key: "sistemaPrincipal", label: "Sistema principal" },
        { key: "sistemasRelacionados", label: "Sistemas relacionados" },
        { key: "resolucao", label: "Resolucao" },
        { key: "tempoAtendimento", label: "Tempo de Atendimento" },
        { key: "status", label: "Status" }
      ],
      rows: chamados.map((item) => ({
        empresa: this.getEmpresaLabel(item, empresasMap),
        funcionario: item.funcionario || "",
        motivo: item.motivo || "",
        dataChamado: item.data || "",
        sistemaPrincipal: this.getSistemaNome(item.contextoSistemaId, sistemasMap),
        sistemasRelacionados: this.getSistemasRelacionadosLabel(item.sistemasRelacionados, sistemasMap),
        resolucao: item.resolucao || "",
        tempoAtendimento: this.formatTempoMinutos(item.tempoAtendimentoMinutos, ""),
        status: this.formatStatus(item.status)
      }))
    };
  }

  private buildTempoPorEmpresaDataset(
    chamados: Chamado[],
    empresasMap: Map<string, Empresa>
  ): RelatorioDataset {
    const grupos = new Map<
      string,
      {
        empresa: string;
        totalChamados: number;
        totalMinutos: number;
        totalChamadosComTempo: number;
      }
    >();

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

    const rows = Array.from(grupos.values())
      .sort((a, b) => {
        if (b.totalMinutos !== a.totalMinutos) return b.totalMinutos - a.totalMinutos;
        return a.empresa.localeCompare(b.empresa);
      })
      .map((item) => ({
        empresa: item.empresa,
        totalChamados: item.totalChamados,
        tempoTotalAtendimento:
          item.totalChamadosComTempo > 0 ? this.formatTempoMinutos(item.totalMinutos, "") : "",
        tempoMedioPorChamado:
          item.totalChamadosComTempo > 0
            ? this.formatTempoMinutos(
                Math.floor(item.totalMinutos / item.totalChamadosComTempo),
                ""
              )
            : ""
      }));

    return {
      sheetName: "Tempo por Empresa",
      columns: [
        { key: "empresa", label: "Nome da Empresa" },
        { key: "totalChamados", label: "Total de Chamados", align: "right" },
        { key: "tempoTotalAtendimento", label: "Tempo Total de Atendimento", align: "right" },
        { key: "tempoMedioPorChamado", label: "Tempo Medio por Chamado", align: "right" }
      ],
      rows
    };
  }

  private buildRankingEmpresasDataset(
    chamados: Chamado[],
    empresasMap: Map<string, Empresa>
  ): RelatorioDataset {
    const grupos = new Map<string, number>();
    chamados.forEach((item) => {
      const empresa = this.getEmpresaLabel(item, empresasMap);
      grupos.set(empresa, (grupos.get(empresa) ?? 0) + 1);
    });

    const totalChamados = chamados.length;
    const rows = Array.from(grupos.entries())
      .sort((a, b) => {
        if (b[1] !== a[1]) return b[1] - a[1];
        return a[0].localeCompare(b[0]);
      })
      .map(([empresa, quantidadeChamados]) => ({
        empresa,
        quantidadeChamados,
        percentualTotal:
          totalChamados > 0
            ? `${((quantidadeChamados / totalChamados) * 100).toFixed(1).replace(".", ",")}%`
            : "0,0%"
      }));

    return {
      sheetName: "Ranking de Empresas",
      columns: [
        { key: "empresa", label: "Empresa" },
        { key: "quantidadeChamados", label: "Quantidade de Chamados", align: "right" },
        { key: "percentualTotal", label: "Percentual em Relacao ao Total", align: "right" }
      ],
      rows
    };
  }

  private getMensagemResultado(filtros: RelatoriosFiltros): string | null {
    if (filtros.empresaIds.length === 0) {
      return "Selecione pelo menos uma empresa para gerar o relatorio.";
    }
    if (filtros.dataInicial && filtros.dataFinal && filtros.dataInicial > filtros.dataFinal) {
      return "Periodo invalido. Ajuste a data inicial e final.";
    }
    return null;
  }

  private getEmpresaLabel(item: Chamado, empresasMap: Map<string, Empresa>): string {
    if (item.empresa) return item.empresa;
    if (item.empresaId) {
      const nome = empresasMap.get(item.empresaId)?.nomeEmpresa;
      if (nome) return nome;
    }
    if (item.clienteNome) return item.clienteNome;
    return item.cliente || "Empresa nao informada";
  }

  private sortEmpresas(items: Empresa[]): Empresa[] {
    return [...items].sort((a, b) => (a.nomeEmpresa || "").localeCompare(b.nomeEmpresa || ""));
  }

  private sortSistemas(items: Sistema[]): Sistema[] {
    return [...items].sort((a, b) => (a.nome || "").localeCompare(b.nome || "", "pt-BR"));
  }

  private sortByDataDesc(items: Chamado[]): Chamado[] {
    return [...items].sort((a, b) => {
      const dataCmp = (b.data || "").localeCompare(a.data || "");
      if (dataCmp !== 0) return dataCmp;
      const timeA = this.getTimestampMillis(
        a.dataFimAtendimento ?? a.concluidoEm ?? a.dataInicioAtendimento ?? a.criadoEm
      );
      const timeB = this.getTimestampMillis(
        b.dataFimAtendimento ?? b.concluidoEm ?? b.dataInicioAtendimento ?? b.criadoEm
      );
      return timeB - timeA;
    });
  }

  private getTimestampMillis(value?: Timestamp | null): number {
    if (value && typeof value.toDate === "function") {
      return value.toDate().getTime();
    }
    return 0;
  }

  private formatStatus(status: StatusChamado): string {
    return status === "concluido" ? "Concluido" : "Aberto";
  }

  private formatTempoMinutos(value?: number | null, emptyText = ""): string {
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

  private hasTempoAtendimento(value?: number | null): boolean {
    return typeof value === "number" && Number.isFinite(value) && value >= 0;
  }

  private getTempoAtendimentoMinutos(value?: number | null): number {
    return this.hasTempoAtendimento(value) ? Math.floor(value as number) : 0;
  }

  private buildFileName(): string {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return `relatorio-chamados-${local.toISOString().slice(0, 10)}.xlsx`;
  }

  private cloneFiltros(filtros: RelatoriosFiltros): RelatoriosFiltros {
    return {
      ...filtros,
      empresaIds: [...filtros.empresaIds]
    };
  }

  private resolveFiltrosEmpresas(
    filtros: RelatoriosFiltros,
    empresas: Empresa[]
  ): RelatoriosFiltros {
    if (this.empresasSelecionadasInicializadas || filtros.empresaIds.length > 0) {
      return filtros;
    }

    const empresaIds = this.getEmpresaIds(empresas);
    if (empresaIds.length === 0) {
      return filtros;
    }

    return {
      ...filtros,
      empresaIds
    };
  }

  private inicializarSelecaoEmpresas(empresas: Empresa[]) {
    if (this.empresasSelecionadasInicializadas) return;

    const empresaIds = this.getEmpresaIds(empresas);
    if (empresaIds.length === 0) return;

    this.empresasSelecionadasInicializadas = true;
    this.atualizarEmpresasSelecionadas(empresaIds);
  }

  private atualizarEmpresasSelecionadas(empresaIds: string[]) {
    this.filtros = {
      ...this.filtros,
      empresaIds: [...empresaIds]
    };
    this.onFiltroChange();
  }

  private getEmpresaIds(empresas: Empresa[]): string[] {
    return empresas.filter((empresa) => !!empresa.id).map((empresa) => empresa.id as string);
  }

  private normalizarTexto(value: string): string {
    return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }

  private getColumnWidth(column: RelatorioColumn, rows: RelatorioRow[]): number {
    const maxRowLength = rows.reduce((maxLength, row) => {
      const value = String(row[column.key] ?? "");
      return Math.max(maxLength, value.length);
    }, column.label.length);

    return Math.min(Math.max(maxRowLength + 2, 14), 42);
  }

  private getSistemaNome(sistemaId: unknown, sistemasMap: Map<string, string>): string {
    if (typeof sistemaId !== "string") {
      return "";
    }

    const id = sistemaId.trim();
    if (!id) {
      return "";
    }

    return sistemasMap.get(id) || id;
  }

  private getSistemasRelacionadosLabel(
    sistemasRelacionados: unknown,
    sistemasMap: Map<string, string>
  ): string {
    if (!Array.isArray(sistemasRelacionados)) {
      return "";
    }

    return [...new Set(
      sistemasRelacionados
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
        .map((item) => sistemasMap.get(item) || item)
    )].join(", ");
  }
}
