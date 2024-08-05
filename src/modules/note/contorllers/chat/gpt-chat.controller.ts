import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { GptChatService } from '../../services/chat/gpt-chat.service';
import { Exam, NoteType } from '../../entities/gpt-chat.entity';
import { Console } from 'console';
import { randomUUID } from 'crypto';
import { title } from 'process';

@Controller({ path: 'chats', version: '1' })
export class GptChatController {
  constructor(private readonly gptChatService: GptChatService) {}

  @Post()
  async replyMessage(
    @Body()
    {
      message,
      userId,
      noteId,
    }: {
      message: {
        message: string;
        isSent: boolean;
      };
      userId: string;
      noteId: string;
    },
  ) {
    try {
      if (message.message.length > 1000) {
        throw new Error('Message exceeds maximum length of 1000 characters');
      }

      const saved = await this.gptChatService.saveChatGptChat(
        message,
        noteId,
        userId,
      );
      const response = await this.gptChatService.getChatGptResponse(
        message.message,
      );
      const generatedMessage = {
        message: response,
        isSent: false,
      };
      const saveResponse = await this.gptChatService.saveChatGptChat(
        generatedMessage,
        noteId,
        userId,
      );

      if (saveResponse && saved) {
        return {
          chat: {
            message: generatedMessage.message,
            isSent: false,
          },
        };
      }
    } catch (error) {
      return {
        error: error.message,
      };
    }
  }

  @Get('/exams/:userId')
  async getExams(@Param('userId') userId: string) {
    const exams = await this.gptChatService.getExamsByUserId(userId);
    if (!exams || exams.length === 0) {
      return {
        exams: [],
      };
    }
    return {
      exams,
    };
  }

  @Get('/:userId/:noteId')
  async getChat(
    @Param('userId') userId: string,
    @Param('noteId') noteId: string,
  ) {
    const chat = await this.gptChatService.getChatGptChat(noteId, userId);
    if (!chat || chat.length === 0) {
      return {
        chat: [],
      };
    }
    return {
      chat,
    };
  }

  @Post('/exams/:userId')
  async createExam(
    @Param('userId') userId: string,
    @Body()
    note: {
      noteId: string;
      note: string;
    },
  ) {
    try {
      const getNote = await this.gptChatService.getNoteById(
        userId,
        note.noteId,
      );
      const content = await this.gptChatService.createExamWithChatGpt(
        note.note,
        userId,
      );
      console.log('content', content);
      const exam = {
        exam: {
          role: 'assistant',
          content: content,
          score: 0,
          noteId: note.noteId,
          examId: randomUUID(),
          title: getNote.title,
        },
      };

      const saved = await this.gptChatService.saveExam(
        userId,
        exam,
        note.noteId,
      );

      return {
        exam,
      };
    } catch (error) {
      return {
        error: error.message,
      };
    }
  }

  @Post('/exams/update/:userId')
  async updateExamPost(
    @Param('userId') userId: string,
    @Body()
    exam: Exam,
  ) {
    try {
      console.log('exam', exam);
      const updated = await this.gptChatService.updateExam(userId, exam);
      return {
        updated,
      };
    } catch (error) {
      return {
        error: error.message,
      };
    }
  }
}
