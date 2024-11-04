import { BadRequestException, Injectable } from '@nestjs/common';
import { BaseService } from 'src/base/service/base.service';
import { WheelDocument, WheelPrize } from './entities/wheels.entity';
import { COLLECTION_NAMES } from 'src/constants';
import { UpdateWheelsDto } from './dto/update-wheels.dto';
import { CreateWheelsDto } from './dto/create-wheels.dto';
import { Types } from 'mongoose';
import { UserPayload } from 'src/base/models/user-payload.model';
import { TelegramBotDocument } from '../telegram-bot/entities/telegram-bot.entity';
import { UserService } from '../users/user.service';
import { TelegramBotService } from '../telegram-bot/telegram-bot.service';
import { UserWheelsService } from '../user-wheels/user-wheels.service';
import { ExtendedInjectModel } from '@libs/super-core';
import { ExtendedModel } from '@libs/super-core/interfaces/extended-model.interface';
import { checkRatePrizeEnough } from './common/check-rate-prize-enough.utils';
import {
    UserTransactionAction,
    UserTransactionType,
} from '../user-transaction/constants';
import { UserWheelTicketsService } from '../user-wheel-tickets/user-wheel-tickets.service';
import dayjs from 'dayjs';
import { TicketStatus } from '../user-wheel-tickets/constant';

@Injectable()
export class WheelsService extends BaseService<WheelDocument> {
    constructor(
        @ExtendedInjectModel(COLLECTION_NAMES.WHEEL)
        private readonly wheelsModel: ExtendedModel<WheelDocument>,
        private readonly userService: UserService,
        private readonly telegramBotService: TelegramBotService,
        private readonly userWheelsService: UserWheelsService,
        private readonly userWheelTicketsService: UserWheelTicketsService,
    ) {
        super(wheelsModel);
    }

    async getWheel(user: UserPayload) {
        const { _id: userId } = user;

        const wheels = await this.wheelsModel.find({}).limit(1).select({
            'prizes.rate': 0,
        });

        if (!wheels.length) {
            throw new BadRequestException('Not found any wheel');
        }

        const [wheel] = wheels;

        return {
            ...wheel,
            freeDaily: await this.userWheelsService.findFreeDaily(
                userId,
                wheel.freeDaily,
            ),
        };
    }

    async getTicket(user: UserPayload) {
        const result = await this.userWheelTicketsService.model.countDocuments({
            createdBy: new Types.ObjectId(user._id),
            status: TicketStatus.NEW,
        });
        return result;
    }

    async play(user: UserPayload) {
        const { _id: userId } = user;
        const ticket = await this.userWheelTicketsService.model.findOne({
            createdBy: userId,
            status: TicketStatus.NEW,
        });
        console.log('find ticket', ticket);
        if (!ticket) {
            throw new BadRequestException('Not found ticket');
        }
        const result =
            await this.userWheelTicketsService.model.findOneAndUpdate(
                { _id: ticket._id },
                { status: TicketStatus.USED },
            );
        if (!result) {
            throw new Error('Failed to update ticket');
        }
        const count = await this.userWheelTicketsService.model.countDocuments({
            createdBy: userId,
            status: TicketStatus.NEW,
        });

        return count;
    }

    async createOne(
        createWheelsDto: CreateWheelsDto,
        userPayload: UserPayload,
        options?: Record<string, any>,
    ) {
        const { _id: userId } = userPayload;
        const { prizes } = createWheelsDto;

        checkRatePrizeEnough(prizes);

        const result = await this.wheelsModel.create({
            ...createWheelsDto,
            ...options,
            createdBy: userId,
        });
        return result;
    }

    async updateOneById(
        _id: Types.ObjectId,
        updateWheelsDto: UpdateWheelsDto,
        user: UserPayload,
        options?: Record<string, any>,
    ) {
        const { _id: userId } = user;
        const { prizes } = updateWheelsDto;

        checkRatePrizeEnough(prizes);

        const result = await this.wheelsModel.findOneAndUpdate(
            { _id },
            { ...updateWheelsDto, ...options, updatedBy: userId },
        );

        if (!result) {
            throw new BadRequestException(`Not found ${_id}`);
        }

        return result;
    }

    async addPrizeForUser(
        userId: Types.ObjectId,
        telegramBot: TelegramBotDocument,
        wheelId: Types.ObjectId,
        prize: number,
    ) {
        const user = await this.userService.model.findOne({ _id: userId });

        if (!user) {
            throw new BadRequestException('Not found user');
        }

        const { currentPoint, telegramUserId } = user;
        const { _id: telegramBotId } = telegramBot || {};
        const after = currentPoint + prize;

        // await this.userService.createUserTransaction(
        //     userId,
        //     telegramUserId,
        //     UserTransactionType.SUM,
        //     prize,
        //     currentPoint,
        //     after,
        //     COLLECTION_NAMES.WHEEL,
        //     wheelId,
        //     telegramBotId,
        //     UserTransactionAction.WHEEL,
        // );

        return prize;
    }

    async buyTicket(userPayload: UserPayload, origin: string) {
        const user = await this.userService.model.findOne({
            _id: userPayload._id,
        });
        const wheel = await this.getWheel(userPayload);

        if (!user) {
            throw new BadRequestException('Not found user');
        }

        const { currentPoint } = user;

        const after = currentPoint - wheel.fee;
        if (after < 0) {
            throw new BadRequestException('Not enough point');
        }

        const now = dayjs();
        const startDay = now.startOf('day').toDate();
        const endDay = now.endOf('day').toDate();
        const countTicketToday =
            await this.userWheelTicketsService.model.countDocuments({
                createdBy: userPayload._id,
                createdAt: {
                    $gte: startDay,
                    $lte: endDay,
                },
            });
        if (countTicketToday > wheel.limit) {
            throw new BadRequestException(
                `You can only buy tickets ${wheel.limit} times a day`,
            );
        }

        const result = await this.userWheelTicketsService.model.create({
            status: TicketStatus.NEW,
            createdBy: userPayload._id,
        });

        await this.userService.createUserTransaction(
            userPayload._id,
            UserTransactionType.SUB,
            wheel.fee,
            COLLECTION_NAMES.USER_WHEEL_TICKET,
            result.id,
            UserTransactionAction.BUY_TICKET,
            null,
        );
    }
}
