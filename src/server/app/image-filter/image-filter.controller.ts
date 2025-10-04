import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { ImageFilterService } from './image-filter.service';
import { FilterImagesDto, FilterImagesResponseDto } from './dto/filter-images.dto';

@ApiTags('图片过滤')
@Controller('image-filter')
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
          { src: 'https://example.com/image1.jpg', tag: '<img1/>' },
          { src: 'https://example.com/image2.png', tag: '<img2/>' }
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
}
