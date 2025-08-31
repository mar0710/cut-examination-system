import { Component, OnInit, NgZone, OnDestroy } from '@angular/core';
import { IQuestion } from '../parser/models';
import { ElectronService } from '../electron/electron.service';

@Component({
  selector: 'app-questions-window',
  templateUrl: './questions-window.component.html',
  styleUrls: ['./user-examination.component.scss']
})
export class QuestionsWindowComponent implements OnInit, OnDestroy {
  questions: IQuestion[] = [];

  constructor(
    private electronService: ElectronService,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    if (this.electronService.isElectron) {
      // Request the questions from the main process
      setTimeout(() => {
        this.electronService.ipcRenderer.send('request-questions-data');
      }, 500);

      // Listen for the response
      this.electronService.ipcRenderer.on('questions-data', (event, questions: IQuestion[]) => {
        this.ngZone.run(() => {
          this.questions = questions;
        });
      });
    }
  }

  ngOnDestroy(): void {
    if (this.electronService.isElectron) {
      this.electronService.ipcRenderer.removeAllListeners('questions-data');
    }
  }
}
