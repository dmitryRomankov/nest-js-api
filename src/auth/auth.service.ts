import { ForbiddenException, Injectable } from '@nestjs/common';
import { User, Bookmars } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import * as argon2 from 'argon2';

import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';

@Injectable({})
export class AuthService {
  constructor(private prisma: PrismaService) {}
  async signin(dto: AuthDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!user) throw new ForbiddenException('Incorrect credentials');

    const pwMatches = argon2.verify(user.hash, dto.password);

    if (!pwMatches) throw new ForbiddenException('Incorrect credentials');

    delete user.hash;
    return user;
  }

  async signup(dto: AuthDto) {
    const hash = await argon2.hash(dto.password);

    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash,
        },
        select: {
          id: true,
          email: true,
          createdAt: true,
        },
      });

      return user;
    } catch (error) {
      const isUniqueFieldValidationError =
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002';
      if (isUniqueFieldValidationError) {
        throw new ForbiddenException('Credentials taken');
      } else {
        throw error;
      }
    }
  }
}
