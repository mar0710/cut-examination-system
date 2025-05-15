import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class GradesService {
  private avgStudyGrade$ = new BehaviorSubject<any>({});
  selectedAvgStudyGrade$ = this.avgStudyGrade$.asObservable();
  private thesisGrade$ = new BehaviorSubject<any>({});
  selectedThesisGrade$ = this.thesisGrade$.asObservable();
  private diplomaGrade$ = new BehaviorSubject<any>({});
  selectedDiplomaGrade$ = this.diplomaGrade$.asObservable();
  private examinatedStudents$ = new BehaviorSubject<any>([]);
  selectedexaminatedStudents$ = this.examinatedStudents$.asObservable();
  constructor() {}

  setAvgStudyGrade(grade: any) {
    this.avgStudyGrade$.next(grade);
  }

  setThesisGrade(grade: any) {
    this.thesisGrade$.next(grade);
  }

  setDiplomaGrade(grade: any) {
    this.diplomaGrade$.next(grade);
  }

  setExaminatedStudents(student: any) {
    this.examinatedStudents$.next(student);
  }
}
