import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ViewEncapsulation,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { Bold, Italic, Underline } from '@ckeditor/ckeditor5-basic-styles';
import { type EditorConfig, Plugin } from '@ckeditor/ckeditor5-core';
import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { type ModelSelection } from '@ckeditor/ckeditor5-engine';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { FontBackgroundColor, FontColor, FontSize } from '@ckeditor/ckeditor5-font';
import { IconFontSize } from '@ckeditor/ckeditor5-icons';
import { List } from '@ckeditor/ckeditor5-list';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import {
  InputTextView,
  type ListDropdownItemDefinition,
  UIModel,
  View,
  addListToDropdown,
  createDropdown,
  focusChildOnDropdownOpen,
} from '@ckeditor/ckeditor5-ui';
import { Undo } from '@ckeditor/ckeditor5-undo';
import { Collection } from '@ckeditor/ckeditor5-utils';
import { Timestamp } from 'firebase/firestore';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';
import { Anotacao } from '../../models/anotacao.model';
import { DataState } from '../../models/data-state.model';
import { AnotacoesService } from '../../services/anotacoes.service';
import { ToastService } from '../../services/toast.service';

const FONT_SIZE_OPTIONS = [10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48];

function parseCustomFontSize(value: string | null | undefined): number | null {
  const parsed = Number.parseInt((value || '').trim(), 10);
  if (!Number.isFinite(parsed)) return null;
  return Math.max(8, Math.min(200, parsed));
}

function normalizeFontSizeCommandValue(value: string | null | undefined): string | null {
  const parsed = parseCustomFontSize(value?.replace(/px$/i, ''));
  return parsed ? `${parsed}px` : null;
}

function formatFontSizeLabel(value: string | null | undefined): string {
  const parsed = parseCustomFontSize(value?.replace(/px$/i, ''));
  return parsed ? String(parsed) : 'Tamanho';
}

class CustomFontSizeToolbar extends Plugin {
  static get pluginName() {
    return 'CustomFontSizeToolbar';
  }

  static get requires() {
    return [FontSize];
  }

  init() {
    const editor = this.editor;
    const t = editor.t;
    const command = editor.commands.get('fontSize');

    if (!command) {
      throw new Error('Comando fontSize indisponivel.');
    }

    let lastSelection: ModelSelection | null = editor.model.createSelection(
      editor.model.document.selection,
    );

    const captureSelection = () => {
      lastSelection = editor.model.createSelection(editor.model.document.selection);
    };

    const restoreSelection = () => {
      if (!lastSelection) return;

      editor.model.change((writer) => {
        writer.setSelection(lastSelection!);
      });
    };

    const applyFontSize = (rawValue: string | null | undefined) => {
      const commandValue = normalizeFontSizeCommandValue(rawValue);
      if (!commandValue) return false;

      restoreSelection();
      editor.execute('fontSize', { value: commandValue });
      editor.editing.view.focus();
      captureSelection();
      return true;
    };

    editor.model.document.selection.on('change:range', captureSelection);

    editor.ui.componentFactory.add('customFontSize', (locale) => {
      const dropdownView = createDropdown(locale);
      const listOptions = new Collection<ListDropdownItemDefinition>();
      const inputView = new InputTextView(locale);
      const customInputView = new View(locale);

      for (const size of FONT_SIZE_OPTIONS) {
        const definition: ListDropdownItemDefinition = {
          type: 'button',
          model: new UIModel({
            commandName: 'fontSize',
            commandParam: `${size}px`,
            label: String(size),
            class: 'ck-fontsize-option',
            role: 'menuitemradio',
            withText: true,
          }),
        };

        definition.model
          .bind('isOn')
          .to(command, 'value', (value: string) => value === `${size}px`);
        listOptions.add(definition);
      }

      listOptions.add({
        type: 'button',
        model: new UIModel({
          commandName: 'fontSize',
          commandParam: undefined,
          label: 'Padrao',
          class: 'ck-fontsize-option ck-fontsize-option-reset',
          role: 'menuitemradio',
          withText: true,
        }),
      });

      addListToDropdown(dropdownView, listOptions, {
        role: 'menu',
        ariaLabel: t('Tamanho da fonte'),
      });

      inputView.set({
        ariaLabel: t('Digite um tamanho de fonte'),
        inputMode: 'numeric',
        placeholder: '17',
      });
      inputView.extendTemplate({
        attributes: {
          class: ['ck-custom-font-size-input'],
        },
      });

      customInputView.setTemplate({
        tag: 'div',
        attributes: {
          class: ['ck', 'ck-custom-font-size-panel'],
        },
        children: [
          {
            tag: 'div',
            attributes: {
              class: ['ck-custom-font-size-copy'],
            },
            children: [
              {
                tag: 'span',
                attributes: {
                  class: ['ck-custom-font-size-title'],
                },
                children: ['Tamanho'],
              },
              {
                tag: 'span',
                attributes: {
                  class: ['ck-custom-font-size-hint'],
                },
                children: ['Digite um valor e pressione Enter'],
              },
            ],
          },
          inputView,
        ],
      });

      dropdownView.panelView.children.add(customInputView);

      dropdownView.buttonView.set({
        icon: IconFontSize,
        label: formatFontSizeLabel(command.value as string | undefined),
        tooltip: t('Tamanho da fonte'),
        withText: true,
      });

      dropdownView.extendTemplate({
        attributes: {
          class: ['ck-custom-font-size-dropdown'],
        },
      });

      dropdownView.bind('isEnabled').to(command);
      dropdownView.buttonView
        .bind('label')
        .to(command, 'value', (value: string | undefined) => formatFontSizeLabel(value));

      this.listenTo(dropdownView, 'execute', (evt: any) => {
        restoreSelection();
        editor.execute(evt.source.commandName, {
          value: evt.source.commandParam,
        });
        editor.editing.view.focus();
        captureSelection();
        dropdownView.isOpen = false;
      });

      focusChildOnDropdownOpen(dropdownView, () => inputView);

      this.listenTo(dropdownView, 'change:isOpen', () => {
        if (!dropdownView.isOpen) return;

        inputView.value = formatFontSizeLabel(command.value as string | undefined).replace(
          'Tamanho',
          '',
        );

        queueMicrotask(() => {
          inputView.select();

          if (!inputView.element) return;

          inputView.element.onkeydown = (event: KeyboardEvent) => {
            if (event.key !== 'Enter') return;
            event.preventDefault();

            if (applyFontSize(inputView.element?.value)) {
              dropdownView.isOpen = false;
            }
          };
        });
      });

      this.listenTo(inputView, 'input', () => {
        const numericValue = (inputView.element?.value || '').replace(/[^\d]/g, '');
        inputView.value = numericValue;
      });

      return dropdownView;
    });
  }
}

