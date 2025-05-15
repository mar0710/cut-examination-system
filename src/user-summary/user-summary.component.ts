import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProgressRecord } from '../../app/progress-record.schema';
import { Semester } from '../../app/semester.schema';
import { Student } from '../../app/student.schema';
import { Thesis } from '../../app/thesis.schema';
import { GradesService } from '../grades.service';
import { IProgressRecord, ISemester, ISubject } from '../parser/models';
import { AuxiliaryFunctions } from '../parser/parser';
import { UserListService } from '../user-list/user-list.service';

@Component({
  selector: 'app-user-summary',
  templateUrl: './user-summary.component.html',
  styleUrls: ['./user-summary.component.scss'],
})
export class UserSummaryComponent implements OnInit {
  progressRecord: IProgressRecord;
  avgGrade: number;
  thesisGrade: number;
  diplomaGrade: number;
  finalGrade: number;

  constructor(
    private route: ActivatedRoute,
    private userListService: UserListService,
    private gradesService: GradesService
  ) {
    this.getProgressRecord();
    this.gradesService.selectedThesisGrade$.subscribe(
      (grade) => (this.thesisGrade = grade)
    );
    this.gradesService.selectedAvgStudyGrade$.subscribe(
      (grade) => (this.avgGrade = grade)
    );
    this.gradesService.selectedDiplomaGrade$.subscribe(
      (grade) => (this.diplomaGrade = grade)
    );
    this.calculateFinalGrade();
  }

  ngOnInit(): void {}

  getProgressRecord() {
    let albumNum: number = parseInt(
      this.route.snapshot.paramMap.get('id')!,
      10
    );
    let student: Student;
    let tempSemesters: string[];
    let semesters: ISemester[] = [];
    let thesis: Thesis;
    let tempProgressRecord: ProgressRecord;
    let tempSemester: Semester;
    let subjects: ISubject[] = [];

    this.userListService.getStudent(albumNum).subscribe((result) => {
      student = result;
    });

    this.userListService.getProgressRecord(student.id).subscribe((result) => {
      tempProgressRecord = result;
    });

    this.userListService
      .getThesis(tempProgressRecord.thesis)
      .subscribe((result) => {
        thesis = result;
      });

    tempSemesters = tempProgressRecord.semesters.split(',');

    for (let semester of tempSemesters) {
      this.userListService
        .getSemester(parseInt(semester))
        .subscribe((result) => {
          tempSemester = result;
        });

      for (let subject of tempSemester.subjects.split(',')) {
        this.userListService
          .getSubject(parseInt(subject))
          .subscribe((result) => {
            subjects.push({
              id: result.id,
              num: result.num,
              title: result.title,
              classType: result.classType,
              passType: result.passType,
              toAvg: result.toAvg,
              hasExam: result.hasExam,
              hours: result.hours,
              grades: result.grades.split(','),
              ECTS: result.ECTS,
            });
          });
      }

      semesters.push({
        id: tempSemester.id,
        num: tempSemester.num,
        year: tempSemester.year,
        finishDate: tempSemester.finishDate,
        subjects: subjects,
        avgGrade: tempSemester.avgGrade,
        totalECTS: tempSemester.totalECTS,
      });

      subjects = [];
    }

    this.progressRecord = {
      id: tempProgressRecord.id,
      recordDate: tempProgressRecord.recordDate,
      academicYear: tempProgressRecord.academicYear,
      student: student,
      semesters: semesters,
      thesis: thesis,
    };
  }

  calculateFinalGrade() {
    const tempFinalGrade = AuxiliaryFunctions.formatGradeToCorrectFormat(this.avgGrade * 0.6 + this.thesisGrade * 0.2 + this.diplomaGrade * 0.2);

    if (tempFinalGrade >= 4.6) {
      this.finalGrade = 5
    } else if(tempFinalGrade >= 4.26) {
      this.finalGrade = 4.5
    } else if (tempFinalGrade >= 3.76) {
      this.finalGrade = 4
    } else if (tempFinalGrade >= 3.26) {
      this.finalGrade = 3.5
    } else if (tempFinalGrade >= 3) {
      this.finalGrade = 3
    } else {
      this.finalGrade = 2
    }
  }

  addStudentToExaminated(albumNum: number) {
    let studentsArray: number[];
    this.gradesService.selectedexaminatedStudents$.subscribe((students) => {
      studentsArray = students;
    });
    studentsArray.push(albumNum);
    this.gradesService.setExaminatedStudents(studentsArray);
  }
}
