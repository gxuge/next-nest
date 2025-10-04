import { Test, TestingModule } from '@nestjs/testing';
import { TextExtractionService } from './text-extraction.service';

describe('TextExtractionService', () => {
  let service: TextExtractionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TextExtractionService],
    }).compile();

    service = module.get<TextExtractionService>(TextExtractionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should extract images and content from HTML text', () => {
    const htmlText = `
      <div>
        <p>This is some content before the image.</p>
        <img src="https://example.com/image1.jpg" alt="Image 1" />
        <p>This is content between images.</p>
        <img src='https://example.com/image2.png' alt='Image 2' />
        <p>This is content after images.</p>
        <img src=https://example.com/image3.gif>
      </div>
    `;

    const result = service.extractDataFromText(htmlText);

    expect(result.images).toEqual(['https://example.com/image1.jpg', 'https://example.com/image2.png', 'https://example.com/image3.gif']);
    expect(result.content).toContain('This is some content before the image.');
    expect(result.content).toContain('This is content between images.');
    expect(result.content).toContain('This is content after images.');
    expect(result.content).not.toContain('<img');
  });

  it('should handle text without images', () => {
    const text = '<p>This is just regular content without any images.</p>';

    const result = service.extractDataFromText(text);

    expect(result.images).toEqual([]);
    expect(result.content).toBe('<p>This is just regular content without any images.</p>');
  });

  it('should handle non-string input', () => {
    const result = service.extractDataFromText(null as any);

    expect(result.images).toEqual([]);
    expect(result.content).toBe('');
  });

  it('should handle empty string', () => {
    const result = service.extractDataFromText('');

    expect(result.images).toEqual([]);
    expect(result.content).toBe('');
  });
});
