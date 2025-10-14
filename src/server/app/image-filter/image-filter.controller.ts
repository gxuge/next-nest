import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { ImageFilterService } from './image-filter.service';
import { FilterImagesDto, FilterImagesResponseDto } from './dto/filter-images.dto';
import { ConvertImageDto, ConvertImageResponseDto } from './dto/convert-image.dto';

@ApiTags('图片处理')
@Controller('api/image')
export class ImageFilterController {
  constructor(private readonly imageFilterService: ImageFilterService) {}

  @Post('filter')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '过滤HTML中的图片',
    description: '根据黑名单、GIF类型和文件大小过滤HTML中的图片标签。被移除的图片会被删除，保留的图片会被替换为占位标签（如<img1/>、<img2/>等），返回过滤后的HTML和统计信息。'
  })
  @ApiResponse({
    status: 200,
    description: '成功过滤图片',
    type: FilterImagesResponseDto,
    schema: {
      example: {
        filteredHtml: '<div><img1/><p>文本内容</p><img2/></div>',
        stats: {
          total: 5,
          removed: 3,
          kept: 2,
          reasons: {
            blacklist: 1,
            gif: 1,
            size: 1
          }
        },
        removedImages: [
          { src: 'https://example.com/blocked.jpg', reason: 'blacklist' },
          { src: 'https://example.com/small.jpg', reason: 'size' },
          { src: 'https://example.com/animation.gif', reason: 'gif' }
        ],
        keptImages: [
          {
            src: 'https://example.com/image1.jpg',
            tag: '<img1/>',
            context: {
              before: '这是一款优秀的智能手机，拥有强大的性能。',
              after: '该手机配备了最新的处理器。',
              full: '这是一款优秀的智能手机，拥有强大的性能。该手机配备了最新的处理器。'
            },
            contextMeta: {
              beforeChars: 285,
              afterChars: 420,
              truncatedBefore: false,
              truncatedAfter: false
            }
          },
          {
            src: 'https://example.com/image2.png',
            tag: '<img2/>',
            context: {
              before: '产品特色：轻薄便携设计。',
              after: '支持多种拍摄模式。',
              full: '产品特色：轻薄便携设计。支持多种拍摄模式。'
            },
            contextMeta: {
              beforeChars: 180,
              afterChars: 500,
              truncatedBefore: true,
              truncatedAfter: false
            }
          }
        ]
      }
    }
  })
  @ApiBadRequestResponse({
    description: '请求参数无效',
    schema: {
      example: {
        statusCode: 400,
        message: ['content should not be empty'],
        error: 'Bad Request'
      }
    }
  })
  async filterImages(@Body() filterDto: FilterImagesDto): Promise<FilterImagesResponseDto> {
    return this.imageFilterService.filterImages(filterDto);
  }

  @Post('convert-to-jpeg')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '转换图片为JPEG格式',
    description: '将任意格式的图片（WebP、PNG、BMP等）转换为标准JPEG格式，返回base64编码的JPEG图片数据。'
  })
  @ApiResponse({
    status: 200,
    description: '成功转换图片',
    type: ConvertImageResponseDto,
    schema: {
      example: {
        imageData: '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0a...',
        originalFormat: 'image/webp',
        convertedFormat: 'image/jpeg',
        originalSize: 12345,
        convertedSize: 10234
      }
    }
  })
  @ApiBadRequestResponse({
    description: '请求参数无效',
    schema: {
      example: {
        statusCode: 400,
        message: ['imageData should not be empty'],
        error: 'Bad Request'
      }
    }
  })
  async convertToJpeg(@Body() convertDto: ConvertImageDto): Promise<ConvertImageResponseDto> {
    return this.imageFilterService.convertToJpeg(convertDto);
  }
}
