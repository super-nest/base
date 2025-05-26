import { LocalStrategy } from 'src/strategies/local.strategy';
import { UserModule } from '../users/user.module';
import { AuthService } from './auth.service';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { appSettings } from 'src/configs/app-settings';
import { RolesModule } from '@libs/super-authorize/modules/roles/roles.module';
import { GoogleStrategy } from './google.strategy';

@Module({
    imports: [
        JwtModule.register({
            secret: appSettings.jwt.secret,
            signOptions: {
                expiresIn: appSettings.jwt.expireIn,
                issuer: appSettings.jwt.issuer,
            },
        }),
        UserModule,
        RolesModule,
    ],
    controllers: [],
    providers: [AuthService, LocalStrategy, GoogleStrategy],
    exports: [AuthService],
})
export class AuthModule {}
