import { Body, Controller } from '@nestjs/common';
import { appSettings } from 'src/configs/app-settings';
import { ApiTags } from '@nestjs/swagger';
import { AuditLog } from 'src/packages/audits/decorators/audits.decorator';
import { AUDIT_EVENT } from 'src/packages/audits/constants';
import { COLLECTION_NAMES } from 'src/constants';
import { UserServiceDev } from './user.service.dev';
import { PERMISSION, Resource, SuperAuthorize } from '@libs/super-authorize';
import { TruncateAllInfoUserDto } from './dto/truncate-all-info-user.dto';
import { SuperPost } from '@libs/super-core';

@Controller('users')
@Resource('users')
@ApiTags('Admin: User')
@AuditLog({
    events: [AUDIT_EVENT.POST, AUDIT_EVENT.PUT, AUDIT_EVENT.DELETE],
    refSource: COLLECTION_NAMES.USER,
})
class _UserControllerAdminDevExport {
    constructor(private readonly userServiceDev: UserServiceDev) {}

    @SuperPost({
        route: 'dev-only-route/truncate-all-info-user',
        dto: TruncateAllInfoUserDto,
    })
    @SuperAuthorize(PERMISSION.POST)
    async truncateAllInfoUser(
        @Body() truncateAllInfoUserDto: TruncateAllInfoUserDto,
    ) {
        return await this.userServiceDev.truncateAllInfoUser(
            truncateAllInfoUserDto,
        );
    }
}

@Controller()
class __UserControllerAdminDevExport {}

export const UserControllerAdminDev = appSettings.development
    ? _UserControllerAdminDevExport
    : __UserControllerAdminDevExport;
