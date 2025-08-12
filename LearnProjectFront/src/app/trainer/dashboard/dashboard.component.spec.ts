import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainerDashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
  let component: TrainerDashboardComponent;
  let fixture: ComponentFixture<TrainerDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TrainerDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrainerDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
