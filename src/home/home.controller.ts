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
} from '@nestjs/common';
import { HomeService } from './home.service';
import { CreateHomeDto, HomeResponseDto, UpdateHomeDto } from './dto/home.dto';
import { ApiTags, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { PropertyType } from '@prisma/client';

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
  @Post()
  createHome(@Body() body: CreateHomeDto) {
    return this.homeService.createHome(body, 1); //FIXME: get realtor id from auth
  }

  @ApiOkResponse({ type: HomeResponseDto })
  @Put(':id')
  updateHome(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateHomeDto,
  ) {
    return this.homeService.updateHome(id, body); //FIXME: get realtor id from auth
  }

  @ApiOkResponse({ type: HomeResponseDto })
  @Delete(':id')
  deleteHome(@Param('id') id: number) {
    return this.homeService.deleteHome(id); //FIXME: get realtor id from auth
  }
}
