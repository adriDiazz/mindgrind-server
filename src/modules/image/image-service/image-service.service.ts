// src/aws/aws.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as AWS from 'aws-sdk';
import { Note } from 'src/modules/note/entities/note.entity';
import { Repository } from 'typeorm';
import * as puppeteer from 'puppeteer';
import { markdownToHtml } from 'src/utils/markdownToHtml';

@Injectable()
export class AwsService {
  private s3: AWS.S3;

  constructor(
    @InjectRepository(Note)
    private readonly noteRepository: Repository<Note>,
  ) {
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });
  }

  async uploadFile(file) {
    const params = {
      Bucket: 'img-previews',
      Key: file.originalname + Date.now(),
      Body: file.buffer,
    };

    return this.s3.upload(params).promise();
  }

  async saveImageRecord(
    file: AWS.S3.ManagedUpload.SendData,
    userId: string,
    noteId: string,
  ) {
    // save image record to database
    const note = await this.noteRepository.findOne({ where: { userId } });
    const noteIndex = note.notes.findIndex((note) => note.noteId === noteId);
    note.notes[noteIndex].previewUrl = file.Location;
    await this.noteRepository.update(note._id, note);
  }

  async markdownToPdf(markdown: string) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const markdownContent = await markdownToHtml(markdown); // Convierte tu Markdown a HTML

    const htmlContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
  body {
    font-family: 'Helvetica', 'Arial', sans-serif;
    font-size: 14px;
    line-height: 1.6;
    padding: 20px;
    color: #333;
    background-color: #fff;
  }

  h1, h2, h3, h4, h5, h6 {
    margin-top: 24px;
    margin-bottom: 16px;
    line-height: 1.2;
    color: #000;
  }

  h1 {
    font-size: 32px;
  }

  h2 {
    font-size: 24px;
  }

  h3 {
    font-size: 20px;
  }

  h4 {
    font-size: 16px;
  }

  h5 {
    font-size: 14px;
  }

  h6 {
    font-size: 12px;
  }

  p {
    margin-top: 0;
    margin-bottom: 16px;
  }

  a {
    color: #0275d8;
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }

  strong {
    font-weight: bold;
  }

  em {
    font-style: italic;
  }

  ul, ol {
    margin-top: 0;
    margin-bottom: 16px;
    padding-left: 20px;
  }

  li {
    margin-bottom: 8px;
  }

  table {
    border-collapse: collapse;
    margin-top: 0;
    margin-bottom: 16px;
    width: 100%;
    border: 1px solid #dee2e6;
  }

  th, td {
    padding: 8px;
    border: 1px solid #dee2e6;
    text-align: left;
  }

  th {
    background-color: #f8f9fa;
    font-weight: bold;
  }

  img {
    max-width: 100%;
    height: auto;
    margin-top: 16px;
    margin-bottom: 16px;
  }

  blockquote {
    margin: 20px 0;
    padding: 10px 20px;
    background-color: #f8f9fa;
    border-left: 4px solid #0275d8;
    color: #616161;
  }

  code {
    font-family: monospace;
    padding: 2px 4px;
    font-size: 90%;
    color: #fff;
  }

  pre {
    background-color: #000;
    padding: 16px;
    overflow: auto;
    line-height: 1.45;
    border-radius: 4px;
    border: 1px solid #dee2e6;
  }

  pre code {
    padding: 0;
    font-size: 100%;
  }
    </style>
  </head>
  <body>
    <!-- Inserta tu HTML convertido de Markdown aquí -->
    ${markdownContent}
  </body>
  </html>
  `;
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0',
    });

    const pdfBuffer = await page.pdf({ format: 'A4' });

    await browser.close();

    return pdfBuffer;
  }

  async takeScreenshotFromMarkdown(markdown: string) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const markdownContent = await markdownToHtml(markdown); // Convierte tu Markdown a HTML

    const htmlContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
  body {
    font-family: 'Helvetica', 'Arial', sans-serif;
    font-size: 14px;
    line-height: 1.6;
    padding: 20px;
    color: #333;
    background-color: #fff;
  }

  h1, h2, h3, h4, h5, h6 {
    margin-top: 24px;
    margin-bottom: 16px;
    line-height: 1.2;
    color: #000;
  }

  h1 {
    font-size: 32px;
  }

  h2 {
    font-size: 24px;
  }

  h3 {
    font-size: 20px;
  }

  h4 {
    font-size: 16px;
  }

  h5 {
    font-size: 14px;
  }

  h6 {
    font-size: 12px;
  }

  p {
    margin-top: 0;
    margin-bottom: 16px;
  }

  a {
    color: #0275d8;
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }

  strong {
    font-weight: bold;
  }

  em {
    font-style: italic;
  }

  ul, ol {
    margin-top: 0;
    margin-bottom: 16px;
    padding-left: 20px;
  }

  li {
    margin-bottom: 8px;
  }

  table {
    border-collapse: collapse;
    margin-top: 0;
    margin-bottom: 16px;
    width: 100%;
    border: 1px solid #dee2e6;
  }

  th, td {
    padding: 8px;
    border: 1px solid #dee2e6;
    text-align: left;
  }

  th {
    background-color: #f8f9fa;
    font-weight: bold;
  }

  img {
    max-width: 100%;
    height: auto;
    margin-top: 16px;
    margin-bottom: 16px;
  }

  blockquote {
    margin: 20px 0;
    padding: 10px 20px;
    background-color: #f8f9fa;
    border-left: 4px solid #0275d8;
    color: #616161;
  }

  code {
    font-family: monospace;
    padding: 2px 4px;
    font-size: 90%;
    color: #fff;
  }

  pre {
    background-color: #000;
    padding: 16px;
    overflow: auto;
    line-height: 1.45;
    border-radius: 4px;
    border: 1px solid #dee2e6;
  }

  pre code {
    padding: 0;
    font-size: 100%;
  }
    </style>
  </head>
  <body>
    <!-- Inserta tu HTML convertido de Markdown aquí -->
    ${markdownContent}
  </body>
  </html>
  `;
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0',
    });

    const screenshotBuffer = await page.screenshot({ fullPage: true });

    await browser.close();

    return screenshotBuffer;
  }
}
