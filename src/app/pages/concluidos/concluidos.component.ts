import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  NgZone,
  ViewChild
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Timestamp } from "firebase/firestore";
import { BehaviorSubject, combineLatest, map, Observable, tap } from "rxjs";
import { Chamado } from "../../models/chamado.model";
import { Cliente } from "../../models/cliente.model";
import { DataState } from "../../models/data-state.model";
import { Empresa, Funcionario } from "../../models/empresa.model";
import { Sistema } from "../../models/sistema.model";
import { ChamadosService } from "../../services/chamados.service";
import { ClientesService } from "../../services/clientes.service";
import { EmpresasService } from "../../services/empresas.service";
import { SistemasService } from "../../services/sistemas.service";
import { ToastService } from "../../services/toast.service";

interface GrupoConcluidos {
  data: string;
  items: ConcluidoItemView[];
}

type ConcluidoItemView = Chamado & {
  clienteLabel: string;
  funcionarioLabel: string;
  sistemaResumo: string;
  sistemaTooltip: string;
};

type ConcluidosFiltros = {
  ano: string;
  mes: string;
  data: string;
  empresaId: string;
  clienteId: string;
  texto: string;
};

type MesFiltroOption = {
  valor: string;
  label: string;
};

type PaginationButton = number | "...";

type EmpresaFiltroOption = {
  valor: string;
  nome: string;
  empresaId: string;
};

type ClienteFiltroOption = {
  valor: string;
  nome: string;
  funcionarioId: string;
  empresaId: string;
  empresaNome: string;
};

type ClienteFiltroGroup = {
  empresaValor: string;
  empresaNome: string;
  items: ClienteFiltroOption[];
};

type SistemaOptionView = Sistema & {
  id: string;
};

type ConcluidosViewModel = {
  carregando: boolean;
  erro: string | null;
  empresasFiltro: EmpresaFiltroOption[];
  clientesFiltro: ClienteFiltroGroup[];
  empresas: Empresa[];
  sistemas: SistemaOptionView[];
  sistemasErro: string | null;
  grupos: GrupoConcluidos[];
  totalConcluidos: number;
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  pageButtons: PaginationButton[];
  totalExibidos: number;
  inicioIntervalo: number;
  fimIntervalo: number;
};

const FILTROS_INICIAIS: ConcluidosFiltros = {
  ano: "",
  mes: "",
  data: "",
  empresaId: "",
  clienteId: "",
  texto: ""
};

const MESES_ABREV = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez"
];

