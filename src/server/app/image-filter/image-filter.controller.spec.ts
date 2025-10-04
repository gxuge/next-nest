import { Test, TestingModule } from '@nestjs/testing';
import { ImageFilterController } from './image-filter.controller';
import { ImageFilterService } from './image-filter.service';

describe('ImageFilterController', () => {
  let controller: ImageFilterController;
  let service: ImageFilterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImageFilterController],
      providers: [ImageFilterService],
    }).compile();

    controller = module.get<ImageFilterController>(ImageFilterController);
    service = module.get<ImageFilterService>(ImageFilterService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('filterImages', () => {
    it('should filter images correctly', async () => {
      const mockHtml =
        '<div><img src="https://example.com/image1.jpg" /><img src="https://example.com/small.gif" /></div>';
      const filterDto = {
        content: mockHtml,
        blacklistUrls: [],
        minSizeKB: 50,
      };

      const mockResult = {
        filteredHtml: '<div><img1/></div>',
        stats: {
          total: 2,
          removed: 1,
          kept: 1,
          reasons: { gif: 1 },
        },
        removedImages: [
          { src: 'https://example.com/small.gif', reason: 'gif' }
        ],
        keptImages: [
          { src: 'https://example.com/image1.jpg', tag: '<img1/>' }
        ],
      };

      jest.spyOn(service, 'filterImages').mockResolvedValue(mockResult);

      const result = await controller.filterImages(filterDto);

      expect(result).toEqual(mockResult);
      expect(service.filterImages).toHaveBeenCalledWith(filterDto);
    });

    it('should handle empty content', async () => {
      const filterDto = {
        content: '',
        blacklistUrls: [],
        minSizeKB: 50,
      };

      const mockResult = {
        filteredHtml: '',
        stats: {
          total: 0,
          removed: 0,
          kept: 0,
          reasons: {},
        },
        removedImages: [],
        keptImages: [],
      };

      jest.spyOn(service, 'filterImages').mockResolvedValue(mockResult);

      const result = await controller.filterImages(filterDto);

      expect(result).toEqual(mockResult);
    });
  });
});
