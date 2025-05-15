import * as XLSX from 'xlsx';
import { Student } from '../../app/student.schema';
import { Thesis } from '../../app/thesis.schema';
import { IProgressRecord, ISemester, ISubject } from './models';

export class ExcelReader {
  sheet: XLSX.WorkSheet;
  rows: string[];

  constructor(xlsxFile: XLSX.WorkBook) {
    this.sheet = xlsxFile.Sheets[xlsxFile.SheetNames[0]];
    this.rows = this.getRows();
  }

  public static fromPath(path: string): ExcelReader {
    const xlsxFile = XLSX.readFile(path);
    return new ExcelReader(xlsxFile);
  }

  public getProgressRecord(): IProgressRecord {
    const dateYearRow = this.rows[0];
    const dateYear = dateYearRow.match(
      /Data: (([0-2]\d|3[0-1])-(0\d|1[0-2])-(\d{4})) r\.\s+Rok Ak.: (\d{4}\/\d{2})/
    );
    const recordDate = new Date(`${dateYear[4]}-${dateYear[3]}-${dateYear[2]}`);
    const academicYear = dateYear[5];

    const facultyRow = this.rows[2];
    const faculty = facultyRow.match(/studenta:(.+)/)[1].trim();

    const nameNumRow = this.rows[3];
    const nameNum = nameNumRow.match(/Nazwisko:(.*)Numer albumu: (\d+)\s*/);
    const studentName = nameNum[1].trim();
    const albumNum = Number.parseInt(nameNum[2]);

    const birthEnrollRow = this.rows[4];
    const birthStart = birthEnrollRow.match(
      /Data urodzenia: (([0-2]\d|3[0-1])-(0\d|1[0-2])-(\d{4}))\s*Data rozpoczęcia studiów: (([0-2]\d|3[0-1])-(0\d|1[0-2])-(\d{4}))/
    );
    const birthDate = new Date(
      `${birthStart[4]}-${birthStart[3]}-${birthStart[2]}`
    );
    const enrollDate = new Date(
      `${birthStart[8]}-${birthStart[7]}-${birthStart[6]}`
    );

    const courseRow = this.rows[5];
    const course = courseRow.match(/\s*Kierunek:(.+)/)[1].trim();

    let j = 6;

    let specialty = null;
    const specialtyRow = this.rows[j];
    const specialtyMatch = specialtyRow.match(/\s*Specjalność:(.+)/);
    if (specialtyMatch) {
      specialty = specialtyMatch[1].trim();
      j++;
    }

    let specialization;
    const specializationRow = this.rows[j];
    const specializationMatch = specializationRow.match(
      /\s*Specjalizacja:(.+)/
    );
    if (specializationMatch) {
      specialization = specializationMatch[1].trim();
      if (specialization === '') specialization = null;

      j++;
    }

    const student = <Student>{
      name: studentName,
      albumNum: albumNum,
      enrollDate: enrollDate,
      course: course,
      faculty: faculty,
      birthDate: birthDate,
      specialty: specialty,
      specialization: specialization,
    };

    const subjectNoGradesRe =
      /((\d+)\s(.+)\s([ćĆ][wW]|\w+)\s+([oOzZ-])\s+([tTnN])\s+([tTnN])\s+(\d+,\d+)\s*)[-wW]*\s*$/;
    const subjectGradesRe =
      /((\d+)\s(.+)\s([ćĆ][wW]|\w+)\s+([oOzZ-])\s+([tTnN])\s+([tTnN])\s+(\d+,\d+)\s+)\s*([wW])*\s*(((\d+,\d+\s+)|(X\s+)|(Z\s)){0,3})\s*((\d+,\d+)|([xXzZ]))/;
    const avgEctsRe =
      /Średnia ocen:\s+\d+,\d+\s+\/\s+\d+,\d+\s+=\s+(\d+,\d+|\?)\s+Razem\s+(\d+,\d+)/;

    const semesters: ISemester[] = [];
    let i;
    for (i = j; i < this.rows.length - 8; i++) {
      const row = this.rows[i];

      if (this.rows[i].match(/Legenda:/)) {
        break;
      }

      let rowMatch;
      if ((rowMatch = row.match(/Semestr: (\d{2})\s+w roku: (\d{4}\/\d{2})/))) {
        const semNum = Number.parseInt(rowMatch[1]);
        const semYear = rowMatch[2];
        i++;

        const semFinishRow = this.rows[i];
        let semFinishMatch, semFinishDate;
        if (
          (semFinishMatch = semFinishRow.match(
            /Semestr zaliczono dnia: (([0-2]\d|3[0-1])-(0\d|1[0-2])-(\d{4}))/
          ))
        ) {
          semFinishDate = new Date(
            `${semFinishMatch[4]}-${semFinishMatch[3]}-${semFinishMatch[2]}`
          );
        } else if (
          (semFinishMatch = semFinishRow.match(/Semestr zaliczono dnia: (.+)/))
        ) {
          semFinishDate = semFinishMatch[1].trim();
        }
        i++;

        const subjects: ISubject[] = [];
        while (
          (rowMatch = this.rows[i].match(subjectGradesRe)) ||
          (rowMatch = this.rows[i].match(subjectNoGradesRe))
        ) {
          const row = this.rows[i];

          const additionalTitleLines = [];
          while (
            !this.rows[i + 1].match(subjectGradesRe) &&
            !this.rows[i + 1].match(subjectNoGradesRe) &&
            !this.rows[i + 1].match(avgEctsRe)
          ) {
            additionalTitleLines.push(this.rows[i + 1].trim());
            i++;
          }

          const subject = ExcelReader.parseSubjectRow(
            rowMatch,
            row,
            additionalTitleLines
          );
          subjects.push(subject);
          i++;
        }

        const avgEctsMatch = this.rows[i].match(avgEctsRe);
        let avgGradeStr = avgEctsMatch[1];
        let avgGrade: number | string = avgGradeStr;
        if (avgGradeStr != '?')
          avgGrade = Number.parseFloat(avgGradeStr.replace(',', '.'));

        const totalEcts = Number.parseFloat(avgEctsMatch[2]);

        semesters.push(<ISemester>{
          num: semNum,
          year: semYear,
          finishDate: semFinishDate,
          subjects: subjects,
          avgGrade: avgGrade,
          totalECTS: totalEcts,
        });
      }
    }

    let subjectMatch;
    while (!(subjectMatch = this.rows[i].match(/Temat pracy:(.+)/))) {
      i++;
    }

    let subject = subjectMatch[1].trim();
    i++;

    let promoterMatch;
    while (!(promoterMatch = this.rows[i].match(/Promotor:(.+)/))) {
      subject = subject.concat(' ', this.rows[i].trim());
      i++;
    }
    const promoter = promoterMatch[1].trim();

    const subjectEngRow = this.rows[this.rows.length - 3];
    const subjectEng = subjectEngRow.trim();
    const reviewersRow = this.rows[this.rows.length - 1];
    const reviewers = reviewersRow.match(/Recenzenci:(.+)/)[1].trim();

    const thesis = <Thesis>{
      subject: subject,
      subjectEng: subjectEng,
      promoter: promoter,
      reviewers: reviewers,
    };

    return <IProgressRecord>{
      recordDate: recordDate,
      academicYear: academicYear,
      student: student,
      semesters: semesters,
      thesis: thesis,
    };
  }

