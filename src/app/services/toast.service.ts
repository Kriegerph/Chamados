import { Injectable, NgZone } from "@angular/core";
import { BehaviorSubject } from "rxjs";

export type ToastType = "success" | "error";

export interface ToastMessage {
  message: string;
  type: ToastType;
}

@Injectable({
  providedIn: "root"
})
export class ToastService {
  private readonly subject = new BehaviorSubject<ToastMessage | null>(null);
  readonly toast$ = this.subject.asObservable();

  constructor(private readonly zone: NgZone) {}

  show(message: string, type: ToastType = "success") {
    this.zone.run(() => this.subject.next({ message, type }));
    setTimeout(() => this.zone.run(() => this.subject.next(null)), 3000);
  }
}
