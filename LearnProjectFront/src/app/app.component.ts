import { Component, OnInit } from '@angular/core';
import { InactivityService } from './services/inactivity.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'LearnProjectFront';

  constructor(private inactivityService: InactivityService) {}

  ngOnInit(): void {
    this.inactivityService.initInactivityTimer();
  }
}
