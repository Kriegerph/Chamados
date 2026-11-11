import { Injectable } from "@angular/core";
import { BehaviorSubject, map } from "rxjs";
import { ChamadosService } from "./chamados.service";

export type DashboardAnoFiltro = number | "__all__";

@Injectable({ providedIn: "root" })
export class DashboardFilterService {
  private readonly anoSubject = new BehaviorSubject<DashboardAnoFiltro>("__all__");
  readonly anoSelecionado$ = this.anoSubject.asObservable();
  readonly anosDisponiveis$;

  constructor(chamados: ChamadosService) {
    this.anosDisponiveis$ = chamados.todosState$.pipe(
      map((state) => {
        const anos = [...new Set(state.data
          .filter((item) => /^\d{4}-\d{2}-\d{2}$/.test(item.data || ""))
          .map((item) => Number(item.data.slice(0, 4))))].sort((a, b) => b - a);
        return anos.length ? anos : [new Date().getFullYear()];
      })
    );
  }

  selecionarAno(ano: DashboardAnoFiltro) {
    this.anoSubject.next(ano);
  }
}
