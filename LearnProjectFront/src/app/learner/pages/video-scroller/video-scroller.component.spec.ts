import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoScrollerComponent } from './video-scroller.component';

describe('VideoScrollerComponent', () => {
  let component: VideoScrollerComponent;
  let fixture: ComponentFixture<VideoScrollerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VideoScrollerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VideoScrollerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
