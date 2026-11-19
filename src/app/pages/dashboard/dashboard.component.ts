import { CommonModule } from "@angular/common";
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
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
import { DashboardFilterService } from "../../services/dashboard-filter.service";

type TopEmpresasPeriodo = "todos" | "ultimoMes" | "ultimos7Dias" | "hoje";
type AnoFiltro = number | "__all__";

type EmpresaResumo = {
  nome: string;
  total: number;
};

type CrescimentoEmpresa = {
  nome: string;
  anterior: number;
  atual: number;
  percentual: number;
};

type DashboardCards = {
  principalLabel: string;
  principalValor: number;
  principalNota: string;
  mesLabel: string;
  mesValor: number;
  mesVariacao: number | null;
  mesNota: string;
  totalAnoLabel: string;
  totalAnoValor: number;
  totalAnoNota: string;
  rankingCrescimento: CrescimentoEmpresa[];
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
  nome: string;
  totalChamados: number;
};

type AnaliseSistemas = {
  topSistemas: SistemaResumo[];
  totalChamadosComSistema: number;
  filtroLabel: string;
};

type DemandaRecente = {
  porDiaDaSemana: { nome: string; total: number; largura: number }[];
  motivosRecorrentes: { nome: string; total: number }[];
  total: number;
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
  demandaRecente: DemandaRecente;
};

