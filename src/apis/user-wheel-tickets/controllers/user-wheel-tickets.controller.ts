import { Body, Controller, Param, Query } from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { Types } from 'mongoose';
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
import { UserPayload } from 'src/base/models/user-payload.model';
import { Me } from 'src/decorators/me.decorator';
import { UserWheelTicketsService } from '../user-wheel-tickets.service';
import { CreateUserWheelTicketDto } from '../dto/create-user-wheel-ticket.dto';
import { TicketStatus } from '../constant';
import { SuperPost, SuperPut } from '@libs/super-core';
import { UpdateUserWheelTicketDto } from '../dto/update-user-wheel-ticket.dto';
import { ParseObjectIdPipe } from 'src/pipes/parse-object-id.pipe';

@Controller('user-wheel-tickets')
@Resource('user-wheel-tickets')
@ApiTags('Front: User Wheel Tickets')
@AuditLog({
    events: [AUDIT_EVENT.POST, AUDIT_EVENT.PUT, AUDIT_EVENT.DELETE],
    refSource: COLLECTION_NAMES.USER_WHEEL_TICKET,
})
export class UserWheelTicketsController {
    constructor(
        private readonly userWheelTicketsService: UserWheelTicketsService,
    ) {}

    @SuperGet()
    @SuperAuthorize(PERMISSION.GET)
    async getAll(
        @Query(new PagingDtoPipe())
        queryParams: ExtendedPagingDto,
        @Me() user: UserPayload,
    ) {
        const result = await this.userWheelTicketsService.getAll(queryParams, {
            createdBy: new Types.ObjectId(user._id),
            status: TicketStatus.NEW,
        });
        return result;
    }

    @SuperPost({ dto: CreateUserWheelTicketDto })
    @SuperAuthorize(PERMISSION.POST)
    async create(
        @Body() createUserWheelTicketDto: CreateUserWheelTicketDto,
        @Me() user: UserPayload,
    ) {
        const result = await this.userWheelTicketsService.createTicket(
            createUserWheelTicketDto,
            user,
        );
        return result;
    }

    @SuperPut({ route: ':id', dto: UpdateUserWheelTicketDto })
    @SuperAuthorize(PERMISSION.PUT)
    @ApiParam({ name: 'id', type: String })
    async update(
        @Param('id', ParseObjectIdPipe) _id: Types.ObjectId,
        @Body() updateUserWheelTicketDto: UpdateUserWheelTicketDto,
        @Me() user: UserPayload,
    ) {
        const result = await this.userWheelTicketsService.updateOneById(
            _id,
            updateUserWheelTicketDto,
            user,
        );
        return result;
    }
}
