import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your_secret_key', 
    });
  }

  async validate(payload: { sub: number; email: string }) {
    const user = await this.prisma.users.findUnique({
      where: { user_id: payload.sub },
    });
    if (!user) {
      // Có thể throw UnauthorizedException hoặc trả về null
      return null;
    }
    const { password_hash, ...result } = user; 
    return result;
  }
}