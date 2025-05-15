import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Question
{
@PrimaryGeneratedColumn()
id: number;
@Column()
field: string;
@Column()
degree: number;
@Column()
specialization: string;
@Column()
subject: string;
@Column()
question: string;
@Column()
answer: string;
}