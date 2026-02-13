import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
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
  busca: string;
  de: string;
  ate: string;
};

type ConcluidosViewModel = {
  carregando: boolean;
  erro: string | null;
  clientes: Cliente[];
  grupos: GrupoConcluidos[];
  totalConcluidos: number;
};

@Component({
  selector: "app-concluidos",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./concluidos.component.html",
  styleUrl: "./concluidos.component.css"
})
export class ConcluidosComponent {
  busca = "";
  filtroDe = "";
  filtroAte = "";

  editando = false;
  editId: string | null = null;
  editMotivo = "";
  editClienteId = "";
  editClienteNomeOriginal = "";
  editData = "";
  editResolucao = "";

  private readonly filtrosSubject = new BehaviorSubject<ConcluidosFiltros>({
    busca: "",
    de: "",
    ate: ""
  });

  readonly vm$: Observable<ConcluidosViewModel>;

  constructor(
    private readonly chamadosService: ChamadosService,
    private readonly clientesService: ClientesService,
    private readonly toast: ToastService
  ) {
    this.vm$ = combineLatest([
      this.chamadosService.todosState$,
      this.clientesService.clientesState$,
      this.filtrosSubject
    ]).pipe(
      map(([chamadosState, clientesState, filtros]) =>
        this.buildViewModel(chamadosState, clientesState, filtros)
      ),
      tap((viewModel) =>
        console.debug(`[Concluidos] concluidos$ emitiu ${viewModel.totalConcluidos} itens`)
      )
    );
  }

  onFiltrosChange() {
    this.filtrosSubject.next({
      busca: this.busca,
      de: this.filtroDe,
      ate: this.filtroAte
    });
  }

  limparFiltros() {
    this.busca = "";
    this.filtroDe = "";
    this.filtroAte = "";
    this.onFiltrosChange();
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
    filtros: ConcluidosFiltros
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

    const grupos = this.agruparPorData(concluidos, filtros);

    return {
      carregando: chamadosState.status === "loading" || clientesState.status === "loading",
      erro: chamadosState.error || clientesState.error,
      clientes,
      grupos,
      totalConcluidos: concluidos.length
    };
  }

  private agruparPorData(
    items: ConcluidoItemView[],
    filtros: ConcluidosFiltros
  ): GrupoConcluidos[] {
    const busca = filtros.busca.trim().toLowerCase();
    const de = filtros.de;
    const ate = filtros.ate;

    const filtrados = items.filter((item) => {
      const alvo = `${item.clienteLabel} ${item.motivo || ""}`.toLowerCase();
      if (busca && !alvo.includes(busca)) return false;
      if (de && item.data < de) return false;
      if (ate && item.data > ate) return false;
      return true;
    });

    const agrupados = new Map<string, ConcluidoItemView[]>();
    filtrados.forEach((item) => {
      const data = item.data || "Sem data";
      const atual = agrupados.get(data) || [];
      agrupados.set(data, [...atual, item]);
    });

    return Array.from(agrupados.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([data, groupedItems]) => ({ data, items: groupedItems }));
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
