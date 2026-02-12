import { Injectable } from "@angular/core";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: "root"
})
export class FirebaseService {
  readonly app = initializeApp(environment.firebaseConfig);
  readonly db = getFirestore(this.app);
}
