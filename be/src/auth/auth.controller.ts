import { Controller, Post, Body, UseGuards, Get, Req, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './auth.guard';
import { Request } from 'express';
import * as authenticatedRequestInterface from 'src/common/interface/authenticated-request.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    console.log("Server đang chạy...");
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }


  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout() {
    return this.authService.logout();
  }


    @UseGuards(JwtAuthGuard)
    @Get('profile')
    getProfile(@Req() req: authenticatedRequestInterface.AuthenticatedRequest) {
      return req.user;
    }
  }