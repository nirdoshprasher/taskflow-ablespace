import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { TasksModule } from './tasks/tasks.module';
import { UsersModule } from './users/users.module';
import { User } from './users/entities/user.entity';
import { Task } from './tasks/entities/task.entity';
import { Subtask } from './tasks/entities/subtask.entity';
import { Comment } from './tasks/entities/comment.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const dbHost = config.get<string>('DB_HOST') ?? '';
        const usePostgres = dbHost.includes('supabase') || dbHost.includes('pooler');

        if (usePostgres) {
          return {
            type: 'postgres',
            host:     dbHost,
            port:     parseInt(config.get<string>('DB_PORT') ?? '5432'),
            username: config.get<string>('DB_USERNAME'),
            password: config.get<string>('DB_PASSWORD'),
            database: config.get<string>('DB_NAME') ?? 'postgres',
            ssl: { rejectUnauthorized: false },
            entities: [User, Task, Subtask, Comment],
            synchronize: true,
            logging: false,
          } as any;
        }

        // SQLite fallback
        return {
          type: 'sqljs',
          location: 'taskdb.sqlite',
          autoSave: true,
          entities: [User, Task, Subtask, Comment],
          synchronize: true,
          logging: false,
        } as any;
      },
    }),

    AuthModule,
    UsersModule,
    TasksModule,
  ],
})
export class AppModule {}
