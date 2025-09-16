import { Component, OnInit, OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CourseService } from '../../../services/course.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

interface Video {
  id: string;
  title: string;
  youtubeUrl: string;
  courseId: string;
  description?: string;
  duration?: string;
  quiz?: Quiz;
}

interface Quiz {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

@Component({
  selector: 'app-video-scroller',
  templateUrl: './video-scroller.component.html',
  standalone: false,
  styleUrls: ['./video-scroller.component.css']
})
export class VideoScrollerComponent implements OnInit, OnDestroy {
  @ViewChild('scrollContainer', { static: false }) scrollContainer!: ElementRef<HTMLDivElement>;

  videos: Video[] = [];
  courseId: string | null = null;
  courseName: string = 'Course';
  isLoading = true;

  // TikTok-style navigation
  currentIndex = 0;
  contentItems: (Video | Quiz)[] = [];
  isPlaying = true;
  isMuted = false;

  // Touch handling
  touchStartY = 0;
  touchEndY = 0;

  // Quiz state
  showQuiz = false;
  currentQuiz: Quiz | null = null;
  selectedAnswer: number | null = null;
  showQuizResult = false;
  quizCorrect = false;

  // Progress tracking
  completedVideos = new Set<string>();
  completedQuizzes = new Set<string>();


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.courseId = this.route.snapshot.paramMap.get('courseId');
    if (this.courseId) {
      this.courseService.getVideosByCourse(this.courseId).subscribe({
        next: (videos) => {
          this.videos = videos;
          this.buildContentItems();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading videos:', error);
          this.isLoading = false;
        }
      });
    }
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  private buildContentItems(): void {
    this.contentItems = [];
    this.videos.forEach(video => {
      this.contentItems.push(video);
      if (video.quiz) {
        this.contentItems.push(video.quiz);
      }
    });
  }

