import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Note } from './modules/note/entities/note.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NoteModule } from './modules/note/note.module';
import { ImageModule } from './modules/image/image.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    NoteModule,
    ImageModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mongodb',
        url: configService.get('MONGO_URL'),
        entities: [Note],
        synchronize: true,
      }),
    }),
    MongooseModule.forRoot(
      `mongodb+srv://adriandiazmanzanares9:${process.env.MONGO_PASS}@mindgrind.ljuvwzf.mongodb.net/MindGrind`,
    ),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
