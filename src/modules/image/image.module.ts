import { Module } from '@nestjs/common';
import { AwsService } from './image-service/image-service.service';
import { AwsController } from './image-controller/image-controller.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Note } from '../note/entities/note.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Note])],
  providers: [AwsService],
  controllers: [AwsController],
})
export class ImageModule {}
