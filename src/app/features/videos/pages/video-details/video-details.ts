import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';

import { PublicService } from '../../../../core/services/public.service';
import { PublicCommentDTO } from '../../../../core/models/public.models';

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
    private publicService: PublicService
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

  // neautentifikovani ne smeju like/comment
  onLikeClick(): void {
    this.showAuthNotice = true;
  }

  onCommentClick(): void {
    this.showAuthNotice = true;
  }

  closeNotice(): void {
    this.showAuthNotice = false;
  }
}
