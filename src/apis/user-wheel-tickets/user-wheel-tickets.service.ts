import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/base/service/base.service';
import { COLLECTION_NAMES } from 'src/constants';
import { ExtendedInjectModel } from '@libs/super-core';
import { ExtendedModel } from '@libs/super-core/interfaces/extended-model.interface';
import { UserWheelTicketDocument } from './entities/user-wheel-ticket.entity';

@Injectable()
export class UserWheelTicketsService extends BaseService<UserWheelTicketDocument> {
    constructor(
        @ExtendedInjectModel(COLLECTION_NAMES.USER_WHEEL_TICKET)
        private readonly userWheelTicketsModel: ExtendedModel<UserWheelTicketDocument>,
    ) {
        super(userWheelTicketsModel);
    }
}
