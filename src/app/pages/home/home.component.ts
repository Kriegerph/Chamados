import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { Observable } from "rxjs";
import { User } from "firebase/auth";
import { AuthService } from "../../services/auth.service";
import { ToastService } from "../../services/toast.service";

type ToastViewModel = {
  type: "success" | "error" | "info" | "warning";
  message: string;
};

@Component({
  selector: "app-home",
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: "./home.component.html",
  styleUrl: "./home.component.css"
})
export class HomeComponent {
  toast$!: Observable<ToastViewModel | null>;
  user$!: Observable<User | null>;

  constructor(
    private readonly toast: ToastService,
    private readonly auth: AuthService,
    private readonly router: Router
  ) {
    this.toast$ = this.toast.toast$ as Observable<ToastViewModel | null>;
    this.user$ = this.auth.authState$;
  }

  async sair() {
    await this.auth.signOut();
    this.router.navigate(["/login"]);
  }
}
