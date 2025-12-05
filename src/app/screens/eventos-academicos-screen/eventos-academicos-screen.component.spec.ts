import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventosAcademicosScreenComponent } from './eventos-academicos-screen.component';

describe('EventosAcademicosScreenComponent', () => {
  let component: EventosAcademicosScreenComponent;
  let fixture: ComponentFixture<EventosAcademicosScreenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EventosAcademicosScreenComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventosAcademicosScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
