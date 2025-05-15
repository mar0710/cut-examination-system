import { Student } from '../../app/student.schema';
import { Thesis } from '../../app/thesis.schema';

export interface ISubject {
  id: number;
  num: number;
  title: string;
  classType: string;
  passType: string;
  toAvg: boolean;
  hasExam: boolean;
  hours: number;
  grades: string[] | null;
  ECTS: number | string | null;
}

export interface IQuestion {
  id: number;
  field: string;
  degree: number;
  specialization: string;
  subject: string;
  question: string;
  answer: string;
}

export interface ISemester {
  id: number;
  num: number;
  year: string;
  finishDate: Date;
  subjects: ISubject[];
  avgGrade: number | null;
  totalECTS: number | string;
}

export interface IProgressRecord {
  id: number;
  recordDate: Date;
  academicYear: string;
  student: Student;
  semesters: ISemester[];
  thesis: Thesis;
}
