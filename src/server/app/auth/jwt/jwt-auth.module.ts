import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthService } from './jwt-auth.service';
import { JwtAuthStrategy } from './jwt-auth.strategy';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => {
        return {
          secret: configService.get<string>('JWT_SECRET'),
          signOptions: {
            expiresIn: configService.get<string>('JWT_EXPIRES_IN'),
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [
    JwtAuthService,
    {
      provide: JwtAuthStrategy,
      useFactory: async (configService: ConfigService) => {
        return new JwtAuthStrategy(configService);
      },
      inject: [ConfigService],
    },
  ],
  exports: [JwtModule, JwtAuthService],
})
export class JwtAuthModule {}
