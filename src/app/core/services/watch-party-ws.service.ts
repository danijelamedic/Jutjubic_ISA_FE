import { Injectable } from '@angular/core';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import { WatchPartyEventDTO } from '../models/watch-party.models';
import { environment } from '../../../environments/environment';
import { Subscription } from 'rxjs';



@Injectable({ providedIn: 'root' })
export class WatchPartyWsService {
  private client: Client | null = null;
  private subscription: StompSubscription | null = null;
  private roomsSubscription: StompSubscription | null = null;

  private connected = false;
  private connectQueue: Array<() => void> = [];

  connect(): void {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('Nema access_token u localStorage. Uloguj se ponovo.');
    }

    if (this.client) {
      if (!this.client.active) {
        this.client.activate();
      }
      return;
    }

    this.client = new Client({
      brokerURL: environment.wsUrl,
      reconnectDelay: 2000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      onConnect: () => {
        this.connected = true;

        const jobs = [...this.connectQueue];
        this.connectQueue = [];
        jobs.forEach(fn => fn());
      },
      onDisconnect: () => {
        this.connected = false;
      },
      onWebSocketClose: () => {
        this.connected = false;
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame.headers['message'], frame.body);
      },
      onWebSocketError: (ev) => {
        console.error('WS error:', ev);
      },
      debug: () => {},
    });

    this.client.activate();
  }


  subscribeRooms(onEvent: (e: WatchPartyEventDTO) => void): Subscription {
    const sub = new Subscription();

    this.ensureConnected(() => {
      if (!this.client) return;

      // resetuje prethodnu rooms sub
      this.roomsSubscription?.unsubscribe();

      this.roomsSubscription = this.client.subscribe('/topic/watchparty/rooms', (msg: IMessage) => {
        try {
          onEvent(JSON.parse(msg.body) as WatchPartyEventDTO);
        } catch {
          console.error('Ne mogu da parsiram rooms event:', msg.body);
        }
      });

      sub.add({ unsubscribe: () => this.roomsSubscription?.unsubscribe() });
    });

    return sub;
  }

  disconnect(): void {
    try {
      this.subscription?.unsubscribe();
      this.subscription = null;

      this.roomsSubscription?.unsubscribe();
      this.roomsSubscription = null;


      this.connected = false;

      this.client?.deactivate();
      this.client = null;
    } catch (e) {
      console.warn('disconnect error', e);
    }
  }

  subscribeRoom(roomId: string, onEvent: (e: WatchPartyEventDTO) => void): void {
    this.ensureConnected(() => {
      if (!this.client) return;

      this.subscription?.unsubscribe();

      this.subscription = this.client.subscribe(
        `/topic/watchparty/${roomId}`,
        (msg: IMessage) => {
          try {
            const evt = JSON.parse(msg.body) as WatchPartyEventDTO;
            onEvent(evt);
          } catch (e) {
            console.error('Ne mogu da parsiram WatchParty event:', msg.body);
          }
        }
      );

      this.client.publish({
        destination: `/app/watchparty/${roomId}/join`,
        body: JSON.stringify({}),
      });
    });
  }

  startVideo(roomId: string, videoId: number): void {
    this.ensureConnected(() => {
      if (!this.client) return;

      this.client.publish({
        destination: `/app/watchparty/${roomId}/start`,
        body: JSON.stringify({ videoId }),
      });
    });
  }

  unsubscribeRoom(): void {
    try {
      this.subscription?.unsubscribe();
      this.subscription = null;
    } catch (e) {
      console.warn('unsubscribeRoom error', e);
    }
  }

  private ensureConnected(job: () => void): void {
    if (!this.client || !this.connected) {
      this.connectQueue.push(job);
      this.connect();
      return;
    }

    job();
  }
}
