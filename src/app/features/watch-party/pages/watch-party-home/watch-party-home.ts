import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WatchPartyApiService } from '../../../../core/services/watch-party-api.service';
import { WatchPartyWsService } from '../../../../core/services/watch-party-ws.service';
import { PublicService } from '../../../../core/services/public.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

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
  
  // room info
  videos: any[] = [];
  videosLoading = false;
  videosError = '';
  selectedVideoId: number | null = null;
  showCreate = false;


  private roomsSub?: Subscription;

  constructor(
    private api: WatchPartyApiService,
    private ws: WatchPartyWsService,
    private router: Router,
    private publicService: PublicService
  ) {}

  ngOnInit(): void {
    this.loadRooms();
    this.loadVideos();
    this.roomsSub = this.ws.subscribeRooms((_evt) => {
      this.loadRooms();
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


  loadVideos(): void {
    this.videosLoading = true;
    this.videosError = '';
    this.videos = [];

    const pageSize = 20; 
    let page = 0;

    const loadNext = () => {
      this.publicService.getVideos(page, pageSize).subscribe({
        next: (res: any) => {
          const chunk = res?.content ?? res ?? [];
          this.videos.push(...chunk);

          const isLast =
            (typeof res?.last === 'boolean' && res.last === true) ||
            chunk.length < pageSize;

          if (isLast) {
            this.videosLoading = false;
            return;
          }

          page++;
          loadNext();
        },
        error: (err: any) => {
          this.videosLoading = false;
          this.videosError = err?.error?.message ?? 'Ne mogu da učitam videe.';
        }
      });
    };

    loadNext();
  }

  trackByVideoId(_: number, v: any) {
    return v.id;
  }

}
