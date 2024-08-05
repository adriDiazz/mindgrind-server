import { UpdateResult } from 'typeorm';
import { Note, NoteType } from '../note/entities/note.entity';

export interface IBaseRepository<T> {
  getNotes(userId: string): Promise<T>;
  getNoteById(userId: string, noteId: string): Promise<NoteType>;
  updateNote(note: Note): Promise<UpdateResult>;
}
