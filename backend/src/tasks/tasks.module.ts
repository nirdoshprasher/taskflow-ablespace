import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { Subtask } from './entities/subtask.entity';
import { Comment } from './entities/comment.entity';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { SubtasksController } from './subtasks.controller';
import { CommentsController } from './comments.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Task, Subtask, Comment])],
  providers: [TasksService],
  controllers: [TasksController, SubtasksController, CommentsController],
  exports: [TasksService],
})
export class TasksModule {}
