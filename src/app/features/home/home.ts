import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { PublicService } from '../../core/services/public.service';
import { PublicVideoDTO } from '../../core/models/public.models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit {
  videos: PublicVideoDTO[] = [];

  loading = false;
  error: string | null = null;

  page = 0;
  size = 6;
  totalPages = 0;

  constructor(private publicService: PublicService) {}

  ngOnInit(): void {
    const needsRefresh = sessionStorage.getItem('home_refresh') === '1';
    if (needsRefresh) {
      sessionStorage.removeItem('home_refresh');
      this.loadVideos(0); 
    } else {
      this.loadVideos(0);
    }
  }


  loadVideos(page: number): void {
    this.loading = true;
    this.error = null;

    this.publicService.getVideos(page, this.size).subscribe({
      next: (res) => {
        this.videos = res.content;
        this.page = res.page.number;
        this.totalPages = res.page.totalPages;
        this.loading = false;
      },
      error: () => {
        this.error = 'Ne mogu da učitam objave.';
        this.loading = false;
      }
    });
  }


  prevPage(): void {
    if (this.page <= 0 || this.loading) return;
    this.loadVideos(this.page - 1);
  }

  nextPage(): void {
    if (this.loading) return;
    if (this.page + 1 >= this.totalPages) return;
    this.loadVideos(this.page + 1);
  }


  goToPage(p: number): void {
    if (this.loading) return;
    if (p < 0 || p >= this.totalPages) return;
    this.loadVideos(p);
  }

}
