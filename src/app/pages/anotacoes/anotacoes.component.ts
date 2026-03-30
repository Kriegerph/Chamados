import { CommonModule } from "@angular/common";
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  ViewChild,
  inject
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormsModule } from "@angular/forms";
import { Timestamp } from "firebase/firestore";
import { map, Observable } from "rxjs";
import { Anotacao } from "../../models/anotacao.model";
import { DataState } from "../../models/data-state.model";
import { AnotacoesService } from "../../services/anotacoes.service";
import { ToastService } from "../../services/toast.service";

type AnotacaoListItem = Anotacao & {
  dataLabel: string | null;
};

type AnotacoesViewModel = {
  carregando: boolean;
  erro: string | null;
  anotacoes: AnotacaoListItem[];
  total: number;
};

type ToolbarButton = {
  label: string;
  title: string;
  command?: string;
  value?: string;
};

type ToolbarColor = {
  label: string;
  value: string;
};

@Component({
  selector: "app-anotacoes",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./anotacoes.component.html",
  styleUrl: "./anotacoes.component.css",
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnotacoesComponent implements AfterViewInit {
  @ViewChild("editor") editorRef?: ElementRef<HTMLDivElement>;

  titulo = "";
  salvando = false;
  excluindo = false;
  modoNovaAnotacao = false;
  anotacaoSelecionadaId: string | null = null;

  readonly fontButtons: ToolbarButton[] = [
    { label: "12", title: "Fonte pequena", command: "fontSize", value: "2" },
    { label: "16", title: "Fonte media", command: "fontSize", value: "4" },
    { label: "20", title: "Fonte grande", command: "fontSize", value: "5" }
  ];
  readonly formatButtons: ToolbarButton[] = [
    { label: "B", title: "Negrito", command: "bold" },
    { label: "I", title: "Italico", command: "italic" },
    { label: "U", title: "Sublinhado", command: "underline" }
  ];
  readonly listButtons: ToolbarButton[] = [
    { label: "• Lista", title: "Lista com marcadores", command: "insertUnorderedList" },
    { label: "1. Lista", title: "Lista numerada", command: "insertOrderedList" }
  ];
  readonly colorButtons: ToolbarColor[] = [
    { label: "Escuro", value: "#0f172a" },
    { label: "Azul", value: "#1d4ed8" },
    { label: "Verde", value: "#15803d" },
    { label: "Vermelho", value: "#b91c1c" },
    { label: "Laranja", value: "#c2410c" }
  ];

  readonly vm$: Observable<AnotacoesViewModel>;

  private readonly destroyRef = inject(DestroyRef);
  private readonly fontSizeMap: Record<string, string> = {
    "1": "10px",
    "2": "12px",
    "3": "14px",
    "4": "16px",
    "5": "20px",
    "6": "24px",
    "7": "28px"
  };
  private readonly dateFormatter = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  });
  private editorHtml = "";
  private editorReady = false;
  private savedSelection: Range | null = null;
  private resetarParaNovoQuandoSelecaoSumir = false;

  constructor(
    private readonly anotacoesService: AnotacoesService,
    private readonly toast: ToastService
  ) {
    this.vm$ = this.anotacoesService.anotacoesState$.pipe(
      map((state) => this.buildViewModel(state))
    );

    this.anotacoesService.anotacoesState$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((state) => this.syncSelection(state.data));
  }

  ngAfterViewInit() {
    this.editorReady = true;
    this.enableCssFormatting();
    this.renderEditorContent(this.editorHtml);
  }

  trackByAnotacao(_: number, item: AnotacaoListItem): string {
    return item.id ?? item.titulo;
  }

  selecionarAnotacao(item: Anotacao) {
    if (!item.id) return;
    this.modoNovaAnotacao = false;
    this.anotacaoSelecionadaId = item.id;
    this.titulo = item.titulo || "";
    this.savedSelection = null;
    this.setEditorContent(item.conteudo || "");
  }

  abrirNovaAnotacao() {
    this.modoNovaAnotacao = true;
    this.anotacaoSelecionadaId = null;
    this.titulo = "";
    this.savedSelection = null;
    this.setEditorContent("");
  }

  async salvarAnotacao() {
    if (this.salvando || this.excluindo) return;

    const titulo = this.titulo.trim();
    const conteudo = this.normalizeEditorHtml(this.getEditorContent());

    if (!titulo) {
      this.toast.show("Informe o titulo da anotacao.", "error");
      return;
    }

    if (!this.hasMeaningfulContent(conteudo)) {
      this.toast.show("Informe o conteudo da anotacao.", "error");
      return;
    }

    this.salvando = true;

    try {
      if (this.anotacaoSelecionadaId && !this.modoNovaAnotacao) {
        await this.anotacoesService.updateAnotacao(this.anotacaoSelecionadaId, {
          titulo,
          conteudo
        });
        this.toast.show("Anotacao atualizada.", "success");
      } else {
        const anotacaoId = await this.anotacoesService.createAnotacao({
          titulo,
          conteudo
        });
        this.anotacaoSelecionadaId = anotacaoId;
        this.modoNovaAnotacao = false;
        this.toast.show("Anotacao criada.", "success");
      }

      this.titulo = titulo;
      this.setEditorContent(conteudo);
    } catch (err: any) {
      this.toast.show(`Erro ao salvar anotacao: ${err?.message || err}`, "error");
    } finally {
      this.salvando = false;
    }
  }

  async excluirAnotacao() {
    if (!this.anotacaoSelecionadaId || this.modoNovaAnotacao || this.excluindo) return;

    const confirmacao = window.confirm("Tem certeza que deseja excluir esta anotacao?");
    if (!confirmacao) return;

    this.excluindo = true;
    this.resetarParaNovoQuandoSelecaoSumir = true;

    try {
      await this.anotacoesService.deleteAnotacao(this.anotacaoSelecionadaId);
      this.toast.show("Anotacao excluida.", "success");
    } catch (err: any) {
      this.resetarParaNovoQuandoSelecaoSumir = false;
      this.toast.show(`Erro ao excluir anotacao: ${err?.message || err}`, "error");
    } finally {
      this.excluindo = false;
    }
  }

  aplicarFormatacao(button: ToolbarButton) {
    if (!button.command) return;
    this.applyEditorCommand(button.command, button.value);
  }

  aplicarCor(color: string) {
    this.applyEditorCommand("foreColor", color);
  }

  inserirQuebraDeLinha() {
    this.applyEditorCommand("insertHTML", "<br>");
  }

  onToolbarMouseDown(event: MouseEvent) {
    event.preventDefault();
  }

  onEditorInput() {
    this.normalizeFontTags();
    this.editorHtml = this.normalizeEditorHtml(this.editorRef?.nativeElement.innerHTML ?? "");
  }

  onEditorPaste(event: ClipboardEvent) {
    event.preventDefault();
    const text = event.clipboardData?.getData("text/plain") ?? "";
    this.applyEditorCommand("insertText", text);
  }

  capturarSelecao() {
    const editor = this.editorRef?.nativeElement;
    const selection = window.getSelection();

    if (!editor || !selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    if (!editor.contains(range.commonAncestorContainer)) return;

    this.savedSelection = range.cloneRange();
  }

  getSalvarLabel(): string {
    if (this.salvando) return "Salvando...";
    return this.modoNovaAnotacao || !this.anotacaoSelecionadaId
      ? "Salvar anotacao"
      : "Atualizar anotacao";
  }

  getStatusLabel(): string {
    return this.modoNovaAnotacao || !this.anotacaoSelecionadaId
      ? "Nova anotacao"
      : "Editando anotacao";
  }

  podeExibirExcluir(): boolean {
    return !!this.anotacaoSelecionadaId && !this.modoNovaAnotacao;
  }

  getExcluirLabel(): string {
    return this.excluindo ? "Excluindo..." : "Excluir anotacao";
  }

  private buildViewModel(state: DataState<Anotacao[]>): AnotacoesViewModel {
    const anotacoes = this.sortAnotacoes(state.data).map((item) => ({
      ...item,
      dataLabel: this.formatDate(item.dataAtualizacao ?? item.dataCriacao ?? null)
    }));

    return {
      carregando: state.status === "loading",
      erro: state.error,
      anotacoes,
      total: anotacoes.length
    };
  }

  private syncSelection(anotacoes: Anotacao[]) {
    const ordenadas = this.sortAnotacoes(anotacoes);

    if (ordenadas.length === 0) {
      this.resetarParaNovoQuandoSelecaoSumir = false;
      if (!this.modoNovaAnotacao || !!this.anotacaoSelecionadaId) {
        this.abrirNovaAnotacao();
      }
      return;
    }

    if (this.modoNovaAnotacao) return;

    if (this.anotacaoSelecionadaId) {
      const existeSelecionada = ordenadas.some((item) => item.id === this.anotacaoSelecionadaId);
      if (existeSelecionada) return;
      if (this.resetarParaNovoQuandoSelecaoSumir) {
        this.resetarParaNovoQuandoSelecaoSumir = false;
        this.abrirNovaAnotacao();
        return;
      }
    }

    this.selecionarAnotacao(ordenadas[0]);
  }

  private sortAnotacoes(items: Anotacao[]): Anotacao[] {
    return [...items].sort((a, b) => {
      const diff = this.getTimestampMillis(b.dataAtualizacao ?? b.dataCriacao) -
        this.getTimestampMillis(a.dataAtualizacao ?? a.dataCriacao);

      if (diff !== 0) return diff;
      return (a.titulo || "").localeCompare(b.titulo || "");
    });
  }

  private formatDate(value: Timestamp | null): string | null {
    if (!value) return null;
    return this.dateFormatter.format(value.toDate());
  }

  private getTimestampMillis(value?: Timestamp | null): number {
    if (value && typeof value.toDate === "function") {
      return value.toDate().getTime();
    }
    return 0;
  }

  private applyEditorCommand(command: string, value?: string) {
    const editor = this.editorRef?.nativeElement;
    if (!editor) return;

    this.enableCssFormatting();
    editor.focus();
    this.restoreSelection();
    document.execCommand(command, false, value);
    this.normalizeFontTags();
    this.capturarSelecao();
    this.onEditorInput();
  }

  private enableCssFormatting() {
    try {
      document.execCommand("styleWithCSS", false, "true");
    } catch {
      // browsers that ignore styleWithCSS continue with execCommand defaults
    }
  }

  private restoreSelection() {
    const editor = this.editorRef?.nativeElement;
    const selection = window.getSelection();

    if (!editor || !selection) return;

    selection.removeAllRanges();

    if (this.savedSelection) {
      selection.addRange(this.savedSelection);
      return;
    }

    const range = document.createRange();
    range.selectNodeContents(editor);
    range.collapse(false);
    selection.addRange(range);
  }

  private normalizeFontTags() {
    const editor = this.editorRef?.nativeElement;
    if (!editor) return;

    const fontNodes = Array.from(editor.querySelectorAll("font"));
    fontNodes.forEach((fontNode) => {
      const span = document.createElement("span");
      const size = fontNode.getAttribute("size");
      const color = fontNode.getAttribute("color");

      if (size && this.fontSizeMap[size]) {
        span.style.fontSize = this.fontSizeMap[size];
      }

      if (color) {
        span.style.color = color;
      }

      while (fontNode.firstChild) {
        span.appendChild(fontNode.firstChild);
      }

      fontNode.replaceWith(span);
    });
  }

  private getEditorContent(): string {
    const html = this.editorRef?.nativeElement.innerHTML ?? this.editorHtml;
    return this.normalizeEditorHtml(html);
  }

  private setEditorContent(html: string) {
    this.editorHtml = this.normalizeEditorHtml(html);
    this.renderEditorContent(this.editorHtml);
  }

  private renderEditorContent(html: string) {
    if (!this.editorReady || !this.editorRef) return;
    this.editorRef.nativeElement.innerHTML = html;
  }

  private normalizeEditorHtml(html: string): string {
    return html
      .replace(/\u200B/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/<div><br><\/div>/gi, "<br>")
      .trim();
  }

  private hasMeaningfulContent(html: string): boolean {
    const text = html
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    return text.length > 0;
  }
}
