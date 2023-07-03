import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { HomeResponseDto, UpdateHomeDto } from './dto/home.dto';
import { CreateHomeParams, GetHomesParams } from 'src/Utils.interfaces';

@Injectable()
export class HomeService {
  constructor(private readonly prismaService: PrismaService) {}
  async getHomes(filter: GetHomesParams): Promise<HomeResponseDto[]> {
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
      where: {
        ...filter,
      },
    });

    if (!response.length) {
      throw new NotFoundException('No homes found');
    }
    return response.map((home) => {
      const fetchHome = { ...home, image: home.images[0].url };
      delete fetchHome.images;
      return new HomeResponseDto(fetchHome);
    });
  }

  async getHome(id: number) {
    const home = await this.prismaService.home.findUnique({
      where: {
        id,
      },
      select: {
        ...HomeResponseDto.select,
        images: {
          select: {
            url: true,
          },
        },
        realtor: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!home) {
      throw new NotFoundException('Home not found');
    }

    return new HomeResponseDto(home);
  }

  async createHome(
    {
      address,
      numberOfBathrooms,
      numberOfBedrooms,
      city,
      landSize,
      price,
      propertyType,
      images,
    }: CreateHomeParams,
    userId: number,
  ) {
    const home = await this.prismaService.home.create({
      data: {
        address,
        number_of_bathrooms: numberOfBathrooms,
        number_of_bedrooms: numberOfBedrooms,
        city,
        land_size: landSize,
        propertyType,
        price,
        realtor_id: userId,
      },
    });

    const homeImages = images.map((image) => {
      return { ...image, home_id: home.id };
    });

    await this.prismaService.image.createMany({
      data: homeImages,
    });

    return new HomeResponseDto(home);
  }

  async updateHome(id: number, body: UpdateHomeDto) {
    /* find if id exist */
    const home = await this.prismaService.home.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
      },
    });
    if (!home) {
      throw new NotFoundException('Home not found');
    }
    const updateHome = await this.prismaService.home.update({
      where: {
        id,
      },
      data: {
        ...body,
      },
    });

    return new HomeResponseDto(updateHome);
  }

  async deleteHome(id: number) {
    const homeImages = await this.prismaService.image.findMany({
      where: {
        home_id: id,
      },
      select: {
        id: true,
      },
    });
    if (!homeImages.length) {
      throw new NotFoundException('Home not found');
    }
    if (homeImages.length) {
      await this.prismaService.image.deleteMany({
        where: {
          home_id: id,
        },
      });

      /* find if id exist */
      const home = await this.prismaService.home.findUnique({
        where: {
          id: id,
        },
        select: {
          id: true,
        },
      });
      if (!home) {
        throw new NotFoundException('Home not found');
      }
      await this.prismaService.home.delete({
        where: {
          id,
        },
      });
      return { message: 'Home deleted successfully' };
    }
  }

  async getRealtorByHomeId(id: number) {
    const home = await this.prismaService.home.findUnique({
      where: {
        id: id,
      },
      select: {
        realtor: {
          select: {
            name: true,
            id: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!home) {
      throw new NotFoundException();
    }

    return home.realtor;
  }
}
