import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';
import { NoteType } from '../entities/note.entity';

export class NoteDto {
  @IsNotEmpty({ message: 'userId is required' })
  @IsString({ message: 'userId must be a string' })
  userId: string;

  @IsNotEmpty({ message: 'notes is required' })
  notes: [NoteType];

  @IsNotEmpty({ message: 'isDirectory is required' })
  @IsBoolean({ message: 'isDirectory must be a boolean' })
  isDirectory: boolean;
}

export default NoteDto;
