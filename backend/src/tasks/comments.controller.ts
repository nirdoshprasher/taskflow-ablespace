import {
  Controller, Get, Post, Delete,
  Param, Body, UseGuards, Request, HttpCode, HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IsString, MaxLength } from 'class-validator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Comment } from './entities/comment.entity';
import { Task } from './entities/task.entity';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

class CreateCommentDto {
  @IsString()
  @MaxLength(2000)
  content: string;
}

@Controller('tasks/:taskId/comments')
@UseGuards(JwtAuthGuard)
export class CommentsController {
  constructor(
    @InjectRepository(Comment) private commentRepo: Repository<Comment>,
    @InjectRepository(Task)    private taskRepo: Repository<Task>,
  ) {}

  private async verifyOwner(taskId: string, userId: string) {
    const task = await this.taskRepo.findOne({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Task not found');
    if (task.userId !== userId) throw new ForbiddenException('Access denied');
    return task;
  }

  @Get()
  async findAll(@Param('taskId') taskId: string, @Request() req) {
    await this.verifyOwner(taskId, req.user.id);
    return this.commentRepo.find({
      where: { taskId },
      order: { createdAt: 'DESC' },
    });
  }

  @Post()
  async create(
    @Param('taskId') taskId: string,
    @Body() dto: CreateCommentDto,
    @Request() req,
  ) {
    await this.verifyOwner(taskId, req.user.id);
    const comment = this.commentRepo.create({
      content: dto.content,
      taskId,
      authorName: req.user.name ?? 'User',
    });
    return this.commentRepo.save(comment);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('taskId') taskId: string,
    @Param('id') id: string,
    @Request() req,
  ) {
    await this.verifyOwner(taskId, req.user.id);
    const comment = await this.commentRepo.findOne({ where: { id, taskId } });
    if (!comment) throw new NotFoundException('Comment not found');
    await this.commentRepo.remove(comment);
  }
}
