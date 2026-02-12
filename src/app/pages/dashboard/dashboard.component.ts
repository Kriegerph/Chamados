import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Subscription } from "rxjs";
import { Cliente } from "../../models/cliente.model";
import { Chamado, DashboardStats } from "../../models/chamado.model";
import { ClientesService } from "../../services/clientes.service";
import { ChamadosService } from "../../services/chamados.service";
import { ToastService } from "../../services/toast.service";

type RankingItem = {
  nome: string;
  total: number;
  abertos: number;
  concluidos: number;
};

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./dashboard.component.html",
  styleUrl: "./dashboard.component.css"
})
export class DashboardComponent implements OnInit, OnDestroy {
  stats: DashboardStats = {
    totalGeral: 0,
    totalAno: 0,
    totalMes: 0,
    totalDia: 0,
    abertosHoje: 0,
    concluidosHoje: 0,
    totaisPorMes: new Array(12).fill(0)
  };
  carregando = true;
  ranking: RankingItem[] = [];
  rankingPeriodo: "hoje" | "7dias" | "mes" | "ano" | "todos" = "todos";
  rankingStatus: "todos" | "concluidos" = "todos";
  clientesTotal = 0;

  private todos: Chamado[] = [];
  private clientesMap = new Map<string, Cliente>();

  readonly meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

  private sub = new Subscription();

  constructor(
    private readonly chamadosService: ChamadosService,
    private readonly clientesService: ClientesService,
    private readonly toast: ToastService
  ) {}

  ngOnInit() {
    this.sub.add(
      this.chamadosService.listenTodos().subscribe({
        next: (items) => {
          this.todos = items;
          this.carregando = false;
          this.rebuild();
        },
        error: (err) => {
          this.carregando = false;
          this.toast.show(`Erro no dashboard: ${err.message}`, "error");
        }
      })
    );
    this.sub.add(
      this.clientesService.clientes$.subscribe({
        next: (items) => {
          this.clientesTotal = items.length;
          this.clientesMap = new Map(
            items.filter((c) => !!c.id).map((c) => [c.id as string, c])
          );
          this.rebuild();
        }
      })
    );
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  carregar() {
    this.rebuild();
  }

  private rebuild() {
    this.stats = this.buildStats(this.todos);
    this.ranking = this.buildRanking(this.todos);
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

  private getToday(): string {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
  }

  private buildRanking(items: Chamado[]): RankingItem[] {
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

    const map = new Map<string, RankingItem>();
    items.forEach((item) => {
      if (!this.matchPeriodo(item.data, today, start7Dias, startMonth, endMonth, startYear, endYear)) {
        return;
      }
      if (this.rankingStatus === "concluidos" && item.status !== "concluido") return;
      const nome = this.getClienteLabel(item);
      const key = item.clienteId ? `id:${item.clienteId}` : `nome:${nome}`;
      const entry = map.get(key) || {
        nome: nome || "Sem cliente",
        total: 0,
        abertos: 0,
        concluidos: 0
      };
      entry.total += 1;
      if (item.status === "aberto") entry.abertos += 1;
      if (item.status === "concluido") entry.concluidos += 1;
      map.set(key, entry);
    });

    return Array.from(map.values())
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
    endYear: string
  ): boolean {
    if (!data) return false;
    switch (this.rankingPeriodo) {
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

  private getClienteLabel(item: Chamado): string {
    if (item.clienteNome) return item.clienteNome;
    if (item.clienteId) {
      const nome = this.clientesMap.get(item.clienteId)?.nome;
      if (nome) return nome;
    }
    return item.cliente || "Sem cliente";
  }
}
