import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { PublicService } from '../../../../core/services/public.service';
import { PublicCommentDTO, PublicVideoDTO } from '../../../../core/models/public.models';
import { AuthStateService } from '../../../../core/auth/auth-state.service';

@Component({
  selector: 'app-video-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './video-details.html',
  styleUrl: './video-details.scss'
})
export class VideoDetails implements OnInit {
  videoId!: number;

  // video details state
  videoLoading = false;
  errorVideo: string | null = null;
  video: PublicVideoDTO | null = null;

  // comments state
  loading = false;
  errorComments: string | null = null;
  comments: PublicCommentDTO[] = [];

  // pagination comments 
  page = 0;
  size = 10;
  totalPages = 0;

  showAuthNotice = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private publicService: PublicService,
    public authState: AuthStateService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.videoId = Number(idParam);

    if (!this.videoId || Number.isNaN(this.videoId)) {
      this.errorVideo = 'Neispravan video ID.';
      return;
    }

    this.loadVideoDetails();
    this.loadComments();
  }

  private loadVideoDetails(): void {
    this.videoLoading = true;
    this.errorVideo = null;

    this.publicService.getVideoDetails(this.videoId).subscribe({
      next: (res) => {
        this.video = res;
        this.videoLoading = false;
      },
      error: () => {
        this.errorVideo = 'Ne mogu da učitam video detalje. Pokušaj ponovo.';
        this.videoLoading = false;
      }
    });
  }

  loadComments(): void {
    this.loading = true;
    this.errorComments = null;

    this.publicService.getVideoComments(this.videoId).subscribe({
      next: (res) => {
        this.comments = res;
        this.loading = false;
      },
      error: () => {
        this.errorComments = 'Ne mogu da učitam komentare. Pokušaj ponovo.';
        this.loading = false;
      }
    });
  }

  prevPage(): void {
    if (this.page > 0) {
      this.page--;
      this.loadComments();
    }
  }

  nextPage(): void {
    if (this.page + 1 < this.totalPages) {
      this.page++;
      this.loadComments();
    }
  }

  onLikeClick(): void {
    if (this.authState.isAuthenticated()) {
      // TODO: kasnije pravi like
      return;
    }
    this.showAuthNotice = true;
  }

  onCommentClick(): void {
    if (this.authState.isAuthenticated()) {
      // TODO: kasnije pravi comment
      return;
    }
    this.showAuthNotice = true;
  }

  goToLogin(): void {
    this.showAuthNotice = false;
    this.router.navigate(['/login'], {
      queryParams: { returnUrl: this.router.url }
    });
  }

  closeNotice(): void {
    this.showAuthNotice = false;
  }
}
