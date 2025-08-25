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

  // Mock quiz data
  private mockQuizzes: Quiz[] = [
    {
      id: 'quiz-1',
      question: 'What is the main purpose of React components?',
      options: [
        'To style web pages',
        'To create reusable UI elements',
        'To manage databases',
        'To handle server requests'
      ],
      correctAnswer: 1,
      explanation: 'React components are reusable pieces of UI that encapsulate logic and presentation.'
    },
    {
      id: 'quiz-2',
      question: 'Which hook is used for managing state in React?',
      options: [
        'useEffect',
        'useState',
        'useContext',
        'useCallback'
      ],
      correctAnswer: 1,
      explanation: 'useState is the React hook specifically designed for managing component state.'
    },
    {
      id: 'quiz-3',
      question: 'What does JSX stand for?',
      options: [
        'JavaScript XML',
        'Java Syntax Extension',
        'JavaScript eXtension',
        'JSON Syntax eXtension'
      ],
      correctAnswer: 0,
      explanation: 'JSX stands for JavaScript XML and allows you to write HTML-like syntax in JavaScript.'
    }
  ];

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
    this.videos.forEach((video, index) => {
      this.contentItems.push(video);
      // Add quiz after every 3 videos
      if ((index + 1) % 3 === 0 && index < this.videos.length - 1) {
        const quizIndex = Math.floor(index / 3);
        if (this.mockQuizzes[quizIndex]) {
          this.contentItems.push(this.mockQuizzes[quizIndex]);
        }
      }
    });
  }

  getSafeUrl(youtubeUrl: string): SafeResourceUrl {
    let videoId = '';

    // Check for standard, short, and shorts URL formats
    if (youtubeUrl.includes('watch?v=')) {
      videoId = youtubeUrl.split('v=')[1];
    } else if (youtubeUrl.includes('youtu.be/')) {
      videoId = youtubeUrl.split('youtu.be/')[1];
    } else if (youtubeUrl.includes('/shorts/')) {
      videoId = youtubeUrl.split('/shorts/')[1];
    }

    // Clean up any extra parameters in the URL
    if (videoId) {
      const ampersandPosition = videoId.indexOf('&');
      if (ampersandPosition !== -1) {
        videoId = videoId.substring(0, ampersandPosition);
      }
    }

    // Construct the embed URL with autoplay and mute settings
    const autoplay = this.isPlaying ? 1 : 0;
    const mute = this.isMuted ? 1 : 0;
    const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=${autoplay}&mute=${mute}&controls=1&rel=0&modestbranding=1`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }

  // Navigation methods
  goToNext(): void {
    if (this.currentIndex < this.contentItems.length - 1) {
      if (this.isCurrentItemVideo()) {
        this.completedVideos.add(this.getCurrentVideo().id);
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

    // Auto-advance after showing result
    setTimeout(() => {
      this.goToNext();
    }, 3000);
  }

  // Utility methods
  getCurrentItem(): Video | Quiz {
    return this.contentItems[this.currentIndex];
  }

  getCurrentVideo(): Video {
    return this.getCurrentItem() as Video;
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
    return this.videos.findIndex(v => v.id === this.getCurrentVideo().id) + 1;
  }

  isVideoCompleted(): boolean {
    if (!this.isCurrentItemVideo()) return false;
    return this.completedVideos.has(this.getCurrentVideo().id);
  }

  canGoNext(): boolean {
    return this.currentIndex < this.contentItems.length - 1;
  }

  canGoPrevious(): boolean {
    return this.currentIndex > 0;
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
