import { Injectable } from '@nestjs/common';

export interface TextExtractionResult {
  images: string[];
  content: string;
}

@Injectable()
export class TextExtractionService {
  extractDataFromText(text: string): TextExtractionResult {
    // Ensure text is a string
    if (typeof text !== 'string') {
      text = String(text ?? '');
    }

    // Regex to match img tags and extract src attributes
    const imgRegex = /<img[^>]*\bsrc\s*=\s*(?:"([^"]*)"|'([^']*)'|([^>\s]+))[^>]*>/gi;

    const images: string[] = [];
    let match;

    // Extract all image URLs
    while ((match = imgRegex.exec(text)) !== null) {
      const url = match[1] || match[2] || match[3];
      if (url) {
        images.push(url);
      }
    }

    // Remove all img tags from content and trim
    const content = text.replace(/<img[^>]*>/gi, '').trim();

    return {
      images,
      content
    };
  }
}