type AnotacaoListItem = Anotacao & {
  dataLabel: string | null;
};

type AnotacoesViewModel = {
  carregando: boolean;
  erro: string | null;
  anotacoes: AnotacaoListItem[];
  totalFiltrado: number;
  total: number;
};

@Component({
  selector: 'app-anotacoes',
  standalone: true,
  imports: [CommonModule, FormsModule, CKEditorModule],
  templateUrl: './anotacoes.component.html',
  styleUrl: './anotacoes.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class AnotacoesComponent {
  readonly Editor = ClassicEditor;
  readonly editorConfig: EditorConfig = {
    licenseKey: 'GPL',
    plugins: [
      Essentials,
      Paragraph,
      Bold,
      Italic,
      Underline,
      CustomFontSizeToolbar,
      FontColor,
      FontBackgroundColor,
      List,
      Undo,
    ],
    toolbar: {
      items: [
        'bold',
        'italic',
        'underline',
        '|',
        'customFontSize',
        '|',
        'fontColor',
        'fontBackgroundColor',
        '|',
        'bulletedList',
        'numberedList',
        '|',
        'undo',
        'redo',
      ],
      shouldNotGroupWhenFull: true,
    },
    placeholder: 'Escreva sua anotacao aqui...',
    fontSize: {
      options: [...FONT_SIZE_OPTIONS, 'default'],
      supportAllValues: true,
    },
    fontColor: {
      columns: 6,
      documentColors: 12,
    },
    fontBackgroundColor: {
      columns: 6,
      documentColors: 12,
    },
  };
  titulo = '';
  conteudoHtml = '';
  salvando = false;
  excluindo = false;
  modoNovaAnotacao = false;
  anotacaoSelecionadaId: string | null = null;
  filtroTitulo = '';

  readonly vm$: Observable<AnotacoesViewModel>;

  private readonly destroyRef = inject(DestroyRef);
  private readonly filtroTituloSubject = new BehaviorSubject<string>('');
  private readonly dateFormatter = new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
  private resetarParaNovoQuandoSelecaoSumir = false;

  constructor(
    private readonly anotacoesService: AnotacoesService,
    private readonly toast: ToastService,
  ) {
    this.vm$ = combineLatest([
      this.anotacoesService.anotacoesState$,
      this.filtroTituloSubject,
    ]).pipe(map(([state, filtroTitulo]) => this.buildViewModel(state, filtroTitulo)));

    this.anotacoesService.anotacoesState$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((state) => this.syncSelection(state.data));
  }

  trackByAnotacao(_: number, item: AnotacaoListItem): string {
    return item.id ?? item.titulo;
  }

  selecionarAnotacao(item: Anotacao) {
    if (!item.id) return;
    this.modoNovaAnotacao = false;
    this.anotacaoSelecionadaId = item.id;
    this.titulo = item.titulo || '';
    this.conteudoHtml = this.normalizeEditorHtml(item.conteudo || '');
  }

  abrirNovaAnotacao() {
    this.modoNovaAnotacao = true;
    this.anotacaoSelecionadaId = null;
    this.titulo = '';
    this.conteudoHtml = '';
  }

  async salvarAnotacao() {
    if (this.salvando || this.excluindo) return;

    const titulo = this.titulo.trim();
    const conteudo = this.normalizeEditorHtml(this.conteudoHtml);

    if (!titulo) {
      this.toast.show('Informe o titulo da anotacao.', 'error');
      return;
    }

    if (!this.hasMeaningfulContent(conteudo)) {
      this.toast.show('Informe o conteudo da anotacao.', 'error');
      return;
    }

    this.salvando = true;

    try {
      if (this.anotacaoSelecionadaId && !this.modoNovaAnotacao) {
        await this.anotacoesService.updateAnotacao(this.anotacaoSelecionadaId, {
          titulo,
          conteudo,
        });
        this.toast.show('Anotacao atualizada.', 'success');
      } else {
        const anotacaoId = await this.anotacoesService.createAnotacao({
          titulo,
          conteudo,
        });
        this.anotacaoSelecionadaId = anotacaoId;
        this.modoNovaAnotacao = false;
        this.toast.show('Anotacao criada.', 'success');
      }

      this.titulo = titulo;
      this.conteudoHtml = conteudo;
    } catch (err: any) {
      this.toast.show(`Erro ao salvar anotacao: ${err?.message || err}`, 'error');
    } finally {
      this.salvando = false;
    }
  }

  async excluirAnotacao() {
    if (!this.anotacaoSelecionadaId || this.modoNovaAnotacao || this.excluindo) return;

    const confirmacao = window.confirm('Tem certeza que deseja excluir esta anotacao?');
    if (!confirmacao) return;

    this.excluindo = true;
    this.resetarParaNovoQuandoSelecaoSumir = true;

    try {
      await this.anotacoesService.deleteAnotacao(this.anotacaoSelecionadaId);
      this.toast.show('Anotacao excluida.', 'success');
    } catch (err: any) {
      this.resetarParaNovoQuandoSelecaoSumir = false;
      this.toast.show(`Erro ao excluir anotacao: ${err?.message || err}`, 'error');
    } finally {
      this.excluindo = false;
    }
  }

  getSalvarLabel(): string {
    if (this.salvando) return 'Salvando...';
    return this.modoNovaAnotacao || !this.anotacaoSelecionadaId
      ? 'Salvar anotacao'
      : 'Atualizar anotacao';
  }

  getStatusLabel(): string {
    return this.modoNovaAnotacao || !this.anotacaoSelecionadaId
      ? 'Nova anotacao'
      : 'Editando anotacao';
  }

  podeExibirExcluir(): boolean {
    return !!this.anotacaoSelecionadaId && !this.modoNovaAnotacao;
  }

  getExcluirLabel(): string {
    return this.excluindo ? 'Excluindo...' : 'Excluir anotacao';
  }

  atualizarFiltroTitulo(valor: string) {
    this.filtroTitulo = valor;
    this.filtroTituloSubject.next(valor);
  }

  private buildViewModel(state: DataState<Anotacao[]>, filtroTitulo: string): AnotacoesViewModel {
    const anotacoesOrdenadas = this.sortAnotacoes(state.data).map((item) => ({
      ...item,
      dataLabel: this.formatDate(item.dataAtualizacao ?? item.dataCriacao ?? null),
    }));
    const anotacoes = this.filterAnotacoes(anotacoesOrdenadas, filtroTitulo);

    return {
      carregando: state.status === 'loading',
      erro: state.error,
      anotacoes,
      totalFiltrado: anotacoes.length,
      total: anotacoesOrdenadas.length,
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
      const diff =
        this.getTimestampMillis(b.dataAtualizacao ?? b.dataCriacao) -
        this.getTimestampMillis(a.dataAtualizacao ?? a.dataCriacao);

      if (diff !== 0) return diff;
      return (a.titulo || '').localeCompare(b.titulo || '');
    });
  }

  private filterAnotacoes(items: AnotacaoListItem[], filtroTitulo: string): AnotacaoListItem[] {
    const termos = filtroTitulo.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);

    if (termos.length === 0) {
      return items;
    }

    return items.filter((item) => {
      const titulo = (item.titulo || '').toLocaleLowerCase();
      return termos.every((termo) => titulo.includes(termo));
    });
  }

  private formatDate(value: Timestamp | null): string | null {
    if (!value) return null;
    return this.dateFormatter.format(value.toDate());
  }

  private getTimestampMillis(value?: Timestamp | null): number {
    if (value && typeof value.toDate === 'function') {
      return value.toDate().getTime();
    }
    return 0;
  }

  private normalizeEditorHtml(html: string): string {
    return html
      .replace(/\u200B/g, '')
      .replace(/&nbsp;/g, ' ')
      .trim();
  }

  private hasMeaningfulContent(html: string): boolean {
    const text = html
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return text.length > 0;
  }
}
