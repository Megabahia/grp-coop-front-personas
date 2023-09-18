import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmacionGaranteComponent } from './confirmacion-garante.component';

describe('ConfirmacionGaranteComponent', () => {
  let component: ConfirmacionGaranteComponent;
  let fixture: ComponentFixture<ConfirmacionGaranteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfirmacionGaranteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmacionGaranteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
