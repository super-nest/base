import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/base/service/base.service';
import { COLLECTION_NAMES } from 'src/constants';
import { ExtendedInjectModel } from '@libs/super-core';
import { ExtendedModel } from '@libs/super-core/interfaces/extended-model.interface';
import { UserWheelTicketDocument } from './entities/user-wheel-ticket.entity';
import { CreateUserWheelTicketDto } from './dto/create-user-wheel-ticket.dto';
import dayjs from 'dayjs';
import { WheelsService } from '../wheels/wheels.service';
import { UserPayload } from 'src/base/models/user-payload.model';
import { UserService } from '../users/user.service';
import {
    UserTransactionAction,
    UserTransactionType,
} from '../user-transaction/constants';

@Injectable()
export class UserWheelTicketsService extends BaseService<UserWheelTicketDocument> {
    constructor(
        @ExtendedInjectModel(COLLECTION_NAMES.USER_WHEEL_TICKET)
        private readonly userWheelTicketsModel: ExtendedModel<UserWheelTicketDocument>,
        private readonly WheelService: WheelsService,
        private readonly userService: UserService,
    ) {
        super(userWheelTicketsModel);
    }

    async createTicket(
        createUserWheelTicketDto: CreateUserWheelTicketDto,
        user: UserPayload,
    ) {
        const { _id } = user;
        const startOfDay = dayjs().startOf('day');
        const timestamp = startOfDay.unix();

        const wheel = await this.WheelService.getWheel(user);

        const countTicketToday =
            await this.userWheelTicketsModel.countDocuments({
                createdBy: _id,
                createdAt: { $gte: timestamp },
            });
        if (countTicketToday > wheel.limit) {
            throw new Error(
                'The number of tickets you can buy today has been set to the maximum',
            );
        }

        await this.userService.createUserTransaction(
            _id,
            UserTransactionType.SUB,
            5,
            COLLECTION_NAMES.USER_WHEEL_TICKET,
            null,
            UserTransactionAction.BUY_TICKET,
            null,
        );

        const result = await this.userWheelTicketsModel.create({
            ...createUserWheelTicketDto,
            createdBy: _id,
        });
        return result;
    }
}
