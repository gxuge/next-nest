import { IsString, IsArray, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FilterImagesDto {
  @ApiProperty({
    description: 'HTML内容，包含需要过滤的图片标签',
    example:
      '<div><img src="https://example.com/image1.jpg" /><img src="https://example.com/small.gif" /></div>',
  })
  @IsString()
  content: string;

  @ApiPropertyOptional({
    description: '黑名单URL数组，包含这些URL的图片将被移除',
    example: ['example.com/blocked', 'spam-site.com'],
    default: [],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  blacklistUrls?: string[];

  @ApiPropertyOptional({
    description: '最小图片大小限制（KB），小于此大小的图片将被移除',
    example: 50,
    minimum: 0,
    default: 50,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minSizeKB?: number;
}

export class ImageStats {
  @ApiProperty({ description: '总图片数量' })
  total: number;

  @ApiProperty({ description: '被移除的图片数量' })
  removed: number;

  @ApiProperty({ description: '保留的图片数量' })
  kept: number;

  @ApiProperty({
    description: '移除原因统计',
    example: { blacklist: 2, gif: 1, size: 3, error: 1 },
  })
  reasons: { [key: string]: number };
}

export class KeptImage {
  @ApiProperty({ description: '保留图片的源地址' })
  src: string;

  @ApiProperty({
    description: '保留图片的占位标签（如<img1/>、<img2/>等）',
    example: '<img1/>',
  })
  tag: string;

  @ApiProperty({
    description: '图片周围的上下文文本，用于辅助AI分析图片内容',
    example: {
      before: '这是一款优秀的智能手机，拥有强大的性能和优雅的设计。',
      after: '该手机配备了最新的处理器和高清显示屏。',
      full: '这是一款优秀的智能手机，拥有强大的性能和优雅的设计。该手机配备了最新的处理器和高清显示屏。',
    },
  })
  context: {
    before: string;
    after: string;
    full: string;
  };

  @ApiProperty({
    description: '上下文提取的元数据信息',
    example: {
      beforeChars: 285,
      afterChars: 500,
      truncatedBefore: true,
      truncatedAfter: false,
    },
  })
  contextMeta: {
    beforeChars: number;
    afterChars: number;
    truncatedBefore: boolean;
    truncatedAfter: boolean;
  };
}

export class FilterImagesResponseDto {
  @ApiProperty({
    description:
      '过滤后的HTML内容，保留的图片会被替换为占位标签（如<img1/>、<img2/>等）',
    example: '<div><img1/><p>文本内容</p><img2/></div>',
  })
  filteredHtml: string;

  @ApiProperty({ description: '统计信息' })
  stats: ImageStats;

  @ApiProperty({ description: '移除的图片列表' })
  removedImages: { src: string; reason: string }[];

  @ApiProperty({ description: '保留的图片列表', type: [KeptImage] })
  keptImages: KeptImage[];
}
