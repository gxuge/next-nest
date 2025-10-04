import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsObject,
  IsNotEmpty,
  IsOptional,
  ValidateIf,
} from 'class-validator';

export class PopulateHtmlDto {
  @ApiProperty({
    description: 'HTML模板字符串，使用自定义标签作为占位符',
    example: `<div>
  <article_title>这是原始主标题内容</article_title>
  <subtitle>这是原始副标题</subtitle>
  <summary>
    <title>原始内部标题</title>
    <content>原始内部内容</content>
  </summary>
</div>`,
  })
  @IsString()
  @IsNotEmpty()
  htmlTemplate: string;

  @ApiPropertyOptional({
    description:
      '预设模板ID（如果提供，将使用内置模板配置，jsonData可省略）',
    example: 'blue-theme',
    enum: ['blue-theme'],
  })
  @IsString()
  @IsOptional()
  templateId?: string;

  @ApiPropertyOptional({
    description:
      'JSON数据对象，用于填充模板（如果提供了templateId，此参数可省略）',
    example: {
      article_title: "<div class='new-title'>{{article_title}}</div>",
      subtitle: '<h2>{{subtitle}}</h2>',
      summary: {
        outer:
          "<section class='summary-container'>{{summary}} <div>{{inner}}</div></section>",
        inner: {
          title: '<h3>{{title}}</h3>',
          content: '<p>{{content}}</p>',
        },
      },
    },
  })
  @IsObject()
  @ValidateIf((o) => !o.templateId)
  @IsNotEmpty()
  jsonData?: Record<string, any>;
}

export class PopulateHtmlResponseDto {
  @ApiProperty({
    description: '填充后的HTML字符串',
    example: '<div><div class="new-title">这是原始主标题内容</div>...</div>',
  })
  result: string;
}

export class TemplateInfoDto {
  @ApiProperty({
    description: '模板ID',
    example: 'blue-theme',
  })
  id: string;

  @ApiProperty({
    description: '模板名称',
    example: '蓝色主题',
  })
  name: string;

  @ApiProperty({
    description: '模板描述',
    example: '现代化蓝色渐变主题，适用于公众号文章排版',
  })
  description: string;
}

export class GetTemplatesResponseDto {
  @ApiProperty({
    description: '可用的模板列表',
    type: [TemplateInfoDto],
  })
  templates: TemplateInfoDto[];
}

