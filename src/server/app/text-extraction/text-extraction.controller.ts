import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { TextExtractionService } from './text-extraction.service';
import { ExtractTextDto, TextExtractionResponseDto } from './dto/text-extraction.dto';

@ApiTags('文本提取')
@Controller('text-extraction')
export class TextExtractionController {
  constructor(private readonly textExtractionService: TextExtractionService) {}

  @Post('extract')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '从HTML文本中提取图片和内容',
    description: '解析HTML文本，提取所有img标签的src属性，并返回去除img标签后的内容。支持单引号、双引号和无引号的src属性格式。'
  })
  @ApiResponse({
    status: 200,
    description: '成功提取图片和内容',
    type: TextExtractionResponseDto,
    schema: {
      example: {
        images: ['https://example.com/image1.jpg', 'https://example.com/image2.png', 'https://example.com/image3.gif'],
        content: '<div><p>这是一些文本内容</p><p>这是图片之间的内容</p><p>这是图片后的内容</p></div>'
      }
    }
  })
  @ApiBadRequestResponse({
    description: '请求参数无效',
    schema: {
      example: {
        statusCode: 400,
        message: ['text should not be empty', 'text must be a string'],
        error: 'Bad Request'
      }
    }
  })
  extractTextData(@Body() extractTextDto: ExtractTextDto): TextExtractionResponseDto {
    return this.textExtractionService.extractDataFromText(extractTextDto.text);
  }
}
