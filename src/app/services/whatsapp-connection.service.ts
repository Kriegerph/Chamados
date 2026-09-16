import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { from, Observable, switchMap } from "rxjs";
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

  constructor(
    private readonly http: HttpClient,
    private readonly auth: AuthService
  ) {}

  getStatus(): Observable<WhatsappConnectionStatus> {
    return from(this.getRequestOptions()).pipe(
      switchMap((options) =>
        this.http.get<WhatsappConnectionStatus>(`${this.baseUrl}/api/whatsapp/status`, options)
      )
    );
  }

  connect(): Observable<WhatsappConnectionStatus> {
    return from(this.getRequestOptions()).pipe(
      switchMap((options) =>
        this.http.post<WhatsappConnectionStatus>(
          `${this.baseUrl}/api/whatsapp/connect`,
          {},
          options
        )
      )
    );
  }

  disconnect(): Observable<WhatsappConnectionStatus> {
    return from(this.getRequestOptions()).pipe(
      switchMap((options) =>
        this.http.post<WhatsappConnectionStatus>(`${this.baseUrl}/api/whatsapp/disconnect`, {}, options)
      )
    );
  }

  private async getRequestOptions() {
    const token = await this.auth.getIdToken();
    if (!token) {
      throw new Error("Usuario nao autenticado.");
    }

    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    };
  }
}
