import { Injectable } from "@angular/core";
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

  show(message: string, type: ToastType = "success") {
    this.subject.next({ message, type });
    setTimeout(() => this.subject.next(null), 3000);
  }
}
