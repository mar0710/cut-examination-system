import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class ProgressRecord
{
	@PrimaryGeneratedColumn('increment')
	id: number;
	@Column()
	recordDate: Date;
  @Column()
  academicYear: string;
  @Column()
  student: number;
  @Column()
  semesters: string;
  @Column()
  thesis: number;
}