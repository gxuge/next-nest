import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HtmlTemplateService } from './html-template.service';
import {
  PopulateHtmlDto,
  PopulateHtmlResponseDto,
  GetTemplatesResponseDto,
} from './dto/populate-html.dto';

@ApiTags('HTML模板')
@Controller('html-template')
export class HtmlTemplateController {
  constructor(private readonly htmlTemplateService: HtmlTemplateService) {}

  @Get('templates')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '获取所有可用的模板列表',
    description: `
      返回系统中所有预设的HTML模板配置列表。
      
      功能说明：
      1. 获取所有可用模板的ID、名称和描述
      2. 可用于前端展示模板选择器
      
      使用场景：
      - 在前端展示可用的模板选项
      - 让用户选择合适的模板
    `,
  })
  @ApiResponse({
    status: 200,
    description: '成功返回模板列表',
    type: GetTemplatesResponseDto,
  })
  getTemplates(): GetTemplatesResponseDto {
    const templates = this.htmlTemplateService.getAllTemplates();
    return {
      templates: templates.map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description,
      })),
    };
  }

  @Post('populate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '填充HTML模板',
    description: `
      将JSON数据填充到HTML模板中。
      
      功能说明：
      1. 接收HTML模板和JSON数据（或templateId使用预设模板）
      2. 支持嵌套结构和占位符替换
      3. 支持特殊字段如summary的outer/inner结构
      4. 返回填充后的HTML字符串
      
      使用方式：
      - 方式1：提供 templateId 使用内置预设模板（推荐）
      - 方式2：提供 jsonData 使用自定义模板配置
      
      使用场景：
      - 动态生成HTML内容
      - 模板引擎功能
      - 内容管理系统
    `,
  })
  @ApiResponse({
    status: 200,
    description: '成功返回填充后的HTML',
    type: PopulateHtmlResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: '请求参数错误',
  })
  @ApiResponse({
    status: 404,
    description: '模板不存在',
  })
  populateHtml(
    @Body() populateHtmlDto: PopulateHtmlDto,
  ): PopulateHtmlResponseDto {
    const result = this.htmlTemplateService.populateHTMLFromJSON(
      populateHtmlDto.htmlTemplate,
      populateHtmlDto.jsonData,
      populateHtmlDto.templateId,
    );

    return { result };
  }
}

