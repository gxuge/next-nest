import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class ConvertImageDto {
  @ApiProperty({
    description: '图片的base64编码数据（支持字符串或包含 data 字段的对象）',
    example: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    examples: {
      string: {
        value: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        summary: '直接传递 base64 字符串',
      },
      object: {
        value: {
          data: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
          mimeType: 'image/jpeg',
          fileType: 'image',
          fileExtension: 'jpg',
        },
        summary: 'n8n 格式（包含 data 字段的对象）',
      },
    },
  })
  @IsNotEmpty()
  imageData: string | any;

  @ApiProperty({
    description: 'JPEG图片质量 (1-100)',
    example: 95,
    required: false,
    default: 95
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  quality?: number;
}

export class ConvertImageResponseDto {
  @ApiProperty({
    description: '转换后的JPEG图片base64数据',
    example: '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0a...'
  })
  imageData: string;

  @ApiProperty({
    description: '原始格式',
    example: 'image/webp'
  })
  originalFormat: string;

  @ApiProperty({
    description: '转换后格式',
    example: 'image/jpeg'
  })
  convertedFormat: string;

  @ApiProperty({
    description: '原始文件大小（字节）',
    example: 12345
  })
  originalSize: number;

  @ApiProperty({
    description: '转换后文件大小（字节）',
    example: 10234
  })
  convertedSize: number;
}

