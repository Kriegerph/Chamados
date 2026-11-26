import { Injectable } from "@angular/core";
import { catchError, exhaustMap, from, Observable, of, shareReplay, startWith, switchMap, tap, timeout, timer } from "rxjs";
import { environment } from "../../environments/environment";
import { AuthService } from "./auth.service";

export type WhatsappConnectionState = "starting" | "qr" | "connected" | "disconnected" | "error";

export interface WhatsappConnectionStatus {
  status: WhatsappConnectionState;
  connected: boolean;
  connecting: boolean;
  canConnect: boolean;
  message: string;
  qrDataUrl: string | null;
  firestoreConfigured: boolean;
  updatedAt: string;
}

@Injectable({
  providedIn: "root"
})
export class WhatsappConnectionService {
  private readonly baseUrl = environment.whatsappApiUrl.replace(/\/$/, "");
  private readonly loopback = ["localhost", "127.0.0.1", "[::1]"].includes(new URL(this.baseUrl).hostname);
  private localAccessApproved = false;

  readonly apiAvailable$ = timer(0, 10000).pipe(
    exhaustMap(() => from(this.getLocalNetworkPermission()).pipe(
      switchMap((permission) => permission === "granted" ? this.checkAvailability() : of(false)),
      timeout(5000),
      catchError(() => of(false))
    )),
    startWith(false),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  constructor(private readonly auth: AuthService) {}

  async getLocalNetworkPermission(): Promise<PermissionState> {
    if (!this.loopback || location.protocol !== "https:" || this.localAccessApproved) return "granted";

    try {
      const permission = await navigator.permissions.query({ name: "loopback-network" as PermissionName });
      return permission.state;
    } catch {
      return "prompt";
    }
  }

  checkAvailability(): Observable<boolean> {
    return from(this.fetchApi("/", { method: "GET" }).then((response) => response.ok)).pipe(
      tap((available) => { if (available) this.localAccessApproved = true; })
    );
  }

  getStatus(): Observable<WhatsappConnectionStatus> {
    return from(this.requestStatus("/api/whatsapp/status", "GET"));
  }

  connect(): Observable<WhatsappConnectionStatus> {
    return from(this.requestStatus("/api/whatsapp/connect", "POST"));
  }

  disconnect(): Observable<WhatsappConnectionStatus> {
    return from(this.requestStatus("/api/whatsapp/disconnect", "POST"));
  }

  private async requestStatus(path: string, method: "GET" | "POST"): Promise<WhatsappConnectionStatus> {
    const token = await this.auth.getIdToken();
    if (!token) {
      throw new Error("Usuario nao autenticado.");
    }

    const response = await this.fetchApi(path, {
      method,
      headers: { Authorization: `Bearer ${token}` },
      ...(method === "POST" ? { body: "{}" } : {})
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.error || `Erro HTTP ${response.status} ao consultar a API.`);
    }
    return data as WhatsappConnectionStatus;
  }

  private fetchApi(path: string, options: RequestInit): Promise<Response> {
    const requestOptions: RequestInit & { targetAddressSpace?: "loopback" } = {
      ...options,
      mode: "cors"
    };
    if (this.loopback && location.protocol === "https:") {
      requestOptions.targetAddressSpace = "loopback";
    }
    return fetch(`${this.baseUrl}${path}`, requestOptions);
  }
}
