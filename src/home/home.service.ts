import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { HomeResponseDto } from './dto/home.dto';

@Injectable()
export class HomeService {
  constructor(private readonly prismaService: PrismaService) {}
  async getHomes(): Promise<HomeResponseDto[]> {
    const response = await this.prismaService.home.findMany({
      select: {
        id: true,
        address: true,
        number_of_bedrooms: true,
        number_of_bathrooms: true,
        city: true,
        price: true,
        images: {
          select: {
            url: true,
          },
        },
      },
      take: 3,
    });
    return response.map((home) => {
      const fetchHome = { ...home, image: home.images[0].url };
      delete fetchHome.images;
      return new HomeResponseDto(fetchHome);
    });
  }

  async getHome(id: string): Promise<string> {
    return 'Home ' + id;
  }

  async createHome(): Promise<string> {
    return 'Create Home';
  }

  async updateHome(id: string): Promise<string> {
    return 'Update Home ' + id;
  }

  async deleteHome(id: string): Promise<string> {
    return 'Delete Home ' + id;
  }
}
