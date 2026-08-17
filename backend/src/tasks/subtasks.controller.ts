import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, UseGuards, Request, HttpCode, HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IsString, IsBoolean, IsOptional, MaxLength } from 'class-validator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Subtask } from './entities/subtask.entity';
import { Task } from './entities/task.entity';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

class CreateSubtaskDto {
  @IsString()
  @MaxLength(200)
  title: string;
}

class UpdateSubtaskDto {
  @IsString()
  @IsOptional()
  @MaxLength(200)
  title?: string;

  @IsBoolean()
  @IsOptional()
  isCompleted?: boolean;
}

@Controller('tasks/:taskId/subtasks')
@UseGuards(JwtAuthGuard)
export class SubtasksController {
  constructor(
    @InjectRepository(Subtask)
    private subtaskRepo: Repository<Subtask>,
    @InjectRepository(Task)
    private taskRepo: Repository<Task>,
  ) {}

  private async verifyTaskOwner(taskId: string, userId: string): Promise<Task> {
    const task = await this.taskRepo.findOne({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Task not found');
    if (task.userId !== userId) throw new ForbiddenException('Access denied');
    return task;
  }

  @Get()
  async findAll(@Param('taskId') taskId: string, @Request() req) {
    await this.verifyTaskOwner(taskId, req.user.id);
    return this.subtaskRepo.find({
      where: { taskId },
      order: { createdAt: 'ASC' },
    });
  }

  @Post()
  async create(
    @Param('taskId') taskId: string,
    @Body() dto: CreateSubtaskDto,
    @Request() req,
  ) {
    await this.verifyTaskOwner(taskId, req.user.id);
    const subtask = this.subtaskRepo.create({ title: dto.title, taskId });
    return this.subtaskRepo.save(subtask);
  }

  @Patch(':id')
  async update(
    @Param('taskId') taskId: string,
    @Param('id') id: string,
    @Body() dto: UpdateSubtaskDto,
    @Request() req,
  ) {
    await this.verifyTaskOwner(taskId, req.user.id);
    const subtask = await this.subtaskRepo.findOne({ where: { id, taskId } });
    if (!subtask) throw new NotFoundException('Subtask not found');
    Object.assign(subtask, dto);
    return this.subtaskRepo.save(subtask);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('taskId') taskId: string,
    @Param('id') id: string,
    @Request() req,
  ) {
    await this.verifyTaskOwner(taskId, req.user.id);
    const subtask = await this.subtaskRepo.findOne({ where: { id, taskId } });
    if (!subtask) throw new NotFoundException('Subtask not found');
    await this.subtaskRepo.remove(subtask);
  }
}
