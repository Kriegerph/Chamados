import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { map, Observable } from "rxjs";
import { Cliente } from "../../models/cliente.model";
import { ClientesService } from "../../services/clientes.service";
import { ToastService } from "../../services/toast.service";

type ClientesViewModel = {
  carregando: boolean;
  erro: string | null;
  clientes: Cliente[];
};

@Component({
  selector: "app-clientes",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./clientes.component.html",
  styleUrl: "./clientes.component.css",
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientesComponent {
  nome = "";
  telefone = "";
  email = "";
  observacao = "";

  editando = false;
  editId: string | null = null;
  editNome = "";
  editTelefone = "";
  editEmail = "";
  editObservacao = "";

  readonly vm$: Observable<ClientesViewModel>;

  constructor(
    private readonly clientesService: ClientesService,
    private readonly toast: ToastService
  ) {
    this.vm$ = this.clientesService.clientesState$.pipe(
      map((state): ClientesViewModel => ({
        carregando: state.status === "loading",
        erro: state.error,
        clientes: this.sortByNome(state.data)
      }))
    );
  }

  async cadastrar() {
    const nome = this.nome.trim();
    if (!nome) {
      this.toast.show("Informe o nome do cliente.", "error");
      return;
    }
    try {
      await this.clientesService.addCliente({
        nome,
        telefone: this.telefone,
        email: this.email,
        observacao: this.observacao
      });
      this.toast.show("Cliente cadastrado com sucesso.", "success");
      this.nome = "";
      this.telefone = "";
      this.email = "";
      this.observacao = "";
    } catch (err: any) {
      this.toast.show(`Erro ao cadastrar: ${err.message}`, "error");
    }
  }

  abrirEdicao(item: Cliente) {
    this.editando = true;
    this.editId = item.id ?? null;
    this.editNome = item.nome || "";
    this.editTelefone = item.telefone || "";
    this.editEmail = item.email || "";
    this.editObservacao = item.observacao || "";
  }

  cancelarEdicao() {
    this.editando = false;
    this.editId = null;
    this.editNome = "";
    this.editTelefone = "";
    this.editEmail = "";
    this.editObservacao = "";
  }

  async salvarEdicao() {
    if (!this.editId) return;
    const nome = this.editNome.trim();
    if (!nome) {
      this.toast.show("Informe o nome do cliente.", "error");
      return;
    }
    try {
      await this.clientesService.updateCliente(this.editId, {
        nome,
        telefone: this.editTelefone.trim(),
        email: this.editEmail.trim(),
        observacao: this.editObservacao.trim()
      });
      this.toast.show("Cliente atualizado.", "success");
      this.cancelarEdicao();
    } catch (err: any) {
      this.toast.show(`Erro ao atualizar: ${err.message}`, "error");
    }
  }

  async excluir(item: Cliente) {
    if (!item.id) return;
    const ok = window.confirm("Tem certeza que deseja excluir este cliente?");
    if (!ok) return;
    try {
      await this.clientesService.deleteCliente(item.id);
      this.toast.show("Cliente excluido.", "success");
    } catch (err: any) {
      this.toast.show(`Erro ao excluir: ${err.message}`, "error");
    }
  }

  private sortByNome(items: Cliente[]): Cliente[] {
    return [...items].sort((a, b) => (a.nome || "").localeCompare(b.nome || ""));
  }
}
