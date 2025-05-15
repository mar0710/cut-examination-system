import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Student
{
	@PrimaryGeneratedColumn('increment')
	id: number;
	@Column()
	name: string;
    @Column()
    albumNum: number;
    @Column()
    birthDate: Date;
    @Column()
    enrollDate: Date;
    @Column()
    faculty: string;
    @Column()
    course: string;
    @Column({nullable: true})
    specialty: string;
    @Column({nullable: true})
    specialization: string;
}