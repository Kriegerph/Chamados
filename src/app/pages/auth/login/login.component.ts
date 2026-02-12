import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { AuthService } from "../../../services/auth.service";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: "./login.component.html",
  styleUrl: "./login.component.css"
})
export class LoginComponent {
  email = "";
  senha = "";
  erro = "";
  carregando = false;

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {}

  async entrar() {
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

    this.carregando = true;
    try {
      await this.auth.signIn(email, this.senha);
      this.router.navigateByUrl(this.getReturnUrl());
    } catch (err: any) {
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
      case "auth/user-not-found":
      case "auth/wrong-password":
      case "auth/invalid-credential":
        return "Credenciais inválidas.";
      case "auth/too-many-requests":
        return "Muitas tentativas. Tente novamente mais tarde.";
      default:
        return "Erro ao entrar.";
    }
  }

  private getReturnUrl(): string {
    const returnUrl = this.route.snapshot.queryParamMap.get("returnUrl");
    if (!returnUrl || returnUrl === "/login" || returnUrl === "/cadastro") {
      return "/abertos";
    }
    return returnUrl;
  }
}
