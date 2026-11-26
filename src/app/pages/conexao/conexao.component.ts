import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { switchMap } from "rxjs";
import {
  WhatsappConnectionService,
  WhatsappConnectionStatus,
  WhatsappConnectionState
} from "../../services/whatsapp-connection.service";

@Component({
  selector: "app-conexao",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./conexao.component.html",
  styleUrl: "./conexao.component.css",
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConexaoComponent implements OnInit, OnDestroy {
  private readonly permissionDeniedMessage =
    "O Chrome bloqueou o acesso à API local. Clique no ícone à esquerda do endereço do site, abra Configurações do site, mude Acesso à rede local para Permitir e recarregue a página.";

  status: WhatsappConnectionStatus | null = null;
  carregando = true;
  conectando = false;
  desconectando = false;
  private statusRequestId = 0;
  private localAccessAllowed = false;
  erro: string | null = null;

  private refreshTimer: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly whatsappConnection: WhatsappConnectionService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    const permission = await this.whatsappConnection.getLocalNetworkPermission();
    if (permission === "granted") {
      this.localAccessAllowed = true;
      this.carregarStatus();
    } else {
      this.carregando = false;
      this.erro = permission === "denied"
        ? this.permissionDeniedMessage
        : "Clique em Atualizar para permitir que este site acesse a API local deste computador.";
      this.cdr.markForCheck();
    }
    this.refreshTimer = setInterval(() => {
      if (this.localAccessAllowed) this.carregarStatus(false);
    }, 5000);
  }

  ngOnDestroy() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }
  }

  carregarStatus(mostrarCarregando = true) {
    if (this.desconectando) return;
    const requestId = ++this.statusRequestId;
    this.erro = null;
    if (mostrarCarregando) {
      this.carregando = true;
    }

    this.whatsappConnection.checkAvailability().pipe(
      switchMap((available) => {
        if (!available) {
          throw new Error("A API não respondeu em http://localhost:3000. Confira se o processo no PM2 está online e escutando na porta 3000.");
        }
        this.localAccessAllowed = true;
        return this.whatsappConnection.getStatus();
      })
    ).subscribe({
      next: (status) => {
        if (requestId !== this.statusRequestId) return;
        this.status = status;
        this.erro = null;
        this.carregando = false;
        this.cdr.markForCheck();
      },
      error: (error) => this.mostrarErroStatus(error, requestId)
    });
  }

  conectar() {
    if (this.status?.connected || this.conectando || this.desconectando) return;

    this.conectando = true;
    this.erro = null;

    this.whatsappConnection.connect().subscribe({
      next: (status) => {
        this.status = status;
        this.conectando = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.erro = this.toErrorMessage(error);
        this.conectando = false;
        this.cdr.markForCheck();
      }
    });
  }

  desconectar() {
    if (this.desconectando || this.conectando || this.status?.connecting) return;
    this.desconectando = true;
    this.statusRequestId++;
    this.carregando = false;
    this.erro = null;
    this.whatsappConnection.disconnect().subscribe({
      next: (status) => {
        this.status = status;
        this.desconectando = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.erro = this.toErrorMessage(error);
        this.desconectando = false;
        this.cdr.markForCheck();
      }
    });
  }

  getStatusLabel(status: WhatsappConnectionState | undefined): string {
    switch (status) {
      case "connected":
        return "Conectado";
      case "qr":
        return "Aguardando leitura";
      case "starting":
        return "Iniciando";
      case "disconnected":
        return "Desconectado";
      case "error":
        return "Erro";
      default:
        return "Verificando";
    }
  }

  getStatusClass(status: WhatsappConnectionState | undefined): string {
    switch (status) {
      case "connected":
        return "success";
      case "qr":
      case "starting":
        return "warning";
      case "disconnected":
      case "error":
        return "danger";
      default:
        return "neutral";
    }
  }

  getAtualizadoEm(status: WhatsappConnectionStatus | null): string {
    if (!status?.updatedAt) return "-";

    return new Date(status.updatedAt).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  private toErrorMessage(error: unknown): string {
    if (error instanceof TypeError) {
      return "Não foi possível acessar a API local. Confira o PM2, a porta 3000 e a permissão de acesso à rede local no navegador.";
    }

    if (error instanceof Error && error.message) {
      return error.message;
    }

    return "Falha ao consultar conexao.";
  }

  private async mostrarErroStatus(error: unknown, requestId: number) {
    const permission = await this.whatsappConnection.getLocalNetworkPermission();
    if (requestId !== this.statusRequestId) return;
    this.erro = permission === "denied" ? this.permissionDeniedMessage : this.toErrorMessage(error);
    this.carregando = false;
    this.cdr.markForCheck();
  }
}
