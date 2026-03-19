import { Injectable, NgZone } from "@angular/core";
import {
  addDoc,
  collection,
  CollectionReference,
  deleteField,
  deleteDoc,
  doc,
  DocumentData,
  increment,
  getDocs,
  onSnapshot,
  serverTimestamp,
  updateDoc
} from "firebase/firestore";
import { BehaviorSubject, map } from "rxjs";
import { DataState } from "../models/data-state.model";
import { Empresa, Funcionario } from "../models/empresa.model";
import { AuthService, AuthState } from "./auth.service";
import { FirebaseService } from "./firebase.service";

@Injectable({
  providedIn: "root"
})
export class EmpresasService {
  private readonly empresasStateSubject = new BehaviorSubject<DataState<Empresa[]>>({
    status: "loading",
    data: [],
    error: null
  });
  readonly empresasState$ = this.empresasStateSubject.asObservable();
  readonly empresas$ = this.empresasState$.pipe(map((state) => state.data));
  private unsubscribeEmpresas?: () => void;
  private currentUid: string | null = null;

  constructor(
    private readonly firebase: FirebaseService,
    private readonly auth: AuthService,
    private readonly zone: NgZone
  ) {
    this.auth.authViewState$.subscribe({
      next: (authState) => this.handleAuthChange(authState),
      error: (err) => {
        console.error("Erro no authState", err);
        this.stopListener();
        this.emitState({
          status: "error",
          data: [],
          error: this.toErrorMessage(err)
        });
      }
    });
  }

  async addEmpresa(data: { nomeEmpresa: string; observacoes?: string }) {
    const uid = this.getUidOrThrow();
    const payload: Omit<Empresa, "id"> = {
      nomeEmpresa: data.nomeEmpresa.trim(),
      observacoes: data.observacoes?.trim() || "",
      totalFuncionarios: 0,
      dataCadastro: serverTimestamp() as any,
      atualizadoEm: serverTimestamp() as any
    };
    await addDoc(this.getEmpresasCol(uid), payload);
  }

  async updateEmpresa(id: string, data: Partial<Empresa>) {
    const uid = this.getUidOrThrow();
    const ref = doc(this.firebase.db, "users", uid, "empresas", id);
    await updateDoc(ref, {
      ...data,
      atualizadoEm: serverTimestamp()
    } as any);
  }

  async deleteEmpresa(id: string) {
    const uid = this.getUidOrThrow();
    const funcionariosSnapshot = await getDocs(this.getFuncionariosCol(uid, id));
    await Promise.all(funcionariosSnapshot.docs.map((item) => deleteDoc(item.ref)));
    await deleteDoc(doc(this.firebase.db, "users", uid, "empresas", id));
  }

