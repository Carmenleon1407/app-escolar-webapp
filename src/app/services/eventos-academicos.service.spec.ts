import { TestBed } from '@angular/core/testing';

import { EventosAcademicosService } from './eventos-academicos.service';

describe('EventosAcademicosService', () => {
  let service: EventosAcademicosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EventosAcademicosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
