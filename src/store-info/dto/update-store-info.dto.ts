import { PartialType } from '@nestjs/mapped-types';
import { CreateStoreInfoDto } from './create-store-info.dto';

export class UpdateStoreInfoDto extends PartialType(CreateStoreInfoDto) {}
