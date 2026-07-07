import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BehaviorSubject, combineLatest, map, Observable, tap } from "rxjs";
import { CalendarioItem } from "../../models/calendario.model";
import { DataState } from "../../models/data-state.model";
import {
  CalendarioPayload,
  CalendarioService
} from "../../services/calendario.service";
import { ToastService } from "../../services/toast.service";

type CalendarioDia = {
  data: string;
  numero: number | null;
  foraDoMes: boolean;
  hoje: boolean;
  itens: CalendarioItem[];
};

type CalendarioViewModel = {
  carregando: boolean;
  erro: string | null;
  tituloMes: string;
  dias: CalendarioDia[];
};

type MesOption = {
  valor: string;
  label: string;
};

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

@Component({
  selector: "app-calendario",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./calendario.component.html",
  styleUrl: "./calendario.component.css",
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CalendarioComponent {
  readonly diasSemana = WEEKDAYS;
  readonly vm$: Observable<CalendarioViewModel>;
  readonly mesesOptions: MesOption[];

  modalAberto = false;
  salvando = false;
  excluindo = false;
  itemEditandoId: string | null = null;
  dataSelecionada = "";
  form: CalendarioPayload = this.getFormInicial("");
  mesSelecionado: string;

  private readonly hoje = new Date();
  private readonly anoAtual = this.hoje.getFullYear();
  private readonly mesAtual = this.hoje.getMonth();
  private readonly mesSelecionadoSubject: BehaviorSubject<string>;
  private readonly tituloFormatter = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric"
  });

  constructor(
    private readonly calendarioService: CalendarioService,
    private readonly toast: ToastService,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.mesSelecionado = this.toMonthKey(this.anoAtual, this.mesAtual);
    this.mesSelecionadoSubject = new BehaviorSubject<string>(this.mesSelecionado);
    this.mesesOptions = this.buildMesesOptions();
    this.vm$ = combineLatest([
      this.calendarioService.calendarioState$,
      this.mesSelecionadoSubject
    ]).pipe(
      map(([state, mesSelecionado]) => this.buildViewModel(state, mesSelecionado)),
      tap(() => this.cdr.markForCheck())
    );
  }

  trackByDia(index: number, dia: CalendarioDia): string {
    return dia.data || `vazio-${index}`;
  }

  trackByItem(_: number, item: CalendarioItem): string {
    return item.id ?? `${item.data}-${item.titulo}`;
  }

  onMesChange() {
    this.mesSelecionadoSubject.next(this.mesSelecionado);
    this.forcarAtualizacaoTela();
  }

  abrirNovoItem(dia: CalendarioDia) {
    if (dia.foraDoMes || !dia.data) return;

    this.itemEditandoId = null;
    this.dataSelecionada = dia.data;
    this.form = this.getFormInicial(dia.data);
    this.modalAberto = true;
    this.forcarAtualizacaoTela();
  }

  abrirEdicao(item: CalendarioItem) {
    this.itemEditandoId = item.id ?? null;
    this.dataSelecionada = item.data;
    this.form = {
      data: item.data,
      titulo: item.titulo || "",
      descricao: item.descricao || ""
    };
    this.modalAberto = true;
    this.forcarAtualizacaoTela();
  }

  fecharModal(forcar = false) {
    if ((this.salvando || this.excluindo) && !forcar) return;

    this.modalAberto = false;
    this.salvando = false;
    this.excluindo = false;
    this.itemEditandoId = null;
    this.dataSelecionada = "";
    this.form = this.getFormInicial("");
    this.forcarAtualizacaoTela();
  }

  async salvarItem() {
    if (this.salvando) return;

    const payload = this.getPayloadSanitizado();
    if (!payload.titulo) {
      this.toast.show("Informe o que sera feito.", "error");
      return;
    }

    this.salvando = true;
    this.forcarAtualizacaoTela();

    try {
      if (this.itemEditandoId) {
        await this.calendarioService.updateItem(this.itemEditandoId, payload);
        this.toast.show("Anotacao atualizada.", "success");
      } else {
        await this.calendarioService.createItem(payload);
        this.toast.show("Anotacao salva.", "success");
      }
      this.fecharModal(true);
    } catch (err: any) {
      this.toast.show(`Erro ao salvar anotacao: ${err?.message || err}`, "error");
    } finally {
      this.salvando = false;
      this.forcarAtualizacaoTela();
    }
  }

  async excluirItem() {
    if (!this.itemEditandoId || this.excluindo) return;

    const ok = window.confirm("Deseja excluir esta anotacao do calendario?");
    if (!ok) return;

    this.excluindo = true;
    this.forcarAtualizacaoTela();

    try {
      await this.calendarioService.deleteItem(this.itemEditandoId);
      this.toast.show("Anotacao excluida.", "success");
      this.fecharModal(true);
    } catch (err: any) {
      this.toast.show(`Erro ao excluir anotacao: ${err?.message || err}`, "error");
    } finally {
      this.excluindo = false;
      this.forcarAtualizacaoTela();
    }
  }

  getTituloModal(): string {
    return this.itemEditandoId ? "Editar anotacao" : "Nova anotacao";
  }

  getDataSelecionadaLabel(): string {
    if (!this.dataSelecionada) return "";
    const [year, month, day] = this.dataSelecionada.split("-").map(Number);
    return new Intl.DateTimeFormat("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long"
    }).format(new Date(year, month - 1, day));
  }

  getSalvarLabel(): string {
    return this.salvando ? "Salvando..." : "Salvar";
  }

  getExcluirLabel(): string {
    return this.excluindo ? "Excluindo..." : "Excluir";
  }

  private buildViewModel(
    state: DataState<CalendarioItem[]>,
    mesSelecionado: string
  ): CalendarioViewModel {
    const { year, monthIndex } = this.parseMonthKey(mesSelecionado);

    return {
      carregando: state.status === "loading",
      erro: state.error,
      tituloMes: this.capitalize(this.tituloFormatter.format(new Date(year, monthIndex, 1))),
      dias: this.buildDias(state.data, year, monthIndex)
    };
  }

  private buildDias(items: CalendarioItem[], year: number, monthIndex: number): CalendarioDia[] {
    const primeiroDiaMes = new Date(year, monthIndex, 1);
    const ultimoDiaMes = new Date(year, monthIndex + 1, 0);
    const totalDiasMes = ultimoDiaMes.getDate();
    const deslocamentoInicial = primeiroDiaMes.getDay();
    const hojeData = this.toDateKey(this.hoje);
    const itensPorData = this.groupItemsByDate(items, year, monthIndex);
    const dias: CalendarioDia[] = [];

    for (let i = 0; i < deslocamentoInicial; i++) {
      dias.push({
        data: "",
        numero: null,
        foraDoMes: true,
        hoje: false,
        itens: []
      });
    }

    for (let day = 1; day <= totalDiasMes; day++) {
      const data = this.toDateKey(new Date(year, monthIndex, day));
      dias.push({
        data,
        numero: day,
        foraDoMes: false,
        hoje: data === hojeData,
        itens: itensPorData.get(data) ?? []
      });
    }

    while (dias.length % 7 !== 0) {
      dias.push({
        data: "",
        numero: null,
        foraDoMes: true,
        hoje: false,
        itens: []
      });
    }

    return dias;
  }

  private groupItemsByDate(
    items: CalendarioItem[],
    year: number,
    monthIndex: number
  ): Map<string, CalendarioItem[]> {
    const map = new Map<string, CalendarioItem[]>();
    const currentMonthPrefix = this.toMonthKey(year, monthIndex);

    items
      .filter((item) => item.data?.startsWith(currentMonthPrefix))
      .forEach((item) => {
        const current = map.get(item.data) ?? [];
        map.set(item.data, [...current, item]);
      });

    map.forEach((value, key) => {
      map.set(
        key,
        [...value].sort((a, b) => (a.titulo || "").localeCompare(b.titulo || "", "pt-BR"))
      );
    });

    return map;
  }

  private buildMesesOptions(): MesOption[] {
    return Array.from({ length: 12 }, (_, monthIndex) => {
      const date = new Date(this.anoAtual, monthIndex, 1);

      return {
        valor: this.toMonthKey(this.anoAtual, monthIndex),
        label: this.capitalize(this.tituloFormatter.format(date))
      };
    });
  }

  private getPayloadSanitizado(): CalendarioPayload {
    return {
      data: this.form.data,
      titulo: this.form.titulo.trim(),
      descricao: this.form.descricao.trim()
    };
  }

  private getFormInicial(data: string): CalendarioPayload {
    return {
      data,
      titulo: "",
      descricao: ""
    };
  }

  private toDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  private toMonthKey(year: number, monthIndex: number): string {
    return `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
  }

  private parseMonthKey(value: string): { year: number; monthIndex: number } {
    const [yearValue, monthValue] = value.split("-").map(Number);
    const year = Number.isFinite(yearValue) ? yearValue : this.anoAtual;
    const monthIndex = Number.isFinite(monthValue) ? Math.max(0, Math.min(11, monthValue - 1)) : this.mesAtual;

    return { year, monthIndex };
  }

  private capitalize(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  private forcarAtualizacaoTela() {
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }
}
