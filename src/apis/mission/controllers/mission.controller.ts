import { PERMISSION, Resource, SuperAuthorize } from '@libs/super-authorize';
import { Controller, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { MissionService } from '../mission.service';
import { SuperGet, SuperPut } from '@libs/super-core';
import { UserPayload } from 'src/base/models/user-payload.model';
import { ParseObjectIdPipe } from 'src/pipes/parse-object-id.pipe';
import { Types } from 'mongoose';
import {
    ActionType,
    ESocialMedia,
} from 'src/apis/user-app-histories/constants';
import { Me } from 'src/decorators/me.decorator';

@Controller('mission')
@Resource('mission')
@ApiTags('Front: Mission')
export class MissionController {
    constructor(private readonly missionService: MissionService) {}

    @SuperGet()
    @ApiBearerAuth()
    @SuperAuthorize(PERMISSION.GET)
    async getMission(@Me() user: UserPayload) {
        return await this.missionService.getMission(user);
    }

    @SuperPut({ route: 'verify-app/:appId/:action' })
    @SuperAuthorize(PERMISSION.PUT)
    @ApiParam({ name: 'appId', type: String })
    @ApiParam({ name: 'action', enum: ActionType })
    async addPointForUser(
        @Param('appId', ParseObjectIdPipe) appId: Types.ObjectId,
        @Param('action') action: ActionType,
        @Me() user: UserPayload,
    ) {
        const result = await this.missionService.updateProgressActionApp(
            appId,
            user,
            action,
        );
        return result;
    }

    @SuperPut({ route: 'verify-social/:social' })
    @SuperAuthorize(PERMISSION.PUT)
    @ApiParam({ name: 'social', enum: ESocialMedia })
    async updateSocialMedia(
        @Param('social') social: ESocialMedia,
        @Me() user: UserPayload,
    ) {
        const result = await this.missionService.updateProgressSocial(
            user,
            social,
        );
        return result;
    }

    @SuperPut({ route: 'claim/:missionId' })
    @SuperAuthorize(PERMISSION.PUT)
    @ApiParam({ name: 'missionId', type: String })
    async claimMission(
        @Param('missionId') missionId: string,
        @Me() user: UserPayload,
    ) {
        const result = await this.missionService.claimMission(missionId, user);
        return result;
    }
}
