import { Injectable } from '@nestjs/common';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { countTextWords } from 'src/utils/utils';
import { Exam, Note } from '../../entities/gpt-chat.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class GptChatService {
  constructor(
    @InjectRepository(Note)
    private readonly chatRepository: Repository<Note>,
  ) {}

  async getChatGptResponse(transcription: string): Promise<any> {
    try {
      const transcriptionLenght = countTextWords(transcription);

      if (transcriptionLenght > 1000) {
        transcription = transcription.slice(0, 1000);
      }
      
      const { text } = await generateText({
        model: openai('gpt-4o-mini'),
        system: `Act like a chat, you are helping a student with a question. The student is asking for help with the following question: "${transcription}"`,
        prompt: transcription,
      });
      return text;
    } catch (error) {
      console.error('Error fetching chat-gpt notes:', error);
      throw new Error('Error fetching chat-gpt notes');
    }
  }

  async saveChatGptChat(
    message: {
      message: string;
      isSent: boolean;
    },
    noteId: string,
    userId: string,
  ) {
    try {
      const toPush = {
        message: message.message,
        isSent: message.isSent,
      };
      const note = await this.chatRepository.findOne({
        where: { userId },
      });

      if (!note) {
        throw new Error('Note not found');
      }

      const noteIndex = note.notes.findIndex((n) => n.noteId === noteId);

      if (noteIndex === -1) {
        throw new Error('Note not found');
      }

      if (!note.notes[noteIndex].chat) {
        note.notes[noteIndex].chat = [];
      }

      note.notes[noteIndex].chat.push(toPush);

      return await this.chatRepository.update(note._id, note);
    } catch (error) {
      console.error('Error saving chat:', error);
      throw new Error('Error saving chat');
    }
  }

  async getChatGptChat(noteId: string, userId: string) {
    try {
      const note = await this.chatRepository.findOne({
        where: { userId },
      });

      if (!note) {
        throw new Error('Note not found');
      }

      const noteIndex = note.notes.findIndex((n) => n.noteId === noteId);

      if (noteIndex === -1) {
        throw new Error('Note not found');
      }

      return note.notes[noteIndex].chat;
    } catch (error) {
      console.error('Error fetching chat:', error);
      throw new Error('Error fetching chat');
    }
  }

  async createExamWithChatGpt(note: string, userId: string) {
    try {
      const noteLenght = countTextWords(note);

      if (noteLenght > 1000) {
        note = note.slice(0, 1000);
      }
      // Construct the prompt with more specific instructions and structured JSON
      const prompt = `
        Create an exam with 10 new questions based on the topic/class notes: "${note}". Each question should have four options and one correct answer. Format the response as a JSON object with an array of questions:
        {
          "questions": [
            {
              "question": "What is a key concept in ${note}?",
              "options": ["Option A", "Option B", "Option C", "Option D"],
              "answer": "Option A"
            }
          ]
        }
        Please complete the array with nine more questions similarly structured.
      `;

      const { text } = await generateText({
        model: openai('gpt-4o'),
        system: `
          You are a teacher preparing an exam for students based on the topic/class notes: "${note}". Create an exam with 10 new questions based on the topic/class notes: "${note}". Each question should have four options and one correct answer. Format the response as a JSON object with an array of questions:
        {
          "questions": [
            {
              "question": "What is a key concept in ${note}?",
              "options": ["Option A", "Option B", "Option C", "Option D"],
              "answer": "Option A"
            }
          ]
        }
        Please complete the array with nine more questions similarly structured.`,
        prompt: prompt,
      });

      

      if (text.startsWith('```json')) {
        return text
          .replace('```json', '')
          .replace('```', '');
      } else {
        return text;
      }
    } catch (error) {
      // Improved error handling with specific error message
      console.error('Error fetching exam questions:', error);
      throw new Error('Failed to create exam questions');
    }
  }

  async saveExam(userId: string, exam: any, noteId: string) {
    console.log('exam', noteId);
    try {
      const note = await this.chatRepository.findOne({
        where: { userId },
      });

      if (!note) {
        throw new Error('Note not found');
      }

      const newExam = { ...exam };

      note.exams.push(newExam);

      return await this.chatRepository.update(note._id, note);
    } catch (error) {
      console.error('Error saving exam:', error);
      throw new Error('Error saving exam');
    }
  }

  async getExamsByUserId(userId: string) {
    try {
      const note = await this.chatRepository.findOne({
        where: { userId },
      });

      if (!note) {
        throw new Error('Note not found');
      }

      return note.exams;
    } catch (error) {
      console.error('Error fetching exam:', error);
      throw new Error('Error fetching exam');
    }
  }

  async getNoteById(userId: string, noteId: string) {
    try {
      const note = await this.chatRepository.findOne({
        where: { userId },
      });

      if (!note) {
        throw new Error('Note not found');
      }

      const noteIndex = note.notes.findIndex((n) => n.noteId === noteId);

      if (noteIndex === -1) {
        throw new Error('Note not found');
      }

      return note.notes[noteIndex];
    } catch (error) {
      console.error('Error fetching note:', error);
      throw new Error('Error fetching note');
    }
  }

  async updateExam(userId: string, exam: Exam) {
    try {
      const note = await this.chatRepository.findOne({
        where: { userId },
      });

      if (!note) {
        throw new Error('Note not found');
      }

      const examIndex = note.exams.findIndex(
        (e) => e.exam.examId === exam.exam.examId,
      );

      if (examIndex === -1) {
        throw new Error('Exam not found');
      }

      note.exams[examIndex] = exam;

      return await this.chatRepository.update(note._id, note);
    } catch (error) {
      console.error('Error updating exam:', error);
      throw new Error('Error updating exam');
    }
  }
}
