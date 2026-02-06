import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WatchPartyApiService } from '../../../../core/services/watch-party-api.service';
import { WatchPartyWsService } from '../../../../core/services/watch-party-ws.service';
import { PublicService } from '../../../../core/services/public.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { WatchPartyEventDTO } from '../../../../core/models/watch-party.models';

@Component({
  selector: 'app-watch-party-home',
  templateUrl: './watch-party-home.html',
  styleUrls: ['./watch-party-home.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class WatchPartyHomeComponent implements OnInit, OnDestroy {
  // create form
  loading = false;
  error = '';
  videoIdInput: number | null = null;

  // rooms list
  rooms: any[] = [];
  roomsLoading = false;
  roomsError = '';
  videoPage = 0;
  readonly videoPageSize = 20;
  hasMoreVideos = true;


  videos: any[] = [];
  videosLoading = false;
  videosError = '';
  selectedVideoId: number | null = null;
  showCreate = false;

  videoTitleById = new Map<number, string>();

  private roomsSub?: Subscription;

  constructor(
    private api: WatchPartyApiService,
    private ws: WatchPartyWsService,
    private router: Router,
    private publicService: PublicService
  ) {}

  ngOnInit(): void {
    this.loadRooms();
    this.loadVideos(true);

    this.roomsSub = this.ws.subscribeRooms((evt) => {
      this.handleRoomsEvent(evt);
    });
  }

  ngOnDestroy(): void {
    this.roomsSub?.unsubscribe();
  }

  loadRooms(): void {
    this.roomsError = '';
    this.roomsLoading = true;

    this.api.listRooms().subscribe({
      next: (data) => {
        this.rooms = data ?? [];
        this.roomsLoading = false;
      },
      error: (err) => {
        this.roomsLoading = false;
        this.roomsError = err?.error?.message ?? 'Ne mogu da učitam liste soba.';
      },
    });
  }

  private handleRoomsEvent(evt: WatchPartyEventDTO): void {
    if (!evt || !evt.type) return;

    const roomId = evt.roomId ?? null;

    if (!roomId) {
      return;
    }

    switch (evt.type) {
      case 'START_VIDEO':
        this.patchRoom(roomId, {
          status: 'STARTED',
          currentVideoId: evt.videoId ?? undefined,
        });
        return;

      case 'ROOM_CLOSED':
        this.patchRoom(roomId, { status: 'CLOSED' });
        return;

      case 'ROOM_CREATED':
      case 'USER_JOINED':
      case 'USER_LEFT':
        this.loadRooms();
        return;

      default:
        return;
    }
  }

  private patchRoom(roomId: string, patch: any): void {
    const idx = this.rooms.findIndex((r) => r.roomId === roomId || r.id === roomId);
    if (idx === -1) {
      this.loadRooms();
      return;
    }

    const current = this.rooms[idx];

    this.rooms[idx] = {
      ...current,
      ...patch,
      currentVideoId:
        patch.currentVideoId ?? current.currentVideoId ?? current.videoId ?? null,
    };
  }

  join(roomId: string): void {
    this.router.navigate(['/watch-party', roomId]);
  }

  create(): void {
    this.error = '';

    if (!this.selectedVideoId) {
      this.error = 'Izaberi video.';
      return;
    }

    this.loading = true;

    this.api.createRoom(this.selectedVideoId).subscribe({
      next: (res) => {
        this.loading = false;
        this.router.navigate(['/watch-party', res.roomId]);
      },
      error: (err) => {
        this.loading = false;

        if (err?.status === 401) {
          this.error = 'Niste prijavljeni ili je token nevažeći.';
        } else if (err?.status === 400) {
          this.error = err?.error?.message ?? 'Neispravan zahtev (proveri videoId).';
        } else {
          this.error = err?.error?.message ?? 'Ne mogu da kreiram Watch Party sobu.';
        }
      },
    });
  }

  loadVideos(reset = false): void {
    if (this.videosLoading) return;

    if (reset) {
      this.videos = [];
      this.videoTitleById.clear();
      this.videoPage = 0;
      this.hasMoreVideos = true;
      this.selectedVideoId = null; 
    }

    if (!this.hasMoreVideos) return;

    this.videosLoading = true;
    this.videosError = '';

    this.publicService.getVideos(this.videoPage, this.videoPageSize).subscribe({
      next: (res: any) => {
        const chunk = res?.content ?? res ?? [];
        this.videos.push(...chunk);

        for (const v of chunk) {
          if (v?.id != null) {
            const title = v.title ?? v.name ?? `Video #${v.id}`;
            this.videoTitleById.set(v.id, title);
          }
        }

        const isLast =
          (typeof res?.last === 'boolean' && res.last === true) ||
          chunk.length < this.videoPageSize;

        this.hasMoreVideos = !isLast;
        this.videoPage++;

        this.videosLoading = false;
      },
      error: (err: any) => {
        this.videosLoading = false;
        this.videosError = err?.error?.message ?? 'Ne mogu da učitam videe.';
      },
    });
  }


  trackByVideoId(_: number, v: any) {
    return v.id;
  }

  getVideoTitle(videoId: number | null | undefined): string {
    if (!videoId) return '—';
    return this.videoTitleById.get(videoId) ?? `Video #${videoId}`;
  }

  loadMoreVideos(): void {
    this.loadVideos(false);
  }

}
