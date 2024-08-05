import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { NoteService } from '../../services/note/note.service';
import { NoteType } from '../../entities/note.entity';
import { createUpdateNoteDto } from '../../dto/updateNoteDto';

@Controller({ version: '1', path: 'note' })
export class NoteController {
  constructor(private readonly noteService: NoteService) {}

  @Get(':userId')
  async getNotes(@Param('userId') userId: string) {
    const data = await this.noteService.getNotes(userId);

    if (data) {
      return data;
    }

    return [];
  }

  @Get('last/:userId')
  getLastModifiedNotes(@Param('userId') userId: string) {
    return this.noteService.getLastModifiedNotes(userId);
  }

  @Post(':userId')
  getNoteById(@Param('userId') userId: string, @Body('note') note: NoteType) {
    const dto = createUpdateNoteDto(note, userId);
    return this.noteService.updateNote(dto);
  }

  @Delete()
  deleteNote(@Query('userId') userId: string, @Query('noteId') noteId: string) {
    return this.noteService.deleteNote(userId, noteId);
  }
}
