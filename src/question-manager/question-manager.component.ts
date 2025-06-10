import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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
export class QuestionManagerComponent implements AfterViewInit, OnInit {
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

  showAddForm = false;
  newQuestion: IQuestion = {
    id: 0,
    field: '',
    degree: null,
    specialization: '',
    subject: '',
    question: '',
    answer: '',
  };

  existingFields: string[] = [];
  existingSpecializations: string[] = [];
  existingSubjects: string[] = [];

  filteredFields: string[] = [];
  filteredSpecializations: string[] = [];
  filteredSubjects: string[] = [];

  constructor(
    private questionManagerService: QuestionManagerService,
    private ngxCsvParser: NgxCsvParser
  ) {
    this.questionManagerService.getQuestions().subscribe((results) => {
      this.dataSource = new MatTableDataSource(results);
    });
  }

  ngOnInit() {
    this.loadQuestions();
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

  toggleAddForm() {
    this.showAddForm = !this.showAddForm;
    if (this.showAddForm) {
      const maxId = this.dataSource?.data?.length
        ? Math.max(...this.dataSource.data.map(q => q.id))
        : 0;
      this.newQuestion = {
        id: maxId + 1,
        field: '',
        degree: null,
        specialization: '',
        subject: '',
        question: '',
        answer: '',
      };
    }
  }

  addQuestion() {
    this.questionManagerService
      .addQuestions([this.newQuestion])
      .subscribe(() => {
        this.loadQuestions();
        this.toggleAddForm();
      });
  }

  private populatePickers(qs: IQuestion[]) {
    this.existingFields = Array.from(new Set(qs.map(q => q.field))).sort();
    this.existingSpecializations = Array.from(new Set(qs.map(q => q.specialization))).sort();
    this.existingSubjects = Array.from(new Set(qs.map(q => q.subject))).sort();

    this.filteredFields = [...this.existingFields];
    this.filteredSpecializations = [...this.existingSpecializations];
    this.filteredSubjects = [...this.existingSubjects];
  }

  filterFields(value: string) {
    const v = value?.toLowerCase() || '';
    this.filteredFields = this.existingFields.filter(opt => opt.toLowerCase().startsWith(v));
  }

  filterSpecializations(value: string) {
    const v = value?.toLowerCase() || '';
    this.filteredSpecializations = this.existingSpecializations.filter(opt => opt.toLowerCase().startsWith(v));
  }

  filterSubjects(value: string) {
    const v = value?.toLowerCase() || '';
    this.filteredSubjects = this.existingSubjects.filter(opt => opt.toLowerCase().startsWith(v));
  }

  loadQuestions() {
    this.questionManagerService.getQuestions().subscribe(qs => {
      this.dataSource.data = qs;
      this.populatePickers(qs);
    });
  }
}
