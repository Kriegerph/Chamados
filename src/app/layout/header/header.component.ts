import { Component, Input, ViewChild } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { AbertosComponent } from "../../pages/abertos/abertos.component";
import { DashboardFilterService } from "../../services/dashboard-filter.service";

@Component({
  selector: "app-header",
  standalone: true,
  imports: [CommonModule, FormsModule, AbertosComponent],
  templateUrl: "./header.component.html",
  styleUrl: "./header.component.css"
})
export class HeaderComponent {
  constructor(readonly dashboardFilter: DashboardFilterService) {}

  @Input() title = "Painel";
  @Input() userEmail = "Usuário";
  @ViewChild("cadastroConcluido") private cadastroConcluido?: AbertosComponent;

  abrirCadastroConcluido() {
    this.cadastroConcluido?.abrirModalCriacao();
  }

  get userInitial(): string {
    const email = this.userEmail || "U";
    return email.charAt(0).toUpperCase();
  }
}
