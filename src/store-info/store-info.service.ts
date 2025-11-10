import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateStoreInfoDto } from './dto/create-store-info.dto';
import { UpdateStoreInfoDto } from './dto/update-store-info.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { storeInfoConfig } from 'src/common/constants/config';

@Injectable()
export class StoreInfoService {
  constructor(private readonly prisma: PrismaService) {}

  async getStore() {
    let info = await this.prisma.storeInfo.findFirst({});
    if (!info) {
      // create default if not exists
      info = await this.prisma.storeInfo.create({
        data: {
          name: storeInfoConfig.name,
          address: storeInfoConfig.address,
          phone: storeInfoConfig.phone,
        },
      });
    }
    return info;
  }

  async update(payload: UpdateStoreInfoDto) {
    const info = await this.prisma.storeInfo.upsert({
      where: { id: 1 },
      update: payload,
      create: {
        name: storeInfoConfig.name,
        address: storeInfoConfig.address,
        phone: storeInfoConfig.phone,
      },
    });

    return info;
  }
}
