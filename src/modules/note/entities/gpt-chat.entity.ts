import { Entity, Column, PrimaryGeneratedColumn, ObjectId } from 'typeorm';

@Entity({ name: 'notes' })
export class Note {
  @PrimaryGeneratedColumn()
  _id: ObjectId;

  @Column()
  id: number;

  @Column()
  userId: string;

  @Column('jsonb', { nullable: true })
  notes: NoteType[];

  @Column('simple-array', { nullable: true })
  exams: Exam[];

  @Column()
  isDirectory: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: null, nullable: true })
  updatedAt: Date;
}

export interface NoteType {
  note: string;
  noteId: string;
  createdAt: Date;
  updatedAt: Date;
  title: string;
  category: string;
  previewUrl: string;
  chat: Chat[];
}

export interface Chat {
  message: string;
  isSent: boolean;
}

export interface Exam {
  exam: {
    role: string;
    content: {
      questions: Question[];
    };
    score: number;
    noteId: string;
    examId: string;
    title: string;
  };
}

interface Question {
  question: string;
  options: string[];
  answer: string;
}
