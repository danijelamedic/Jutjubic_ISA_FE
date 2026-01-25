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
    this.loadComments(0);
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

  loadComments(page: number) {
    this.loading = true;
    this.errorComments = null;

    this.publicService.getVideoComments(this.videoId, page, this.size)
      .subscribe({
        next: (res) => {
          this.comments = res.content;                 
          this.page = res.page.number;
          this.totalPages = res.page.totalPages;
          this.loading = false;
        },
        error: (err) => {
          this.errorComments = 'Ne mogu da učitam komentare.';
          this.loading = false;
        }
      });
  }


  prevPage(): void {
    if (this.page <= 0 || this.loading) return;
    this.loadComments(this.page - 1);
  }

  nextPage(): void {
    if (this.loading) return;
    if (this.page + 1 >= this.totalPages) return;
    this.loadComments(this.page + 1);
  }

  goToPage(p: number): void {
    if (this.loading) return;
    if (p < 0 || p >= this.totalPages) return;
    this.loadComments(p);
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
