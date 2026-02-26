import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";

type NavItem = {
  label: string;
  route: string;
  icon: string;
  exact?: boolean;
  disabled?: boolean;
};

@Component({
  selector: "app-sidebar",
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: "./sidebar.component.html",
  styleUrl: "./sidebar.component.css"
})
export class SidebarComponent {
  @Input() open = true;
  @Input() mobileMode = false;

  @Output() routeSelected = new EventEmitter<void>();
  @Output() requestToggle = new EventEmitter<void>();
  @Output() requestLogout = new EventEmitter<void>();

  readonly menuItems: NavItem[] = [
    { label: "Dashboard", route: "/dashboard", icon: "dashboard" },
    { label: "Chamados Abertos", route: "/abertos", icon: "folder-open", exact: true },
    { label: "Chamados Concluídos", route: "/concluidos", icon: "check-square" },
    { label: "Clientes", route: "/clientes", icon: "users" },
    { label: "Relatórios", route: "", icon: "bar-chart", disabled: true }
  ];

  onNavigate() {
    this.routeSelected.emit();
  }

  onToggleClick() {
    this.requestToggle.emit();
  }

  onLogoutClick() {
    this.requestLogout.emit();
  }

  getIconPath(icon: string): string {
    switch (icon) {
      case "dashboard":
        return "M4 12h7V4H4zm0 8h7v-6H4zm9 0h7V12h-7zm0-16v6h7V4z";
      case "folder-open":
        return "M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v1H3zm0 3h20l-2 9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z";
      case "check-square":
        return "M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2m-8 13-4-4 1.4-1.4L11 13.2l4.6-4.6L17 10z";
      case "users":
        return "M16 11a4 4 0 1 0-4-4 4 4 0 0 0 4 4m-8 0a3 3 0 1 0-3-3 3 3 0 0 0 3 3m0 2c-2.7 0-8 1.3-8 4v2h10v-2c0-1 .4-2 1.2-2.8A11 11 0 0 0 8 13m8 0c-2.7 0-8 1.3-8 4v2h16v-2c0-2.7-5.3-4-8-4";
      case "bar-chart":
        return "M5 9h3v11H5zm5-4h3v15h-3zm5 7h3v8h-3zm5-9h3v17h-3z";
      case "logout":
        return "M16 13v-2H7V8l-5 4 5 4v-3zM20 3H10a2 2 0 0 0-2 2v4h2V5h10v14H10v-4H8v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2";
      default:
        return "M4 4h16v16H4z";
    }
  }
}
