import { Module } from '@nestjs/common';
import { HtmlTemplateController } from './html-template.controller';
import { HtmlTemplateService } from './html-template.service';

@Module({
  controllers: [HtmlTemplateController],
  providers: [HtmlTemplateService],
  exports: [HtmlTemplateService],
})
export class HtmlTemplateModule {}

