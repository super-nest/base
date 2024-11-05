import { Controller, Req } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { WheelsService } from '../wheels.service';
import { UserPayload } from 'src/base/models/user-payload.model';
import { PERMISSION, Resource, SuperAuthorize } from '@libs/super-authorize';
import { SuperPost, SuperGet } from '@libs/super-core';
import { AuditLog } from 'src/packages/audits/decorators/audits.decorator';
import { AUDIT_EVENT } from 'src/packages/audits/constants';
import { COLLECTION_NAMES } from 'src/constants';
import { Me } from 'src/decorators/me.decorator';
import { CountTicketResponseDTO } from '../dto/outputs/cout-ticket-response.dto';
import { GetWheelResponseDTO } from '../dto/outputs/get-wheel-resonse.dto';

@Controller('wheels')
@Resource('wheels')
@ApiTags('Front: Wheels')
@AuditLog({
    events: [AUDIT_EVENT.POST, AUDIT_EVENT.PUT, AUDIT_EVENT.DELETE],
    refSource: COLLECTION_NAMES.WHEEL,
})
export class WheelsController {
    constructor(private readonly wheelsService: WheelsService) {}

    @SuperGet({ output: GetWheelResponseDTO })
    @SuperAuthorize(PERMISSION.GET)
    async getScratch(@Me() user: UserPayload) {
        return await this.wheelsService.getWheel(user);
    }

    @SuperGet({ route: 'count-ticket', output: CountTicketResponseDTO })
    @SuperAuthorize(PERMISSION.GET)
    async countTicket(@Me() user: UserPayload) {
        return await this.wheelsService.getTicket(user);
    }

    @SuperPost({ route: 'buy-ticket' })
    @SuperAuthorize(PERMISSION.POST)
    async buyTicket(
        @Req() req: { headers: Record<string, string> },
        @Me() user: UserPayload,
    ) {
        const origin = req.headers['origin'];
        return await this.wheelsService.buyTicket(user, origin);
    }

    @SuperPost({ route: 'play' })
    @SuperAuthorize(PERMISSION.POST)
    async play(
        @Req() req: { headers: Record<string, string> },
        @Me() user: UserPayload,
    ) {
        const origin = req.headers['origin'];

        return await this.wheelsService.play(user, origin);
    }
}
