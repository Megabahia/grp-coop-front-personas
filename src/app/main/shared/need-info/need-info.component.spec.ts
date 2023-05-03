import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NeedInfoComponent } from './need-info.component';

describe('NeedInfoComponent', () => {
  let component: NeedInfoComponent;
  let fixture: ComponentFixture<NeedInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NeedInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NeedInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
