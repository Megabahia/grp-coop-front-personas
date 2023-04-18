import { TestBed } from '@angular/core/testing';

import { PagesViewsService } from './pages-views.service';

describe('PagesViewsService', () => {
  let service: PagesViewsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PagesViewsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
