import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { Timestamp } from "firebase/firestore";
import { combineLatest, map, Observable } from "rxjs";
import { Chamado } from "../../models/chamado.model";
import { Cliente } from "../../models/cliente.model";
import { DataState } from "../../models/data-state.model";
import { ChamadosService } from "../../services/chamados.service";
import { ClientesService } from "../../services/clientes.service";
import { ToastService } from "../../services/toast.service";

type AbertoItemView = Chamado & {
  clienteLabel: string;
};

type AbertosViewModel = {
  carregando: boolean;
  erro: string | null;
  abertos: AbertoItemView[];
  clientes: Cliente[];
};

@Component({
  selector: "app-abertos",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./abertos.component.html",
  styleUrl: "./abertos.component.css",
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AbertosComponent {
  modoCadastro: "novo" | "antigo" = "novo";
  motivo = "";
  clienteId = "";
  data = "";
  resolucao = "";

  modalAberto = false;
  finalizarId: string | null = null;
  resolucaoFinalizar = "";

  editando = false;
  editId: string | null = null;
  editMotivo = "";
  editClienteId = "";
  editClienteNomeOriginal = "";
  editData = "";
  editResolucao = "";
  editStatus: "aberto" | "concluido" = "aberto";

  readonly vm$: Observable<AbertosViewModel>;

  constructor(
    private readonly chamadosService: ChamadosService,
    private readonly clientesService: ClientesService,
    private readonly toast: ToastService,
    private readonly router: Router
  ) {
    this.data = this.getToday();
    this.vm$ = combineLatest([
      this.chamadosService.todosState$,
      this.clientesService.clientesState$
    ]).pipe(
      map(([chamadosState, clientesState]) => this.buildViewModel(chamadosState, clientesState))
    );
  }

  onModoChange() {
    if (this.modoCadastro === "novo") {
      this.resolucao = "";
    }
    if (!this.data) {
      this.data = this.getToday();
    }
  }

  async salvar() {
    const motivo = this.motivo.trim();
    const clienteId = this.clienteId;
    const clienteNome = this.getClienteNomeById(clienteId);
    const data = this.data;
    const resolucao = this.resolucao.trim();

    if (!motivo || !clienteId || !clienteNome || !data) {
      this.toast.show("Preencha motivo, cliente e data.", "error");
      return;
    }

    if (this.modoCadastro === "antigo" && !resolucao) {
      this.toast.show("Informe como foi resolvido.", "error");
      return;
    }

    try {
      if (this.modoCadastro === "novo") {
        await this.chamadosService.addChamadoNovo({ motivo, clienteId, clienteNome, data });
      } else {
        await this.chamadosService.addChamadoAntigo({
          motivo,
          clienteId,
          clienteNome,
          data,
          resolucao
        });
      }
      this.toast.show("Chamado salvo com sucesso.", "success");
      this.motivo = "";
      this.clienteId = "";
      this.resolucao = "";
      this.data = this.getToday();
    } catch (err: any) {
      this.toast.show(`Erro ao salvar: ${err.message}`, "error");
    }
  }

  abrirModalFinalizar(id: string) {
    this.finalizarId = id;
    this.resolucaoFinalizar = "";
    this.modalAberto = true;
  }

  cancelarModal() {
    this.modalAberto = false;
    this.finalizarId = null;
  }

  async confirmarFinalizacao() {
    const texto = this.resolucaoFinalizar.trim();
    if (!texto) {
      this.toast.show("Informe como foi resolvido.", "error");
      return;
    }

    if (!this.finalizarId) return;

    try {
      await this.chamadosService.finalizarChamado(this.finalizarId, texto);
      this.toast.show("Chamado finalizado.", "success");
      this.cancelarModal();
    } catch (err: any) {
      this.toast.show(`Erro ao finalizar: ${err.message}`, "error");
    }
  }

  abrirModalEditar(item: Chamado & { clienteLabel?: string }) {
    this.editando = true;
    this.editId = item.id ?? null;
    this.editMotivo = item.motivo || "";
    this.editClienteId = item.clienteId || "";
    this.editClienteNomeOriginal = item.clienteLabel || this.getClienteLabel(item);
    this.editData = item.data || "";
    this.editResolucao = item.resolucao || "";
    this.editStatus = item.status;
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
    if (this.editStatus === "concluido" && !resolucao) {
      this.toast.show("Informe como foi resolvido.", "error");
      return;
    }

    try {
      const payload: Partial<Chamado> = {
        motivo,
        data,
        clienteNome,
        cliente: clienteNome
      };
      if (clienteId) {
        payload.clienteId = clienteId;
      }
      if (this.editStatus === "concluido") {
        payload.resolucao = resolucao;
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

  onClienteChange() {
    if (this.clienteId === "__novo__") {
      this.clienteId = "";
      this.router.navigate(["/clientes"]);
    }
  }

  private buildViewModel(
    chamadosState: DataState<Chamado[]>,
    clientesState: DataState<Cliente[]>
  ): AbertosViewModel {
    const clientes = this.sortClientes(clientesState.data);
    const clientesMap = new Map(
      clientes.filter((item) => !!item.id).map((item) => [item.id as string, item])
    );
    const abertos = this.sortByDataDesc(
      chamadosState.data.filter((item) => item.status === "aberto")
    ).map((item) => ({
      ...item,
      clienteLabel: this.getClienteLabelFromMap(item, clientesMap)
    }));

    return {
      carregando: chamadosState.status === "loading" || clientesState.status === "loading",
      erro: chamadosState.error || clientesState.error,
      abertos,
      clientes
    };
  }

  private getToday(): string {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
  }

  private sortByDataDesc(items: Chamado[]): Chamado[] {
    return [...items].sort((a, b) => {
      const dataCmp = (b.data || "").localeCompare(a.data || "");
      if (dataCmp !== 0) return dataCmp;
      const timeA = this.getTimestampMillis(a.criadoEm ?? a.concluidoEm);
      const timeB = this.getTimestampMillis(b.criadoEm ?? b.concluidoEm);
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
    const clientesMap = new Map(
      this.clientesService
        .getClientesSnapshot()
        .filter((cliente) => !!cliente.id)
        .map((cliente) => [cliente.id as string, cliente])
    );
    return this.getClienteLabelFromMap(item, clientesMap);
  }

  private getClienteLabelFromMap(item: Chamado, clientesMap: Map<string, Cliente>): string {
    if (item.clienteNome) return item.clienteNome;
    if (item.clienteId) {
      const nome = clientesMap.get(item.clienteId)?.nome;
      if (nome) return nome;
    }
    return item.cliente || "Cliente não informado";
  }

  private getClienteNomeById(id: string): string {
    if (!id) return "";
    return this.clientesService.getClientesSnapshot().find((item) => item.id === id)?.nome ?? "";
  }

  private sortClientes(items: Cliente[]): Cliente[] {
    return [...items].sort((a, b) => (a.nome || "").localeCompare(b.nome || ""));
  }
}
