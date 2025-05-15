import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Index } from 'typeorm';
import { ProgressRecord } from '../../app/progress-record.schema';
import { Semester } from '../../app/semester.schema';
import { Student } from '../../app/student.schema';
import { Thesis } from '../../app/thesis.schema';
import { GradesService } from '../grades.service';
import { IProgressRecord, ISemester, ISubject } from '../parser/models';
import { AuxiliaryFunctions } from '../parser/parser';
import { QuestionManagerService } from '../question-manager/question-manager.service';
import { UserListService } from '../user-list/user-list.service';

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.scss'],
})
export class UserDetailsComponent implements OnInit {
  progressRecord: IProgressRecord;
  avgGrade: number;

  constructor(
    private route: ActivatedRoute,
    private userListService: UserListService,
    private questionManagerService: QuestionManagerService,
    private gradesService: GradesService
  ) {
    this.getProgressRecord();
    this.gradesService.setAvgStudyGrade(this.calculateStudyAvgGrade());
    this.gradesService.selectedAvgStudyGrade$.subscribe(
      (grade) => (this.avgGrade = grade)
    );
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

  calculateStudyAvgGrade() {
    let avgGrade: number = 0;
    for (let semester of this.progressRecord.semesters) {
      if (semester.avgGrade.toString() != '?') {
        avgGrade += semester.avgGrade;
      }
    }
    return AuxiliaryFunctions.formatGradeToCorrectFormat(avgGrade / this.progressRecord.semesters.length);
  }


  areQuestionsExist() {
    let numberOfQuestions;
    this.questionManagerService.getQuestions().subscribe((results)=>{
      numberOfQuestions = results.length;
    })
    if (numberOfQuestions == 0) {
      return false;
    } else {
      return true;
    }
  }


}
