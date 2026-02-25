import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener } from "@angular/core";
import { NavigationEnd, Router, RouterOutlet } from "@angular/router";
import { User } from "firebase/auth";
import { filter, map, Observable, startWith, tap } from "rxjs";
import { AuthService } from "../services/auth.service";
import { ToastService } from "../services/toast.service";
import { HeaderComponent } from "./header/header.component";
import { SidebarComponent } from "./sidebar/sidebar.component";

type ToastViewModel = {
  type: "success" | "error" | "info" | "warning";
  message: string;
};

@Component({
  selector: "app-layout",
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, HeaderComponent],
  templateUrl: "./layout.component.html",
  styleUrl: "./layout.component.css",
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LayoutComponent {
  toast$!: Observable<ToastViewModel | null>;
  user$!: Observable<User | null>;
  readonly pageTitle$: Observable<string>;

  sidebarOpen = true;
  mobileMode = false;

  private readonly titleByRoute: Record<string, string> = {
    dashboard: "Dashboard",
    abertos: "Chamados Abertos",
    concluidos: "Chamados Concluidos",
    clientes: "Clientes"
  };

  constructor(
    private readonly toast: ToastService,
    private readonly auth: AuthService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.toast$ = this.toast.toast$ as Observable<ToastViewModel | null>;
    this.user$ = this.auth.authState$;
    this.pageTitle$ = this.router.events
      .pipe(
        startWith(new NavigationEnd(0, this.router.url, this.router.url)),
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        map((event) => event.urlAfterRedirects),
        tap(() => {
          if (this.mobileMode) this.sidebarOpen = false;
        }),
        map((url) => this.resolvePageTitle(url))
      );

    this.updateViewportState(window.innerWidth);
  }

  @HostListener("window:resize", ["$event"])
  onResize(event: UIEvent) {
    const width = (event.target as Window).innerWidth;
    this.updateViewportState(width);
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  onRouteSelected() {
    if (this.mobileMode) this.sidebarOpen = false;
  }

  async sair() {
    await this.auth.signOut();
    this.router.navigate(["/login"]);
  }

  private updateViewportState(width: number) {
    const mobile = width <= 960;
    if (mobile === this.mobileMode) return;

    this.mobileMode = mobile;
    if (mobile) {
      this.sidebarOpen = false;
    }
    this.cdr.markForCheck();
  }

  private resolvePageTitle(url: string): string {
    const firstSegment = url.replace(/^\//, "").split("/")[0];
    return this.titleByRoute[firstSegment] ?? "Painel";
  }
}
