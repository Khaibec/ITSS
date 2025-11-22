import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { name, email, password, nationality } = registerDto;

    const existingUser = await this.prisma.users.findUnique({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const newUser = await this.prisma.users.create({
        data: {
          name,
          email,
          nationality,
          password_hash: hashedPassword,
        },
      });

      const { password_hash, ...result } = newUser;
      return result;
    } catch (error) {
      throw new BadRequestException('Error registering user');
    }
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.prisma.users.findUnique({ where: { email } });
    if (!user || !user.password_hash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { email: user.email, sub: user.user_id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  // Chức năng đăng xuất thực tế không cần logic phía server phức tạp
  // Mà chủ yếu là phía client xóa token. Tuy nhiên, nếu bạn muốn ghi lại
  // việc đăng xuất hoặc invalidate token (phức tạp hơn), bạn có thể thêm logic ở đây.
  async logout() {
    return { message: 'Logged out successfully (client should clear token)' };
  }
}