  async listFuncionarios(empresaId: string): Promise<Funcionario[]> {
    const uid = this.getUidOrThrow();
    const snapshot = await getDocs(this.getFuncionariosCol(uid, empresaId));
    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      nomeFuncionario: String(docSnap.data()["nomeFuncionario"] || ""),
      telefone: String(docSnap.data()["telefone"] || ""),
      criarChamadoAutomatico: this.normalizeCriacaoAutomatica(
        docSnap.data()["criarChamadoAutomatico"]
      ),
      ativo: docSnap.data()["ativo"] !== false,
      dataCadastro: (docSnap.data()["dataCadastro"] as Funcionario["dataCadastro"]) ?? null,
      atualizadoEm: (docSnap.data()["atualizadoEm"] as Funcionario["atualizadoEm"]) ?? null
    }));
  }

  async addFuncionario(
    empresaId: string,
    data: {
      nomeFuncionario: string;
      telefone?: string;
      criarChamadoAutomatico?: boolean;
    }
  ) {
    const uid = this.getUidOrThrow();
    const payload: Omit<Funcionario, "id"> = {
      nomeFuncionario: data.nomeFuncionario.trim(),
      telefone: data.telefone?.trim() || "",
      criarChamadoAutomatico: this.normalizeCriacaoAutomatica(data.criarChamadoAutomatico),
      ativo: true,
      dataCadastro: serverTimestamp() as any,
      atualizadoEm: serverTimestamp() as any
    };
    await addDoc(this.getFuncionariosCol(uid, empresaId), payload);
    await updateDoc(doc(this.firebase.db, "users", uid, "empresas", empresaId), {
      totalFuncionarios: increment(1),
      atualizadoEm: serverTimestamp()
    } as any);
  }

  async updateFuncionario(
    empresaId: string,
    funcionarioId: string,
    data: Partial<Funcionario>
  ) {
    const uid = this.getUidOrThrow();
    const ref = doc(
      this.firebase.db,
      "users",
      uid,
      "empresas",
      empresaId,
      "funcionarios",
      funcionarioId
    );
    await updateDoc(ref, {
      nomeFuncionario: data.nomeFuncionario?.trim() || "",
      telefone: data.telefone?.trim() || "",
      criarChamadoAutomatico: this.normalizeCriacaoAutomatica(data.criarChamadoAutomatico),
      cargo: deleteField(),
      email: deleteField(),
      atualizadoEm: serverTimestamp()
    } as any);
  }

  isCriacaoAutomaticaHabilitada(
    funcionario?: Pick<Funcionario, "criarChamadoAutomatico"> | null
  ): boolean {
    return this.normalizeCriacaoAutomatica(funcionario?.criarChamadoAutomatico);
  }

  async deleteFuncionario(empresaId: string, funcionarioId: string) {
    const uid = this.getUidOrThrow();
    const ref = doc(
      this.firebase.db,
      "users",
      uid,
      "empresas",
      empresaId,
      "funcionarios",
      funcionarioId
    );
    await deleteDoc(ref);
    await updateDoc(doc(this.firebase.db, "users", uid, "empresas", empresaId), {
      totalFuncionarios: increment(-1),
      atualizadoEm: serverTimestamp()
    } as any);
  }

  getEmpresasSnapshot(): Empresa[] {
    return this.empresasStateSubject.value.data;
  }

  private getEmpresasCol(uid: string): CollectionReference<DocumentData> {
    return collection(this.firebase.db, "users", uid, "empresas");
  }

  private getFuncionariosCol(
    uid: string,
    empresaId: string
  ): CollectionReference<DocumentData> {
    return collection(this.firebase.db, "users", uid, "empresas", empresaId, "funcionarios");
  }

  private getUidOrThrow(): string {
    const uid = this.auth.getUid();
    if (!uid) {
      throw new Error("Faca login.");
    }
    return uid;
  }

  private normalizeCriacaoAutomatica(value: unknown): boolean {
    return value === false ? false : true;
  }

  private handleAuthChange(authState: AuthState) {
    if (authState.status === "loading") {
      this.emitState({
        status: "loading",
        data: this.empresasStateSubject.value.data,
        error: null
      });
      return;
    }

    if (authState.status === "error") {
      this.stopListener();
      this.emitState({
        status: "error",
        data: [],
        error: authState.error || "Falha ao resolver autenticacao."
      });
      return;
    }

    const uid = authState.user?.uid ?? null;
    if (!uid) {
      this.stopListener();
      this.emitState({
        status: "ready",
        data: [],
        error: null
      });
      return;
    }

    if (uid === this.currentUid) return;

    this.stopListener();
    this.currentUid = uid;
    this.emitState({
      status: "loading",
      data: [],
      error: null
    });
    this.startListener(uid);
  }

  private startListener(uid: string) {
    this.unsubscribeEmpresas = onSnapshot(
      this.getEmpresasCol(uid),
      (snapshot) => {
        const items = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Empresa)
        }));
        this.emitState({
          status: "ready",
          data: items,
          error: null
        });
      },
      (error) => {
        console.error("Erro ao escutar empresas", error);
        this.emitState({
          status: "error",
          data: [],
          error: this.toErrorMessage(error)
        });
      }
    );
  }

  private stopListener() {
    if (this.unsubscribeEmpresas) {
      this.unsubscribeEmpresas();
      this.unsubscribeEmpresas = undefined;
    }
    this.currentUid = null;
  }

  private emitState(state: DataState<Empresa[]>) {
    this.zone.run(() => this.empresasStateSubject.next(state));
  }

  private toErrorMessage(error: unknown): string {
    if (error instanceof Error && error.message) {
      return error.message;
    }
    return "Erro ao carregar empresas.";
  }
}
