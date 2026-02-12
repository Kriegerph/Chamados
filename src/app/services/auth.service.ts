import { Injectable } from "@angular/core";
import {
  User,
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { Observable } from "rxjs";
import { FirebaseService } from "./firebase.service";

@Injectable({
  providedIn: "root"
})
export class AuthService {
  private readonly auth: ReturnType<typeof getAuth>;
  readonly authState$: Observable<User | null>;

  constructor(private readonly firebase: FirebaseService) {
    this.auth = getAuth(this.firebase.app);
    this.authState$ = new Observable<User | null>((subscriber) => {
      const unsubscribe = onAuthStateChanged(
        this.auth,
        (user) => subscriber.next(user),
        (error) => subscriber.error(error)
      );
      return () => unsubscribe();
    });
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
    return this.auth.currentUser?.uid ?? null;
  }
}
