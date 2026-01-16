import { Injectable, computed, signal } from '@angular/core';

export type AuthUser = {
  username?: string;
  email?: string;
  role?: string;
};

@Injectable({ providedIn: 'root' })
export class AuthStateService {
  private readonly TOKEN_KEY = 'access_token';

  // token + login state
  private _token = signal<string | null>(localStorage.getItem(this.TOKEN_KEY));
  token = computed(() => this._token());

  isAuthenticated = computed(() => !!this._token());

  private _user = signal<AuthUser | null>(null);
  user = computed(() => this._user());

  setToken(token: string) {
    localStorage.setItem(this.TOKEN_KEY, token);
    this._token.set(token);
  }

  clear() {
    localStorage.removeItem(this.TOKEN_KEY);
    this._token.set(null);
    this._user.set(null);
  }

  setUser(user: AuthUser | null) {
    this._user.set(user);
  }
}
