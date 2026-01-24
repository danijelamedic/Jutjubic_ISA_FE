import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UploadVideoResponse } from '../models/video-upload.models';

@Injectable({ providedIn: 'root' })
export class VideoUploadService {
  private readonly baseUrl = '/api/videos';

  constructor(private http: HttpClient) {}

  upload(formData: FormData): Observable<HttpEvent<UploadVideoResponse>> {
  return this.http.post<UploadVideoResponse>(this.baseUrl, formData, {
    observe: 'events',
    reportProgress: true
  });
}

}
