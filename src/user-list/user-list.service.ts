import { Injectable } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { of, catchError, Observable, throwError } from 'rxjs';
import { ProgressRecord } from '../../app/progress-record.schema';
import { Semester } from '../../app/semester.schema';
import { Student } from '../../app/student.schema';
import { Subject } from '../../app/subject.schema';
import { Thesis } from '../../app/thesis.schema';
import { UserListComponent } from './user-list.component';

@Injectable()
export class UserListService {
  constructor(private _electronService: ElectronService) {}

  getStudents(): Observable<Student[]> {
    return of(this._electronService.ipcRenderer.sendSync('get-students')).pipe(
      catchError((err: any) => throwError(err.json))
    );
  }

  getStudent(albumNum: number): Observable<Student> {
    return of(
      this._electronService.ipcRenderer.sendSync('get-student', albumNum)
    ).pipe(catchError((err: any) => throwError(err.json)));
  }

  addStudent(student: Student): Observable<number> {
    return of(
      this._electronService.ipcRenderer.sendSync('add-student', student)
    ).pipe(catchError((err: any) => throwError(console.log(err))));
  }

  deleteAllStudents(): Observable<Student[]> {
    return of(
      this._electronService.ipcRenderer.sendSync('delete-students')
    ).pipe(catchError((err: any) => throwError(err.json)));
  }

  addThesis(thesis: Thesis): Observable<number> {
    return of(
      this._electronService.ipcRenderer.sendSync('add-thesis', thesis)
    ).pipe(catchError((err: any) => throwError(console.log(err))));
  }

  getThesis(id: number): Observable<Thesis> {
    return of(
      this._electronService.ipcRenderer.sendSync('get-thesis', id)
    ).pipe(catchError((err: any) => throwError(err.json)));
  }

  deleteTheses(): Observable<Thesis> {
    return of(this._electronService.ipcRenderer.sendSync('delete-theses')).pipe(
      catchError((err: any) => throwError(err.json))
    );
  }

  addSubject(subject: Subject): Observable<number> {
    return of(
      this._electronService.ipcRenderer.sendSync('add-subject', subject)
    ).pipe(catchError((err: any) => throwError(console.log(err))));
  }

  getSubject(id: number): Observable<Subject> {
    return of(
      this._electronService.ipcRenderer.sendSync('get-subject', id)
    ).pipe(catchError((err: any) => throwError(err.json)));
  }

  deleteSubjects(): Observable<Thesis> {
    return of(
      this._electronService.ipcRenderer.sendSync('delete-subjects')
    ).pipe(catchError((err: any) => throwError(err.json)));
  }

  addSemester(semester: Semester): Observable<number> {
    return of(
      this._electronService.ipcRenderer.sendSync('add-semester', semester)
    ).pipe(catchError((err: any) => throwError(console.log(err))));
  }

  getSemester(id: number): Observable<Semester> {
    return of(
      this._electronService.ipcRenderer.sendSync('get-semester', id)
    ).pipe(catchError((err: any) => throwError(err.json)));
  }

  deleteSemesters(): Observable<Thesis> {
    return of(
      this._electronService.ipcRenderer.sendSync('delete-semesters')
    ).pipe(catchError((err: any) => throwError(err.json)));
  }

  addProgressRecord(progressRecord: ProgressRecord): Observable<number> {
    return of(
      this._electronService.ipcRenderer.sendSync(
        'add-progressRecord',
        progressRecord
      )
    ).pipe(catchError((err: any) => throwError(console.log(err))));
  }

  getProgressRecord(id: number): Observable<ProgressRecord> {
    return of(
      this._electronService.ipcRenderer.sendSync('get-progressRecord', id)
    ).pipe(catchError((err: any) => throwError(err.json)));
  }

  deleteProgressRecords(): Observable<Thesis> {
    return of(
      this._electronService.ipcRenderer.sendSync('delete-progressRecords')
    ).pipe(catchError((err: any) => throwError(err.json)));
  }
}
