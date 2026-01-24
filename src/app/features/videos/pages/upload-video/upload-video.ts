import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpErrorResponse, HttpEvent, HttpEventType } from '@angular/common/http';


import { VideoUploadService } from '../../../../core/services/video-upload.service';

@Component({
  selector: 'app-upload-video',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './upload-video.html',
  styleUrl: './upload-video.scss'
})
export class UploadVideo {
  submitting = false;
  error: string | null = null;
  success: string | null = null;

  progress = 0;

  selectedVideo: File | null = null;
  selectedThumb: File | null = null;
  thumbPreviewUrl: string | null = null;

  form: FormGroup;

  @ViewChild('videoInput') videoInput!: ElementRef<HTMLInputElement>;
  @ViewChild('thumbInput') thumbInput!: ElementRef<HTMLInputElement>;
  
  private resetFormAndFiles() {
    this.form.reset();

    this.selectedVideo = null;
    this.selectedThumb = null;

    if (this.thumbPreviewUrl) {
      URL.revokeObjectURL(this.thumbPreviewUrl);
      this.thumbPreviewUrl = null;
    }

    this.progress = 0;
    this.submitting = false;

    if (this.videoInput?.nativeElement) this.videoInput.nativeElement.value = '';
    if (this.thumbInput?.nativeElement) this.thumbInput.nativeElement.value = '';
  }

  constructor(
    private fb: FormBuilder,
    private uploadService: VideoUploadService,
    private router: Router
  ) {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(80)]],
      description: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(2000)]],
      tagsCsv: ['', [Validators.required, Validators.maxLength(200)]],
      location: ['']
    });
  }

  onVideoSelected(ev: Event) {
    this.error = null;
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    if (!file) {
      this.selectedVideo = null;
      return;
    }

    if (file.type !== 'video/mp4') {
      this.selectedVideo = null;
      input.value = '';
      this.error = 'Video mora biti MP4 format.';
      return;
    }

    const maxBytes = 200 * 1024 * 1024;
    if (file.size > maxBytes) {
      this.selectedVideo = null;
      input.value = '';
      this.error = 'Video je veći od 200MB.';
      return;
    }

    this.selectedVideo = file;
  }

  onThumbSelected(ev: Event) {
    this.error = null;
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    if (!file) {
      this.selectedThumb = null;
      this.thumbPreviewUrl = null;
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.selectedThumb = null;
      this.thumbPreviewUrl = null;
      input.value = '';
      this.error = 'Thumbnail mora biti slika (png/jpg/webp...).';
      return;
    }

    this.selectedThumb = file;

    if (this.thumbPreviewUrl) URL.revokeObjectURL(this.thumbPreviewUrl);
    this.thumbPreviewUrl = URL.createObjectURL(file);
  }

  canSubmit(): boolean {
    return this.form.valid && !!this.selectedVideo && !!this.selectedThumb && !this.submitting;
  }

  private markHomeRefreshNeeded() {
    sessionStorage.setItem('home_refresh', '1');
  }


  submit() {
    if (!this.canSubmit()) return;

    this.error = null;
    this.success = null;
    this.submitting = true;
    this.progress = 0;

    const dto = {
      title: this.form.value.title,
      description: this.form.value.description,
      tags: this.form.value.tagsCsv,
      location: this.form.value.location || null
    };

    const fd = new FormData();

    fd.append(
      'data',
      new Blob([JSON.stringify(dto)], { type: 'application/json' })
    );

    fd.append('video', this.selectedVideo!, this.selectedVideo!.name);

    fd.append('thumbnail', this.selectedThumb!, this.selectedThumb!.name);

    this.uploadService.upload(fd).subscribe({
    next: (event: HttpEvent<any>) => {
      if (event.type === HttpEventType.UploadProgress && event.total) {
        this.progress = Math.round((event.loaded / event.total) * 100);
      }

      if (event.type === HttpEventType.Response) {
        const body = event.body as any; // CreateVideoPostResponseDTO

        //signal za home refresh
        this.markHomeRefreshNeeded();
        this.resetFormAndFiles();

        //redirect na profil autora
        if (body?.authorUsername) {
          this.router.navigate(['/users', body.authorUsername], {
            queryParams: { uploaded: body?.id ?? '' } 
          });
          return;
        }

        // fallback: video details ako ima id
        if (body?.id) {
          this.router.navigate(['/videos', body.id]);
          return;
        }

        // fallback: home
        this.router.navigate(['/home'], { queryParams: { refresh: Date.now() } });
      }


    },
    error: (err: HttpErrorResponse) => {
      this.submitting = false;
      this.error = (err.error as any)?.message || 'Greška pri upload-u.';
    }
  });

  }

  ngOnDestroy() {
    if (this.thumbPreviewUrl) URL.revokeObjectURL(this.thumbPreviewUrl);
  }
}
