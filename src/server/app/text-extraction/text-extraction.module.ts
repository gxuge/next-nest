import { Module } from '@nestjs/common';
import { TextExtractionController } from './text-extraction.controller';
import { TextExtractionService } from './text-extraction.service';

@Module({
  controllers: [TextExtractionController],
  providers: [TextExtractionService],
  exports: [TextExtractionService],
})
export class TextExtractionModule {}
