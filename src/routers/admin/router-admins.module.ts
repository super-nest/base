import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { UserControllerAdmin } from 'src/apis/users/controllers/user.controller.admin';
import { AuthModule } from 'src/apis/auth/auth.module';
import { AuthControllerAdmin } from 'src/apis/auth/controllers/auth.controller.admin';
import { UserModule } from 'src/apis/users/user.module';
import { CommonModule } from 'src/common/common.module';

@Module({
    imports: [
        ScheduleModule.forRoot(),
        CommonModule,
        UserModule,
        AuthModule,
    ],
    controllers: [
        AuthControllerAdmin,
        UserControllerAdmin,
    ],
    providers: [],
})
export class RouterAdminsModule {}
