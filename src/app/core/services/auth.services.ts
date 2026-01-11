import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RegistrationRequest, ResponseMessage } from '../models/auth.models';

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
    return this.http.get<ResponseMessage>(`/api/auth/activate?token=${encodeURIComponent(token)}`);
  }
}
 