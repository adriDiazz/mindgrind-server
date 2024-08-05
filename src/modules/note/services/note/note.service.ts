import { Injectable } from '@nestjs/common';
import { NoteRepositoryService } from '../../repository/note-repository/note-repository.service';
import { INoteRepository } from 'src/modules/IServices/note.interface';
import { NoteType } from '../../entities/note.entity';
import { UpdateNoteDto } from '../../dto/updateNoteDto';

@Injectable()
export class NoteService implements INoteRepository {
  constructor(private readonly noteRepository: NoteRepositoryService) {}

  getNotes(userId: string) {
    return this.noteRepository.getNotes(userId);
  }

  getNoteById(userId: string, noteId: string) {
    return this.noteRepository.getNoteById(userId, noteId);
  }

  async getLastModifiedNotes(userId: string): Promise<NoteType[]> {
    let userNotes = (await this.noteRepository.getNotes(userId))?.notes;

    if (!userNotes) {
      userNotes = [];
    }

    if (userNotes.length === 0 || !userNotes) {
      return null;
    }

    const lastModifiedNote = userNotes.sort((a, b) => {
      return <any>new Date(b.updatedAt) - <any>new Date(a.updatedAt);
    });

    return lastModifiedNote;
  }

  async updateNote(note: UpdateNoteDto) {
    try {
      const userData = await this.noteRepository.getNotes(note.userId);
      const noteToUpdateIndex = userData.notes.findIndex((userNote) => {
        return userNote.noteId === note.note.note.noteId;
      });

      if (noteToUpdateIndex === -1 || !userData) {
        return null;
      }

      userData.notes[noteToUpdateIndex] = note.note.note;

      return this.noteRepository.updateNote(userData);
    } catch (error) {
      // Handle the error here
      console.error(error);
      throw error;
    }
  }

  async deleteNote(userId: string, noteId: string) {
    try {
      const userData = await this.noteRepository.getNotes(userId);
      const noteToDeleteIndex = userData.notes.findIndex((userNote) => {
        return userNote.noteId === noteId;
      });

      if (noteToDeleteIndex === -1 || !userData) {
        return null;
      }

      userData.notes.splice(noteToDeleteIndex, 1);

      return this.noteRepository.updateNote(userData);
    } catch (error) {
      // Handle the error here
      console.error(error);
      throw error;
    }
  }
}
