/**
 * 预设HTML模板配置
 * 每个模板包含ID、名称、描述和模板配置数据
 */

export interface TemplateConfig {
  id: string;
  name: string;
  description: string;
  data: Record<string, any>;
}

/**
 * 蓝色主题模板
 */
export const BLUE_THEME_TEMPLATE: TemplateConfig = {
  id: 'blue-theme',
  name: '蓝色主题',
  description: '现代化蓝色渐变主题，适用于公众号文章排版',
  data: {
    article_title:
      '<h1 style="text-align: center; font-size: 22px; color: rgba(0, 0, 0, 0.9); margin: 20px 0; line-height: 1.4;">{{article_title}}</h1>',

    subtitle:
      '<div style="margin: 20px 0; box-sizing: border-box; font-style: normal; font-weight: 400; text-align: justify; font-size: 16px; color: rgb(62, 62, 62);"><div style="text-align: center; justify-content: center; display: flex; flex-flow: row; margin: 0px 0px 10px; box-sizing: border-box;"><div style="display: inline-block; vertical-align: middle; width: auto; flex: 0 0 0%; height: auto; align-self: center; padding: 0px 5px 0px 0px; line-height: 0; box-sizing: border-box;"><div style="text-align: right; margin: 0px; box-sizing: border-box;"><div style="display: inline-block; width: 5px; height: 20px; vertical-align: top; overflow: hidden; border-radius: 10px; background-color: rgb(222, 239, 255); box-sizing: border-box;"></div></div></div><div style="display: inline-block; vertical-align: middle; width: auto; flex: 0 0 0%; height: auto; align-self: center; padding: 0px 5px 0px 0px; line-height: 0; box-sizing: border-box;"><div style="text-align: right; margin: 0px; box-sizing: border-box;"><div style="display: inline-block; width: 5px; height: 30px; vertical-align: top; overflow: hidden; border-radius: 10px; background-color: rgb(222, 239, 255); box-sizing: border-box;"></div></div></div><div style="display: inline-block; vertical-align: middle; width: auto; align-self: center; flex: 0 0 auto; background-image: linear-gradient(140deg, rgb(50, 151, 248) 0%, rgb(28, 96, 248) 34%, rgb(30, 101, 248) 66%, rgb(50, 151, 248) 100%); border-style: solid; border-width: 2px; border-color: rgb(255, 255, 255); border-radius: 10px; overflow: hidden; box-shadow: rgb(189, 189, 189) 0px 0px 3px 0px, rgb(54, 243, 241) 2px 2px 5px 0px inset, rgb(8, 63, 186) -2px -2px 5px 0px inset; padding: 10px 20px; min-width: 5%; max-width: 100%; height: auto; z-index: 1; box-sizing: border-box;"><div style="text-align: justify; letter-spacing: 2px; box-sizing: border-box; color: rgb(255, 255, 255); font-size: 16px; font-weight: bold;"><p style="white-space: normal;margin: 0px;padding: 0px;box-sizing: border-box;"><strong style="box-sizing: border-box;"><span>{{subtitle}}</span></strong></p></div></div><div style="display: inline-block; vertical-align: middle; width: auto; flex: 0 0 0%; height: auto; align-self: center; padding: 0px; z-index: auto; line-height: 0; box-sizing: border-box;"><div style="text-align: left; margin: 0px; box-sizing: border-box;"><div style="display: inline-block; width: 5px; height: 30px; vertical-align: top; overflow: hidden; border-radius: 10px; background-color: rgb(222, 239, 255); box-sizing: border-box;"></div></div></div><div style="display: inline-block; vertical-align: middle; width: auto; flex: 0 0 0%; height: auto; align-self: center; padding: 0px; z-index: auto; line-height: 0; box-sizing: border-box;"><div style="text-align: left; margin: 0px; box-sizing: border-box;"><div style="display: inline-block; width: 5px; height: 20px; vertical-align: top; overflow: hidden; border-radius: 10px; background-color: rgb(222, 239, 255); box-sizing: border-box;"></div></div></div></div></div>',

    summary: {
      outer:
        '<div style="margin: 20px 0; box-sizing: border-box; font-style: normal; font-weight: 400; text-align: justify; color: rgb(62, 62, 62);">\n   <div style="text-align: center; justify-content: center; display: flex; flex-flow: row; margin: 10px 0px; box-sizing: border-box;">\n    <div style="display: inline-block; width: 99%; vertical-align: top; align-self: flex-start; flex: 0 0 auto; border-top: 1px solid rgb(41, 155, 253); border-bottom-left-radius: 10px; border-bottom-right-radius: 10px; box-shadow: rgb(191, 220, 255) 0px 5px 0px; padding: 20px 20px; height: auto; overflow: hidden; box-sizing: border-box; max-width: 99% !important;">\n     {{inner}}\n    </div>\n   </div>\n  </div>',
      inner: {
        title:
          '<div style="text-align: left; justify-content: flex-start; display: flex; flex-flow: row; margin: 0px 0px 20px; box-sizing: border-box;">\n      <div style="display: inline-block; vertical-align: top; width: auto; align-self: flex-start; flex: 0 0 0%; height: auto; line-height: 0; background-color: #4862ff; box-sizing: border-box;">\n       <div style="text-align: center; box-sizing: border-box;">\n        <div style="display: inline-block; width: 12px; height: 12px; vertical-align: top; overflow: hidden; background-color: #ffffff; border-top-right-radius: 50px; box-sizing: border-box;"></div>\n       </div>\n      </div>\n      <div style="display: inline-block; vertical-align: top; width: auto; align-self: flex-start; flex: 0 0 auto; background-image: linear-gradient(162deg, #4862ff 0%, #0ecafc 100%); min-width: 5%; max-width: 100%; height: auto; padding: 5px 20px; border-bottom-left-radius: 10px; border-bottom-right-radius: 10px; overflow: hidden; box-sizing: border-box;">\n       <div style="color: #ffffff; font-size: 16px; letter-spacing: 2px; line-height: 1.6; box-sizing: border-box;">\n        <p style="margin: 0px;padding: 0px;box-sizing: border-box;"><strong style="box-sizing: border-box;"><span>{{title}}</span></strong></p>\n       </div>\n      </div>\n      <div style="display: inline-block; vertical-align: top; width: auto; align-self: flex-start; flex: 0 0 0%; height: auto; line-height: 0; background-color: #299bfd; box-sizing: border-box;">\n       <div style="text-align: center; box-sizing: border-box;">\n        <div style="display: inline-block; width: 12px; height: 12px; vertical-align: top; overflow: hidden; background-color: #ffffff; border-top-left-radius: 50px; box-sizing: border-box;"></div>\n       </div>\n      </div>\n     </div>',
        content:
          '<div style="text-align: justify; font-size: 16px; line-height: 1.75; box-sizing: border-box;">\n      <p style="white-space: normal;margin: 0px;padding: 0px;box-sizing: border-box;"><span>{{content}}</span></p>\n     </div>',
      },
    },

    main_subject: '<strong><span>{{main_subject}}</span></strong>',

    highlight_content:
      '<span style="color: rgb(0, 112, 192); font-weight: bold;"><strong><span>{{highlight_content}}</span></strong></span>',

    content_points: {
      title:
        '<div style="margin: 10px 0%; display: flex; flex-flow: row; text-align: left; justify-content: flex-start; box-sizing: border-box;"><div style="display: inline-block; vertical-align: bottom; width: auto; min-width: 10%; max-width: 100%; flex: 0 0 auto; height: auto; border-top-left-radius: 50px; border-bottom-left-radius: 50px; border-top-right-radius: 8px; overflow: hidden; align-self: flex-end; z-index: 2; margin: 0px; box-shadow: rgb(0, 0, 0) 0px 0px 0px; background-image: linear-gradient(162deg, rgb(72, 98, 255) 0%, rgb(14, 202, 252) 100%); padding: 4px 10px; box-sizing: border-box;"><div style="justify-content: flex-start; display: flex; flex-flow: row; box-sizing: border-box;"><div style="display: inline-block; vertical-align: middle; width: auto; align-self: center; flex: 0 0 auto; min-width: 5%; max-width: 100%; height: auto; box-sizing: border-box;"><div style="text-align: center; margin: 0px; box-sizing: border-box;"><div style="display: inline-block; width: 25px; height: 25px; vertical-align: top; overflow: hidden; border-radius: 100%; background-color: rgb(255, 255, 255); box-sizing: border-box;"></div></div></div><div style="display: inline-block; vertical-align: middle; width: auto; align-self: center; flex: 0 0 auto; min-width: 5%; max-width: 100%; height: auto; padding: 0px 0px 0px 10px; box-sizing: border-box;"><div style="margin: 0px; box-sizing: border-box; font-size: 16px; color: rgb(255, 255, 255); font-weight: bold;"><p style="margin: 0px;padding: 0px;box-sizing: border-box;"><strong style="box-sizing: border-box;"><span>NO.n</span></strong></p></div></div></div></div><div style="display: inline-block; vertical-align: bottom; width: auto; min-width: 10%; max-width: 100%; flex: 0 0 auto; height: auto; align-self: flex-end; z-index: auto; margin: 0px; line-height: 2; letter-spacing: 0px; background-color: rgb(255, 255, 255); border-top-right-radius: 50px; overflow: hidden; border-bottom-right-radius: 50px; box-shadow: rgb(191, 220, 255) 0px 0px 5px 0px; padding: 0px 15px 0px 0px; box-sizing: border-box;"><div style="display: flex; flex-flow: row; text-align: justify; justify-content: flex-start; box-sizing: border-box;"><div style="display: inline-block; vertical-align: bottom; width: auto; align-self: flex-end; flex: 0 0 0%; height: auto; line-height: 0; background-color: rgb(14, 202, 252); box-sizing: border-box;"><div style="text-align: center; box-sizing: border-box;"><div style="display: inline-block; width: 12px; height: 12px; vertical-align: top; overflow: hidden; background-color: rgb(255, 255, 255); border-bottom-left-radius: 50px; box-sizing: border-box;"></div></div></div><div style="display: inline-block; vertical-align: bottom; width: auto; align-self: flex-end; flex: 0 0 auto; min-width: 10%; max-width: 100%; height: auto; box-sizing: border-box;"><div style="margin: 5px 0px; box-sizing: border-box;"><div style="color: rgb(63, 143, 239); letter-spacing: 2px; line-height: 1.6; box-sizing: border-box; font-size: 16px; font-weight: bold;"><p style="margin: 0px;padding: 0px;box-sizing: border-box;"><strong style="box-sizing: border-box;"><span>{{title}}</span></strong></p></div></div></div></div></div></div>',
      content:
        '<div style="margin-bottom: 20px; text-align: justify;"><p>{{content}}</p></div>',
    },
  },
};

/**
 * 所有可用的模板配置映射表
 */
export const TEMPLATE_REGISTRY: Record<string, TemplateConfig> = {
  [BLUE_THEME_TEMPLATE.id]: BLUE_THEME_TEMPLATE,
  // 未来可以在这里添加更多模板
  // 'green-theme': GREEN_THEME_TEMPLATE,
  // 'red-theme': RED_THEME_TEMPLATE,
};

/**
 * 获取所有可用的模板列表
 */
export function getAllTemplates(): TemplateConfig[] {
  return Object.values(TEMPLATE_REGISTRY);
}

/**
 * 根据ID获取模板配置
 */
export function getTemplateById(templateId: string): TemplateConfig | null {
  return TEMPLATE_REGISTRY[templateId] || null;
}

