import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserExaminationComponent } from './user-examination.component';

describe('UserExaminationComponent', () => {
  let component: UserExaminationComponent;
  let fixture: ComponentFixture<UserExaminationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserExaminationComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserExaminationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
