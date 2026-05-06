import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoggerService } from '../common/logger/pino-logger.service';
import { RegisterDto, LoginDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly logger: LoggerService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      this.logger.info('Registration attempt with existing email', {
        email: dto.email,
        endpoint: '/auth/register',
      });
      throw new ConflictException('Email already in use');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: { email: dto.email, password: passwordHash, name: dto.name },
      select: { id: true, email: true, name: true, createdAt: true },
    });

    this.logger.securityEvent({
      type: 'AUTH_SUCCESS',
      userId: user.id,
      username: user.email,
      endpoint: '/auth/register',
      details: { action: 'user_registration' },
    });

    const token = this.signToken(user.id, user.email);
    return { user, token };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) {
      this.logger.securityEvent({
        type: 'AUTH_FAILED',
        username: dto.email,
        endpoint: '/auth/login',
        details: { reason: 'user_not_found' },
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) {
      this.logger.securityEvent({
        type: 'AUTH_FAILED',
        username: dto.email,
        userId: user.id,
        endpoint: '/auth/login',
        details: { reason: 'invalid_password' },
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    this.logger.securityEvent({
      type: 'AUTH_SUCCESS',
      userId: user.id,
      username: user.email,
      endpoint: '/auth/login',
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...safeUser } = user;
    const token = this.signToken(user.id, user.email);
    return { user: safeUser, token };
  }

  private signToken(userId: string, email: string): string {
    return this.jwtService.sign({ sub: userId, email }, { expiresIn: '15m' });
  }
}
