import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ExcelReader } from '../parser/parser';
import * as XLSX from 'xlsx';
import { UserListService } from './user-list.service';
import { Student } from '../../app/student.schema';
import { ISubject, IProgressRecord, ISemester } from '../parser/models';
import { Subject } from '../../app/subject.schema';
import { Semester } from '../../app/semester.schema';
import { ProgressRecord } from '../../app/progress-record.schema';
import { GradesService } from '../grades.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
})
export class UserListComponent implements AfterViewInit {
  displayedColumns: string[] = ['albumNum', 'name', 'more'];
  dataSource: MatTableDataSource<Student>;
  examinatedStudents: number[];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('uploads') fileValue: ElementRef;

  constructor(
    private userListService: UserListService,
    private gradeService: GradesService
  ) {
    this.userListService.getStudents().subscribe((results) => {
      this.dataSource = new MatTableDataSource(results);
    });
    this.gradeService.selectedexaminatedStudents$.subscribe((students) => {
      this.examinatedStudents = students;
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
    this.userListService.deleteSubjects().subscribe(() => {});
    this.userListService.deleteSemesters().subscribe(() => {});
    this.userListService.deleteTheses().subscribe(() => {});
    this.userListService.deleteProgressRecords().subscribe(() => {});
    this.userListService.deleteAllStudents().subscribe(() => {
      this.dataSource.data = [];
    });
  }

  getFiledetials(element) {
    for (let file of element.files) {
      let workBook = null;
      const reader = new FileReader();
      reader.onload = (event) => {
        const data = reader.result;
        workBook = XLSX.read(data, { type: 'binary' });
        let readser = new ExcelReader(workBook);

        this.saveProgressRecordToDatabase(readser.getProgressRecord());
        this.userListService.getStudents().subscribe((results) => {
          this.dataSource.data = results;
        });
      };
      reader.readAsBinaryString(file);
    }

    this.fileValue.nativeElement.value = '';
  }

  saveProgressRecordToDatabase(progressRecord: IProgressRecord) {
    let studentId: number;
    let semesterIds: number[] = [];
    let thesisId: number;
    let subjectIds: number[] = [];
    let controlUser;

    this.userListService.getStudent(progressRecord.student.albumNum).subscribe((record)=>{
        controlUser = record;
    })

    if (Object.keys(controlUser).length === 0) {
      this.userListService.addStudent(progressRecord.student).subscribe((id) => {
        studentId = id;
      });

      this.userListService.addThesis(progressRecord.thesis).subscribe((id) => {
        thesisId = id;
      });

      for (let semester of progressRecord.semesters) {
        for (let subject of semester.subjects) {
          this.userListService
            .addSubject(this.subjectToSubjectSchema(subject))
            .subscribe((id) => {
              subjectIds.push(id);
            });
        }
        this.userListService
          .addSemester(this.semesterToSemesterSchema(semester, subjectIds))
          .subscribe((id) => {
            semesterIds.push(id);
          });
        subjectIds = [];
      }
      this.userListService
        .addProgressRecord(
          this.progressRecordToProgressRecordSchema(
            progressRecord,
            studentId,
            semesterIds,
            thesisId
          )
        )
        .subscribe(() => {});
    } else {
      console.log('student with album number: ' + progressRecord.student.albumNum + ' already exists')
    }


  }

  subjectToSubjectSchema(subject: ISubject): Subject {
    return {
      id: subject.id,
      num: subject.num,
      title: subject.title,
      classType: subject.classType,
      passType: subject.passType,
      toAvg: subject.toAvg,
      hasExam: subject.hasExam,
      hours: subject.hours,
      grades: subject.grades.join(','),
      ECTS: subject.ECTS == null ? null : subject.ECTS.toString(),
    };
  }

  semesterToSemesterSchema(
    semester: ISemester,
    subjectIds: number[]
  ): Semester {
    return {
      id: semester.id,
      num: semester.num,
      year: semester.year,
      finishDate: semester.finishDate,
      subjects: subjectIds.join(','),
      avgGrade: semester.avgGrade,
      totalECTS: semester.totalECTS.toString(),
    };
  }

  progressRecordToProgressRecordSchema(
    progressRecord: IProgressRecord,
    studentId: number,
    semesterIds: number[],
    thesisId: number
  ): ProgressRecord {
    return {
      id: progressRecord.id,
      recordDate: progressRecord.recordDate,
      academicYear: progressRecord.academicYear,
      student: studentId,
      semesters: semesterIds.join(','),
      thesis: thesisId,
    };
  }

  shouldDisableButton(albumNum: number): boolean {
    if (this.examinatedStudents.includes(albumNum)) {
      return true;
    } else {
      return false;
    }
  }
}
