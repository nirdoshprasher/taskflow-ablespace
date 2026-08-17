import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/entities/user.entity';

// Simple password hashing using Node's built-in crypto (no native deps needed)
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + 'salt_ablespace').digest('hex');
}

function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  private generateToken(user: User): string {
    return this.jwtService.sign({
      sub: user.id,
      email: user.email,
      isGuest: user.isGuest,
    });
  }

  private sanitizeUser(user: User) {
    const { password, ...rest } = user as any;
    return rest;
  }

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const user = await this.usersService.create({
      name: dto.name,
      email: dto.email,
      password: hashPassword(dto.password),
      isGuest: false,
    });

    return {
      token: this.generateToken(user),
      user: this.sanitizeUser(user),
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!verifyPassword(dto.password, user.password)) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      token: this.generateToken(user),
      user: this.sanitizeUser(user),
    };
  }

  async guestLogin() {
    const user = await this.usersService.createGuest();
    return {
      token: this.generateToken(user),
      user: this.sanitizeUser(user),
    };
  }

  async getProfile(userId: string) {
    const user = await this.usersService.findById(userId);
    return this.sanitizeUser(user);
  }
}
