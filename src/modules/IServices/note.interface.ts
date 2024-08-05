import { UpdateNoteDto } from '../note/dto/updateNoteDto';
import { Note, NoteType } from '../note/entities/note.entity';

export interface INoteRepository {
  getNotes(userId: string): Promise<Note>;
  getNoteById(userId: string, noteId: string): Promise<NoteType>;
  getLastModifiedNotes(userId: string): Promise<NoteType[]>;
  updateNote(note: UpdateNoteDto);
  deleteNote(userId: string, noteId: string);
}
