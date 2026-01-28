import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { PublicService } from '../../../../core/services/public.service';
import { PublicCommentDTO, PublicVideoDTO } from '../../../../core/models/public.models';
import { AuthStateService } from '../../../../core/auth/auth-state.service';
import { FormsModule } from '@angular/forms';
import { CommentService } from '../../../../core/services/comment.service';


@Component({
  selector: 'app-video-details',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './video-details.html',
  styleUrl: './video-details.scss'
})
export class VideoDetails implements OnInit {
  videoId!: number;

  videoLoading = false;
  errorVideo: string | null = null;
  video: PublicVideoDTO | null = null;

  loading = false;
  errorComments: string | null = null;
  comments: PublicCommentDTO[] = [];

  page = 0;
  size = 10;
  totalPages = 0;

  commentText = '';
  submittingComment = false;
  commentError: string | null = null;
  commentSuccess: string | null = null;


  showAuthNotice = false;
  showAddComment = false;

  private incrementedFor = new Set<number>();


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private publicService: PublicService,
    public authState: AuthStateService,
    public commentService: CommentService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      const id = Number(idParam);

      if (!id || Number.isNaN(id)) {
        this.errorVideo = 'Neispravan video ID.';
        return;
      }

      this.videoId = id;

      this.onEnterVideo(id);
    });
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
      // to do : implementiraj like
      return;
    }
    this.showAuthNotice = true;
  }

  onCommentClick(): void {
    this.commentError = null;
    this.commentSuccess = null;
    
    if (this.authState.isAuthenticated()) {
      this.showAuthNotice = false;
      this.showAddComment = !this.showAddComment; // otvori/zatvori formu

      // setTimeout(() => {
      //   document.getElementById('add-comment')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // }, 0);

       if (!this.showAddComment) {
        this.commentError = null;
        this.commentSuccess = null;
      }

      return;
    }
    this.showAddComment = false;
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

  submitComment(): void {
  this.commentError = null;
  this.commentSuccess = null;

  if (!this.authState.isAuthenticated()) {
    this.showAuthNotice = true;
    return;
  }

  const text = this.commentText.trim();
  if (!text) {
    this.commentError = 'Komentar ne sme biti prazan.';
    return;
  }

  if (text.length > 1500) {
    this.commentError = 'Komentar je predugačak (max 1500 karaktera).';
    return;
  }

  this.submittingComment = true;

  this.commentService.create(this.videoId, text).subscribe({
    next: () => {
      this.submittingComment = false;
      this.commentText = '';
      this.showAddComment = false;
      this.commentSuccess = 'Komentar je dodat.';

      this.loadComments(0);
      this.loadVideoDetails();
    },
    error: (err) => {
      this.submittingComment = false;

      // rate limit 60 komentara po satu - daje status code 429
      if (err?.status === 429) {
        this.commentError =
          'Previše komentara. Dozvoljeno je 60 komentara po satu. Pokušaj kasnije.';
        return;
      }

      this.commentError = err?.error?.message || 'Neuspešno dodavanje komentara.';
    }
  });
  }
  
  onCommentKeydown(e: KeyboardEvent): void {
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      this.submitComment();
    }
  }
  private onEnterVideo(id: number): void {
    const shouldIncrement = !this.incrementedFor.has(id);

    if (shouldIncrement) {
      this.incrementedFor.add(id);

      this.publicService.incrementView(id).subscribe({
        next: () => {
          this.loadVideoDetails();
        },
        error: () => {
          this.loadVideoDetails();
        }
      });
    } else {
      this.loadVideoDetails();
    }

    this.loadComments(0);
  }


}
