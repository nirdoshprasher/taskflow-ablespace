import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskStatus } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly tasksRepository: Repository<Task>,
  ) {}

  async findAllByUser(
    userId: string,
    filters?: {
      status?: TaskStatus;
      priority?: string;
      category?: string;
      search?: string;
    },
  ): Promise<Task[]> {
    const query = this.tasksRepository
      .createQueryBuilder('task')
      .where('task.userId = :userId', { userId })
      .orderBy('task.createdAt', 'DESC');

    if (filters?.status) {
      query.andWhere('task.status = :status', { status: filters.status });
    }
    if (filters?.priority) {
      query.andWhere('task.priority = :priority', {
        priority: filters.priority,
      });
    }
    if (filters?.category) {
      query.andWhere('task.category = :category', {
        category: filters.category,
      });
    }
    if (filters?.search) {
      query.andWhere(
        '(LOWER(task.title) LIKE :search OR LOWER(task.description) LIKE :search)',
        { search: `%${filters.search.toLowerCase()}%` },
      );
    }

    return query.getMany();
  }

  async findOne(id: string, userId: string): Promise<Task> {
    const task = await this.tasksRepository.findOne({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');
    if (task.userId !== userId)
      throw new ForbiddenException('Access denied to this task');
    return task;
  }

  async create(userId: string, dto: CreateTaskDto): Promise<Task> {
    const task = this.tasksRepository.create({ ...dto, userId });
    return this.tasksRepository.save(task);
  }

  async update(id: string, userId: string, dto: UpdateTaskDto): Promise<Task> {
    const task = await this.findOne(id, userId);
    Object.assign(task, dto);
    // Sync isCompleted with status
    if (dto.status === TaskStatus.COMPLETED) {
      task.isCompleted = true;
    } else if (dto.status) {
      task.isCompleted = false;
    }
    if (dto.isCompleted === true) {
      task.status = TaskStatus.COMPLETED;
    } else if (dto.isCompleted === false && task.status === TaskStatus.COMPLETED) {
      task.status = TaskStatus.TODO;
    }
    return this.tasksRepository.save(task);
  }

  async remove(id: string, userId: string): Promise<void> {
    const task = await this.findOne(id, userId);
    await this.tasksRepository.remove(task);
  }

  async getStats(userId: string) {
    const tasks = await this.tasksRepository.find({ where: { userId } });
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === TaskStatus.COMPLETED).length;
    const inProgress = tasks.filter(
      (t) => t.status === 'in_progress' as TaskStatus,
    ).length;
    const todo = tasks.filter((t) => t.status === TaskStatus.TODO).length;
    const overdue = tasks.filter((t) => {
      if (!t.dueDate || t.status === TaskStatus.COMPLETED) return false;
      return new Date(t.dueDate) < new Date();
    }).length;

    return { total, completed, inProgress, todo, overdue };
  }
}
