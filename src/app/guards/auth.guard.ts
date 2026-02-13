import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router, RouterStateSnapshot } from "@angular/router";
import { filter, map, take } from "rxjs";
import { AuthService } from "../services/auth.service";

@Injectable({
  providedIn: "root"
})
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(private readonly auth: AuthService, private readonly router: Router) {}

  canActivate(_route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.check(state.url);
  }

  canActivateChild(_route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.check(state.url);
  }

  private check(url: string) {
    return this.auth.authViewState$.pipe(
      filter((state) => state.status !== "loading"),
      take(1),
      map((state) =>
        state.user
          ? true
          : this.router.createUrlTree(["/login"], {
              queryParams: { returnUrl: url }
            })
      )
    );
  }
}
