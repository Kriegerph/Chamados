import { Routes } from "@angular/router";
import { AuthGuard } from "./guards/auth.guard";
import { AbertosComponent } from "./pages/abertos/abertos.component";
import { CadastroComponent } from "./pages/auth/cadastro/cadastro.component";
import { ClientesComponent } from "./pages/clientes/clientes.component";
import { ConcluidosComponent } from "./pages/concluidos/concluidos.component";
import { DashboardComponent } from "./pages/dashboard/dashboard.component";
import { LayoutComponent } from "./layout/layout.component";
import { LoginComponent } from "./pages/auth/login/login.component";

export const appRoutes: Routes = [
  { path: "login", component: LoginComponent },
  { path: "cadastro", component: CadastroComponent },
  {
    path: "",
    component: LayoutComponent,
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    children: [
      { path: "", pathMatch: "full", redirectTo: "dashboard" },
      { path: "abertos", component: AbertosComponent },
      { path: "clientes", component: ClientesComponent },
      { path: "concluidos", component: ConcluidosComponent },
      { path: "dashboard", component: DashboardComponent }
    ]
  },
  { path: "**", redirectTo: "" }
];
