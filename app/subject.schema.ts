import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Subject
{
	@PrimaryGeneratedColumn('increment')
	id: number;
	@Column()
	num: number;
  @Column()
  title: string;
  @Column()
  classType: string;
  @Column()
  passType: string;
  @Column()
  toAvg: boolean;
  @Column()
  hasExam: boolean;
  @Column()
  hours: number;
  @Column({nullable: true})
  grades: string;
  @Column({nullable: true})
  ECTS: string;
}