@Component({
  selector: "app-concluidos",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./concluidos.component.html",
  styleUrl: "./concluidos.component.css",
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConcluidosComponent {
  @ViewChild("chamadosListTop") private chamadosListTop?: ElementRef<HTMLElement>;

  filtrosDraft: ConcluidosFiltros = this.cloneFiltros(FILTROS_INICIAIS);
  anosDisponiveis: string[] = [];
  pageSize = 10;
  readonly pageSizeOptions = [10, 20, 50, 100];

  editando = false;
  editId: string | null = null;
  editMotivo = "";
  editClienteNomeOriginal = "";
  editEmpresaId = "";
  editEmpresaNomeOriginal = "";
  editFuncionarioId = "";
  editFuncionarioNomeOriginal = "";
  editContextoSistemaId = "";
  editSistemasRelacionados: string[] = [];
  editData = "";
  editTempoChamado = "";
  editTempoNaoRegistrado = false;
  editResolucao = "";
  editUsaEmpresa = false;
  editFuncionarios: Funcionario[] = [];
  editCarregandoFuncionarios = false;

  private filtrosAplicados: ConcluidosFiltros = this.cloneFiltros(FILTROS_INICIAIS);
  private mesesDisponiveisPorAno = new Map<string, MesFiltroOption[]>();
  private readonly filtrosAplicadosSubject = new BehaviorSubject<ConcluidosFiltros>(
    this.cloneFiltros(FILTROS_INICIAIS)
  );
  private readonly pageSizeSubject = new BehaviorSubject<number>(this.pageSize);
  private readonly currentPageSubject = new BehaviorSubject<number>(1);

  readonly vm$: Observable<ConcluidosViewModel>;

  constructor(
    private readonly chamadosService: ChamadosService,
    private readonly clientesService: ClientesService,
    private readonly empresasService: EmpresasService,
    private readonly sistemasService: SistemasService,
    private readonly toast: ToastService,
    private readonly zone: NgZone,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.vm$ = combineLatest([
      this.chamadosService.todosState$,
      this.clientesService.clientesState$,
      this.empresasService.empresasState$,
      this.sistemasService.sistemasState$,
      this.filtrosAplicadosSubject,
      this.pageSizeSubject,
      this.currentPageSubject
    ]).pipe(
      map(([chamadosState, clientesState, empresasState, sistemasState, filtros, pageSize, currentPage]) =>
        this.buildViewModel(
          chamadosState,
          clientesState,
          empresasState,
          sistemasState,
          filtros,
          pageSize,
          currentPage
        )
      ),
      tap((viewModel) => {
        if (viewModel.currentPage !== this.currentPageSubject.value) {
          this.currentPageSubject.next(viewModel.currentPage);
        }
      })
    );
  }

  get mesesDisponiveisDraft(): MesFiltroOption[] {
    if (!this.filtrosDraft.ano) return [];
    return this.mesesDisponiveisPorAno.get(this.filtrosDraft.ano) ?? [];
  }

  onAnoDraftChange() {
    this.filtrosDraft.mes = "";
    this.onFiltroDraftChange();
  }

  onEmpresaFiltroDraftChange() {
    this.filtrosDraft.clienteId = "";
    this.onFiltroDraftChange();
  }

  onFiltroDraftChange() {
    if (this.currentPageSubject.value === 1) return;
    this.currentPageSubject.next(1);
  }

  getClientesFiltroGroups(grupos: ClienteFiltroGroup[]): ClienteFiltroGroup[] {
    if (!this.filtrosDraft.empresaId) return grupos;
    return grupos.filter((grupo) => grupo.empresaValor === this.filtrosDraft.empresaId);
  }

  aplicarFiltros() {
    this.filtrosAplicados = this.cloneFiltros(this.filtrosDraft);
    this.currentPageSubject.next(1);
    this.filtrosAplicadosSubject.next(this.cloneFiltros(this.filtrosAplicados));
    this.scrollParaTopoDaListagem();
  }

  limparFiltros() {
    this.filtrosDraft = this.cloneFiltros(FILTROS_INICIAIS);
    this.filtrosAplicados = this.cloneFiltros(FILTROS_INICIAIS);
    this.currentPageSubject.next(1);
    this.filtrosAplicadosSubject.next(this.cloneFiltros(this.filtrosAplicados));
    this.scrollParaTopoDaListagem();
  }

  onPageSizeChange() {
    this.currentPageSubject.next(1);
    this.pageSizeSubject.next(this.pageSize);
    this.scrollParaTopoDaListagem();
  }

  irParaPrimeiraPagina(totalPages: number) {
    if (totalPages <= 0) return;
    this.irParaPagina(1, totalPages);
  }

  irParaPaginaAnterior(totalPages: number) {
    if (totalPages <= 0) return;
    this.irParaPagina(this.currentPageSubject.value - 1, totalPages);
  }

  irParaPagina(page: number, totalPages: number) {
    if (totalPages <= 0) return;
    const paginaClamped = Math.min(Math.max(page, 1), totalPages);
    if (paginaClamped === this.currentPageSubject.value) return;
    this.currentPageSubject.next(paginaClamped);
    this.scrollParaTopoDaListagem();
  }

  irParaProximaPagina(totalPages: number) {
    if (totalPages <= 0) return;
    this.irParaPagina(this.currentPageSubject.value + 1, totalPages);
  }

  irParaUltimaPagina(totalPages: number) {
    if (totalPages <= 0) return;
    this.irParaPagina(totalPages, totalPages);
  }

  trackByPageButton(index: number, item: PaginationButton): string {
    return `${item}-${index}`;
  }

  private scrollParaTopoDaListagem() {
    const target = this.chamadosListTop?.nativeElement;
    if (!target) return;

    requestAnimationFrame(() => {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest"
      });
    });
  }

  formatIntervaloAtendimento(item: Chamado): string {
    const fim = this.getHorarioFim(item);
    const inicio = this.getHorarioInicio(item, fim);

    if (!inicio && !fim) {
      return "-- \u2192 --";
    }

    return `${this.formatHora(inicio)} \u2192 ${this.formatHora(fim)}`;
  }

  formatTempoAtendimento(item: Chamado): string {
    const minutos = item.tempoAtendimentoMinutos;
    if (typeof minutos !== "number" || Number.isNaN(minutos)) {
      return "Tempo não registrado";
    }

    const totalMinutos = Math.max(0, Math.floor(minutos));
    if (totalMinutos < 60) {
      return `${totalMinutos} min`;
    }

    const horas = Math.floor(totalMinutos / 60);
    const minutosRestantes = totalMinutos % 60;
    return `${horas}h ${minutosRestantes.toString().padStart(2, "0")}m`;
  }

  async abrirModalEditar(item: ConcluidoItemView) {
    this.editando = true;
    this.editId = item.id ?? null;
    this.editMotivo = item.motivo || "";
    this.editData = item.data || "";
    const tempoAtendimentoMinutos = this.getTempoAtendimentoMinutos(item);
    this.editTempoNaoRegistrado = tempoAtendimentoMinutos == null;
    this.editTempoChamado = tempoAtendimentoMinutos == null
      ? ""
      : this.formatTempoChamado(tempoAtendimentoMinutos);
    this.editResolucao = item.resolucao || "";
    this.editUsaEmpresa = this.isChamadoEmpresa(item);
    this.editClienteNomeOriginal = this.editUsaEmpresa ? "" : item.clienteLabel;
    this.editEmpresaId = "";
    this.editEmpresaNomeOriginal = "";
    this.editFuncionarioId = "";
    this.editFuncionarioNomeOriginal = "";
    this.editFuncionarios = [];

    this.editEmpresaId = item.empresaId || this.getEmpresaIdByNome(item.empresa || "");
    this.editEmpresaNomeOriginal = item.empresa || "";
    this.editFuncionarioId = item.funcionarioId || "";
    this.editFuncionarioNomeOriginal = item.funcionario || "";
    this.editContextoSistemaId = item.contextoSistemaId || "";
    this.editSistemasRelacionados = this.sanitizeSistemaIds(
      item.sistemasRelacionados,
      item.contextoSistemaId,
      this.editEmpresaId
    );
    if (this.editEmpresaId) {
      await this.carregarFuncionariosEdicao(this.editEmpresaId);
      if (!this.editFuncionarioId && this.editFuncionarioNomeOriginal) {
        this.runInZone(() => {
          this.editFuncionarioId =
            this.editFuncionarios.find(
              (funcionario) => funcionario.nomeFuncionario === this.editFuncionarioNomeOriginal
            )?.id || "";
        });
      }
    }
  }

  cancelarEdicao() {
    this.editando = false;
    this.editId = null;
    this.editMotivo = "";
    this.editClienteNomeOriginal = "";
    this.editEmpresaId = "";
    this.editEmpresaNomeOriginal = "";
    this.editFuncionarioId = "";
    this.editFuncionarioNomeOriginal = "";
    this.editContextoSistemaId = "";
    this.editSistemasRelacionados = [];
    this.editData = "";
    this.editTempoChamado = "";
    this.editTempoNaoRegistrado = false;
    this.editResolucao = "";
    this.editUsaEmpresa = false;
    this.editFuncionarios = [];
  }

  async onEditEmpresaChange(empresaId: string) {
    this.iniciarCarregamentoFuncionariosEdicao(empresaId);

    if (!empresaId) {
      this.finalizarCarregamentoFuncionariosEdicao([]);
      return;
    }

    await this.carregarFuncionariosEdicao(empresaId);
  }

  async salvarEdicao() {
    if (!this.editId) return;
    const motivo = this.editMotivo.trim();
    const data = this.editData;
    const tempoAtendimentoMinutos = this.editTempoNaoRegistrado
      ? undefined
      : this.getTempoChamadoMinutos(this.editTempoChamado);
    const resolucao = this.editResolucao.trim();
    const empresa = this.getEmpresaNomeById(this.editEmpresaId) || this.editEmpresaNomeOriginal;
    const funcionario =
      this.getFuncionarioNomeById(this.editFuncionarioId, this.editFuncionarios) ||
      this.editFuncionarioNomeOriginal;

    if (!motivo || !data || !resolucao) {
      this.toast.show("Preencha motivo, data e resolução.", "error");
      return;
    }

    if (!this.editEmpresaId || !empresa || !this.editFuncionarioId || !funcionario) {
      this.toast.show("Preencha empresa e funcionário.", "error");
      return;
    }

    if (tempoAtendimentoMinutos === undefined && !this.editTempoNaoRegistrado) {
      return;
    }

    try {
      const payload: Partial<Chamado> = {
        motivo,
        data,
        resolucao,
        empresa,
        empresaId: this.editEmpresaId,
        funcionario,
        funcionarioId: this.editFuncionarioId,
        contextoSistemaId: this.editContextoSistemaId.trim(),
        sistemasRelacionados: this.sanitizeSistemaIds(
          this.editSistemasRelacionados,
          this.editContextoSistemaId,
          this.editEmpresaId
        )
      };
      if (this.editUsaEmpresa) {
        payload.cliente = empresa;
        payload.clienteNome = empresa;
      }
      if (!this.editTempoNaoRegistrado) {
        payload.tempoAtendimento = tempoAtendimentoMinutos ?? null;
        payload.tempoAtendimentoMinutos = tempoAtendimentoMinutos ?? null;
      }
      await this.chamadosService.updateChamado(this.editId, payload);
      this.runInZone(() => {
        this.toast.show("Chamado atualizado.", "success");
        this.cancelarEdicao();
      });
    } catch (err: any) {
      this.toast.show(`Erro ao atualizar: ${err.message}`, "error");
    }
  }

  async excluirChamado(item: Chamado) {
    if (!item.id) return;
    const ok = window.confirm("Tem certeza que deseja excluir este chamado?");
    if (!ok) return;
    try {
      await this.chamadosService.deleteChamado(item.id);
      this.toast.show("Chamado excluído.", "success");
    } catch (err: any) {
      this.toast.show(`Erro ao excluir: ${err.message}`, "error");
    }
  }

  private buildViewModel(
    chamadosState: DataState<Chamado[]>,
    clientesState: DataState<Cliente[]>,
    empresasState: DataState<Empresa[]>,
    sistemasState: DataState<Sistema[]>,
    filtros: ConcluidosFiltros,
    pageSize: number,
    currentPage: number
  ): ConcluidosViewModel {
    const clientes = this.sortClientes(clientesState.data);
    const clientesMap = new Map(
      clientes.filter((item) => !!item.id).map((item) => [item.id as string, item])
    );
    const empresas = this.sortEmpresas(empresasState.data);
    const empresasMap = new Map(
      empresas.filter((item) => !!item.id).map((item) => [item.id as string, item])
    );
    const sistemas = this.sortSistemas(sistemasState.data)
      .filter((item): item is SistemaOptionView => !!item.id)
      .map((item) => ({
        ...item,
        id: item.id!
      }));
    const sistemasMap = new Map(sistemas.map((item) => [item.id, item]));
    const concluidos = this.sortByDataDesc(
      chamadosState.data.filter((item) => item.status === "concluido")
    ).map((item) => ({
      ...item,
      clienteLabel: this.getClienteLabelFromMap(item, clientesMap, empresasMap),
      funcionarioLabel: item.funcionario || "",
      sistemaResumo: this.buildSistemaResumo(item, sistemasMap),
      sistemaTooltip: this.buildSistemaTooltip(item, sistemasMap)
    }));

    this.atualizarOpcoesData(concluidos);
    const empresasFiltro = this.buildEmpresasFiltro(concluidos, empresasMap);
    const clientesFiltro = this.buildClientesFiltro(concluidos, empresasMap);
    const filtrados = this.filtrarConcluidos(concluidos, filtros, empresasFiltro, clientesFiltro);
    const totalItems = filtrados.length;
    const totalPages = totalItems > 0 ? Math.ceil(totalItems / pageSize) : 0;
    const paginaAtual = totalPages > 0 ? Math.min(Math.max(currentPage, 1), totalPages) : 1;
    const start = totalItems > 0 ? (paginaAtual - 1) * pageSize : 0;
    const fim = totalItems > 0 ? Math.min(start + pageSize, totalItems) : 0;
    const itensPaginados = filtrados.slice(start, fim);
    const grupos = this.agruparPorData(itensPaginados);

    return {
      carregando:
        chamadosState.status === "loading" ||
        clientesState.status === "loading" ||
        empresasState.status === "loading" ||
        sistemasState.status === "loading",
      erro: chamadosState.error || clientesState.error || empresasState.error,
      empresasFiltro,
      clientesFiltro,
      empresas,
      sistemas,
      sistemasErro: sistemasState.error,
      grupos,
      totalConcluidos: concluidos.length,
      totalItems,
      totalPages,
      currentPage: paginaAtual,
      pageSize,
      pageButtons: this.buildPageButtons(totalPages, paginaAtual),
      totalExibidos: itensPaginados.length,
      inicioIntervalo: totalItems > 0 ? start + 1 : 0,
      fimIntervalo: fim
    };
  }

  private buildPageButtons(totalPages: number, currentPage: number): PaginationButton[] {
    if (totalPages <= 0) return [];
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }
    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, "...", totalPages];
    }
    if (currentPage >= totalPages - 3) {
      return [
        1,
        "...",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages
      ];
    }
    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
  }

  private filtrarConcluidos(
    items: ConcluidoItemView[],
    filtros: ConcluidosFiltros,
    empresasFiltro: EmpresaFiltroOption[],
    clientesFiltro: ClienteFiltroGroup[]
  ): ConcluidoItemView[] {
    const textoBusca = this.normalizarTexto(filtros.texto.trim());
    const empresaFiltroSelecionada =
      empresasFiltro.find((item) => item.valor === filtros.empresaId) ?? null;
    const empresaFiltroNomeNormalizado = empresaFiltroSelecionada
      ? this.normalizarTexto(empresaFiltroSelecionada.nome)
      : "";
    const clienteFiltroSelecionado =
      this.findClienteFiltroOption(clientesFiltro, filtros.clienteId);
    const clienteFiltroNomeNormalizado = clienteFiltroSelecionado
      ? this.normalizarTexto(clienteFiltroSelecionado.nome)
      : "";

    return items.filter((item) => {
      const data = item.data || "";

      if (filtros.data) {
        if (data !== filtros.data) return false;
      } else {
        if (filtros.ano && !data.startsWith(`${filtros.ano}-`)) return false;
        if (filtros.mes && data.slice(5, 7) !== filtros.mes) return false;
      }

      if (filtros.empresaId && empresaFiltroSelecionada) {
        if (empresaFiltroSelecionada.empresaId) {
          if (item.empresaId === empresaFiltroSelecionada.empresaId) {
            // Match direto por empresaId.
          } else {
            const nomeItem = this.normalizarTexto(item.clienteLabel || item.empresa || item.cliente || "");
            if (!empresaFiltroNomeNormalizado || nomeItem !== empresaFiltroNomeNormalizado) return false;
          }
        } else if (empresaFiltroNomeNormalizado) {
          const nomeItem = this.normalizarTexto(item.clienteLabel || item.empresa || item.cliente || "");
          if (nomeItem !== empresaFiltroNomeNormalizado) return false;
        } else {
          return false;
        }
      }

      if (filtros.clienteId && clienteFiltroSelecionado) {
        if (clienteFiltroSelecionado.funcionarioId) {
          if (
            item.funcionarioId === clienteFiltroSelecionado.funcionarioId &&
            item.empresaId === clienteFiltroSelecionado.empresaId
          ) {
            // Match direto por funcionarioId.
          } else {
            const nomeItem = this.normalizarTexto(item.funcionarioLabel || item.funcionario || "");
            if (
              !clienteFiltroNomeNormalizado ||
              nomeItem !== clienteFiltroNomeNormalizado ||
              item.empresaId !== clienteFiltroSelecionado.empresaId
            ) {
              return false;
            }
          }
        } else if (clienteFiltroNomeNormalizado) {
          const nomeItem = this.normalizarTexto(item.funcionarioLabel || item.funcionario || "");
          if (
            nomeItem !== clienteFiltroNomeNormalizado ||
            item.empresaId !== clienteFiltroSelecionado.empresaId
          ) {
            return false;
          }
        } else {
          return false;
        }
      }

      if (textoBusca) {
        const alvo = this.normalizarTexto(
          `${item.motivo || ""} ${item.resolucao || ""} ${item.clienteLabel || ""} ${item.funcionarioLabel || ""}`
        );
        if (!alvo.includes(textoBusca)) return false;
      }

      return true;
    });
  }

  private buildEmpresasFiltro(
    items: ConcluidoItemView[],
    empresasMap: Map<string, Empresa>
  ): EmpresaFiltroOption[] {
    const opcoesPorChave = new Map<string, EmpresaFiltroOption>();

    items.forEach((item) => {
      const empresaId = item.empresaId || "";
      const nomeEmpresa =
        item.empresa ||
        (empresaId ? empresasMap.get(empresaId)?.nomeEmpresa || "" : "") ||
        item.clienteLabel ||
        item.cliente ||
        "";
      const nomeNormalizado = this.normalizarTexto(nomeEmpresa);

      if (empresaId) {
        const chave = `id:${empresaId}`;
        if (!opcoesPorChave.has(chave)) {
          opcoesPorChave.set(chave, {
            valor: chave,
            nome: nomeEmpresa || "Empresa não informada",
            empresaId
          });
        }
        return;
      }

      if (!nomeNormalizado) return;
      const jaExisteComMesmoNome = Array.from(opcoesPorChave.values()).some(
        (itemOpcao) => this.normalizarTexto(itemOpcao.nome) === nomeNormalizado
      );
      if (jaExisteComMesmoNome) return;
      const chave = `nome:${nomeNormalizado}`;
      if (!opcoesPorChave.has(chave)) {
        opcoesPorChave.set(chave, {
          valor: chave,
          nome: nomeEmpresa,
          empresaId: ""
        });
      }
    });

    return Array.from(opcoesPorChave.values()).sort((a, b) => a.nome.localeCompare(b.nome));
  }

  private buildClientesFiltro(
    items: ConcluidoItemView[],
    empresasMap: Map<string, Empresa>
  ): ClienteFiltroGroup[] {
    const gruposPorChave = new Map<string, ClienteFiltroGroup>();
    const opcoesPorGrupo = new Map<string, Set<string>>();

    items.forEach((item) => {
      const nomeFuncionario = item.funcionarioLabel || item.funcionario || "";
      const nomeNormalizado = this.normalizarTexto(nomeFuncionario);
      if (!nomeNormalizado) return;

      const empresaId = item.empresaId || "";
      const empresaNome =
        item.empresa ||
        (empresaId ? empresasMap.get(empresaId)?.nomeEmpresa || "" : "") ||
        "Empresa nÃ£o informada";
      const empresaValor = empresaId ? `id:${empresaId}` : `nome:${this.normalizarTexto(empresaNome)}`;
      const grupoChave = empresaValor;
      const opcaoChave = `nome:${grupoChave}:${nomeNormalizado}`;

      if (!gruposPorChave.has(grupoChave)) {
        gruposPorChave.set(grupoChave, {
          empresaValor,
          empresaNome,
          items: []
        });
        opcoesPorGrupo.set(grupoChave, new Set<string>());
      }

      const opcoesGrupo = opcoesPorGrupo.get(grupoChave);
      if (!opcoesGrupo || opcoesGrupo.has(opcaoChave)) {
        return;
      }
      opcoesGrupo.add(opcaoChave);

      gruposPorChave.get(grupoChave)?.items.push({
        valor: opcaoChave,
        nome: nomeFuncionario,
        funcionarioId: "",
        empresaId,
        empresaNome
      });
    });

    return Array.from(gruposPorChave.values())
      .map((grupo) => ({
        ...grupo,
        items: grupo.items.sort((a, b) => a.nome.localeCompare(b.nome))
      }))
      .sort((a, b) => a.empresaNome.localeCompare(b.empresaNome));
  }

  private findClienteFiltroOption(
    grupos: ClienteFiltroGroup[],
    valor: string
  ): ClienteFiltroOption | null {
    if (!valor) return null;
    return grupos.flatMap((grupo) => grupo.items).find((item) => item.valor === valor) ?? null;
  }

  private agruparPorData(items: ConcluidoItemView[]): GrupoConcluidos[] {
    const agrupados = new Map<string, ConcluidoItemView[]>();
    items.forEach((item) => {
      const data = item.data || "Sem data";
      const atual = agrupados.get(data) || [];
      agrupados.set(data, [...atual, item]);
    });

    return Array.from(agrupados.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([data, groupedItems]) => ({ data, items: groupedItems }));
  }

  private atualizarOpcoesData(items: ConcluidoItemView[]) {
    const anosSet = new Set<string>();
    const mesesSetPorAno = new Map<string, Set<string>>();

    items.forEach((item) => {
      if (!this.isDataIso(item.data)) return;
      const ano = item.data.slice(0, 4);
      const mes = item.data.slice(5, 7);
      anosSet.add(ano);
      const mesesAno = mesesSetPorAno.get(ano) ?? new Set<string>();
      mesesAno.add(mes);
      mesesSetPorAno.set(ano, mesesAno);
    });

    this.anosDisponiveis = Array.from(anosSet).sort((a, b) => b.localeCompare(a));
    const novoMapa = new Map<string, MesFiltroOption[]>();
    mesesSetPorAno.forEach((meses, ano) => {
      novoMapa.set(ano, this.converterMeses(Array.from(meses)));
    });
    this.mesesDisponiveisPorAno = novoMapa;

    if (this.filtrosDraft.ano && !this.anosDisponiveis.includes(this.filtrosDraft.ano)) {
      this.filtrosDraft.ano = "";
      this.filtrosDraft.mes = "";
      return;
    }

    if (this.filtrosDraft.ano && this.filtrosDraft.mes) {
      const meses = this.mesesDisponiveisPorAno.get(this.filtrosDraft.ano) ?? [];
      if (!meses.some((item) => item.valor === this.filtrosDraft.mes)) {
        this.filtrosDraft.mes = "";
      }
    }
  }

  private converterMeses(meses: string[]): MesFiltroOption[] {
    return meses
      .sort((a, b) => a.localeCompare(b))
      .map((mes) => ({
        valor: mes,
        label: MESES_ABREV[Number(mes) - 1] || mes
      }));
  }

  private isDataIso(data?: string): data is string {
    return typeof data === "string" && /^\d{4}-\d{2}-\d{2}$/.test(data);
  }

  private normalizarTexto(value: string): string {
    return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }

  private cloneFiltros(filtros: ConcluidosFiltros): ConcluidosFiltros {
    return { ...filtros };
  }

  private sortByDataDesc(items: Chamado[]): Chamado[] {
    return [...items].sort((a, b) => {
      const dataCmp = (b.data || "").localeCompare(a.data || "");
      if (dataCmp !== 0) return dataCmp;
      const timeA = this.getTimestampMillis(a.concluidoEm ?? a.criadoEm);
      const timeB = this.getTimestampMillis(b.concluidoEm ?? b.criadoEm);
      return timeB - timeA;
    });
  }

  private getTimestampMillis(value?: Timestamp | null): number {
    if (value && typeof value.toDate === "function") {
      return value.toDate().getTime();
    }
    return 0;
  }

  private getTempoChamadoMinutos(value: string): number | null | undefined {
    const tempo = value.trim();
    if (!tempo) {
      return null;
    }

    const match = /^(\d{2}):([0-5]\d)$/.exec(tempo);
    if (!match) {
      this.toast.show("Informe o tempo do chamado no formato HH:mm.", "error");
      return undefined;
    }

    return Number(match[1]) * 60 + Number(match[2]);
  }

  private getTempoAtendimentoMinutos(item: Chamado): number | null {
    const valor = item.tempoAtendimentoMinutos ?? item.tempoAtendimento ?? null;
    return typeof valor === "number" && Number.isFinite(valor)
      ? Math.max(0, Math.floor(valor))
      : null;
  }

  private getHorarioInicio(item: Chamado, horarioFim: Date | null): Date | null {
    if (item.tipoCadastro === "antigo") {
      const tempoAtendimentoMinutos = this.getTempoAtendimentoMinutos(item);
      if (!horarioFim || tempoAtendimentoMinutos == null) {
        return null;
      }

      return new Date(horarioFim.getTime() - tempoAtendimentoMinutos * 60_000);
    }

    return this.getDateFromTimestamp(item.dataInicioAtendimento) ?? this.getDateFromTimestamp(item.criadoEm);
  }

  private getHorarioFim(item: Chamado): Date | null {
    if (item.tipoCadastro === "antigo") {
      return this.getDateFromTimestamp(item.criadoEm)
        ?? this.getDateFromTimestamp(item.concluidoEm)
        ?? this.getDateFromTimestamp(item.dataFechamento)
        ?? this.getDateFromTimestamp(item.dataFimAtendimento);
    }

    return this.getDateFromTimestamp(item.dataFimAtendimento)
      ?? this.getDateFromTimestamp(item.dataFechamento)
      ?? this.getDateFromTimestamp(item.concluidoEm)
      ?? this.getDateFromTimestamp(item.criadoEm);
  }

  private getDateFromTimestamp(value?: Timestamp | null): Date | null {
    if (value && typeof value.toDate === "function") {
      return value.toDate();
    }
    return null;
  }

  private formatHora(value: Date | null): string {
    if (!value) {
      return "--";
    }

    return `${value.getHours().toString().padStart(2, "0")}:${value.getMinutes().toString().padStart(2, "0")}`;
  }

  private formatTempoChamado(minutos: number): string {
    const totalMinutos = Math.max(0, Math.floor(minutos));
    const horas = Math.floor(totalMinutos / 60);
    const minutosRestantes = totalMinutos % 60;
    return `${horas.toString().padStart(2, "0")}:${minutosRestantes.toString().padStart(2, "0")}`;
  }

  private sanitizeTempoChamadoInput(value: string): string {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length <= 2) {
      return digits;
    }
    if (Number(digits[2]) > 5) {
      return digits.slice(0, 2);
    }
    return `${digits.slice(0, 2)}:${digits.slice(2)}`;
  }

  private getClienteLabelFromMap(
    item: Chamado,
    clientesMap: Map<string, Cliente>,
    empresasMap: Map<string, Empresa>
  ): string {
    if (item.empresa) return item.empresa;
    if (item.empresaId) {
      const nomeEmpresa = empresasMap.get(item.empresaId)?.nomeEmpresa;
      if (nomeEmpresa) return nomeEmpresa;
    }
    if (item.clienteNome) return item.clienteNome;
    if (item.clienteId) {
      const nome = clientesMap.get(item.clienteId)?.nome;
      if (nome) return nome;
    }
    return item.cliente || "Cliente não informado";
  }

  private buildSistemaResumo(
    item: Chamado,
    sistemasMap: Map<string, SistemaOptionView>
  ): string {
    const contextoSistemaId = item.contextoSistemaId?.trim() || "";
    if (!contextoSistemaId) return "";

    const sistemaPrincipal = sistemasMap.get(contextoSistemaId)?.nome?.trim() || "";
    if (!sistemaPrincipal) return "";

    const relacionados = this.getSistemasRelacionadosNomes(item, sistemasMap);
    return relacionados.length > 0 ? `${sistemaPrincipal} +${relacionados.length}` : sistemaPrincipal;
  }

  private buildSistemaTooltip(
    item: Chamado,
    sistemasMap: Map<string, SistemaOptionView>
  ): string {
    const contextoSistemaId = item.contextoSistemaId?.trim() || "";
    if (!contextoSistemaId) return "";

    const sistemaPrincipal = sistemasMap.get(contextoSistemaId)?.nome?.trim() || "";
    if (!sistemaPrincipal) return "";

    const relacionados = this.getSistemasRelacionadosNomes(item, sistemasMap);
    if (relacionados.length === 0) {
      return `Sistema principal: ${sistemaPrincipal}`;
    }

    return `Sistema principal: ${sistemaPrincipal}\nRelacionados: ${relacionados.join(", ")}`;
  }

  private getSistemasRelacionadosNomes(
    item: Chamado,
    sistemasMap: Map<string, SistemaOptionView>
  ): string[] {
    if (!Array.isArray(item.sistemasRelacionados)) {
      return [];
    }

    return [...new Set(
      item.sistemasRelacionados
        .filter((sistemaId): sistemaId is string => typeof sistemaId === "string")
        .map((sistemaId) => sistemaId.trim())
        .filter((sistemaId) => !!sistemaId && sistemaId !== item.contextoSistemaId)
        .map((sistemaId) => sistemasMap.get(sistemaId)?.nome?.trim() || "")
        .filter(Boolean)
    )];
  }

  private isChamadoEmpresa(item: Chamado): boolean {
    return !!(item.empresaId || item.empresa || item.funcionarioId || item.funcionario);
  }

  private async carregarFuncionariosEdicao(empresaId: string) {
    try {
      const funcionarios = await this.empresasService.listFuncionarios(empresaId);
      this.finalizarCarregamentoFuncionariosEdicao(
        this.sortFuncionarios(funcionarios.filter((item) => item.ativo !== false))
      );
    } catch (err: any) {
      this.runInZone(() => {
        this.toast.show(`Erro ao carregar funcionários: ${err.message}`, "error");
        this.finalizarCarregamentoFuncionariosEdicao([]);
      });
    }
  }

  private getEmpresaNomeById(id: string): string {
    if (!id) return "";
    return this.empresasService.getEmpresasSnapshot().find((item) => item.id === id)?.nomeEmpresa ?? "";
  }

  private getEmpresaIdByNome(nomeEmpresa: string): string {
    return (
      this.empresasService.getEmpresasSnapshot().find((item) => item.nomeEmpresa === nomeEmpresa)?.id ??
      ""
    );
  }

  private getFuncionarioNomeById(id: string, funcionarios: Funcionario[]): string {
    if (!id) return "";
    return funcionarios.find((item) => item.id === id)?.nomeFuncionario ?? "";
  }

  getFuncionarioOptionLabel(funcionario: Funcionario): string {
    return funcionario.nomeFuncionario || "";
  }

  onEditTempoChamadoChange(value: string) {
    if (this.editTempoNaoRegistrado) return;
    this.editTempoChamado = this.sanitizeTempoChamadoInput(value);
  }

  private sortClientes(items: Cliente[]): Cliente[] {
    return [...items].sort((a, b) => (a.nome || "").localeCompare(b.nome || ""));
  }

  private sortEmpresas(items: Empresa[]): Empresa[] {
    return [...items].sort((a, b) =>
      (a.nomeEmpresa || "").localeCompare(b.nomeEmpresa || "")
    );
  }

  private sortFuncionarios(items: Funcionario[]): Funcionario[] {
    return [...items].sort((a, b) =>
      (a.nomeFuncionario || "").localeCompare(b.nomeFuncionario || "")
    );
  }

  private sortSistemas(items: Sistema[]): Sistema[] {
    return [...items].sort((a, b) => (a.nome || "").localeCompare(b.nome || "", "pt-BR"));
  }

  getSistemasEmpresaOptions(empresaId: string, sistemas: SistemaOptionView[]): SistemaOptionView[] {
    if (!empresaId) return [];

    const sistemaIds = this.getEmpresaSistemaIds(empresaId);
    if (sistemaIds.length === 0) return [];

    const sistemasMap = new Map(
      sistemas.filter((item) => !!item.id).map((item) => [item.id, item])
    );

    return sistemaIds
      .map((id) => sistemasMap.get(id) ?? null)
      .filter((item): item is SistemaOptionView => !!item);
  }

  getSistemasRelacionadosOptions(
    empresaId: string,
    sistemas: SistemaOptionView[],
    contextoSistemaId: string
  ): SistemaOptionView[] {
    const contexto = contextoSistemaId.trim();
    return this.getSistemasEmpresaOptions(empresaId, sistemas).filter((item) => item.id !== contexto);
  }

  isSistemaRelacionadoSelecionado(sistemaId: string): boolean {
    return this.editSistemasRelacionados.includes(sistemaId);
  }

  onEditContextoSistemaChange() {
    this.editSistemasRelacionados = this.sanitizeSistemaIds(
      this.editSistemasRelacionados,
      this.editContextoSistemaId,
      this.editEmpresaId
    );
  }

  alternarSistemaRelacionado(sistemaId: string, selecionado: boolean) {
    const atualizados = selecionado
      ? [...this.editSistemasRelacionados, sistemaId]
      : this.editSistemasRelacionados.filter((item) => item !== sistemaId);

    this.editSistemasRelacionados = this.sanitizeSistemaIds(
      atualizados,
      this.editContextoSistemaId,
      this.editEmpresaId
    );
  }

  private sanitizeSistemaIds(
    value: unknown,
    contextoSistemaId = "",
    empresaId = ""
  ): string[] {
    if (!Array.isArray(value)) {
      return [];
    }

    const permitidos = new Set(this.getEmpresaSistemaIds(empresaId));
    const contexto = contextoSistemaId.trim();

    return [...new Set(
      value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter((item) => !!item && item !== contexto && (!empresaId || permitidos.has(item)))
    )];
  }

  private getEmpresaSistemaIds(empresaId: string): string[] {
    if (!empresaId) return [];

    const empresa = this.empresasService.getEmpresasSnapshot().find((item) => item.id === empresaId);
    if (!empresa?.sistemas || !Array.isArray(empresa.sistemas)) {
      return [];
    }

    return [...new Set(
      empresa.sistemas
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
    )];
  }

  private iniciarCarregamentoFuncionariosEdicao(empresaId: string) {
    this.runInZone(() => {
      this.editEmpresaId = empresaId;
      this.editFuncionarioId = "";
      this.editContextoSistemaId = "";
      this.editSistemasRelacionados = [];
      this.editFuncionarios = [];
      this.editCarregandoFuncionarios = !!empresaId;
      this.forcarAtualizacaoFormulario();
    });
  }

  private finalizarCarregamentoFuncionariosEdicao(funcionarios: Funcionario[]) {
    this.runInZone(() => {
      this.editFuncionarios = [...funcionarios];
      this.editCarregandoFuncionarios = false;
      this.forcarAtualizacaoFormulario();
    });
  }

  private forcarAtualizacaoFormulario() {
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  private runInZone<T>(callback: () => T): T {
    return NgZone.isInAngularZone() ? callback() : this.zone.run(callback);
  }
}
