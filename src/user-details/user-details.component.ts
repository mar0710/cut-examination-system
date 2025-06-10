import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProgressRecord } from '../../app/progress-record.schema';
import { Semester } from '../../app/semester.schema';
import { Student } from '../../app/student.schema';
import { Thesis } from '../../app/thesis.schema';
import { GradesService } from '../grades.service';
import { IProgressRecord, ISemester, ISubject } from '../parser/models';
import { AuxiliaryFunctions, ExcelReader } from '../parser/parser';
import { QuestionManagerService } from '../question-manager/question-manager.service';
import { UserListService } from '../user-list/user-list.service';
import * as XLSX from 'xlsx';

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

    const totalECTS = semesters.reduce((sum, sem) => sum + Number(sem.totalECTS || 0), 0);

    const validSemesters = semesters.filter(
      s => s.finishDate && !isNaN(new Date(s.finishDate).getTime())
    );

    const studyStartDate = student.enrollDate;

    const studyEndDate = validSemesters.length > 0
      ? validSemesters[validSemesters.length - 1].finishDate
      : null;

    this.progressRecord = {
      id: tempProgressRecord.id,
      recordDate: tempProgressRecord.recordDate,
      academicYear: tempProgressRecord.academicYear,
      student: student,
      semesters: semesters,
      thesis: thesis,
      totalECTS: totalECTS,
      studyStartDate: studyStartDate,
      studyEndDate: studyEndDate,
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

  get studyDegree(): string {
    return AuxiliaryFunctions.getStudyDegreeByEcts(this.progressRecord.totalECTS);
  }

  get isGraduatedOnTime(): boolean {
    const start = this.progressRecord.studyStartDate ? new Date(this.progressRecord.studyStartDate) : undefined;
    const end = this.progressRecord.studyEndDate ? new Date(this.progressRecord.studyEndDate) : undefined;
    if (!start || !end) return false;
    return AuxiliaryFunctions.isGraduatedOnTime(start, end, this.studyDegree);
  }

  handleFileUpload(xlsxFile: File) {
    const fileReader = new FileReader();
    fileReader.onload = (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const reader = new ExcelReader(workbook);
      const progressRecord = reader.getProgressRecord();
      this.progressRecord = progressRecord;
    };
    fileReader.readAsArrayBuffer(xlsxFile);
  }

  get ectsValidation(): { valid: boolean; required: number; actual: number } {
    const degree = this.studyDegree;
    let requiredEcts = 0;
    switch (degree) {
      case 'inżynierskie':
        requiredEcts = 210;
        break;
      case 'licencjackie':
        requiredEcts = 180;
        break;
      case 'magisterskie inżynierskie':
        requiredEcts = 90;
        break;
      case 'magisterskie':
        requiredEcts = 120;
        break;
      default:
        requiredEcts = 0;
    }
    const actualEcts = this.progressRecord?.totalECTS || 0;
    return {
      valid: actualEcts >= requiredEcts,
      required: requiredEcts,
      actual: actualEcts,
    };
  }

}
