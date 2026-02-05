export interface StartVideoMessageDTO {
  videoId: number;
}

export type WatchPartyEventType =
  | 'START_VIDEO'
  | 'ERROR'
  | 'USER_JOINED'
  | 'ROOM_CREATED'
  | 'USER_LEFT'
  | 'ROOM_CLOSED';

export interface WatchPartyEventDTO {
  type: WatchPartyEventType;
  message?: string;
  videoId?: number;
  roomId?: string;
  username?: string;
}

export interface WatchPartyRoomDTO {
  id: string;
  ownerEmail: string;    
  members: number;
  status: 'WAITING' | 'PLAYING' | 'CLOSED';
  videoId: number;
}


