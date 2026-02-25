import { Component, Input } from "@angular/core";

@Component({
  selector: "app-header",
  standalone: true,
  templateUrl: "./header.component.html",
  styleUrl: "./header.component.css"
})
export class HeaderComponent {
  @Input() title = "Painel";
  @Input() userEmail = "Usuario";

  get userInitial(): string {
    const email = this.userEmail || "U";
    return email.charAt(0).toUpperCase();
  }
}
