import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BehaviorSubject, combineLatest, map, Observable, tap } from "rxjs";
import { Chamado, DashboardStats } from "../../models/chamado.model";
import { Cliente } from "../../models/cliente.model";
import { DataState } from "../../models/data-state.model";
import { ChamadosService } from "../../services/chamados.service";
import { ClientesService } from "../../services/clientes.service";

type RankingItem = {
  nome: string;
  total: number;
  abertos: number;
  concluidos: number;
};

type RankingFilters = {
  periodo: "hoje" | "7dias" | "mes" | "ano" | "todos";
  status: "todos" | "concluidos";
};

type DashboardViewModel = {
  carregando: boolean;
  erro: string | null;
  stats: DashboardStats;
  ranking: RankingItem[];
  clientesTotal: number;
  anoSelecionado: number;
  anosDisponiveis: number[];
  totaisPorMesAnoSelecionado: number[];
  totalAnoSelecionado: number;
  semChamadosNoAnoSelecionado: boolean;
};

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./dashboard.component.html",
  styleUrl: "./dashboard.component.css"
})
export class DashboardComponent {
  rankingPeriodo: "hoje" | "7dias" | "mes" | "ano" | "todos" = "todos";
  rankingStatus: "todos" | "concluidos" = "todos";
  anoSelecionado = this.getCurrentYear();
  anosDisponiveis: number[] = this.buildFallbackYears(this.anoSelecionado, 5);

  readonly meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

  private readonly rankingFiltersSubject = new BehaviorSubject<RankingFilters>({
    periodo: "todos",
    status: "todos"
  });
  private readonly anoSelecionadoSubject = new BehaviorSubject<number>(this.anoSelecionado);

  readonly vm$: Observable<DashboardViewModel>;

  constructor(
    private readonly chamadosService: ChamadosService,
    private readonly clientesService: ClientesService
  ) {
    this.vm$ = combineLatest([
      this.chamadosService.todosState$,
      this.clientesService.clientesState$,
      this.rankingFiltersSubject,
      this.anoSelecionadoSubject
    ]).pipe(
      map(([chamadosState, clientesState, rankingFilters, anoSelecionado]) =>
        this.buildViewModel(chamadosState, clientesState, rankingFilters, anoSelecionado)
      ),
      tap((vm) => {
        this.anosDisponiveis = vm.anosDisponiveis;
      })
    );
  }

  atualizar() {
    this.rankingFiltersSubject.next({
      periodo: this.rankingPeriodo,
      status: this.rankingStatus
    });
    this.anoSelecionadoSubject.next(this.anoSelecionado);
  }

  onAnoChange() {
    this.anoSelecionadoSubject.next(this.anoSelecionado);
  }

  private buildViewModel(
    chamadosState: DataState<Chamado[]>,
    clientesState: DataState<Cliente[]>,
    rankingFilters: RankingFilters,
    anoSelecionado: number
  ): DashboardViewModel {
    const clientesMap = new Map(
      clientesState.data
        .filter((item) => !!item.id)
        .map((item) => [item.id as string, item])
    );
    const stats = this.buildStats(chamadosState.data);
    const ranking = this.buildRanking(chamadosState.data, clientesMap, rankingFilters);
    const anosDisponiveis = this.buildAvailableYears(chamadosState.data, anoSelecionado);
    const resumoAnoSelecionado = this.buildMonthlyTotalsByYear(chamadosState.data, anoSelecionado);

    return {
      carregando: chamadosState.status === "loading" || clientesState.status === "loading",
      erro: chamadosState.error || clientesState.error,
      stats,
      ranking,
      clientesTotal: clientesState.data.length,
      anoSelecionado,
      anosDisponiveis,
      totaisPorMesAnoSelecionado: resumoAnoSelecionado.totaisPorMes,
      totalAnoSelecionado: resumoAnoSelecionado.totalAno,
      semChamadosNoAnoSelecionado: resumoAnoSelecionado.totalAno === 0
    };
  }

  private buildStats(items: Chamado[]): DashboardStats {
    const today = this.getToday();
    const year = today.slice(0, 4);
    const month = today.slice(5, 7);
    const startYear = `${year}-01-01`;
    const endYear = `${year}-12-31`;
    const monthNum = Number(month);
    const lastDay = String(new Date(Number(year), monthNum, 0).getDate()).padStart(2, "0");
    const startMonth = `${year}-${month}-01`;
    const endMonth = `${year}-${month}-${lastDay}`;

    let totalGeral = 0;
    let totalAno = 0;
    let totalMes = 0;
    let abertosHoje = 0;
    let concluidosHoje = 0;
    const totaisPorMes = new Array(12).fill(0);

    items.forEach((item) => {
      totalGeral += 1;
      const data = item.data;
      if (data) {
        if (data >= startYear && data <= endYear) {
          totalAno += 1;
          const idx = Number(data.slice(5, 7)) - 1;
          if (idx >= 0 && idx < 12) totaisPorMes[idx] += 1;
        }
        if (data >= startMonth && data <= endMonth) {
          totalMes += 1;
        }
        if (data === today) {
          if (item.status === "aberto") abertosHoje += 1;
          if (item.status === "concluido") concluidosHoje += 1;
        }
      }
    });

    return {
      totalGeral,
      totalAno,
      totalMes,
      totalDia: abertosHoje + concluidosHoje,
      abertosHoje,
      concluidosHoje,
      totaisPorMes
    };
  }

