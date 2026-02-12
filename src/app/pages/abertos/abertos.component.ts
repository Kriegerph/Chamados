import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { Timestamp } from "firebase/firestore";
import { Subscription } from "rxjs";
import { Cliente } from "../../models/cliente.model";
import { Chamado } from "../../models/chamado.model";
import { ClientesService } from "../../services/clientes.service";
import { ChamadosService } from "../../services/chamados.service";
import { ToastService } from "../../services/toast.service";

@Component({
  selector: "app-abertos",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./abertos.component.html",
  styleUrl: "./abertos.component.css"
})
export class AbertosComponent implements OnInit, OnDestroy {
  modoCadastro: "novo" | "antigo" = "novo";
  motivo = "";
  clienteId = "";
  data = "";
  resolucao = "";

  abertos: Chamado[] = [];
  carregando = true;
  clientes: Cliente[] = [];
  private clientesMap = new Map<string, Cliente>();

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

  private sub = new Subscription();

  constructor(
    private readonly chamadosService: ChamadosService,
    private readonly clientesService: ClientesService,
    private readonly toast: ToastService,
    private readonly router: Router
  ) {}

  ngOnInit() {
    this.data = this.getToday();
    this.sub.add(
      this.chamadosService.listenTodos().subscribe({
        next: (items) => {
          this.abertos = this.sortByDataDesc(
            items.filter((item) => item.status === "aberto")
          );
          this.carregando = false;
        },
        error: (err) => {
          this.carregando = false;
          this.toast.show(`Erro ao carregar abertos: ${err.message}`, "error");
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
        }
      })
    );
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
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

  abrirModalEditar(item: Chamado) {
    this.editando = true;
    this.editId = item.id ?? null;
    this.editMotivo = item.motivo || "";
    this.editClienteId = item.clienteId || "";
    this.editClienteNomeOriginal = this.getClienteLabel(item);
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
