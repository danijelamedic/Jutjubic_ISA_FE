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
  message?: string | null;
  videoId?: number | null;
  roomId?: string | null;
  username?: string | null;
}

export interface WatchPartyRoomDTO {
  id: string;
  ownerEmail: string;    
  members: number;
  status: 'WAITING' | 'STARTED' | 'CLOSED';
  videoId: number;
}


