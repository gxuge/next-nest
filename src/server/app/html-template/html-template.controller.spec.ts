import { Test, TestingModule } from '@nestjs/testing';
import { HtmlTemplateController } from './html-template.controller';
import { HtmlTemplateService } from './html-template.service';

describe('HtmlTemplateController', () => {
  let controller: HtmlTemplateController;
  let service: HtmlTemplateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HtmlTemplateController],
      providers: [HtmlTemplateService],
    }).compile();

    controller = module.get<HtmlTemplateController>(HtmlTemplateController);
    service = module.get<HtmlTemplateService>(HtmlTemplateService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('populateHtml', () => {
    it('should populate HTML template with JSON data', () => {
      const htmlTemplate = `
        <div>
          <article_title>这是原始主标题内容</article_title>
          <subtitle>这是原始副标题</subtitle>
        </div>
      `;

      const jsonData = {
        article_title: "<div class='new-title'>{{article_title}}</div>",
        subtitle: '<h2>{{subtitle}}</h2>',
      };

      const result = controller.populateHtml({ htmlTemplate, jsonData });

      expect(result.result).toBeDefined();
      expect(result.result).toContain('这是原始主标题内容');
      expect(result.result).toContain('这是原始副标题');
    });

    it('should handle nested summary structure', () => {
      const htmlTemplate = `
        <div>
          <summary>
            <title>原始内部标题</title>
            <content>原始内部内容</content>
          </summary>
        </div>
      `;

      const jsonData = {
        summary: {
          outer:
            "<section class='summary-container'>{{summary}} <div>{{inner}}</div></section>",
          inner: {
            title: '<h3>{{title}}</h3>',
            content: '<p>{{content}}</p>',
          },
        },
      };

      const result = controller.populateHtml({ htmlTemplate, jsonData });

      expect(result.result).toBeDefined();
      expect(result.result).toContain('原始内部标题');
      expect(result.result).toContain('原始内部内容');
    });

    it('should handle HTML entities in style attributes correctly', () => {
      const htmlTemplate = `
        <div>
          <title>原始标题</title>
        </div>
      `;

      // 模拟包含HTML实体编码的jsonData（这是导致问题的场景）
      const jsonDataWithEntities = {
        title: '<h1 class="new-title" style=&quot;text-align: center; font-size: 14px;&quot;>{{title}}</h1>',
      };

      const result = controller.populateHtml({
        htmlTemplate,
        jsonData: jsonDataWithEntities,
      });

      expect(result.result).toBeDefined();
      expect(result.result).toContain('原始标题');
      
      // 验证style属性被正确解析，而不是被错误拆分
      expect(result.result).toContain('style="text-align: center; font-size: 14px;"');
      expect(result.result).not.toContain('center;=""');
      expect(result.result).not.toContain('font-size:=""');
    });

    it('should handle properly escaped quotes in JSON', () => {
      const htmlTemplate = `
        <div>
          <article_title>原始文章标题</article_title>
        </div>
      `;

      const jsonData = {
        article_title: '<div class="wrapper" style="text-align: center; font-size: 14px; color: blue;">{{article_title}}</div>',
      };

      const result = controller.populateHtml({ htmlTemplate, jsonData });

      expect(result.result).toBeDefined();
      expect(result.result).toContain('原始文章标题');
      expect(result.result).toContain('style="text-align: center; font-size: 14px; color: blue;"');
    });

    it('should handle escaped curly brackets in placeholders', () => {
      const htmlTemplate = `
        <div>
          <article_title>深圳初三学年规划</article_title>
        </div>
      `;

      // 模拟占位符大括号被转义的情况 \{\{...\}\}
      const jsonData = {
        article_title: '<h1 style="text-align: center;">\\{\\{article_title\\}\\}</h1>',
      };

      const result = controller.populateHtml({ htmlTemplate, jsonData });

      expect(result.result).toBeDefined();
      // 验证占位符被正确替换，而不是保留 \{\{article_title\}\}
      expect(result.result).toContain('深圳初三学年规划');
      expect(result.result).not.toContain('\\{\\{');
      expect(result.result).not.toContain('\\}\\}');
      expect(result.result).toContain('<h1 style="text-align: center;">深圳初三学年规划</h1>');
    });
  });
});

