import { CommonModule } from "@angular/common";
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Chart } from "chart.js/auto";
import { BehaviorSubject, combineLatest, map, Observable, tap } from "rxjs";
import { Chamado } from "../../models/chamado.model";
import { DataState } from "../../models/data-state.model";
import { Sistema } from "../../models/sistema.model";
import { ChamadosService } from "../../services/chamados.service";
import { SistemasService } from "../../services/sistemas.service";

type TopEmpresasPeriodo = "todos" | "ultimoMes" | "ultimos7Dias" | "hoje";
type AnoFiltro = number | "__all__";

type EmpresaResumo = {
  nome: string;
  total: number;
};

type DashboardCards = {
  principalLabel: string;
  principalValor: number;
  principalNota: string;
  mesLabel: string;
  mesValor: number;
  mesNota: string;
  totalAnoLabel: string;
  totalAnoValor: number;
  totalAnoNota: string;
  abertosValor: number;
  abertosNota: string;
};

type GraficoDiario = {
  ano: number;
  mes: number;
  mesLabel: string;
  labels: number[];
  totais: number[];
  totalMes: number;
  semChamados: boolean;
};

type SistemaResumo = {
  id: string;
  nome: string;
  totalChamados: number;
  percentual: number;
  tempoMedioMinutos: number | null;
  chamadosComTempo: number;
  scoreCriticidade: number;
};

type GraficoDistribuicaoSistemas = {
  labels: string[];
  valores: number[];
  total: number;
  semDados: boolean;
};

type AnaliseSistemas = {
  topSistemas: SistemaResumo[];
  tempoMedioSistemas: SistemaResumo[];
  distribuicao: GraficoDistribuicaoSistemas;
  sistemasCriticos: SistemaResumo[];
  totalConcluidos: number;
  totalChamadosComSistema: number;
  semDados: boolean;
  filtroLabel: string;
};

type SistemaAcumulado = {
  id: string;
  nome: string;
  totalChamados: number;
  totalTempoMinutos: number;
  chamadosComTempo: number;
};

type DashboardViewModel = {
  carregando: boolean;
  erro: string | null;
  anoSelecionado: AnoFiltro;
  anoSelecionadoLabel: string;
  anosDisponiveis: number[];
  anoMensalSelecionado: number;
  anosMensalDisponiveis: number[];
  cards: DashboardCards;
  totaisPorMesGraficoMensal: number[];
  totalPeriodoGraficoMensal: number;
  topEmpresas: EmpresaResumo[];
  topEmpresasPeriodo: TopEmpresasPeriodo;
  graficoDiario: GraficoDiario;
  analiseSistemas: AnaliseSistemas;
};

