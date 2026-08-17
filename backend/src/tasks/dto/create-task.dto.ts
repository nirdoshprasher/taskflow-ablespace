import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  MaxLength,
  MinLength,
} from 'class-validator';
import { TaskPriority, TaskStatus } from '../entities/task.entity';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  @MinLength(1)
  @MaxLength(200, { message: 'Title must be at most 200 characters' })
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000, { message: 'Description must be at most 1000 characters' })
  description?: string;

  @IsEnum(TaskStatus, { message: 'Invalid status value' })
  @IsOptional()
  status?: TaskStatus;

  @IsEnum(TaskPriority, { message: 'Invalid priority value' })
  @IsOptional()
  priority?: TaskPriority;

  @IsString()
  @IsOptional()
  dueDate?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  category?: string;
}
