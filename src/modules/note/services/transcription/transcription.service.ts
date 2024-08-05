import { Injectable } from '@nestjs/common';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { YoutubeTranscript } from '../../../../utils/YT';
import { countTextWords } from '../../../../utils/utils';
import { Readable } from 'stream';
import { Model, now } from 'mongoose';
import { Note } from '../transcription/transcription.schema';
import { InjectModel } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';

@Injectable()
export class TranscriptionService {
  constructor(@InjectModel(Note.name) private _noteModel: Model<Note>) {}

  async fetchTranscript(videoId: string): Promise<string> {
    try {
      const transcript = await YoutubeTranscript.fetchTranscript(videoId);
      // const fullText = transcript.map((line) => line.text).join(' ');
      return transcript;
    } catch (error) {
      console.error('Error fetching transcript:', error);
      throw new Error('Error fetching transcript');
    }
  }

  async processPdf(pdfBuffer: Buffer): Promise<string> {
    try {
      const PdfReader = await import('pdfreader');
      const pdfReader = new PdfReader.PdfReader({});

      const pdfStream = new Readable();
      pdfStream.push(pdfBuffer.buffer);
      pdfStream.push(null);

      let text = '';

      return new Promise<string>((resolve, reject) => {
        pdfStream.on('data', (chunk: Buffer) => {
          pdfReader.parseBuffer(chunk, (err, item) => {
            if (err) {
              reject(err);
            } else if (!item) {
              if (text) {
                resolve(text);
              } else {
                reject(new Error('Empty PDF'));
              }
            } else if (item.text) {
              text += item.text;
            }
          });
        });
      });
    } catch (error) {
      console.error('Error reading Pdf', error);
      throw error;
    }
  }

  async getNotesFake(transcription: string): Promise<string> {
    return `# Resumen de la polera de la monarquía española

- **Introducción:**
  - Hoy en Memorias de Pezos vamos a hacer un breve repaso de la historia de la monarquía española.
  - Si quieren saber más, tenemos un vídeo en nuestro canal donde resumimos la historia de España desde el Paleolítico hasta el siglo XXI.
  - En el vídeo de hoy nos centraremos específicamente en la monarquía española, en los reyes y en sus sitios más destacables para bien y para mal.

- **Formación de España:**
  - El concepto de España es complejo y su formación no ocurrió de manera instantánea ni en un momento específico, sino que fue un proceso gradual y complicado a lo largo de varios siglos.
  - Utilizaremos como punto de partida el matrimonio de Isabel I de Castilla con Fernando II de Aragón, más conocidos como los Reyes Católicos.
  - Este enlace significó la unificación de los territorios de Castilla y Aragón, sentando las bases para la creación de la monarquía española en la Península Ibérica.
  - También estaban los reinos de Navarra, que se anexionó a Castilla en 1512, Portugal y el último bastión musulmán, el reino nazarí de Granada, que fue conquistado en 1492, marcando el fin de ocho siglos de reconquista.

- **Reinado de los Reyes Católicos:**
  - En el mismo año de la toma de Granada, en 1492, Cristóbal Colón descubrió América pensando que había hallado un nuevo camino hacia las Indias o Asia por el oeste.
  - Otros eventos importantes de su reinado incluyen la expulsión de los judíos y la implantación de...
`;
  }

  async getChatGptNotes(transcription: string): Promise<any> {
    try {
      const transcriptionLenght = countTextWords(transcription);

      if (transcriptionLenght > 1000) {
        transcription = transcription.slice(0, 1000);
        console.log('transcription', transcription.length);
      }

      const prompt = `As a [ABC Course Student], I'm preparing notes on the subject/topic [${transcription}]. I need you to act as an expert professor and provide me with comprehensive and well-structured notes.Here are the guidelines for the notes:\n\n1. Key Terms and Concepts: Include definitions of key terms and insights about main ideas. Use appropriate examples for a better understanding of the topic.\n\n2. Styling: Use H2 for the main headings and questions and H3 for all the sub-headings. You must include related emojis to make the notes engaging. Use bold and italic formatting for emphasis and clarity.\n\n3. Questions and Answers: Generate a list of potential questions and detailed answers that someone studying this subject might need to know.\n\n4. Structure: Summarize the information logically using bulleted or numbered points.\n\nCondition: Please ensure the notes cover the following topics: [ALL THE TOPICS]`;

      const { text } = await generateText({
        model: openai('gpt-4o-mini'),
        system: `As a [ABC Course Student], I'm preparing notes on the subject/topic [${transcription}]`,
        prompt: prompt,
      });

      
      return text;
    } catch (error) {
      console.error('Error fetching chat-gpt notes:', error);
      throw new Error('Error fetching chat-gpt notes');
    }
  }

  async saveNotes(chatGptNotes: string, user: string) {
    try {
      if (!user) {
        throw new Error('Invalid user data');
      }
      console.log('Saving note for user:', user);
      const userData = await this._noteModel.findOne({ userId: user });
      if (userData) {
        userData.notes.push({
          note: chatGptNotes,
          noteId: randomUUID(),
          createdAt: now(),
          updatedAt: now(),
          title: 'Untitled document',
          chat: [],
          category: 'General',
          previewUrl:
            'https://img-previews.s3.eu-north-1.amazonaws.com/screenshot.png1711999247059',
        });
        const data = await userData.save();
        return {
          noteId: userData.notes[userData.notes.length - 1].noteId,
          data,
        };
      } else {
        const noteRandomId = randomUUID();
        const newNote = new this._noteModel({
          userId: user,
          notes: [
            {
              note: chatGptNotes,
              noteId: noteRandomId,
              createdAt: now(),
              updatedAt: now(),
              title: 'Untitled document',
              chat: [],
              previewUrl:
                '	https://img-previews.s3.eu-north-1.amazonaws.com/screenshot.png1711999247059',
            },
          ],
          exams: [],
          isDirectory: false,
        });
        const data = await newNote.save();

        return { noteId: noteRandomId, data };
      }
    } catch (error) {
      console.error('Error saving note:', error);
      throw new Error('Error saving note');
    }
  }
}
