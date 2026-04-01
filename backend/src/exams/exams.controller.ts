import { Controller, Post, Get, Put, Delete, Body, Param, UseInterceptors, UploadedFile, UseGuards, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ExamsService } from './exams.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { CreateExamDto, UpdateExamDto } from './dto/exam.dto';

export const storage = diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    cb(null, filename);
  }
});

@Controller('exams')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  @Roles('ADMIN', 'LECTURER')
  @Post()
  create(@Body() createExamDto: CreateExamDto, @CurrentUser() user: any) {
    return this.examsService.create(createExamDto, user.id);
  }

  @Get()
  findAll() {
    return this.examsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.examsService.findOne(id);
  }

  @Roles('ADMIN', 'LECTURER')
  @Put(':id')
  update(
    @Param('id') id: string, 
    @Body() updateExamDto: UpdateExamDto,
    @CurrentUser() user: any
  ) {
    return this.examsService.update(id, updateExamDto, user.id, user.role);
  }

  @Roles('ADMIN', 'LECTURER')
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.examsService.remove(id, user.id, user.role);
  }

  @Roles('ADMIN', 'LECTURER')
  @Post(':examId/upload-students')
  @UseInterceptors(FileInterceptor('file', { storage }))
  async uploadStudents(
    @Param('examId') examId: string, 
    @UploadedFile() file: Express.Multer.File
  ) {
    if (!file) throw new BadRequestException('No Excel file uploaded');

    await this.examsService.queueStudentsUpload(examId, file.path);
    
    return {
      message: 'Upload successful, background processing started.',
      file: file.originalname,
      status: 'pending'
    };
  }
}