  private getRows(): string[] {
    const split = this.sheet['!ref'].split(':');
    const first = split[0];
    const last = split[1];

    const letter = first[0];
    const firstI = Number.parseInt(first.slice(1));
    const lastI = Number.parseInt(last.slice(1));

    let rows = [];
    for (let i = firstI; i <= lastI; i += 1) {
      const index = letter + i;
      const data = this.sheet[index];

      if (
        data == undefined ||
        /rodz\s+form\s+do\s+eg/g.test(data.v) ||
        /lp\s+nazwa\s+przedmiotu\s+zaj.\s+zal/.test(data.v) ||
        !/[a-zA-Z]/g.test(data.v)
      ) {
        continue;
      }

      rows.push(data.v);
    }
    return rows;
  }

  private static parseSubjectRow(
    rowMatch: any,
    row: any,
    additionalTitleLines: string[]
  ): ISubject {
    const num = Number.parseInt(rowMatch[2]);
    let title = rowMatch[3].trim();
    for (let line of additionalTitleLines) {
      title = title.concat(' ', line);
    }
    const classType = rowMatch[4];
    const passType = rowMatch[5];
    const toAvg = rowMatch[6].toUpperCase() == 'T';
    const hasExam = rowMatch[7].toUpperCase() == 'T';
    const hours = Number.parseFloat(rowMatch[8]);
    let grades = [];
    let ects: number | string | null = null;

    let gradesMatch;
    const gradesPart = row.slice(rowMatch[1].length);
    if (gradesPart.match('s*-s*')) {
      ects = null;
    } else if ((gradesMatch = gradesPart.match(/((\d+,\d+)|([XxZz]))/gm))) {
      let j;
      for (j = 0; j < gradesMatch.length - 1; j++) {
        let grade: string = gradesMatch[j].trim();
        let gradeParsed: string | number = grade;

        if (!['z', 'Z', 'x', 'X'].includes(grade))
          gradeParsed = Number.parseFloat(grade.replace(',', '.'));

        grades.push(gradeParsed);
      }

      if (!['x', 'X'].includes(gradesMatch[j])) {
        ects = Number.parseFloat(gradesMatch[j]);
      } else {
        ects = gradesMatch[j];
      }
    }

    return <ISubject>{
      num: num,
      title: title,
      classType: classType,
      passType: passType,
      toAvg: toAvg,
      hasExam: hasExam,
      hours: hours,
      grades: grades,
      ECTS: ects,
    };
  }

}

export class AuxiliaryFunctions {
  public static formatGradeToCorrectFormat(grade: number): number {
    return parseFloat(parseFloat(grade.toString().slice(0, (grade.toString().indexOf('.') + 4))).toFixed(2));
  }
}
