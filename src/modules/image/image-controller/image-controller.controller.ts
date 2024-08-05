import {
  Body,
  Controller,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { File } from 'buffer';
import { AwsService } from '../image-service/image-service.service';
import { Response } from 'express';

@Controller({ version: '1', path: 's3' })
export class AwsController {
  constructor(private readonly awsService: AwsService) {}

  @Post('upload/:userId/:noteId')
  @UseInterceptors(FileInterceptor('image'))
  async uploadFile(
    @UploadedFile() file: File,
    @Param('userId') userId: string,
    @Param('noteId') noteId: string,
  ) {
    const saved = await this.awsService.uploadFile(file);
    if (saved) {
      return this.awsService.saveImageRecord(saved, userId, noteId);
    }
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(@UploadedFile() file: File) {
    return this.awsService.uploadFile(file);
  }

  @Post()
  async generatePdf(@Body('markdown') markdown: string, @Res() res: Response) {
    const pdfBuffer = await this.awsService.markdownToPdf(markdown);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=download.pdf');
    res.send(pdfBuffer);
  }

  @Post('preview')
  async generatePreview(
    @Body('markdown') markdown: string,
    @Res() res: Response,
  ) {
    const screenshot =
      await this.awsService.takeScreenshotFromMarkdown(markdown);

    res.setHeader('Content-Type', 'image/png');
    res.send(screenshot);
  }
}
