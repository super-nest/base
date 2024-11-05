import { Body, Controller, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserPayload } from 'src/base/models/user-payload.model';
import { COLLECTION_NAMES } from 'src/constants';
import { AuditLog } from 'src/packages/audits/decorators/audits.decorator';
import { AUDIT_EVENT } from 'src/packages/audits/constants';
import { UpdateMeDto } from '../dto/inputs/update-me.dto';
import { UserService } from '../user.service';
import { MetadataType } from 'src/apis/metadata/constants';
import { SuperPut } from '@libs/super-core/decorators/super-put.decorator';
import { SuperGet } from '@libs/super-core/decorators/super-get.decorator';
import { SuperAuthorize } from '@libs/super-authorize/decorators/authorize.decorator';
import { PERMISSION, Resource } from '@libs/super-authorize';
import { Me } from 'src/decorators/me.decorator';
import { ResultUserDto } from '../dto/outputs/result-user.dto';

@Controller('users')
@Resource('users')
@ApiTags('Front: User')
@AuditLog({
    events: [AUDIT_EVENT.POST, AUDIT_EVENT.PUT, AUDIT_EVENT.DELETE],
    refSource: COLLECTION_NAMES.FILE,
})
export class UserController {
    constructor(private readonly userService: UserService) {}

    @SuperGet({ route: 'me', output: ResultUserDto })
    @SuperAuthorize(PERMISSION.GET)
    async getMe(@Me() user: UserPayload) {
        const result = await this.userService.getMeForFront(user);
        return result;
    }

    @SuperPut({ route: 'me', dto: UpdateMeDto })
    @SuperAuthorize(PERMISSION.PUT)
    async updateMe(@Body() updateMeDto: UpdateMeDto, @Me() user: UserPayload) {
        return this.userService.updateMe(user, updateMeDto);
    }

    @SuperGet({ route: 'history-reward/:type' })
    @SuperAuthorize(PERMISSION.GET)
    async getHistoryReward(
        @Param('type') type: MetadataType,
        @Me() user: UserPayload,
    ) {
        return this.userService.getHistoryReward(user, type);
    }
}
