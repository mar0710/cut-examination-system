import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Semester
{
	@PrimaryGeneratedColumn()
	id: number;
	@Column()
	num: number;
  @Column()
  year: string;
  @Column()
  finishDate: Date;
  @Column()
  subjects: string;
  @Column({nullable: true})
  avgGrade: number;
  @Column()
  totalECTS: string;
}