import { Body, Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserPayload } from 'src/base/models/user-payload.model';
import { COLLECTION_NAMES } from 'src/constants';
import { AuditLog } from 'src/packages/audits/decorators/audits.decorator';
import { AUDIT_EVENT } from 'src/packages/audits/constants';
import { UpdateMeDto } from '../dto/update-me.dto';
import { UserService } from '../user.service';
import { PERMISSION, Resource, SuperAuthorize } from '@libs/super-authorize';
import { SuperGet, SuperPut } from '@libs/super-core';
import { Me } from 'src/decorators/me.decorator';

@Controller('users')
@Resource('users')
@ApiTags('Front: User')
@AuditLog({
    events: [AUDIT_EVENT.POST, AUDIT_EVENT.PUT, AUDIT_EVENT.DELETE],
    refSource: COLLECTION_NAMES.FILE,
})
export class UserController {
    constructor(private readonly userService: UserService) {}

    @SuperGet({ route: 'me' })
    @SuperAuthorize(PERMISSION.GET)
    async getMe(@Me() user: UserPayload) {
        const result = await this.userService.getMe(user);
        return result;
    }

    @SuperPut({ route: 'me', dto: UpdateMeDto })
    @SuperAuthorize(PERMISSION.PUT)
    async updateMe(@Body() updateMeDto: UpdateMeDto, @Me() user: UserPayload) {
        return this.userService.updateMe(user, updateMeDto);
    }
}