const ANO_TODOS: AnoFiltro = "__all__";

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./dashboard.component.html",
  styleUrl: "./dashboard.component.css",
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements AfterViewInit, OnDestroy {
  @ViewChild("monthlyChart") monthlyChartRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild("clientsChart") clientsChartRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild("dailyChart") dailyChartRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild("topSystemsChart") topSystemsChartRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild("avgSystemsChart") avgSystemsChartRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild("systemsDistributionChart") systemsDistributionChartRef?: ElementRef<HTMLCanvasElement>;

  readonly meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  readonly ANO_TODOS = ANO_TODOS;
  readonly periodosTopEmpresas: Array<{ value: TopEmpresasPeriodo; label: string }> = [
    { value: "todos", label: "Todos" },
    { value: "hoje", label: "Hoje" },
    { value: "ultimos7Dias", label: "Últimos 7 dias" },
    { value: "ultimoMes", label: "Último mês" }
  ];

  anoSelecionado: AnoFiltro = ANO_TODOS;
  anoMensalSelecionado = this.getCurrentYear();
  topEmpresasPeriodo: TopEmpresasPeriodo = "todos";
  anoDiarioSelecionado = this.getCurrentYear();
  mesDiarioSelecionado = this.getCurrentMonth();

  readonly vm$: Observable<DashboardViewModel>;

  private readonly anoSelecionadoSubject = new BehaviorSubject<AnoFiltro>(this.anoSelecionado);
  private readonly anoMensalSelecionadoSubject = new BehaviorSubject<number>(this.anoMensalSelecionado);
  private readonly topEmpresasPeriodoSubject = new BehaviorSubject<TopEmpresasPeriodo>(this.topEmpresasPeriodo);
  private readonly graficoDiarioFiltroSubject = new BehaviorSubject<{ ano: number; mes: number }>({
    ano: this.anoDiarioSelecionado,
    mes: this.mesDiarioSelecionado
  });

  private monthlyChart: Chart | null = null;
  private clientsChart: Chart | null = null;
  private dailyChart: Chart | null = null;
  private topSystemsChart: Chart | null = null;
  private avgSystemsChart: Chart | null = null;
  private systemsDistributionChart: Chart | null = null;
  private latestVm: DashboardViewModel | null = null;
  private chartReady = false;

  constructor(
    private readonly chamadosService: ChamadosService,
    private readonly sistemasService: SistemasService
  ) {
    this.vm$ = combineLatest([
      this.chamadosService.todosState$,
      this.sistemasService.sistemasState$,
      this.anoSelecionadoSubject,
      this.anoMensalSelecionadoSubject,
      this.topEmpresasPeriodoSubject,
      this.graficoDiarioFiltroSubject
    ]).pipe(
      map(
        ([
          chamadosState,
          sistemasState,
          anoSelecionado,
          anoMensalSelecionado,
          topEmpresasPeriodo,
          graficoDiarioFiltro
        ]) =>
          this.buildViewModel(
            chamadosState,
            sistemasState,
            anoSelecionado,
            anoMensalSelecionado,
            topEmpresasPeriodo,
            graficoDiarioFiltro
          )
      ),
      tap((vm) => {
        this.latestVm = vm;
        this.syncControles(vm);
        if (!this.chartReady) return;
        requestAnimationFrame(() => this.renderCharts());
      })
    );
  }

  ngAfterViewInit() {
    this.chartReady = true;
    this.renderCharts();
  }

  ngOnDestroy() {
    this.destroyCharts();
  }

  onAnoChange() {
    this.anoSelecionadoSubject.next(this.anoSelecionado);
  }

  onTopEmpresasPeriodoChange() {
    this.topEmpresasPeriodoSubject.next(this.topEmpresasPeriodo);
  }

  onAnoMensalChange() {
    this.anoMensalSelecionadoSubject.next(this.anoMensalSelecionado);
  }

  onGraficoDiarioFiltroChange() {
    this.graficoDiarioFiltroSubject.next({
      ano: this.anoDiarioSelecionado,
      mes: this.mesDiarioSelecionado
    });
  }

  formatTempoMedio(minutos: number | null | undefined): string {
    if (typeof minutos !== "number" || !Number.isFinite(minutos)) {
      return "Sem tempo";
    }

    const totalMinutos = Math.max(0, Math.round(minutos));
    if (totalMinutos < 60) {
      return `${totalMinutos} min`;
    }

    const horas = Math.floor(totalMinutos / 60);
    const minutosRestantes = totalMinutos % 60;
    return `${horas}h ${minutosRestantes.toString().padStart(2, "0")}m`;
  }

  formatPercentual(percentual: number): string {
    return `${percentual.toFixed(percentual >= 10 ? 0 : 1)}%`;
  }

  getDistribuicaoLegenda(distribuicao: GraficoDistribuicaoSistemas): Array<{
    cor: string;
    nome: string;
    percentual: string;
    valor: number;
  }> {
    if (distribuicao.semDados) {
      return [];
    }

    const cores = this.getPieColors(distribuicao.valores.length);
    return distribuicao.labels.map((nome, index) => {
      const valor = distribuicao.valores[index] ?? 0;
      const percentual = distribuicao.total > 0 ? (valor / distribuicao.total) * 100 : 0;

      return {
        cor: cores[index] ?? cores[0] ?? "#3b82f6",
        nome,
        percentual: this.formatPercentual(percentual),
        valor
      };
    });
  }

  private buildViewModel(
    chamadosState: DataState<Chamado[]>,
    sistemasState: DataState<Sistema[]>,
    anoSelecionado: AnoFiltro,
    anoMensalSelecionado: number,
    topEmpresasPeriodo: TopEmpresasPeriodo,
    graficoDiarioFiltro: { ano: number; mes: number }
  ): DashboardViewModel {
    const chamados = chamadosState.data;
    const sistemas = sistemasState.data;
    const anosDisponiveis = this.buildAvailableYears(chamados);
    const anoPrincipalResolvido = this.resolveAnoSelecionado(anoSelecionado, anosDisponiveis);
    const anoMensalResolvido = this.resolveAnoMensalSelecionado(anoMensalSelecionado, anosDisponiveis);
    const graficoDiarioResolvido = this.resolveGraficoDiarioFiltro(graficoDiarioFiltro, anosDisponiveis);

    const cards = this.buildCards(chamados, anoPrincipalResolvido);
    const totaisAnoMensal = this.buildMonthlyTotalsByYear(chamados, anoMensalResolvido);
    const topEmpresas = this.buildTopEmpresas(
      chamados,
      anoPrincipalResolvido,
      topEmpresasPeriodo
    );
    const analiseSistemas = this.buildAnaliseSistemas(
      chamados,
      sistemas,
      anoPrincipalResolvido
    );
    const graficoDiario = this.buildDailyTotalsByMonth(
      chamados,
      graficoDiarioResolvido.ano,
      graficoDiarioResolvido.mes
    );

    return {
      carregando: chamadosState.status === "loading" || sistemasState.status === "loading",
      erro: chamadosState.error || sistemasState.error,
      anoSelecionado: anoPrincipalResolvido,
      anoSelecionadoLabel:
        anoPrincipalResolvido === ANO_TODOS ? "Todos" : String(anoPrincipalResolvido),
      anosDisponiveis,
      anoMensalSelecionado: anoMensalResolvido,
      anosMensalDisponiveis: [...anosDisponiveis],
      cards,
      totaisPorMesGraficoMensal: totaisAnoMensal.totaisPorMes,
      totalPeriodoGraficoMensal: totaisAnoMensal.totalAno,
      topEmpresas,
      topEmpresasPeriodo,
      graficoDiario,
      analiseSistemas
    };
  }

  private buildCards(items: Chamado[], anoSelecionado: AnoFiltro): DashboardCards {
    const today = this.getToday();
    const [anoAtual, mesAtual, diaAtual] = today.split("-").map(Number);
    const mesAtualLabel = this.meses[mesAtual - 1];
    const anoBaseCardMes = anoSelecionado === ANO_TODOS ? anoAtual : anoSelecionado;
    const chamadosMesReferencia = items.filter((item) => {
      const data = item.data || "";
      if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) return false;
      const [ano, mes] = data.split("-").map(Number);
      return ano === anoBaseCardMes && mes === mesAtual;
    });

    let totalAnoSelecionado = 0;
    let totalHojeAnoSelecionado = 0;
    let abertosHojeAnoSelecionado = 0;
    let concluidosHojeAnoSelecionado = 0;
    let abertosAtuais = 0;
    let concluidosAtuais = 0;

    items.forEach((item) => {
      if (item.status === "aberto") abertosAtuais += 1;
      if (item.status === "concluido") concluidosAtuais += 1;

      const data = item.data || "";
      if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) return;

      const [ano, mes, dia] = data.split("-").map(Number);
      if (anoSelecionado !== ANO_TODOS && ano !== anoSelecionado) return;

      totalAnoSelecionado += 1;
      if (mes === mesAtual && dia === diaAtual) {
        totalHojeAnoSelecionado += 1;
        if (item.status === "aberto") abertosHojeAnoSelecionado += 1;
        if (item.status === "concluido") concluidosHojeAnoSelecionado += 1;
      }
    });

    const anoEhAtual = anoSelecionado === ANO_TODOS || anoSelecionado === anoAtual;
    const sufixoAno =
      anoSelecionado === ANO_TODOS ? "todos os anos" : String(anoSelecionado);
    const principalLabel = anoEhAtual ? "Chamados hoje" : "Chamados no ano";
    const principalValor = anoEhAtual ? totalHojeAnoSelecionado : totalAnoSelecionado;
    const principalNota = anoEhAtual
      ? `${abertosHojeAnoSelecionado} abertos / ${concluidosHojeAnoSelecionado} concluídos`
      : `Ano ${sufixoAno}`;

    return {
      principalLabel,
      principalValor,
      principalNota,
      mesLabel: `Chamados em ${mesAtualLabel}`,
      mesValor: chamadosMesReferencia.length,
      mesNota:
        anoSelecionado === ANO_TODOS
          ? "Mês de referência no ano atual"
          : "Mês de referência no ano selecionado",
      totalAnoLabel: anoSelecionado === ANO_TODOS ? "Total geral" : "Total do ano selecionado",
      totalAnoValor: totalAnoSelecionado,
      totalAnoNota:
        anoSelecionado === ANO_TODOS ? "Acumulado de todos os anos" : `Acumulado de ${anoSelecionado}`,
      abertosValor: abertosAtuais,
      abertosNota: `Concluídos atualmente: ${concluidosAtuais}`
    };
  }

  private buildMonthlyTotalsByYear(items: Chamado[], anoSelecionado: AnoFiltro): {
    totaisPorMes: number[];
    totalAno: number;
  } {
    const totaisPorMes = new Array(12).fill(0);
    let totalAno = 0;

    items.forEach((item) => {
      const data = item.data || "";
      if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) return;
      if (anoSelecionado !== ANO_TODOS && !data.startsWith(`${anoSelecionado}-`)) return;
      const mes = Number(data.slice(5, 7));
      const index = mes - 1;
      if (index < 0 || index > 11) return;
      totaisPorMes[index] += 1;
      totalAno += 1;
    });

    return { totaisPorMes, totalAno };
  }

  private buildTopEmpresas(
    items: Chamado[],
    anoSelecionado: AnoFiltro,
    periodo: TopEmpresasPeriodo
  ): EmpresaResumo[] {
    const today = this.getToday();
    const inicioUltimos7Dias = this.shiftDate(today, -6);
    const inicioUltimoMes = this.shiftDate(today, -29);
    const rankingMap = new Map<string, EmpresaResumo>();

    items.forEach((item) => {
      const data = item.data || "";
      if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) return;
      if (periodo !== "hoje" && anoSelecionado !== ANO_TODOS && !data.startsWith(`${anoSelecionado}-`)) return;
      if (!this.matchPeriodo(data, periodo, today, inicioUltimos7Dias, inicioUltimoMes)) return;

      if (!item.empresa?.trim()) return;

      const nomeEmpresa = item.empresa.trim();
      const key = this.normalizarTexto(nomeEmpresa);
      const atual = rankingMap.get(key) || { nome: nomeEmpresa, total: 0 };
      atual.total += 1;
      rankingMap.set(key, atual);
    });

    return Array.from(rankingMap.values())
      .sort((a, b) => b.total - a.total || a.nome.localeCompare(b.nome))
      .slice(0, 5);
  }

  private buildAnaliseSistemas(
    items: Chamado[],
    sistemas: Sistema[],
    anoSelecionado: AnoFiltro
  ): AnaliseSistemas {
    const sistemasMap = new Map(
      sistemas
        .filter((item): item is Sistema & { id: string } => !!item.id)
        .map((item) => [item.id, item.nome?.trim() || item.id])
    );
    const principalMap = new Map<string, SistemaAcumulado>();

    const concluidos = items.filter(
      (item) =>
        item.status === "concluido" &&
        !!item.contextoSistemaId?.trim() &&
        this.matchAnoFiltro(item, anoSelecionado)
    );

    concluidos.forEach((item) => {
      const sistemaPrincipalId = item.contextoSistemaId!.trim();
      const acumuladoPrincipal = this.getOrCreateSistemaAcumulado(
        principalMap,
        sistemaPrincipalId,
        sistemasMap
      );
      acumuladoPrincipal.totalChamados += 1;

      const tempoMinutos = this.getTempoAtendimentoMinutos(item);
      if (tempoMinutos != null) {
        acumuladoPrincipal.totalTempoMinutos += tempoMinutos;
        acumuladoPrincipal.chamadosComTempo += 1;
      }
    });

    const totalChamadosComSistema = Array.from(principalMap.values()).reduce(
      (acc, item) => acc + item.totalChamados,
      0
    );
    const base = Array.from(principalMap.values())
      .map((id) => {
        const totalChamados = id.totalChamados ?? 0;
        const chamadosComTempo = id.chamadosComTempo ?? 0;
        const tempoMedioMinutos =
          chamadosComTempo > 0 ? (id.totalTempoMinutos ?? 0) / chamadosComTempo : null;

        return {
          id: id.id,
          nome: this.resolveSistemaNome(id.id, sistemasMap),
          totalChamados,
          percentual:
            totalChamadosComSistema > 0
              ? (totalChamados / totalChamadosComSistema) * 100
              : 0,
          tempoMedioMinutos,
          chamadosComTempo,
          scoreCriticidade: totalChamados + (tempoMedioMinutos ?? 0)
        } satisfies SistemaResumo;
      })
      .filter((item) => item.totalChamados > 0 || item.chamadosComTempo > 0);

    const topSistemas = [...base]
      .sort((a, b) => b.totalChamados - a.totalChamados || a.nome.localeCompare(b.nome))
      .slice(0, 5);
    const tempoMedioSistemas = [...base]
      .filter((item) => item.tempoMedioMinutos != null)
      .sort(
        (a, b) =>
          (b.tempoMedioMinutos ?? 0) - (a.tempoMedioMinutos ?? 0) ||
          b.totalChamados - a.totalChamados ||
          a.nome.localeCompare(b.nome)
      )
      .slice(0, 5);
    const sistemasCriticos = [...base]
      .sort(
        (a, b) =>
          b.scoreCriticidade - a.scoreCriticidade ||
          b.totalChamados - a.totalChamados ||
          (b.tempoMedioMinutos ?? 0) - (a.tempoMedioMinutos ?? 0) ||
          a.nome.localeCompare(b.nome)
      )
      .slice(0, 5);

    return {
      topSistemas,
      tempoMedioSistemas,
      distribuicao: this.buildDistribuicaoSistemas(base),
      sistemasCriticos,
      totalConcluidos: concluidos.length,
      totalChamadosComSistema,
      semDados: concluidos.length === 0 || base.length === 0,
      filtroLabel:
        anoSelecionado === ANO_TODOS
          ? "Concluídos de todos os anos"
          : `Concluídos de ${anoSelecionado}`
    };
  }

  private buildDistribuicaoSistemas(items: SistemaResumo[]): GraficoDistribuicaoSistemas {
    const ordenados = [...items]
      .filter((item) => item.totalChamados > 0)
      .sort((a, b) => b.totalChamados - a.totalChamados || a.nome.localeCompare(b.nome));

    if (ordenados.length === 0) {
      return {
        labels: ["Sem dados"],
        valores: [1],
        total: 0,
        semDados: true
      };
    }

    const limite = 6;
    const principais = ordenados.slice(0, limite);
    const outros = ordenados.slice(limite);
    const totalOutros = outros.reduce((acc, item) => acc + item.totalChamados, 0);

    return {
      labels:
        totalOutros > 0
          ? [...principais.map((item) => item.nome), "Outros"]
          : principais.map((item) => item.nome),
      valores:
        totalOutros > 0
          ? [...principais.map((item) => item.totalChamados), totalOutros]
          : principais.map((item) => item.totalChamados),
      total: ordenados.reduce((acc, item) => acc + item.totalChamados, 0),
      semDados: false
    };
  }

  private matchPeriodo(
    data: string,
    periodo: TopEmpresasPeriodo,
    today: string,
    inicioUltimos7Dias: string,
    inicioUltimoMes: string
  ): boolean {
    switch (periodo) {
      case "hoje":
        return data === today;
      case "ultimos7Dias":
        return data >= inicioUltimos7Dias && data <= today;
      case "ultimoMes":
        return data >= inicioUltimoMes && data <= today;
      default:
        return true;
    }
  }

  private matchAnoFiltro(item: Chamado, anoSelecionado: AnoFiltro): boolean {
    if (anoSelecionado === ANO_TODOS) {
      return true;
    }

    const data = item.data || "";
    return /^\d{4}-\d{2}-\d{2}$/.test(data) && data.startsWith(`${anoSelecionado}-`);
  }

  private getTempoAtendimentoMinutos(item: Chamado): number | null {
    const valor = item.tempoAtendimentoMinutos ?? item.tempoAtendimento ?? null;
    return typeof valor === "number" && Number.isFinite(valor) ? valor : null;
  }

  private getOrCreateSistemaAcumulado(
    map: Map<string, SistemaAcumulado>,
    sistemaId: string,
    sistemasMap: Map<string, string>
  ): SistemaAcumulado {
    const atual = map.get(sistemaId);
    if (atual) {
      return atual;
    }

    const criado: SistemaAcumulado = {
      id: sistemaId,
      nome: this.resolveSistemaNome(sistemaId, sistemasMap),
      totalChamados: 0,
      totalTempoMinutos: 0,
      chamadosComTempo: 0
    };
    map.set(sistemaId, criado);
    return criado;
  }

  private resolveSistemaNome(sistemaId: string, sistemasMap: Map<string, string>): string {
    return sistemasMap.get(sistemaId)?.trim() || sistemaId;
  }

  private buildDailyTotalsByMonth(items: Chamado[], ano: number, mes: number): GraficoDiario {
    const totalDias = this.getDaysInMonth(ano, mes);
    const labels = Array.from({ length: totalDias }, (_, index) => index + 1);
    const totais = new Array(totalDias).fill(0);

    items.forEach((item) => {
      const data = item.data || "";
      if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) return;
      const [itemAno, itemMes, itemDia] = data.split("-").map(Number);
      if (itemAno !== ano || itemMes !== mes) return;
      if (itemDia < 1 || itemDia > totalDias) return;
      totais[itemDia - 1] += 1;
    });

    const totalMes = totais.reduce((acc, value) => acc + value, 0);
    return {
      ano,
      mes,
      mesLabel: this.meses[mes - 1],
      labels,
      totais,
      totalMes,
      semChamados: totalMes === 0
    };
  }

  private buildAvailableYears(items: Chamado[]): number[] {
    const years = new Set<number>();
    items.forEach((item) => {
      const data = item.data || "";
      if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) return;
      years.add(Number(data.slice(0, 4)));
    });

    const sorted = Array.from(years).sort((a, b) => b - a);
    if (sorted.length > 0) return sorted;
    return [this.getCurrentYear()];
  }

  private resolveAnoSelecionado(anoSelecionado: AnoFiltro, anosDisponiveis: number[]): AnoFiltro {
    if (anoSelecionado === ANO_TODOS) return ANO_TODOS;
    if (typeof anoSelecionado === "number" && anosDisponiveis.includes(anoSelecionado)) {
      return anoSelecionado;
    }
    return anosDisponiveis[0];
  }

  private resolveAnoMensalSelecionado(anoSelecionado: number, anosDisponiveis: number[]): number {
    if (anosDisponiveis.includes(anoSelecionado)) return anoSelecionado;
    const anoAtual = this.getCurrentYear();
    if (anosDisponiveis.includes(anoAtual)) return anoAtual;
    return anosDisponiveis[0];
  }

  private resolveGraficoDiarioFiltro(
    filtro: { ano: number; mes: number },
    anosDisponiveis: number[]
  ): { ano: number; mes: number } {
    const anoResolvido = this.resolveAnoSelecionado(filtro.ano, anosDisponiveis);
    const ano = typeof anoResolvido === "number" ? anoResolvido : anosDisponiveis[0];
    const mes = Math.min(12, Math.max(1, filtro.mes));
    return { ano, mes };
  }

  private getDaysInMonth(year: number, month: number): number {
    return new Date(year, month, 0).getDate();
  }

  private shiftDate(dateStr: string, deltaDias: number): string {
    const [year, month, day] = dateStr.split("-").map(Number);
    const dt = new Date(year, month - 1, day);
    dt.setDate(dt.getDate() + deltaDias);
    const local = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
  }

  private getCurrentYear(): number {
    return Number(this.getToday().slice(0, 4));
  }

  private getCurrentMonth(): number {
    return Number(this.getToday().slice(5, 7));
  }

  private getToday(): string {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
  }

  private normalizarTexto(value: string): string {
    return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }

  private syncControles(vm: DashboardViewModel) {
    if (this.anoSelecionado !== vm.anoSelecionado) {
      this.anoSelecionado = vm.anoSelecionado;
    }

    if (this.anoMensalSelecionado !== vm.anoMensalSelecionado) {
      this.anoMensalSelecionado = vm.anoMensalSelecionado;
    }

    if (this.topEmpresasPeriodo !== vm.topEmpresasPeriodo) {
      this.topEmpresasPeriodo = vm.topEmpresasPeriodo;
    }

    if (this.anoDiarioSelecionado !== vm.graficoDiario.ano) {
      this.anoDiarioSelecionado = vm.graficoDiario.ano;
    }

    if (this.mesDiarioSelecionado !== vm.graficoDiario.mes) {
      this.mesDiarioSelecionado = vm.graficoDiario.mes;
    }
  }

  private renderCharts() {
    if (!this.chartReady || !this.latestVm) return;
    if (
      !this.monthlyChartRef ||
      !this.clientsChartRef ||
      !this.dailyChartRef ||
      !this.topSystemsChartRef ||
      !this.avgSystemsChartRef ||
      !this.systemsDistributionChartRef
    ) {
      return;
    }

    const vm = this.latestVm;
    this.renderMonthlyChart(vm.totaisPorMesGraficoMensal);
    this.renderClientsChart(vm.topEmpresas);
    this.renderDailyChart(vm.graficoDiario.labels, vm.graficoDiario.totais);
    this.renderTopSystemsChart(vm.analiseSistemas.topSistemas);
    this.renderAvgSystemsChart(vm.analiseSistemas.tempoMedioSistemas);
    this.renderSystemsDistributionChart(vm.analiseSistemas.distribuicao);
  }

  private renderMonthlyChart(data: number[]) {
    const palette = this.getChartPalette();
    this.monthlyChart?.destroy();
    this.monthlyChart = new Chart(this.monthlyChartRef!.nativeElement, {
      type: "bar",
      data: {
        labels: this.meses,
        datasets: [
          {
            label: "Chamados por mês",
            data,
            borderRadius: 6,
            backgroundColor: palette.primary,
            hoverBackgroundColor: palette.primaryDark
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { precision: 0, color: palette.textMuted },
            grid: { color: palette.grid }
          },
          x: {
            ticks: { color: palette.textMuted },
            grid: { display: false }
          }
        }
      }
    });
  }

  private renderClientsChart(topEmpresas: EmpresaResumo[]) {
    const palette = this.getChartPalette();
    this.clientsChart?.destroy();
    const labels = topEmpresas.length
      ? topEmpresas.map((item) => item.nome)
      : ["1", "2", "3", "4", "5"];
    const values = topEmpresas.length ? topEmpresas.map((item) => item.total) : [0, 0, 0, 0, 0];

    this.clientsChart = new Chart(this.clientsChartRef!.nativeElement, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Chamados",
            data: values,
            borderRadius: 6,
            backgroundColor: palette.primaryLight,
            hoverBackgroundColor: palette.primary
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: "y",
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: { precision: 0, color: palette.textMuted },
            grid: { color: palette.grid }
          },
          y: {
            ticks: { color: palette.textMuted },
            grid: { display: false }
          }
        }
      }
    });
  }

  private renderDailyChart(labels: number[], data: number[]) {
    const palette = this.getChartPalette();
    this.dailyChart?.destroy();
    this.dailyChart = new Chart(this.dailyChartRef!.nativeElement, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Chamados por dia",
            data,
            borderRadius: 4,
            backgroundColor: palette.primary,
            hoverBackgroundColor: palette.primaryDark,
            maxBarThickness: 18
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { precision: 0, color: palette.textMuted },
            grid: { color: palette.grid }
          },
          x: {
            ticks: { color: palette.textMuted },
            grid: { display: false }
          }
        }
      }
    });
  }

  private renderTopSystemsChart(items: SistemaResumo[]) {
    const palette = this.getChartPalette();
    this.topSystemsChart?.destroy();

    const labels = items.length ? items.map((item) => item.nome) : ["Sem dados"];
    const values = items.length ? items.map((item) => item.totalChamados) : [0];

    this.topSystemsChart = new Chart(this.topSystemsChartRef!.nativeElement, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Chamados",
            data: values,
            borderRadius: 6,
            backgroundColor: palette.primaryLight,
            hoverBackgroundColor: palette.primary
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: "y",
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: { precision: 0, color: palette.textMuted },
            grid: { color: palette.grid }
          },
          y: {
            ticks: { color: palette.textMuted },
            grid: { display: false }
          }
        }
      }
    });
  }

  private renderAvgSystemsChart(items: SistemaResumo[]) {
    const palette = this.getChartPalette();
    this.avgSystemsChart?.destroy();

    const labels = items.length ? items.map((item) => item.nome) : ["Sem dados"];
    const values = items.length ? items.map((item) => Math.round(item.tempoMedioMinutos ?? 0)) : [0];

    this.avgSystemsChart = new Chart(this.avgSystemsChartRef!.nativeElement, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Tempo médio (min)",
            data: values,
            borderRadius: 6,
            backgroundColor: palette.warning,
            hoverBackgroundColor: palette.warningDark
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => `Tempo médio: ${this.formatTempoMedio(Number(context.raw) || 0)}`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: palette.textMuted,
              callback: (value) => `${value}m`
            },
            grid: { color: palette.grid }
          },
          x: {
            ticks: { color: palette.textMuted },
            grid: { display: false }
          }
        }
      }
    });
  }

  private renderSystemsDistributionChart(distribuicao: GraficoDistribuicaoSistemas) {
    const palette = this.getChartPalette();
    const backgroundColor = distribuicao.semDados
      ? [palette.neutral]
      : this.getPieColors(distribuicao.valores.length);

    this.systemsDistributionChart?.destroy();
    this.systemsDistributionChart = new Chart(this.systemsDistributionChartRef!.nativeElement, {
      type: "doughnut",
      data: {
        labels: distribuicao.labels,
        datasets: [
          {
            data: distribuicao.valores,
            backgroundColor,
            borderColor: "#ffffff",
            borderWidth: 3,
            spacing: 2,
            hoverOffset: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "74%",
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                if (distribuicao.semDados) {
                  return "Sem dados";
                }

                const total = distribuicao.valores.reduce((acc, value) => acc + value, 0);
                const valor = Number(context.raw) || 0;
                const percentual = total > 0 ? (valor / total) * 100 : 0;
                return `${context.label}: ${valor} (${this.formatPercentual(percentual)})`;
              }
            }
          }
        }
      }
    });
  }

  private getChartPalette() {
    const styles = getComputedStyle(document.documentElement);
    return {
      primary: styles.getPropertyValue("--primary-500").trim() || "#3b82f6",
      primaryDark: styles.getPropertyValue("--primary-600").trim() || "#2563eb",
      primaryLight: styles.getPropertyValue("--primary-400").trim() || "#60a5fa",
      warning: styles.getPropertyValue("--warning-500").trim() || "#f59e0b",
      warningDark: styles.getPropertyValue("--warning-600").trim() || "#d97706",
      neutral: styles.getPropertyValue("--border-color").trim() || "#cbd5e1",
      textMuted: styles.getPropertyValue("--text-muted").trim() || "#64748b",
      grid: "rgba(148, 163, 184, 0.22)"
    };
  }

  private getPieColors(total: number): string[] {
    const styles = getComputedStyle(document.documentElement);
    const palette = [
      styles.getPropertyValue("--primary-500").trim() || "#3b82f6",
      styles.getPropertyValue("--primary-400").trim() || "#60a5fa",
      styles.getPropertyValue("--success-500").trim() || "#22c55e",
      styles.getPropertyValue("--warning-500").trim() || "#f59e0b",
      "#0ea5e9",
      "#14b8a6",
      "#f97316"
    ];

    return Array.from({ length: total }, (_, index) => palette[index % palette.length]);
  }

  private destroyCharts() {
    this.monthlyChart?.destroy();
    this.clientsChart?.destroy();
    this.dailyChart?.destroy();
    this.topSystemsChart?.destroy();
    this.avgSystemsChart?.destroy();
    this.systemsDistributionChart?.destroy();
    this.monthlyChart = null;
    this.clientsChart = null;
    this.dailyChart = null;
    this.topSystemsChart = null;
    this.avgSystemsChart = null;
    this.systemsDistributionChart = null;
  }
}
