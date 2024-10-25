import { SuperCacheService } from './super-cache.service';
import { DynamicModule, Global, Module } from '@nestjs/common';
import { CacheModuleConfig } from './configs/cache-module.config';
import { SuperCacheEvent } from './event-handlers/super-cache.event';
import { SuperCacheController } from './super-cache.controller';

export interface SuperCacheModuleOptions {
    redis?: {
        host: string;
        port: number;
        username: string;
        password: string;
    };
}

@Global()
@Module({})
export class SuperCacheModule {
    static forRoot(options: SuperCacheModuleOptions): DynamicModule {
        return {
            module: SuperCacheModule,
            imports: [CacheModuleConfig.registerAsync(options)],
            providers: [SuperCacheService, SuperCacheEvent],
            exports: [SuperCacheService],
            controllers: [SuperCacheController],
        };
    }
}
