import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { WatchPartyWsService } from '../../../../core/services/watch-party-ws.service';
import { WatchPartyApiService } from '../../../../core/services/watch-party-api.service';
import { WatchPartyEventDTO, WatchPartyRoomDTO } from '../../../../core/models/watch-party.models';
import { AuthService } from '../../../../core/services/auth.services';


@Component({
  selector: 'app-watch-party-room',
  templateUrl: './watch-party-room.html',
  styleUrls: ['./watch-party-room.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class WatchPartyRoomComponent implements OnInit, OnDestroy {
  roomId = '';

  room: WatchPartyRoomDTO | null = null;
  isOwner = false;
  eventLog: string[] = [];

  status = 'Povezujem se...';
  error = '';

  private navigatingToVideo = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ws: WatchPartyWsService,
    private api: WatchPartyApiService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.roomId = this.route.snapshot.paramMap.get('roomId') || '';

    if (!this.roomId) {
      this.error = 'Nedostaje roomId u URL-u.';
      return;
    }

    this.api.getRoom(this.roomId).subscribe({
      next: (room) => {
        this.room = room;

        const ownerEmail = (room as any).ownerEmail ?? null;
        const ownerUsername = (room as any).ownerUsername ?? (room as any).owner ?? null;

        const me = this.getJwtIdentity();

        this.isOwner =
          (!!me && !!ownerEmail && me.toLowerCase() === ownerEmail.toLowerCase()) ||
          (!!me && !!ownerUsername && me === ownerUsername);

        console.log('ROOM ownerEmail:', ownerEmail);
        console.log('JWT identity:', me);
        console.log('isOwner:', this.isOwner);


        this.status = this.isOwner ? 'Ti si vlasnik sobe.' : 'U sobi si kao gost.';

        console.log('ROOM object:', room);
        console.log('ROOM ownerEmail:', ownerEmail);
        console.log('ROOM ownerUsername:', ownerUsername);
        console.log('JWT identity:', me);
        console.log('isOwner:', this.isOwner);

        this.ws.subscribeRoom(this.roomId, (evt) => this.handleEvent(evt));
      },

      error: () => {
        this.error = 'Soba ne postoji ili ne može da se učita.';
      },
    });
  }

  ngOnDestroy(): void {
      if (!this.navigatingToVideo && this.roomId) {
        this.api.leaveRoom(this.roomId).subscribe({ error: () => {} });
      }

    this.ws.unsubscribeRoom();
  }


  startVideo(): void {
    this.error = '';

    if (!this.isOwner) {
      this.error = 'Samo vlasnik sobe može da pusti video.';
      return;
    }

    const vid = this.getRoomVideoId();

    console.log('[WP] startVideo clicked. isOwner=', this.isOwner, 'roomId=', this.roomId, 'videoId=', vid);

    if (!vid) {
      this.error = 'Soba nema videoId (backend getRoom ne vraća video).';
      console.log('[WP] room object:', this.room);
      return;
    }

    this.ws.startVideo(this.roomId, vid);
    this.navigatingToVideo = true;
    this.router.navigate(['/videos', vid], {
        queryParams: { wpRoomId: this.roomId }
      });

  }

// guest
  private handleEvent(evt: WatchPartyEventDTO): void {
    if (!evt || !evt.type) return;
    console.log('WATCH PARTY EVENT:', evt);

    const text = this.formatEvent(evt);
    if (text) {
      this.eventLog.unshift(text);
      if (this.eventLog.length > 8) this.eventLog.pop();
    }

    switch (evt.type) {
      case 'ERROR':
        this.error = evt.message ?? 'Greška u WP sobi.';
        return;

      case 'START_VIDEO':
        if (evt.videoId) {
          this.navigatingToVideo = true;
          this.router.navigate(['/videos', evt.videoId], {
            queryParams: { wpRoomId: evt.roomId }
          });
          
        }
        
        return;


      case 'ROOM_CLOSED':
        this.status = 'CLOSED';
        this.error = '';
        this.navigatingToVideo = false;
        return;

      default:
        return;
    }
  }

  private formatEvent(evt: WatchPartyEventDTO): string {
    const u = evt.username;

    switch (evt.type) {
      case 'ROOM_CREATED':
        return 'Soba je kreirana.';
      case 'USER_JOINED':
        return u ? `${u} se pridružio/la.` : (evt.message ?? 'Korisnik se pridružio.');
      case 'USER_LEFT':
        return u ? `${u} je napustio/la sobu.` : (evt.message ?? 'Korisnik je napustio sobu.');
      case 'START_VIDEO':
        return u ? `${u} je pustio video.` : (evt.message ?? 'Video je pušten.');
      case 'ROOM_CLOSED':
        return 'Vlasnik je zatvorio sobu.';
      case 'ERROR':
        return evt.message ?? 'Greška.';
      default:
        return evt.type;
    }
  }

  private getJwtIdentity(): string | null {
    const token = this.auth.getToken(); 
    if (!token) return null;

    try {
      const payloadB64 = token.split('.')[1];
      const decoded = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')));
      return decoded?.email ?? decoded?.username ?? decoded?.sub ?? null;
    } catch {
      return null;
    }
  }

  getRoomVideoId(): number | null {
    const r: any = this.room;
    return (r?.videoId ?? r?.currentVideoId ?? null);
  }

  displayRoomId(): string {
    const r: any = this.room;
    return (r?.roomId ?? r?.id ?? '');
  }
}
