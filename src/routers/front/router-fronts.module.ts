import { Module } from '@nestjs/common';
import { UserModule } from 'src/apis/users/user.module';
import { CommonModule } from 'src/common/common.module';
import { AuthModule } from 'src/apis/auth/auth.module';
import { AuthController } from 'src/apis/auth/controllers/auth.controller';
import { UserController } from 'src/apis/users/controllers/user.controller';

@Module({
    imports: [
        CommonModule,
        UserModule,
        AuthModule,
    ],
    controllers: [
        UserController,
        AuthController,
    ],
    providers: [],
})
export class RouterFrontsModule {}
