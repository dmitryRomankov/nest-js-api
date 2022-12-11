import { Body, Controller, Post } from '@nestjs/common/decorators';

import { AuthDto } from './dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signin')
  signin(@Body() dto: AuthDto) {
    return this.authService.signin(dto);
  }

  @Post('signup')
  async signup(@Body() dto: AuthDto) {
    return this.authService.signup(dto);
  }
}
