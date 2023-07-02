import { Controller, Get, Param, Post, Put, Delete } from '@nestjs/common';
import { HomeService } from './home.service';
import { HomeResponseDto } from './dto/home.dto';

@Controller('home')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}
  @Get()
  async getHomes(): Promise<HomeResponseDto[]> {
    return this.homeService.getHomes();
  }

  @Get(':id')
  getHome(@Param('id') id: string): string {
    return 'Home ' + id;
  }

  @Post()
  createHome(): string {
    return 'Create Home';
  }

  @Put(':id')
  updateHome(@Param('id') id: string): string {
    return 'Update Home ' + id;
  }

  @Delete(':id')
  deleteHome(@Param('id') id: string): string {
    return 'Delete Home ' + id;
  }
}
