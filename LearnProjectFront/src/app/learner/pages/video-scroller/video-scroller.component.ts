import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';
import { CourseService } from '../../../services/course.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import {NgIf} from '@angular/common';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'app-video-scroller',
  templateUrl: './video-scroller.component.html',
  standalone: false,
  styleUrls: ['./video-scroller.component.css']
})
export class VideoScrollerComponent implements OnInit {
  videos: any[] = [];
  courseId: string | null = null;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private courseService: CourseService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.courseId = this.route.snapshot.paramMap.get('courseId');
    if (this.courseId) {
      this.courseService.getVideosByCourse(this.courseId).subscribe(videos => {
        this.videos = videos;
        this.isLoading = false;
      });
    }
  }

  getSafeUrl(youtubeUrl: string): SafeResourceUrl {
    // Basic extraction of YouTube video ID
    let videoId = youtubeUrl.split('v=')[1];
    if (videoId) {
      const ampersandPosition = videoId.indexOf('&');
      if (ampersandPosition !== -1) {
        videoId = videoId.substring(0, ampersandPosition);
      }
      const embedUrl = `https://www.youtube.com/embed/${videoId}`;
      return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
    }
    return ''; // Return a safe, empty value if URL is invalid
  }
}
