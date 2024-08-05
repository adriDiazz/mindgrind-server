import { NoteType } from '../entities/note.entity';

export interface UpdateNoteDto {
  note: {
    note: NoteType;
  };
  userId: string;
}

export const createUpdateNoteDto = (
  note: NoteType,
  userId: string,
): UpdateNoteDto => {
  return {
    note: {
      note,
    },
    userId,
  };
};
