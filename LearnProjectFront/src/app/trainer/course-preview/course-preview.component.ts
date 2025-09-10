import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

// Replicating the interfaces from dashboard component for type safety
interface GeneratedQuiz {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface GeneratedVideo {
  id: string;
  title: string;
  youtubeUrl: string;
  prompt: string;
  quiz: GeneratedQuiz;
  isUpdating: boolean;
  isEditingQuiz: boolean;
}

export interface CoursePreviewData {
  title: string;
  description: string;
  videos: GeneratedVideo[];
}

@Component({
  selector: 'app-course-preview',
  standalone: false,
  templateUrl: './course-preview.component.html',
  styleUrls: ['./course-preview.component.css']
})
export class CoursePreviewComponent {

  constructor(
    public dialogRef: MatDialogRef<CoursePreviewComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CoursePreviewData,
    private sanitizer: DomSanitizer
  ) {}

  getEmbedUrl(url: string): SafeResourceUrl {
    if (!url) return this.sanitizer.bypassSecurityTrustResourceUrl('');

    let videoId: string | undefined;

    if (url.includes('youtu.be/') || url.includes('/shorts/')) {
      const urlParts = url.split('/');
      videoId = urlParts[urlParts.length - 1];
    } else if (url.includes('watch?v=')) {
      videoId = url.split('v=')[1];
    } else if (url.includes('/embed/')) {
      const urlParts = url.split('/');
      videoId = urlParts[urlParts.length - 1];
    }

    if (videoId) {
      const ampersandPosition = videoId.indexOf('&');
      if (ampersandPosition !== -1) {
        videoId = videoId.substring(0, ampersandPosition);
      }
      return this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/' + videoId);
    }

    return this.sanitizer.bypassSecurityTrustResourceUrl('');
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
