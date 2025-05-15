import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionManagerComponent } from './question-manager.component';

describe('QuestionManagerComponent', () => {
  let component: QuestionManagerComponent;
  let fixture: ComponentFixture<QuestionManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [QuestionManagerComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
