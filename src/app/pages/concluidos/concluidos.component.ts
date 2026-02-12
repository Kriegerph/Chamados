import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Timestamp } from "firebase/firestore";
import { Subscription } from "rxjs";
import { Cliente } from "../../models/cliente.model";
import { Chamado } from "../../models/chamado.model";
import { ClientesService } from "../../services/clientes.service";
import { ChamadosService } from "../../services/chamados.service";
import { ToastService } from "../../services/toast.service";

interface GrupoConcluidos {
  data: string;
  items: Chamado[];
}

@Component({
  selector: "app-concluidos",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./concluidos.component.html",
  styleUrl: "./concluidos.component.css"
})
export class ConcluidosComponent implements OnInit, OnDestroy {
  concluidos: Chamado[] = [];
  grupos: GrupoConcluidos[] = [];
  busca = "";
  filtroDe = "";
  filtroAte = "";
  carregando = true;

  editando = false;
  editId: string | null = null;
  editMotivo = "";
  editClienteId = "";
  editClienteNomeOriginal = "";
  editData = "";
  editResolucao = "";

  clientes: Cliente[] = [];
  private clientesMap = new Map<string, Cliente>();

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
          this.concluidos = this.sortByDataDesc(
            items.filter((item) => item.status === "concluido")
          );
          this.carregando = false;
          this.aplicarFiltros();
        },
        error: (err) => {
          this.carregando = false;
          this.toast.show(`Erro ao carregar concluídos: ${err.message}`, "error");
        }
      })
    );
    this.sub.add(
      this.clientesService.clientes$.subscribe({
        next: (items) => {
          this.clientes = this.sortClientes(items);
          this.clientesMap = new Map(
            this.clientes.filter((c) => !!c.id).map((c) => [c.id as string, c])
          );
          this.aplicarFiltros();
        }
      })
    );
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  aplicarFiltros() {
    const busca = this.busca.trim().toLowerCase();
    const de = this.filtroDe;
    const ate = this.filtroAte;

    const filtrados = this.concluidos.filter((item) => {
      const clienteLabel = this.getClienteLabel(item);
      const alvo = `${clienteLabel} ${item.motivo || ""}`.toLowerCase();
      if (busca && !alvo.includes(busca)) return false;
      if (de && item.data < de) return false;
      if (ate && item.data > ate) return false;
      return true;
    });

    const map = new Map<string, Chamado[]>();
    filtrados.forEach((item) => {
      const data = item.data || "Sem data";
      if (!map.has(data)) map.set(data, []);
      map.get(data)!.push(item);
    });

    const ordenado = Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
    this.grupos = ordenado.map(([data, items]) => ({ data, items }));
  }

  limparFiltros() {
    this.busca = "";
    this.filtroDe = "";
    this.filtroAte = "";
    this.aplicarFiltros();
  }

  formatHora(item: Chamado): string {
    if (item.concluidoEm && typeof (item.concluidoEm as any).toDate === "function") {
      const dt = (item.concluidoEm as any).toDate() as Date;
      return dt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    }
    return "-";
  }

  abrirModalEditar(item: Chamado) {
    this.editando = true;
    this.editId = item.id ?? null;
    this.editMotivo = item.motivo || "";
    this.editClienteId = item.clienteId || "";
    this.editClienteNomeOriginal = this.getClienteLabel(item);
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
      this.toast.show("Informe a resolução.", "error");
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
      this.toast.show("Chamado excluído.", "success");
    } catch (err: any) {
      this.toast.show(`Erro ao excluir: ${err.message}`, "error");
    }
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

  getClienteLabel(item: Chamado): string {
    if (item.clienteNome) return item.clienteNome;
    if (item.clienteId) {
      const nome = this.getClienteNomeById(item.clienteId);
      if (nome) return nome;
    }
    return item.cliente || "Cliente não informado";
  }

  private getClienteNomeById(id: string): string {
    if (!id) return "";
    return this.clientesMap.get(id)?.nome ?? "";
  }

  private sortClientes(items: Cliente[]): Cliente[] {
    return [...items].sort((a, b) => (a.nome || "").localeCompare(b.nome || ""));
  }
}
