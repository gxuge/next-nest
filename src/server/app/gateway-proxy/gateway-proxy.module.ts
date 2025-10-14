import { Module } from '@nestjs/common';
import { ModelScopeProxyController } from './modelscope-proxy.controller';
import { GatewayProxyService } from './gateway-proxy.service';

@Module({
  controllers: [ModelScopeProxyController],
  providers: [GatewayProxyService],
  exports: [GatewayProxyService],
})
export class GatewayProxyModule {}

