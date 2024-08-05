import { Module } from '@nestjs/common';
import { NoteController } from './contorllers/note/note.controller';
import { TranscriptionController } from './contorllers/transcription/transcription.controller';
import { GptChatController } from './contorllers/chat/gpt-chat.controller';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Note } from './entities/note.entity';
import { NoteService } from './services/note/note.service';
import { TranscriptionService } from './services/transcription/transcription.service';
import { GptChatService } from './services/chat/gpt-chat.service';
import { NoteRepositoryService } from './repository/note-repository/note-repository.service';
import { NoteSchema } from './services/transcription/transcription.schema';
import { MongooseModule } from '@nestjs/mongoose';




@Module({
  imports: [TypeOrmModule.forFeature([Note]),  MongooseModule.forFeature([{ name: Note.name, schema: NoteSchema }])],
  controllers: [NoteController, GptChatController, TranscriptionController],
  providers: [NoteService, NoteRepositoryService, GptChatService, TranscriptionService],
})
export class NoteModule {}
