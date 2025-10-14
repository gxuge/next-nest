import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import * as http from 'http';
import * as https from 'https';
import { URL } from 'url';
import { GatewayProxyDto } from './dto/gateway-proxy.dto';

@Injectable()
export class GatewayProxyService {
  private readonly logger = new Logger(GatewayProxyService.name);

  /**
   * 使用原生 http/https 模块发送请求，完全控制请求头
   */
  private async sendRequestWithNativeHttp(
    url: string,
    jsonBody: string,
    headers: Record<string, string>,
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const parsedUrl = new URL(url);
      const isHttps = parsedUrl.protocol === 'https:';
      const httpModule = isHttps ? https : http;
      const agent = isHttps
        ? new https.Agent({ keepAlive: false })
        : new http.Agent({ keepAlive: false });

      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (isHttps ? 443 : 80),
        path: parsedUrl.pathname + parsedUrl.search,
        method: 'POST',
        headers: {
          ...headers,
          'Content-Length': Buffer.byteLength(jsonBody, 'utf8'),
          Connection: 'close',
          'Accept-Encoding': 'identity',
        },
        timeout: 120000,
        agent,
        // 容忍上游返回的非标准响应头（例如同时包含 Content-Length 与 Transfer-Encoding）
        insecureHTTPParser: true,
      };

      const req = httpModule.request(options, (res) => {
        let responseBody = '';

        res.on('data', (chunk) => {
          responseBody += chunk;
        });

        res.on('end', () => {
          try {
            const jsonResponse = JSON.parse(responseBody);
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(jsonResponse);
            } else {
              reject({
                statusCode: res.statusCode,
                message: jsonResponse.error?.message || 'Request failed',
                data: jsonResponse,
              });
            }
          } catch (error) {
            reject({
              statusCode: res.statusCode || 500,
              message: 'Failed to parse response',
              data: responseBody,
            });
          }
        });
      });

      req.on('error', (error) => {
        reject({
          statusCode: 500,
          message: error.message,
          error: error,
        });
      });

      req.on('timeout', () => {
        req.destroy();
        reject({
          statusCode: 408,
          message: 'Request timeout',
        });
      });

      req.write(jsonBody);
      req.end();
    });
  }

  async proxyToGateway(dto: GatewayProxyDto): Promise<any> {
    try {
      // 构建请求体
      const requestBody: any = {
        model: dto.model,
        messages: dto.messages,
      };

      // 如果提供了系统提示词，添加到 messages 数组的开头
      if (dto.systemPrompt) {
        requestBody.messages = [
          {
            role: 'system',
            content: dto.systemPrompt,
          },
          ...dto.messages,
        ];
      }

      // 将请求体转换为 JSON 字符串
      const jsonBody = JSON.stringify(requestBody);
      const bodyLength = Buffer.byteLength(jsonBody, 'utf8');

      // 设置请求头，包含 Portkey 配置
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-portkey-config': JSON.stringify(dto.portkeyConfig),
      };

      this.logger.log(`Proxying request to: ${dto.gatewayUrl}`);
      this.logger.debug(`Request body size: ${bodyLength} bytes`);

      // 使用原生 http/https 模块发送请求，避免 axios 自动添加冲突的头
      const response = await this.sendRequestWithNativeHttp(
        dto.gatewayUrl,
        jsonBody,
        headers,
      );

      this.logger.log('Gateway response received successfully');

      return response;
    } catch (error) {
      this.logger.error('Gateway proxy error:', error);

      // 处理我们自己的原生 HTTP 错误
      if (error && typeof error === 'object' && 'statusCode' in error) {
        const status =
          (error as any).statusCode || HttpStatus.INTERNAL_SERVER_ERROR;
        const message = (error as any).message || 'Gateway request failed';

        throw new HttpException(
          {
            statusCode: status,
            message,
            error: (error as any).data || 'Gateway Error',
            gatewayUrl: dto.gatewayUrl,
          },
          status,
        );
      }

      // 处理其他未知错误
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: (error as any)?.message || 'Internal server error',
          error: 'Gateway Proxy Error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
