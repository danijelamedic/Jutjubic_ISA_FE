import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';

import { PublicService } from '../../../../core/services/public.service';
import { PublicUserDTO, PublicVideoDTO, SpringPage } from '../../../../core/models/public.models';

@Component({
  selector: 'app-public-user-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './public-user-profile.html',
  styleUrl: './public-user-profile.scss'
})
export class PublicUserProfile implements OnInit {
  username!: string;

  loadingUser = false;
  loadingVideos = false;
  error: string | null = null;

  user: PublicUserDTO | null = null;

  videos: PublicVideoDTO[] = [];
  page = 0;
  size = 6;
  totalPages = 0;

  constructor(
    private route: ActivatedRoute,
    private publicService: PublicService
  ) {}

  ngOnInit(): void {
    const u = this.route.snapshot.paramMap.get('username');
    this.username = (u ?? '').trim();

    if (!this.username) {
      this.error = 'Neispravan username.';
      return;
    }

    this.loadUser();
    this.loadVideos(0);
  }

  loadUser(): void {
    this.loadingUser = true;
    this.error = null;

    this.publicService.getPublicUser(this.username).subscribe({
      next: (res) => {
        this.user = res;
        this.loadingUser = false;
      },
      error: () => {
        this.error = 'Ne mogu da učitam profil korisnika.';
        this.loadingUser = false;
      }
    });
  }

  loadVideos(page: number): void {
    this.loadingVideos = true;
    this.error = null;

    this.publicService.getUserVideos(this.username, page, this.size).subscribe({
      next: (res: SpringPage<PublicVideoDTO>) => {
        this.videos = res.content;
        this.page = res.number ?? 0;
        this.totalPages = res.totalPages ?? 0;
        this.loadingVideos = false;
      },
      error: () => {
        this.error = 'Ne mogu da učitam objave korisnika.';
        this.loadingVideos = false;
      }
    });
  }

  prevPage(): void {
    if (this.page > 0) this.loadVideos(this.page - 1);
  }

  nextPage(): void {
    if (this.page + 1 < this.totalPages) this.loadVideos(this.page + 1);
  }
}
