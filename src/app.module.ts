import { SuperAuthorizeModule } from './../libs/src/super-authorize/super-authorize.module';
import { SuperCoreModule } from 'libs/src/super-core/super-core.module';
import { RoutersModule } from './routers/routers.module';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from './common/common.module';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { SeedsModule } from './packages/seeds/seeds.module';
import { appSettings } from './configs/app-settings';
import { AuditsModule } from './packages/audits/audits.module';
import { MultipleLanguageModule } from '@libs/super-multiple-language/multiple-language.module';
import { SuperCacheModule } from '@libs/super-cache/super-cache.module';
import { CorsMiddleware } from './apis/middlewares/cors.middleware';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        MongooseModule.forRootAsync({
            useFactory: async () => ({
                uri: appSettings.mongoose.uri,
            }),
        }),
        EventEmitterModule.forRoot(),
        ScheduleModule.forRoot(),
        RoutersModule.forRoot(),
        SuperCoreModule,
        CommonModule,
        MultipleLanguageModule,
        AuditsModule,
        SuperAuthorizeModule.forRoot({
            paths: ['admin', 'front'],
            jwt: {
                secret: appSettings.jwt.secret,
                issuer: appSettings.jwt.issuer,
                expiresIn: appSettings.jwt.expireIn,
            },
        }),
        SuperCacheModule.forRoot({
            redis: {
                host: appSettings.redis.host,
                port: appSettings.redis.port,
                username: appSettings.redis.username,
                password: appSettings.redis.password,
            },
        }),
        SeedsModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(CorsMiddleware).forRoutes('*');
    }
}