const ANO_TODOS: AnoFiltro = "__all__";
const FORMATO_CRESCIMENTO = new Intl.NumberFormat("pt-BR", {
  style: "percent",
  signDisplay: "always",
  maximumFractionDigits: 2
});

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./dashboard.component.html",
  styleUrl: "./dashboard.component.css",
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements AfterViewInit, OnDestroy {
  @ViewChild("growthCard") private growthCard?: ElementRef<HTMLElement>;
  @ViewChild("growthTrigger") private growthTrigger?: ElementRef<HTMLButtonElement>;
  @ViewChild("monthlyChart") monthlyChartRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild("clientsChart") clientsChartRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild("dailyChart") dailyChartRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild("topSystemsChart") topSystemsChartRef?: ElementRef<HTMLCanvasElement>;

  readonly meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  readonly periodosTopEmpresas: Array<{ value: TopEmpresasPeriodo; label: string }> = [
    { value: "todos", label: "Todos" },
    { value: "hoje", label: "Hoje" },
    { value: "ultimos7Dias", label: "Últimos 7 dias" },
    { value: "ultimoMes", label: "Último mês" }
  ];

  anoMensalSelecionado = this.getCurrentYear();
  topEmpresasPeriodo: TopEmpresasPeriodo = "todos";
  anoDiarioSelecionado = this.getCurrentYear();
  mesDiarioSelecionado = this.getCurrentMonth();
  rankingCrescimentoAberto = false;

  readonly vm$: Observable<DashboardViewModel>;

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
  private latestVm: DashboardViewModel | null = null;
  private chartReady = false;

  constructor(
    private readonly chamadosService: ChamadosService,
    private readonly sistemasService: SistemasService,
    private readonly dashboardFilter: DashboardFilterService
  ) {
    this.vm$ = combineLatest([
      this.chamadosService.todosState$,
      this.sistemasService.sistemasState$,
      this.dashboardFilter.anoSelecionado$,
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
      analiseSistemas,
      demandaRecente: this.buildDemandaRecente(chamados, this.getToday())
    };
  }

  private buildCards(items: Chamado[], anoSelecionado: AnoFiltro): DashboardCards {
    const today = this.getToday();
    const [anoAtual, mesAtual, diaAtual] = today.split("-").map(Number);
    const mesAtualLabel = this.meses[mesAtual - 1];
    const anoBaseCardMes = typeof anoSelecionado === "number" ? anoSelecionado : anoAtual;
    const mesAnterior = mesAtual === 1 ? 12 : mesAtual - 1;
    const anoMesAnterior = mesAtual === 1 ? anoBaseCardMes - 1 : anoBaseCardMes;
    const diaLimiteAtual = Math.min(diaAtual, this.getDaysInMonth(anoBaseCardMes, mesAtual));
    const diaLimiteAnterior = Math.min(diaAtual, this.getDaysInMonth(anoMesAnterior, mesAnterior));
    const periodoAtual = `${diaLimiteAtual}/${mesAtualLabel}`;
    const periodoAnterior = `${diaLimiteAnterior}/${this.meses[mesAnterior - 1]}`;
    const anoReferenciaLabel = anoBaseCardMes === anoAtual ? "" : ` · ${anoBaseCardMes}`;
    let totalMesReferencia = 0;
    let totalMesAnterior = 0;

    let totalAnoSelecionado = 0;
    let totalHojeAnoSelecionado = 0;
    let abertosHojeAnoSelecionado = 0;
    let concluidosHojeAnoSelecionado = 0;

    items.forEach((item) => {
      const data = item.data || "";
      if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) return;

      const [ano, mes, dia] = data.split("-").map(Number);
      if (dia < 1) return;
      if (ano === anoBaseCardMes && mes === mesAtual && dia <= diaLimiteAtual) {
        totalMesReferencia += 1;
      }
      if (ano === anoMesAnterior && mes === mesAnterior && dia <= diaLimiteAnterior) {
        totalMesAnterior += 1;
      }
      if (anoSelecionado !== ANO_TODOS && ano !== anoSelecionado) return;

      totalAnoSelecionado += 1;
      if (ano === anoAtual && mes === mesAtual && dia === diaAtual) {
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
      mesValor: totalMesReferencia,
      mesVariacao: totalMesAnterior > 0 ? (totalMesReferencia - totalMesAnterior) / totalMesAnterior : null,
      mesNota: `Até ${periodoAtual} · ${totalMesAnterior} até ${periodoAnterior}${anoReferenciaLabel}`,
      totalAnoLabel: anoSelecionado === ANO_TODOS ? "Total geral" : "Total do ano selecionado",
      totalAnoValor: totalAnoSelecionado,
      totalAnoNota:
        anoSelecionado === ANO_TODOS ? "Acumulado de todos os anos" : `Acumulado de ${anoSelecionado}`,
      rankingCrescimento: this.buildRankingCrescimento(items, today)
    };
  }

  formatarCrescimento(percentual: number): string {
    return FORMATO_CRESCIMENTO.format(percentual);
  }

  @HostListener("document:click", ["$event"])
  fecharRankingAoClicarFora(event: MouseEvent) {
    if (
      this.rankingCrescimentoAberto &&
      event.target instanceof Node &&
      !this.growthCard?.nativeElement.contains(event.target)
    ) {
      this.rankingCrescimentoAberto = false;
    }
  }

  @HostListener("document:keydown.escape")
  fecharRankingComEscape() {
    if (!this.rankingCrescimentoAberto) return;
    this.rankingCrescimentoAberto = false;
    this.growthTrigger?.nativeElement.focus();
  }

  private buildRankingCrescimento(items: Chamado[], hoje: string): CrescimentoEmpresa[] {
    const dataComparacao = this.shiftDate(hoje, -7);
    const totais = new Map<string, Omit<CrescimentoEmpresa, "percentual">>();

    for (const item of items) {
      const data = item.data || "";
      const nome = item.empresa?.trim();
      if (!nome || !/^\d{4}-\d{2}-\d{2}$/.test(data) || data > hoje) {
        continue;
      }

      const chave = this.normalizarTexto(nome);
      const empresa = totais.get(chave) ?? { nome, anterior: 0, atual: 0 };
      empresa.atual += 1;
      if (data <= dataComparacao) {
        empresa.anterior += 1;
      }
      totais.set(chave, empresa);
    }

    const ranking: CrescimentoEmpresa[] = [];
    for (const empresa of totais.values()) {
      if (empresa.anterior === 0 || empresa.atual <= empresa.anterior) continue;
      const percentual = (empresa.atual - empresa.anterior) / empresa.atual;
      ranking.push({ ...empresa, percentual });
    }
    return ranking
      .sort((a, b) => b.percentual - a.percentual || b.atual - a.atual)
      .slice(0, 5);
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
    const principalMap = new Map<string, number>();
    let totalChamadosComSistema = 0;

    for (const item of items) {
      const sistemaId = item.contextoSistemaId?.trim();
      if (item.status !== "concluido" || !sistemaId || !this.matchAnoFiltro(item, anoSelecionado)) continue;
      principalMap.set(sistemaId, (principalMap.get(sistemaId) ?? 0) + 1);
      totalChamadosComSistema += 1;
    }

    const topSistemas = Array.from(principalMap, ([id, totalChamados]) => ({
      nome: sistemasMap.get(id) ?? id,
      totalChamados
    }))
      .sort((a, b) => b.totalChamados - a.totalChamados || a.nome.localeCompare(b.nome))
      .slice(0, 5);

    return {
      topSistemas,
      totalChamadosComSistema,
      filtroLabel: anoSelecionado === ANO_TODOS ? "Concluídos de todos os anos" : `Concluídos de ${anoSelecionado}`
    };
  }

  private buildDemandaRecente(items: Chamado[], hoje: string): DemandaRecente {
    const inicio = this.shiftDate(hoje, -28);
    const dias = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const totaisPorDia = dias.map(() => 0);
    const motivos = new Map<string, { nome: string; total: number }>();
    let total = 0;

    for (const item of items) {
      const data = item.data || "";
      if (item.status !== "concluido" || !/^\d{4}-\d{2}-\d{2}$/.test(data) || data < inicio || data >= hoje) continue;
      const dia = new Date(data);
      if (!Number.isFinite(dia.getTime()) || dia.toISOString().slice(0, 10) !== data) continue;
      totaisPorDia[dia.getUTCDay()] += 1;
      total += 1;

      const nome = item.motivo?.trim().replace(/\s+/g, " ");
      if (!nome) continue;
      const chave = this.normalizarTexto(nome);
      const motivo = motivos.get(chave) ?? { nome, total: 0 };
      motivo.total += 1;
      motivos.set(chave, motivo);
    }

    const maiorTotal = Math.max(1, ...totaisPorDia);
    return {
      total,
      porDiaDaSemana: [1, 2, 3, 4, 5, 6, 0].map((dia) => ({
        nome: dias[dia],
        total: totaisPorDia[dia],
        largura: (totaisPorDia[dia] / maiorTotal) * 100
      })),
      motivosRecorrentes: Array.from(motivos.values())
        .filter((motivo) => motivo.total > 1)
        .sort((a, b) => b.total - a.total || a.nome.localeCompare(b.nome))
        .slice(0, 5)
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
      !this.topSystemsChartRef
    ) {
      return;
    }

    const vm = this.latestVm;
    this.renderMonthlyChart(vm.totaisPorMesGraficoMensal);
    this.renderClientsChart(vm.topEmpresas);
    this.renderDailyChart(vm.graficoDiario.labels, vm.graficoDiario.totais);
    this.renderTopSystemsChart(vm.analiseSistemas.topSistemas);
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
            ticks: { stepSize: 50, autoSkip: false, maxTicksLimit: 1000, precision: 0, color: palette.textMuted },
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
            ticks: { stepSize: 2, autoSkip: false, maxTicksLimit: 1000, precision: 0, color: palette.textMuted },
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

  private getChartPalette() {
    const styles = getComputedStyle(document.documentElement);
    return {
      primary: styles.getPropertyValue("--primary-500").trim() || "#3b82f6",
      primaryDark: styles.getPropertyValue("--primary-600").trim() || "#2563eb",
      primaryLight: styles.getPropertyValue("--primary-400").trim() || "#60a5fa",
      textMuted: styles.getPropertyValue("--text-muted").trim() || "#64748b",
      grid: "rgba(148, 163, 184, 0.22)"
    };
  }

  private destroyCharts() {
    this.monthlyChart?.destroy();
    this.clientsChart?.destroy();
    this.dailyChart?.destroy();
    this.topSystemsChart?.destroy();
    this.monthlyChart = null;
    this.clientsChart = null;
    this.dailyChart = null;
    this.topSystemsChart = null;
  }
}
