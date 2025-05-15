import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NgxCsvParser, NgxCSVParserError } from 'ngx-csv-parser';
import { IQuestion } from '../parser/models';
import { QuestionManagerService } from './question-manager.service';

@Component({
  selector: 'app-question-manager',
  templateUrl: './question-manager.component.html',
  styleUrls: ['./question-manager.component.scss'],
})
export class QuestionManagerComponent implements AfterViewInit {
  displayedColumns: string[] = [
    'id',
    'subject',
    'question',
    'deleteQuestion',
  ];
  dataSource: MatTableDataSource<IQuestion>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('uploads') fileValue: ElementRef;

  constructor(
    private questionManagerService: QuestionManagerService,
    private ngxCsvParser: NgxCsvParser
  ) {
    this.questionManagerService.getQuestions().subscribe((results) => {
      this.dataSource = new MatTableDataSource(results);
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  deleteAllItems() {
    this.questionManagerService.deleteAllQuestions().subscribe(() => {
      this.dataSource.data = [];
    });
  }

  deleteItem(id: number) {
    this.questionManagerService.deleteQuestion(id).subscribe((results) => {
      this.dataSource.data = results;
    });
  }

  parseRowToQuestion(row: any, id: number): IQuestion {
    let question: IQuestion = {
      id: id,
      field: row[0],
      degree: Number.parseInt(row[1]),
      specialization: row[2],
      subject: row[3],
      question: row[4],
      answer: row[5],
    };
    return question;
  }

  onChange(fileList: FileList): void {
    let counter = 1;
    let files = Array.from(fileList);
    this.ngxCsvParser
      .parse(files[0], { header: false, delimiter: ',' })
      .pipe()
      .subscribe({
        next: (result): void => {
          let rows = result as [];
          rows.shift();
          rows.forEach((element) => {
            let question = this.parseRowToQuestion(element, counter++);
            this.dataSource.data.push(question);
          });
          this.questionManagerService
            .addQuestions(this.dataSource.data)
            .subscribe((results) => {
              this.dataSource.data = results;
            });
          this.fileValue.nativeElement.value = '';
        },
        error: (error: NgxCSVParserError): void => {
          console.log('Error', error);
        },
      });
  }
}
