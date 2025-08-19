import { TestBed } from '@angular/core/testing';

import { LearnerDataService } from './learner-data.service';

describe('LearnerDataService', () => {
  let service: LearnerDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LearnerDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
