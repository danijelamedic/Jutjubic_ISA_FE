import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { RegistrationRequest, ResponseMessage } from '../models/auth.models';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token?: string;
  accessToken?: string;
  jwt?: string;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly baseUrl = '/api/auth';

  constructor(private http: HttpClient) {}

  register(req: RegistrationRequest): Observable<ResponseMessage> {
    return this.http.post<ResponseMessage>(`${this.baseUrl}/register`, req);
  }

  activate(token: string): Observable<ResponseMessage> {
    return this.http.get<ResponseMessage>(`${this.baseUrl}/activate`, {
      params: { token }
    });
  }

  login(payload: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, payload).pipe(
      tap((res) => {
        const token = res.token || res.accessToken || res.jwt;
        if (token) {
          localStorage.setItem('access_token', token);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('access_token');
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
