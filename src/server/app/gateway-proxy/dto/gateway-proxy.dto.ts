import { IsString, IsNotEmpty, IsObject, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

// Portkey 配置相关类型
class RetryConfig {
  @ApiProperty({
    description: '重试次数',
    example: 2,
  })
  attempts: number;
}

class StrategyConfig {
  @ApiProperty({
    description: '策略模式',
    example: 'fallback',
  })
  mode: string;
}

class TargetConfig {
  @ApiProperty({
    description: '提供商',
    example: 'modelscope',
  })
  provider: string;

  @ApiProperty({
    description: 'API密钥',
    example: 'sk-xxx',
  })
  api_key: string;

  @ApiProperty({
    description: '覆盖参数',
    example: { model: 'Qwen/Qwen3-VL-30B-A3B-Instruct' },
    required: false,
  })
  override_params?: Record<string, any>;
}

class PortkeyConfig {
  @ApiProperty({
    description: '重试配置',
    type: RetryConfig,
  })
  @ValidateNested()
  @Type(() => RetryConfig)
  retry: RetryConfig;

  @ApiProperty({
    description: '策略配置',
    type: StrategyConfig,
  })
  @ValidateNested()
  @Type(() => StrategyConfig)
  strategy: StrategyConfig;

  @ApiProperty({
    description: '目标配置列表',
    type: [TargetConfig],
  })
  @ValidateNested({ each: true })
  @Type(() => TargetConfig)
  targets: TargetConfig[];
}

// 消息内容类型
class MessageContent {
  @ApiProperty({
    description: '内容类型：text 或 image_url',
    example: 'text',
  })
  type: string;

  @ApiProperty({
    description: '文本内容',
    required: false,
    example: '分析这张图片',
  })
  text?: string;

  @ApiProperty({
    description: '图片URL对象',
    required: false,
    example: { url: 'https://example.com/image.jpg' },
  })
  image_url?: {
    url: string;
  };
}

class Message {
  @ApiProperty({
    description: '消息角色',
    example: 'user',
  })
  role: string;

  @ApiProperty({
    description: '消息内容，可以是字符串或内容对象数组',
    example: [
      { type: 'image_url', image_url: { url: 'https://example.com/image.jpg' } },
      { type: 'text', text: '分析这张图片' }
    ],
  })
  content: string | MessageContent[];
}

export class GatewayProxyDto {
  @ApiProperty({
    description: 'Gateway 地址',
    example: 'http://106.52.245.55:8787/v1/chat/completions',
  })
  @IsString()
  @IsNotEmpty()
  gatewayUrl: string;

  @ApiProperty({
    description: 'Portkey 配置对象',
    type: PortkeyConfig,
  })
  @IsObject()
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => PortkeyConfig)
  portkeyConfig: PortkeyConfig;

  @ApiProperty({
    description: '模型名称',
    example: 'Qwen/Qwen3-VL-30B-A3B-Instruct',
  })
  @IsString()
  @IsNotEmpty()
  model: string;

  @ApiProperty({
    description: '对话消息数组',
    type: [Message],
  })
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => Message)
  messages: Message[];

  @ApiProperty({
    description: '系统提示词（可选）',
    example: 'You are a helpful assistant.',
    required: false,
  })
  @IsString()
  @IsOptional()
  systemPrompt?: string;
}

