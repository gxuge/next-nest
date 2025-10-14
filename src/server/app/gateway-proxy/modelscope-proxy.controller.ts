import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { GatewayProxyService } from './gateway-proxy.service';
import { GatewayProxyDto } from './dto/gateway-proxy.dto';

@ApiTags('AI Gateway 代理')
@Controller('api/gateway')
export class ModelScopeProxyController {
  constructor(private readonly gatewayProxyService: GatewayProxyService) {}

  @Post('proxy')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '代理调用 AI Gateway（Portkey）',
    description: `将请求转发到指定的 AI Gateway，支持 Portkey 配置。
    
功能特点：
- 自动处理大请求体
- JSON 自动转义
- 支持系统提示词
- 支持多模态消息（文本和图片）
- 120秒超时时间
- 完整的错误处理`,
  })
  @ApiResponse({
    status: 200,
    description: '成功代理请求并返回 Gateway 响应',
    schema: {
      example: {
        id: 'chatcmpl-xxx',
        object: 'chat.completion',
        created: 1234567890,
        model: 'Qwen/Qwen3-VL-30B-A3B-Instruct',
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: '这是AI的回复内容',
            },
            finish_reason: 'stop',
          },
        ],
        usage: {
          prompt_tokens: 100,
          completion_tokens: 50,
          total_tokens: 150,
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: '请求参数无效',
    schema: {
      example: {
        statusCode: 400,
        message: [
          'gatewayUrl should not be empty',
          'gatewayUrl must be a string',
          'portkeyConfig should not be empty',
        ],
        error: 'Bad Request',
      },
    },
  })
  async proxyToGateway(@Body() gatewayProxyDto: GatewayProxyDto): Promise<any> {
    return this.gatewayProxyService.proxyToGateway(gatewayProxyDto);
  }
}

