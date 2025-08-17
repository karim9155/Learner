import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnrollModalComponent } from './enroll-modal.component';

describe('EnrollModalComponent', () => {
  let component: EnrollModalComponent;
  let fixture: ComponentFixture<EnrollModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EnrollModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnrollModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
