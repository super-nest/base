import { Controller, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { COLLECTION_NAMES } from 'src/constants';
import {
    PagingDtoPipe,
    ExtendedPagingDto,
} from 'src/pipes/page-result.dto.pipe';
import { AuditLog } from 'src/packages/audits/decorators/audits.decorator';
import { AUDIT_EVENT } from 'src/packages/audits/constants';
import { SuperGet } from '@libs/super-core/decorators/super-get.decorator';
import { SuperAuthorize } from '@libs/super-authorize/decorators/authorize.decorator';
import { PERMISSION, Resource } from '@libs/super-authorize';
import { UserWheelTicketsService } from '../user-wheel-tickets.service';
import { TicketStatus } from '../constant';

@Controller('user-wheel-tickets')
@Resource('user-wheel-tickets')
@ApiTags('Admin: User Wheel Tickets')
@AuditLog({
    events: [AUDIT_EVENT.POST, AUDIT_EVENT.PUT, AUDIT_EVENT.DELETE],
    refSource: COLLECTION_NAMES.USER_WHEEL_TICKET,
})
export class UserWheelTicketsAminController {
    constructor(
        private readonly userWheelTicketsService: UserWheelTicketsService,
    ) {}

    @SuperGet()
    @SuperAuthorize(PERMISSION.GET)
    async getAll(
        @Query(new PagingDtoPipe())
        queryParams: ExtendedPagingDto,
    ) {
        const result = await this.userWheelTicketsService.getAll(queryParams, {
            status: TicketStatus.NEW,
        });
        return result;
    }
}