  getSafeUrl(youtubeUrl: string): SafeResourceUrl {
    if (!youtubeUrl) {
      return this.sanitizer.bypassSecurityTrustResourceUrl('');
    }

    let videoId = '';
    try {
      const url = new URL(youtubeUrl);
      if (url.hostname === 'youtu.be') {
        videoId = url.pathname.slice(1);
      } else if (url.hostname.includes('youtube.com')) {
        if (url.pathname.startsWith('/embed/')) {
          videoId = url.pathname.split('/embed/')[1];
        } else if (url.pathname.startsWith('/shorts/')) {
          videoId = url.pathname.split('/shorts/')[1];
        } else if (url.searchParams.has('v')) {
          videoId = url.searchParams.get('v')!;
        }
      }
    } catch (error) {
      console.error('Could not parse YouTube URL:', error);
      const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
      const match = youtubeUrl.match(regex);
      if (match && match[1]) {
        videoId = match[1];
      }
    }


    if (!videoId) {
      console.error('Could not extract video ID from URL:', youtubeUrl);
      return this.sanitizer.bypassSecurityTrustResourceUrl('');
    }


    const autoplay = this.isPlaying ? 1 : 0;
    const mute = this.isMuted ? 1 : 0;
    const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=${autoplay}&mute=${mute}&controls=1&rel=0&modestbranding=1`;

    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }

  // Navigation methods
  goToNext(): void {
    if (this.currentIndex < this.contentItems.length - 1) {
      if (this.isCurrentItemVideo()) {
        this.completedVideos.add(this.getCurrentVideo()!.id);
      }

      this.currentIndex++;
      this.resetQuizState();
      this.updateCurrentItem();
    }
  }

  goToPrevious(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.resetQuizState();
      this.updateCurrentItem();
    }
  }

  private updateCurrentItem(): void {
    const currentItem = this.contentItems[this.currentIndex];
    if (this.isQuizItem(currentItem)) {
      this.currentQuiz = currentItem;
      this.showQuiz = true;
    } else {
      this.currentQuiz = null;
      this.showQuiz = false;
    }
  }

  private resetQuizState(): void {
    this.selectedAnswer = null;
    this.showQuizResult = false;
    this.showQuiz = false;
  }

  // Touch handlers
  onTouchStart(event: TouchEvent): void {
    this.touchStartY = event.touches[0].clientY;
  }

  onTouchMove(event: TouchEvent): void {
    this.touchEndY = event.touches[0].clientY;
  }

  onTouchEnd(): void {
    if (!this.touchStartY || !this.touchEndY) return;

    const distance = this.touchStartY - this.touchEndY;
    const isSwipeUp = distance > 50;
    const isSwipeDown = distance < -50;

    if (isSwipeUp) {
      this.goToNext();
    } else if (isSwipeDown) {
      this.goToPrevious();
    }
  }

  // Keyboard navigation
  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowUp':
      case 'k':
        event.preventDefault();
        this.goToPrevious();
        break;
      case 'ArrowDown':
      case 'j':
        event.preventDefault();
        this.goToNext();
        break;
      case ' ':
        event.preventDefault();
        this.togglePlayPause();
        break;
      case 'm':
        event.preventDefault();
        this.toggleMute();
        break;
      case 'Escape':
        this.goBack();
        break;
    }
  }

  // Video controls
  togglePlayPause(): void {
    this.isPlaying = !this.isPlaying;
    // Note: In a real implementation, you'd need to communicate with the iframe
    // to control playback, which requires the YouTube Player API
  }

  toggleMute(): void {
    this.isMuted = !this.isMuted;
    // Note: Similar to play/pause, mute control would require YouTube Player API
  }

  // Quiz methods
  selectQuizAnswer(answerIndex: number): void {
    if (this.showQuizResult || !this.currentQuiz) return;

    this.selectedAnswer = answerIndex;
    this.quizCorrect = answerIndex === this.currentQuiz.correctAnswer;
    this.showQuizResult = true;

    this.completedQuizzes.add(this.currentQuiz.id);

    // If it's the last item, navigate to results page, otherwise advance to next item.
    if (this.isLastItem()) {
      setTimeout(() => {
        this.finishCourse();
      }, 2000); // Shorter delay for finishing
    } else {
      setTimeout(() => {
        this.goToNext();
      }, 3000);
    }
  }

  // Utility methods
  getCurrentItem(): Video | Quiz {
    return this.contentItems[this.currentIndex];
  }

  getCurrentVideo(): Video | null {
    if (this.isCurrentItemVideo()) {
      return this.getCurrentItem() as Video;
    }
    return null;
  }

  getCurrentQuiz(): Quiz {
    return this.getCurrentItem() as Quiz;
  }

  isCurrentItemVideo(): boolean {
    const item = this.getCurrentItem();
    return item && 'youtubeUrl' in item;
  }

  isCurrentItemQuiz(): boolean {
    const item = this.getCurrentItem();
    return item && 'question' in item;
  }

  private isQuizItem(item: Video | Quiz): item is Quiz {
    return 'question' in item;
  }

  getProgressPercentage(): number {
    return ((this.currentIndex + 1) / this.contentItems.length) * 100;
  }

  getVideoIndex(): number {
    if (!this.isCurrentItemVideo()) return 0;
    return this.videos.findIndex(v => v.id === this.getCurrentVideo()!.id) + 1;
  }

  isVideoCompleted(): boolean {
    if (!this.isCurrentItemVideo()) return false;
    return this.completedVideos.has(this.getCurrentVideo()!.id);
  }

  canGoNext(): boolean {
    return this.currentIndex < this.contentItems.length - 1;
  }

  canGoPrevious(): boolean {
    return this.currentIndex > 0;
  }

  isLastItem(): boolean {
    return this.currentIndex === this.contentItems.length - 1;
  }

  finishCourse(): void {
    if (this.courseId) {
      this.router.navigate(['/learner/results', this.courseId]);
    }
  }

  goBack(): void {
    this.router.navigate(['/learner/courses']);
  }

  goHome(): void {
    this.router.navigate(['/']);
  }

  getOptionLetter(index: number): string {
    return String.fromCharCode(65 + index);
  }

  getAnswerButtonClass(index: number): string {
    let baseClass = 'w-full p-4 text-left border-2 transition-all duration-200 hover:bg-gray-50';

    if (this.selectedAnswer === index) {
      if (this.showQuizResult) {
        if (index === this.currentQuiz?.correctAnswer) {
          baseClass += ' border-green-500 bg-green-50 text-green-800';
        } else {
          baseClass += ' border-red-500 bg-red-50 text-red-800';
        }
      } else {
        baseClass += ' border-blue-500 bg-blue-50';
      }
    } else if (this.showQuizResult && index === this.currentQuiz?.correctAnswer) {
      baseClass += ' border-green-500 bg-green-50 text-green-800';
    } else {
      baseClass += ' border-gray-200 hover:border-gray-300';
    }

    return baseClass;
  }

  getAnswerIconClass(index: number): string {
    let baseClass = 'w-6 h-6 border-2 flex items-center justify-center text-sm font-medium';

    if (this.selectedAnswer === index) {
      if (this.showQuizResult) {
        if (index === this.currentQuiz?.correctAnswer) {
          baseClass += ' border-green-500 bg-green-500 text-white';
        } else {
          baseClass += ' border-red-500 bg-red-500 text-white';
        }
      } else {
        baseClass += ' border-blue-500 bg-blue-500 text-white';
      }
    } else if (this.showQuizResult && index === this.currentQuiz?.correctAnswer) {
      baseClass += ' border-green-500 bg-green-500 text-white';
    } else {
      baseClass += ' border-gray-300';
    }

    return baseClass;
  }
}
