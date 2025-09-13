import {
  IsString,
  IsArray,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FilterImagesDto {
  @ApiProperty({
    description: 'HTML内容，包含需要过滤的图片标签',
    example: '<div><img src="https://example.com/image1.jpg" /><img src="https://example.com/small.gif" /></div>'
  })
  @IsString()
  content: string;

  @ApiPropertyOptional({
    description: '黑名单URL数组，包含这些URL的图片将被移除',
    example: ['example.com/blocked', 'spam-site.com'],
    default: []
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  blacklistUrls?: string[];

  @ApiPropertyOptional({
    description: '最小图片大小限制（KB），小于此大小的图片将被移除',
    example: 50,
    minimum: 0,
    default: 50
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
    example: { blacklist: 2, gif: 1, size: 3, error: 1 }
  })
  reasons: { [key: string]: number };
}

export class KeptImage {
  @ApiProperty({ description: '保留图片的源地址' })
  src: string;

  @ApiProperty({ description: '保留图片的完整img标签' })
  tag: string;
}

export class FilterImagesResponseDto {
  @ApiProperty({ description: '过滤后的HTML内容' })
  filteredHtml: string;

  @ApiProperty({ description: '统计信息' })
  stats: ImageStats;

  @ApiProperty({ description: '移除的图片列表' })
  removedImages: { src: string; reason: string }[];

  @ApiProperty({ description: '保留的图片列表', type: [KeptImage] })
  keptImages: KeptImage[];
}
