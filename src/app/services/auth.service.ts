import { Injectable, NgZone } from "@angular/core";
import {
  User,
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { BehaviorSubject, map } from "rxjs";
import { FirebaseService } from "./firebase.service";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated" | "error";

export interface AuthState {
  status: AuthStatus;
  user: User | null;
  error: string | null;
}

@Injectable({
  providedIn: "root"
})
export class AuthService {
  private readonly auth: ReturnType<typeof getAuth>;
  private readonly authStateSubject = new BehaviorSubject<AuthState>({
    status: "loading",
    user: null,
    error: null
  });

  readonly authViewState$ = this.authStateSubject.asObservable();
  readonly authState$ = this.authViewState$.pipe(map((state) => state.user));

  constructor(
    private readonly firebase: FirebaseService,
    private readonly zone: NgZone
  ) {
    this.auth = getAuth(this.firebase.app);
    onAuthStateChanged(
      this.auth,
      (user) => {
        this.zone.run(() => {
          this.authStateSubject.next({
            status: user ? "authenticated" : "unauthenticated",
            user,
            error: null
          });
          console.debug("[Auth] authState resolvido", {
            status: user ? "authenticated" : "unauthenticated",
            uid: user?.uid ?? null
          });
        });
      },
      (error) => {
        this.zone.run(() => {
          this.authStateSubject.next({
            status: "error",
            user: null,
            error: this.toErrorMessage(error)
          });
          console.error("[Auth] erro no authState", error);
        });
      }
    );
  }

  async signUp(email: string, senha: string): Promise<string> {
    const cred = await createUserWithEmailAndPassword(this.auth, email, senha);
    const uid = cred.user.uid;
    try {
      await setDoc(
        doc(this.firebase.db, "users", uid),
        { email, criadoEm: serverTimestamp() },
        { merge: true }
      );
    } catch (err: any) {
      const error: any = new Error("Conta criada, mas falhou ao criar perfil no Firestore.");
      error.code = "firestore/profile-create-failed";
      error.cause = err;
      throw error;
    }
    return uid;
  }

  async signIn(email: string, senha: string) {
    await signInWithEmailAndPassword(this.auth, email, senha);
  }

  async signOut() {
    await firebaseSignOut(this.auth);
  }

  getUid(): string | null {
    return this.authStateSubject.value.user?.uid ?? this.auth.currentUser?.uid ?? null;
  }

  private toErrorMessage(error: unknown): string {
    if (error instanceof Error && error.message) {
      return error.message;
    }
    return "Falha ao carregar autenticacao.";
  }
}
