import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { WatchPartyRoomDTO } from '../../core/models/watch-party.models';

export interface CreateWatchPartyRoomResponseDTO {
  videoId: number;
  roomId: string;
  ownerEmail: string;
  joinUrl: string;
}

export type WatchPartyRoomStatus = 'WAITING' | 'STARTED' | 'CLOSED';

export interface WatchPartyRoomInfoDTO {
  roomId: string;
  ownerEmail: string;
  createdAt?: string;
  memberCount: number;
  currentVideoId: number;
  status: WatchPartyRoomStatus;
}

@Injectable({ providedIn: 'root' })
export class WatchPartyApiService {
  constructor(private http: HttpClient) {}

  createRoom(videoId: number): Observable<CreateWatchPartyRoomResponseDTO> {

    return this.http.post<CreateWatchPartyRoomResponseDTO>(
      `/api/watch-party/rooms`,
      { videoId }
    );
  }

  listRooms() {
    return this.http.get<any[]>(`${environment.apiUrl}/api/watch-party/rooms`);
  }

  getRooms() {
    return this.http.get<WatchPartyRoomInfoDTO[]>('/api/watch-party/rooms');
  }

  getRoom(roomId: string) {
    return this.http.get<WatchPartyRoomDTO>(`/api/watch-party/rooms/${roomId}`);
  }

  joinRoom(roomId: string) {
    return this.http.post<WatchPartyRoomInfoDTO>(`/api/watch-party/rooms/${roomId}/join`, {});
  }

  leaveRoom(roomId: string) {
    return this.http.post<WatchPartyRoomInfoDTO | null>(`/api/watch-party/rooms/${roomId}/leave`, {});
  }
}
