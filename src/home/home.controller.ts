import {
  Controller,
  Get,
  Param,
  Post,
  Put,
  Delete,
  Query,
  ParseIntPipe,
  Body,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { HomeService } from './home.service';
import {
  CreateHomeDto,
  HomeResponseDto,
  InquireDto,
  UpdateHomeDto,
} from './dto/home.dto';
import { ApiTags, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { PropertyType, UserType } from '@prisma/client';
import { User } from 'src/user/decorator/user.decorator';
import { whichUser } from 'src/Utils.interfaces';
import { AuthGuard } from 'src/guards.auth';
import { Roles } from 'src/decorators/roles.decorators';

@ApiTags('home')
@Controller('home')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @ApiOkResponse({ type: HomeResponseDto, isArray: true })
  @Get()
  async getHomes(
    @Query('city') city?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('minPrice') minPrice?: string,
    @Query('propertyType') propertyType?: PropertyType,
  ): Promise<HomeResponseDto[]> {
    const price =
      maxPrice || minPrice
        ? {
            ...(maxPrice && { lte: parseInt(maxPrice) }),
            ...(minPrice && { gte: parseInt(minPrice) }),
          }
        : undefined;
    const filters = {
      ...(city && { city }),
      ...(price && { price }),
      ...(propertyType && { propertyType }),
    };
    return this.homeService.getHomes(filters);
  }

  @ApiOkResponse({ type: HomeResponseDto })
  @Get(':id')
  getHome(@Param('id', ParseIntPipe) id: number) {
    return this.homeService.getHome(id);
  }

  @ApiCreatedResponse({ type: HomeResponseDto })
  @Roles(UserType.REALTOR)
  @Post()
  createHome(@Body() body: CreateHomeDto, @User() user: whichUser) {
    return this.homeService.createHome(body, user.id); //FIXME: get realtor id from auth
  }

  @ApiOkResponse({ type: HomeResponseDto })
  @Roles(UserType.REALTOR)
  @Put(':id')
  async updateHome(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateHomeDto,
    @User() user: whichUser,
  ) {
    const realtor = await this.homeService.getRealtorByHomeId(id);
    if (realtor.id !== user.id) {
      throw new UnauthorizedException(
        'You are not authorized to update this home',
      );
    }

    return this.homeService.updateHome(id, body); //FIXME: get realtor id from auth
  }

  @ApiOkResponse({ type: HomeResponseDto })
  @Roles(UserType.REALTOR)
  @Delete(':id')
  async deleteHome(@Param('id') id: number, @User() user: whichUser) {
    console.log('userId', user);
    const realtor = await this.homeService.getRealtorByHomeId(id);
    if (realtor.id !== user.id) {
      throw new UnauthorizedException(
        'You are not authorized to delete this home',
      );
    }
    return this.homeService.deleteHome(id); //FIXME: get realtor id from auth
  }

  @ApiOkResponse()
  @Roles(UserType.BUYER)
  @Post('/:id/inquire')
  inquire(
    @Param('id', ParseIntPipe) homeId: number,
    @User() user: whichUser,
    @Body() { message }: InquireDto,
  ) {
    return this.homeService.inquire(user, homeId, message);
  }

  @ApiOkResponse()
  @Roles(UserType.REALTOR)
  @Get('/:id/messages')
  async getHomeMessages(
    @Param('id', ParseIntPipe) id: number,
    @User() user: whichUser,
  ) {
    const realtor = await this.homeService.getRealtorByHomeId(id);

    if (realtor.id !== user.id) {
      throw new UnauthorizedException();
    }

    return this.homeService.getMessagesByHome(id);
  }
}
