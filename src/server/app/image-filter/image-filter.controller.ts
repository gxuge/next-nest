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
    description: '根据黑名单、GIF类型和文件大小过滤HTML中的图片标签，返回过滤后的HTML和统计信息'
  })
  @ApiResponse({
    status: 200,
    description: '成功过滤图片',
    type: FilterImagesResponseDto,
    schema: {
      example: {
        filteredHtml: '<div><img src="https://example.com/large-image.jpg" /></div>',
        stats: {
          total: 3,
          removed: 2,
          kept: 1,
          reasons: {
            blacklist: 1,
            size: 1
          }
        }
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
