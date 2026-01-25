import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateCommentRequest, CreateCommentResponse } from '../models/comment.models';

@Injectable({ providedIn: 'root' })
export class CommentService {
  private readonly baseUrl = '/api/videos';

  constructor(private http: HttpClient) {}

  create(videoId: number, text: string): Observable<CreateCommentResponse> {
    const payload: CreateCommentRequest = { text };
    return this.http.post<CreateCommentResponse>(`${this.baseUrl}/${videoId}/comments`, payload);
  }
}
