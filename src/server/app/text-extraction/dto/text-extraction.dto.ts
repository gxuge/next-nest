import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ExtractTextDto {
  @ApiProperty({
    description: '需要提取图片和内容的HTML文本',
    example: '<div><p>文本内容</p><img src="https://example.com/image1.jpg" alt="图片1" /><p>更多内容</p><img src="https://example.com/image2.png" /></div>',
  })
  @IsString()
  @IsNotEmpty()
  text: string;
}

export class TextExtractionResponseDto {
  @ApiProperty({
    description: '提取的图片URL列表',
    example: ['https://example.com/image1.jpg', 'https://example.com/image2.png'],
    type: [String],
  })
  images: string[];

  @ApiProperty({
    description: '移除所有img标签后的内容',
    example: '<div><p>文本内容</p><p>更多内容</p></div>',
  })
  content: string;
}
