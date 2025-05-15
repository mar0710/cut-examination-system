import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Thesis
{
	@PrimaryGeneratedColumn('increment')
	id: number;
	@Column()
	subject: string;
  @Column()
  subjectEng: string;
  @Column()
  promoter: string;
  @Column()
  reviewers: string;
}