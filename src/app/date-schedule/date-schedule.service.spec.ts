import { TestBed } from '@angular/core/testing';

import { DateScheduleService } from './date-schedule.service';

describe('DateScheduleService', () => {
  let service: DateScheduleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DateScheduleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
