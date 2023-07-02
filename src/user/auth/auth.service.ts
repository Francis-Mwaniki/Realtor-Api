import { ConflictException, HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignUpParams } from 'src/Utils.interfaces';
import * as bcrypt from 'bcryptjs';
import { UserType } from '@prisma/client';
import * as jwt from 'jsonwebtoken';
import { SignInDto } from 'src/dtos/auth.dto';

@Injectable()
export class AuthService {
  constructor(private readonly prismaService: PrismaService) {}
  async signup(
    { name, phone, email, password }: SignUpParams,
    userType: UserType,
  ) {
    // does user exist?
    const user = await this.prismaService.user.findUnique({
      where: { email },
    });
    if (user) {
      throw new ConflictException('User already exists');
    }
    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    const newUser = await this.prismaService.user.create({
      data: {
        name,
        phone,
        email,
        password: hashedPassword,
        user_type: userType,
      } as any,
    });
    const token = this.generateToken(newUser.name, newUser.id);
    // return user
    return { user: newUser, token };
  }
  async signin({ email, password }: SignInDto) {
    // does user exist?
    const user = await this.prismaService.user.findUnique({
      where: { email },
    });
    if (!user) {
      throw new HttpException('Invalid credentials', 400);
    }
    // check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new HttpException('Invalid credentials', 400);
    }
    const token = this.generateToken(user.name, user.id);
    // return user
    return { user, token };
  }

  private generateToken(name: string, id: number | string) {
    return jwt.sign({ name, id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });
  }

  async generateProductKey(email: string, userType: UserType) {
    const string = `${email}-${userType}-${process.env.PRODUCT_KEY_SECRET}`;

    return bcrypt.hash(string, 10);
  }
}
