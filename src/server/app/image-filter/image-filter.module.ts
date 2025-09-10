import { Module } from '@nestjs/common';
import { ImageFilterController } from './image-filter.controller';
import { ImageFilterService } from './image-filter.service';

@Module({
  controllers: [ImageFilterController],
  providers: [ImageFilterService],
  exports: [ImageFilterService],
})
export class ImageFilterModule {}
