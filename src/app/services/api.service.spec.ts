import { TestBed } from '@angular/core/testing';

import { LenguaslistService } from './api';

describe('LenguaslistService', () => {
  let service: LenguaslistService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LenguaslistService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
