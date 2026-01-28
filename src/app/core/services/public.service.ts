import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SpringPage, PublicVideoDTO, PublicCommentDTO, PublicUserDTO, PagedResponse } from '../models/public.models';


@Injectable({
  providedIn: 'root'
})
export class PublicService {
    private readonly baseUrl = '/api/public';

    constructor(private http: HttpClient) {}

      getVideos(page = 0, size = 10) {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PagedResponse<PublicVideoDTO>>(`${this.baseUrl}/videos`, { params });
  }

  getVideoComments(videoId: number, page: number, size: number) {
    return this.http.get<PagedResponse<PublicCommentDTO>>(
      `/api/public/videos/${videoId}/comments?page=${page}&size=${size}`
    );
  }

  getPublicUser(username: string) {
    return this.http.get<PublicUserDTO>(`${this.baseUrl}/users/${username}`);
  }

  getUserVideos(username: string, page = 0, size = 6) {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PagedResponse<PublicVideoDTO>>(
      `${this.baseUrl}/users/${username}/videos`,
      { params }
    );
  }


  getVideoDetails(videoId: number): Observable<PublicVideoDTO> {
    return this.http.get<PublicVideoDTO>(`/api/public/videos/${videoId}`);
  }

  incrementView(videoId: number) {
    return this.http.post<void>(`/api/public/videos/${videoId}/views`, {});
  }
  
}


