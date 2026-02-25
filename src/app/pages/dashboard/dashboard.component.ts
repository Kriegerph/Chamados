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
import { Cliente } from "../../models/cliente.model";
import { DataState } from "../../models/data-state.model";
import { ChamadosService } from "../../services/chamados.service";
import { ClientesService } from "../../services/clientes.service";

type TopClientesPeriodo = "todos" | "ultimoMes" | "ultimos7Dias" | "hoje";
type AnoFiltro = number | "__all__";

type ClienteResumo = {
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
  topClientes: ClienteResumo[];
  topClientesPeriodo: TopClientesPeriodo;
  graficoDiario: GraficoDiario;
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

  readonly meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  readonly ANO_TODOS = ANO_TODOS;
  readonly periodosTopClientes: Array<{ value: TopClientesPeriodo; label: string }> = [
    { value: "todos", label: "Todos" },
    { value: "ultimoMes", label: "Ultimo mes" },
    { value: "ultimos7Dias", label: "Ultimos 7 dias" },
    { value: "hoje", label: "Hoje" }
  ];

  anoSelecionado: AnoFiltro = ANO_TODOS;
  anoMensalSelecionado = this.getCurrentYear();
  topClientesPeriodo: TopClientesPeriodo = "todos";
  anoDiarioSelecionado = this.getCurrentYear();
  mesDiarioSelecionado = this.getCurrentMonth();

  readonly vm$: Observable<DashboardViewModel>;

  private readonly anoSelecionadoSubject = new BehaviorSubject<AnoFiltro>(this.anoSelecionado);
  private readonly anoMensalSelecionadoSubject = new BehaviorSubject<number>(this.anoMensalSelecionado);
  private readonly topClientesPeriodoSubject = new BehaviorSubject<TopClientesPeriodo>(this.topClientesPeriodo);
  private readonly graficoDiarioFiltroSubject = new BehaviorSubject<{ ano: number; mes: number }>({
    ano: this.anoDiarioSelecionado,
    mes: this.mesDiarioSelecionado
  });

  private monthlyChart: Chart | null = null;
  private clientsChart: Chart | null = null;
  private dailyChart: Chart | null = null;
  private latestVm: DashboardViewModel | null = null;
  private chartReady = false;

  constructor(
    private readonly chamadosService: ChamadosService,
    private readonly clientesService: ClientesService
  ) {
    this.vm$ = combineLatest([
      this.chamadosService.todosState$,
      this.clientesService.clientesState$,
      this.anoSelecionadoSubject,
      this.anoMensalSelecionadoSubject,
      this.topClientesPeriodoSubject,
      this.graficoDiarioFiltroSubject
    ]).pipe(
      map(([chamadosState, clientesState, anoSelecionado, anoMensalSelecionado, topClientesPeriodo, graficoDiarioFiltro]) =>
        this.buildViewModel(
          chamadosState,
          clientesState,
          anoSelecionado,
          anoMensalSelecionado,
          topClientesPeriodo,
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

  onTopClientesPeriodoChange() {
    this.topClientesPeriodoSubject.next(this.topClientesPeriodo);
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

  private buildViewModel(
    chamadosState: DataState<Chamado[]>,
    clientesState: DataState<Cliente[]>,
    anoSelecionado: AnoFiltro,
    anoMensalSelecionado: number,
    topClientesPeriodo: TopClientesPeriodo,
    graficoDiarioFiltro: { ano: number; mes: number }
  ): DashboardViewModel {
    const chamados = chamadosState.data;
    const anosDisponiveis = this.buildAvailableYears(chamados);
    const anoPrincipalResolvido = this.resolveAnoSelecionado(anoSelecionado, anosDisponiveis);
    const anoMensalResolvido = this.resolveAnoMensalSelecionado(anoMensalSelecionado, anosDisponiveis);
    const graficoDiarioResolvido = this.resolveGraficoDiarioFiltro(graficoDiarioFiltro, anosDisponiveis);

    const clientesMap = new Map(
      clientesState.data
        .filter((cliente) => !!cliente.id)
        .map((cliente) => [cliente.id as string, cliente])
    );

    const cards = this.buildCards(chamados, anoPrincipalResolvido);
    const totaisAnoMensal = this.buildMonthlyTotalsByYear(chamados, anoMensalResolvido);
    const topClientes = this.buildTopClientes(
      chamados,
      clientesMap,
      anoPrincipalResolvido,
      topClientesPeriodo
    );
    const graficoDiario = this.buildDailyTotalsByMonth(
      chamados,
      graficoDiarioResolvido.ano,
      graficoDiarioResolvido.mes
    );

    return {
      carregando: chamadosState.status === "loading" || clientesState.status === "loading",
      erro: chamadosState.error || clientesState.error,
      anoSelecionado: anoPrincipalResolvido,
      anoSelecionadoLabel:
        anoPrincipalResolvido === ANO_TODOS ? "Todos" : String(anoPrincipalResolvido),
      anosDisponiveis,
      anoMensalSelecionado: anoMensalResolvido,
      anosMensalDisponiveis: [...anosDisponiveis],
      cards,
      totaisPorMesGraficoMensal: totaisAnoMensal.totaisPorMes,
      totalPeriodoGraficoMensal: totaisAnoMensal.totalAno,
      topClientes,
      topClientesPeriodo,
      graficoDiario
    };
  }

  private buildCards(items: Chamado[], anoSelecionado: AnoFiltro): DashboardCards {
    const today = this.getToday();
    const [anoAtual, mesAtual, diaAtual] = today.split("-").map(Number);
    const mesAtualLabel = this.meses[mesAtual - 1];

    let totalAnoSelecionado = 0;
    let totalMesAtualAnoSelecionado = 0;
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
      if (mes === mesAtual) totalMesAtualAnoSelecionado += 1;
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
      ? `${abertosHojeAnoSelecionado} abertos / ${concluidosHojeAnoSelecionado} concluidos`
      : `Ano ${sufixoAno}`;

    return {
      principalLabel,
      principalValor,
      principalNota,
      mesLabel: `Chamados em ${mesAtualLabel} (${sufixoAno})`,
      mesValor: totalMesAtualAnoSelecionado,
      mesNota: "Mes de referencia no ano selecionado",
      totalAnoLabel: anoSelecionado === ANO_TODOS ? "Total geral" : "Total do ano selecionado",
      totalAnoValor: totalAnoSelecionado,
      totalAnoNota:
        anoSelecionado === ANO_TODOS ? "Acumulado de todos os anos" : `Acumulado de ${anoSelecionado}`,
      abertosValor: abertosAtuais,
      abertosNota: `Concluidos atualmente: ${concluidosAtuais}`
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

  private buildTopClientes(
    items: Chamado[],
    clientesMap: Map<string, Cliente>,
    anoSelecionado: AnoFiltro,
    periodo: TopClientesPeriodo
  ): ClienteResumo[] {
    const today = this.getToday();
    const inicioUltimos7Dias = this.shiftDate(today, -6);
    const inicioUltimoMes = this.shiftDate(today, -29);
    const rankingMap = new Map<string, ClienteResumo>();

    items.forEach((item) => {
      const data = item.data || "";
      if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) return;
      if (anoSelecionado !== ANO_TODOS && !data.startsWith(`${anoSelecionado}-`)) return;
      if (!this.matchPeriodo(data, periodo, today, inicioUltimos7Dias, inicioUltimoMes)) return;

      const nomeCliente = this.getClienteLabel(item, clientesMap);
      const key = item.clienteId ? `id:${item.clienteId}` : `nome:${nomeCliente}`;
      const atual = rankingMap.get(key) || { nome: nomeCliente, total: 0 };
      atual.total += 1;
      rankingMap.set(key, atual);
    });

    return Array.from(rankingMap.values())
      .sort((a, b) => b.total - a.total || a.nome.localeCompare(b.nome))
      .slice(0, 5);
  }

  private matchPeriodo(
    data: string,
    periodo: TopClientesPeriodo,
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

  private getClienteLabel(item: Chamado, clientesMap: Map<string, Cliente>): string {
    if (item.clienteNome) return item.clienteNome;
    if (item.clienteId) {
      const nome = clientesMap.get(item.clienteId)?.nome;
      if (nome) return nome;
    }
    return item.cliente || "Sem cliente";
  }

  private syncControles(vm: DashboardViewModel) {
    if (this.anoSelecionado !== vm.anoSelecionado) {
      this.anoSelecionado = vm.anoSelecionado;
    }

    if (this.anoMensalSelecionado !== vm.anoMensalSelecionado) {
      this.anoMensalSelecionado = vm.anoMensalSelecionado;
    }

    if (this.topClientesPeriodo !== vm.topClientesPeriodo) {
      this.topClientesPeriodo = vm.topClientesPeriodo;
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
    if (!this.monthlyChartRef || !this.clientsChartRef || !this.dailyChartRef) return;

    const vm = this.latestVm;
    this.renderMonthlyChart(vm.totaisPorMesGraficoMensal);
    this.renderClientsChart(vm.topClientes);
    this.renderDailyChart(vm.graficoDiario.labels, vm.graficoDiario.totais);
  }

  private renderMonthlyChart(data: number[]) {
    this.monthlyChart?.destroy();
    this.monthlyChart = new Chart(this.monthlyChartRef!.nativeElement, {
      type: "bar",
      data: {
        labels: this.meses,
        datasets: [
          {
            label: "Chamados por mes",
            data,
            borderRadius: 6,
            backgroundColor: "#4a81ea",
            hoverBackgroundColor: "#2f67cf"
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
            ticks: { precision: 0 }
          },
          x: {
            grid: { display: false }
          }
        }
      }
    });
  }

  private renderClientsChart(topClientes: ClienteResumo[]) {
    this.clientsChart?.destroy();
    const labels = topClientes.length ? topClientes.map((item) => item.nome) : ["Sem dados"];
    const values = topClientes.length ? topClientes.map((item) => item.total) : [0];

    this.clientsChart = new Chart(this.clientsChartRef!.nativeElement, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Chamados",
            data: values,
            borderRadius: 6,
            backgroundColor: "#6fa0ff",
            hoverBackgroundColor: "#4a81ea"
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
            ticks: { precision: 0 }
          },
          y: {
            grid: { display: false }
          }
        }
      }
    });
  }

  private renderDailyChart(labels: number[], data: number[]) {
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
            backgroundColor: "#3f76dc",
            hoverBackgroundColor: "#2f67cf",
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
            ticks: { precision: 0 }
          },
          x: {
            grid: { display: false }
          }
        }
      }
    });
  }

  private destroyCharts() {
    this.monthlyChart?.destroy();
    this.clientsChart?.destroy();
    this.dailyChart?.destroy();
    this.monthlyChart = null;
    this.clientsChart = null;
    this.dailyChart = null;
  }
}
