import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { map, Observable } from "rxjs";
import { Sistema } from "../../models/sistema.model";
import { SistemasService } from "../../services/sistemas.service";
import { ToastService } from "../../services/toast.service";

type SistemasViewModel = {
  carregando: boolean;
  erro: string | null;
  sistemas: Sistema[];
  total: number;
};

@Component({
  selector: "app-sistemas",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./sistemas.component.html",
  styleUrl: "./sistemas.component.css",
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SistemasComponent {
  nome = "";
  salvando = false;
  excluindoId: string | null = null;

  readonly vm$: Observable<SistemasViewModel>;

  constructor(
    private readonly sistemasService: SistemasService,
    private readonly toast: ToastService
  ) {
    this.vm$ = this.sistemasService.sistemasState$.pipe(
      map((state): SistemasViewModel => {
        const sistemas = this.sortSistemas(state.data);

        return {
          carregando: state.status === "loading",
          erro: state.error,
          sistemas,
          total: sistemas.length
        };
      })
    );
  }

  trackBySistema(_: number, item: Sistema): string {
    return item.id ?? item.nome;
  }

  getSistemaIdPreview(): string {
    return this.sistemasService.buildSistemaId(this.nome);
  }

  async adicionarSistema() {
    if (this.salvando) {
      return;
    }

    const nome = this.nome.trim();
    if (!nome) {
      this.toast.show("Informe o nome do sistema.", "error");
      return;
    }

    this.salvando = true;

    try {
      await this.sistemasService.createSistema(nome);
      this.toast.show("Sistema cadastrado com sucesso.", "success");
      this.nome = "";
    } catch (err: any) {
      this.toast.show(`Erro ao cadastrar sistema: ${err?.message || err}`, "error");
    } finally {
      this.salvando = false;
    }
  }

  async excluirSistema(item: Sistema) {
    if (!item.id || this.excluindoId === item.id) {
      return;
    }

    const ok = window.confirm("Deseja excluir este sistema?");
    if (!ok) {
      return;
    }

    this.excluindoId = item.id;

    try {
      await this.sistemasService.deleteSistema(item);
      this.toast.show("Sistema excluído.", "success");
    } catch (err: any) {
      this.toast.show(`Erro ao excluir sistema: ${err?.message || err}`, "error");
    } finally {
      if (this.excluindoId === item.id) {
        this.excluindoId = null;
      }
    }
  }

  getExcluirLabel(item: Sistema): string {
    return this.excluindoId === item.id ? "Excluindo..." : "Excluir";
  }

  private sortSistemas(items: Sistema[]): Sistema[] {
    return [...items].sort((a, b) => (a.nome || "").localeCompare(b.nome || "", "pt-BR"));
  }
}
