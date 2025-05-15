import { Injectable } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { of, catchError, Observable, throwError } from 'rxjs';
import { IQuestion } from '../parser/models';

@Injectable()
export class QuestionManagerService {
  constructor(private _electronService: ElectronService) {}

  getQuestions(): Observable<IQuestion[]> {
    return of(this._electronService.ipcRenderer.sendSync('get-questions')).pipe(
      catchError((err: any) => throwError(err.json))
    );
  }

  getQuestion(id: number): Observable<IQuestion> {
    return of(
      this._electronService.ipcRenderer.sendSync('get-question', id)
    ).pipe(catchError((err: any) => throwError(err.json)));
  }

  addQuestions(questions: IQuestion[]): Observable<IQuestion[]> {
    return of(
      this._electronService.ipcRenderer.sendSync('add-questions', questions)
    ).pipe(catchError((err: any) => throwError(err.json)));
  }

  deleteAllQuestions(): Observable<IQuestion[]> {
    return of(
      this._electronService.ipcRenderer.sendSync('delete-questions')
    ).pipe(catchError((err: any) => throwError(err.json)));
  }

  deleteQuestion(id: number): Observable<IQuestion[]> {
    return of(
      this._electronService.ipcRenderer.sendSync('delete-question', id)
    ).pipe(catchError((err: any) => throwError(err.json)));
  }
}
