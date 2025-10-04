import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { NextServer } from 'next/dist/server/next';

@Injectable()
export class ViewService implements OnModuleInit {
  private server: NextServer;

  constructor(private configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    try {
      // 使用动态 import 来导入 Next.js，解决 ESM/CommonJS 兼容性问题
      const nextModule: any = await import('next');
      const createNextServer = nextModule.default || nextModule;

      this.server = createNextServer({
        dev: this.configService.get<string>('NODE_ENV') !== 'production',
        dir: './src/client',
      });
      await this.server.prepare();
    } catch (error) {
      console.error('Failed to initialize Next.js:', error);
    }
  }

  handler(req: Request, res: Response) {
    return this.server.getRequestHandler()(req, res);
  }
}