  private buildMonthlyTotalsByYear(items: Chamado[], anoSelecionado: number): {
    totaisPorMes: number[];
    totalAno: number;
  } {
    const prefixoAno = `${anoSelecionado}-`;
    const totaisPorMes = new Array(12).fill(0);
    let totalAno = 0;

    items.forEach((item) => {
      const data = item.data || "";
      if (!data.startsWith(prefixoAno)) return;
      const mes = Number(data.slice(5, 7));
      const idx = mes - 1;
      if (idx < 0 || idx > 11) return;
      totaisPorMes[idx] += 1;
      totalAno += 1;
    });

    return { totaisPorMes, totalAno };
  }

  private buildAvailableYears(items: Chamado[], anoSelecionado: number): number[] {
    const anoAtual = this.getCurrentYear();
    const years = new Set<number>([anoAtual, anoSelecionado]);

    items.forEach((item) => {
      const data = item.data || "";
      if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) return;
      const year = Number(data.slice(0, 4));
      if (year > 0) years.add(year);
    });

    if (years.size < 5) {
      this.buildFallbackYears(anoAtual, 5).forEach((year) => years.add(year));
    }

    return Array.from(years).sort((a, b) => b - a);
  }

  private buildFallbackYears(baseYear: number, total: number): number[] {
    const years: number[] = [];
    for (let i = 0; i < total; i += 1) {
      years.push(baseYear - i);
    }
    return years;
  }

  private getCurrentYear(): number {
    return Number(this.getToday().slice(0, 4));
  }

  private getToday(): string {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
  }

  private buildRanking(
    items: Chamado[],
    clientesMap: Map<string, Cliente>,
    rankingFilters: RankingFilters
  ): RankingItem[] {
    const today = this.getToday();
    const year = today.slice(0, 4);
    const month = today.slice(5, 7);
    const startYear = `${year}-01-01`;
    const endYear = `${year}-12-31`;
    const monthNum = Number(month);
    const lastDay = String(new Date(Number(year), monthNum, 0).getDate()).padStart(2, "0");
    const startMonth = `${year}-${month}-01`;
    const endMonth = `${year}-${month}-${lastDay}`;
    const start7Dias = this.shiftDate(today, -6);

    const rankingMap = new Map<string, RankingItem>();
    items.forEach((item) => {
      if (!this.matchPeriodo(item.data, today, start7Dias, startMonth, endMonth, startYear, endYear, rankingFilters.periodo)) {
        return;
      }
      if (rankingFilters.status === "concluidos" && item.status !== "concluido") return;
      const nome = this.getClienteLabel(item, clientesMap);
      const key = item.clienteId ? `id:${item.clienteId}` : `nome:${nome}`;
      const entry = rankingMap.get(key) || {
        nome: nome || "Sem cliente",
        total: 0,
        abertos: 0,
        concluidos: 0
      };
      entry.total += 1;
      if (item.status === "aberto") entry.abertos += 1;
      if (item.status === "concluido") entry.concluidos += 1;
      rankingMap.set(key, entry);
    });

    return Array.from(rankingMap.values())
      .sort((a, b) => b.total - a.total || a.nome.localeCompare(b.nome))
      .slice(0, 10);
  }

  private matchPeriodo(
    data: string | undefined,
    today: string,
    start7Dias: string,
    startMonth: string,
    endMonth: string,
    startYear: string,
    endYear: string,
    periodo: RankingFilters["periodo"]
  ): boolean {
    if (!data) return false;
    switch (periodo) {
      case "hoje":
        return data === today;
      case "7dias":
        return data >= start7Dias && data <= today;
      case "mes":
        return data >= startMonth && data <= endMonth;
      case "ano":
        return data >= startYear && data <= endYear;
      default:
        return true;
    }
  }

  private shiftDate(dateStr: string, deltaDias: number): string {
    const [year, month, day] = dateStr.split("-").map(Number);
    const dt = new Date(year, month - 1, day);
    dt.setDate(dt.getDate() + deltaDias);
    const local = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000);
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
}
