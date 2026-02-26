import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { AuthService } from "../../../services/auth.service";

@Component({
  selector: "app-cadastro",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: "./cadastro.component.html",
  styleUrl: "./cadastro.component.css"
})
export class CadastroComponent {
  email = "";
  senha = "";
  confirmar = "";
  erro = "";
  carregando = false;
  private cadastroConcluido = false;

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {}

  async cadastrar() {
    if (this.carregando) return;
    this.erro = "";
    const email = this.email.trim();

    if (!email) {
      this.erro = "Informe o email.";
      return;
    }
    if (!this.isValidEmail(email)) {
      this.erro = "Informe um email válido.";
      return;
    }
    if (!this.senha) {
      this.erro = "Informe a senha.";
      return;
    }
    if (this.senha.length < 6) {
      this.erro = "A senha deve ter pelo menos 6 caracteres.";
      return;
    }
    if (!this.confirmar) {
      this.erro = "Confirme a senha.";
      return;
    }
    if (this.confirmar !== this.senha) {
      this.erro = "As senhas não conferem.";
      return;
    }

    this.carregando = true;
    try {
      await this.auth.signUp(email, this.senha);
      this.cadastroConcluido = true;
      this.router.navigateByUrl(this.getReturnUrl());
    } catch (err: any) {
      this.logAuthError(err);
      this.erro = this.mapAuthError(err);
    } finally {
      this.carregando = false;
    }
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private mapAuthError(err: any): string {
    const code = err?.code;
    switch (code) {
      case "auth/invalid-email":
        return "Email inválido.";
      case "auth/email-already-in-use":
        return this.cadastroConcluido || this.auth.getUid()
          ? "Sua conta já foi criada, faça login."
          : "Email já está em uso.";
      case "auth/weak-password":
        return "Senha fraca. Use pelo menos 6 caracteres.";
      case "firestore/profile-create-failed":
        return "Conta criada, mas falhou ao criar perfil no Firestore.";
      default:
        return "Erro ao cadastrar.";
    }
  }

  private getReturnUrl(): string {
    const returnUrl = this.route.snapshot.queryParamMap.get("returnUrl");
    if (!returnUrl || returnUrl === "/login" || returnUrl === "/cadastro") {
      return "/abertos";
    }
    return returnUrl;
  }

  private logAuthError(err: any) {
    const code = err?.code ?? "unknown";
    const message = err?.message ?? "";
    console.warn("Cadastro falhou", { code, message });
  }
}

