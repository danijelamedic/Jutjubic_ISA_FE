import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { PublicService } from '../../../../core/services/public.service';
import { PublicCommentDTO } from '../../../../core/models/public.models';
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

  loading = false;
  error: string | null = null;

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
      this.error = 'Neispravan video ID.';
      return;
    }

    this.loadComments();
  }

  loadComments(): void {
    this.loading = true;
    this.error = null;

    this.publicService.getVideoComments(this.videoId).subscribe({
      next: (res) => {
        this.comments = res;
        this.loading = false;
      },
      error: () => {
        this.error = 'Ne mogu da učitam komentare. Pokušaj ponovo.';
        this.loading = false;
      }
    });
  }

  prevPage(): void {
    if (this.page > 0) this.loadComments();
  }

  nextPage(): void {
    if (this.page + 1 < this.totalPages) this.loadComments();
  }

  // neautentifikovani: obavesti + redirect na login sa returnUrl
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
