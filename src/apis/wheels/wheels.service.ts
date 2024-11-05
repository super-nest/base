import { BadRequestException, Injectable } from '@nestjs/common';
import { BaseService } from 'src/base/service/base.service';
import { WheelDocument, WheelPrize } from './entities/wheels.entity';
import { COLLECTION_NAMES } from 'src/constants';
import { Types } from 'mongoose';
import { UserPayload } from 'src/base/models/user-payload.model';
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
import { TicketStatus, TicketType } from '../user-wheel-tickets/constant';
import { CreateWheelsDto } from './dto/inputs/create-wheels.dto';
import { UpdateWheelsDto } from './dto/inputs/update-wheels.dto';
import { PlayWheelDTO } from './dto/inputs/play-wheel.dto';
import { UserWheelTicketDocument } from '../user-wheel-tickets/entities/user-wheel-ticket.entity';
import _ from 'lodash';
import { appSettings } from 'src/configs/app-settings';
import { populateGroupPrizeAggregate } from './common/populate-group.aggregate';
import { WheelPrizeType } from './constants';
import { BuyTicketDto } from './dto/inputs/buy-ticket.dto';

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

    async getOne(
        _id: Types.ObjectId,
        options?: Record<string, any>,
    ): Promise<any> {
        const result = await this.model
            .findOne(
                {
                    $or: [{ _id }, { slug: _id }],
                    ...options,
                },
                populateGroupPrizeAggregate,
            )
            .autoPopulate()
            .multipleLanguage(appSettings.mainLanguage);

        return result;
    }

    async getWheel(userPayload: UserPayload) {
        const wheels = await this.wheelsModel
            .find({}, populateGroupPrizeAggregate)
            .limit(1)
            .select({
                'prizes.rate': 0,
            });

        if (!wheels.length) {
            throw new BadRequestException('Not found any wheel');
        }

        const [wheel] = wheels;

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

        return { ...wheel, todayBuy: countTicketToday };
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
    async getTicket(user: UserPayload) {
        const result = await this.userWheelTicketsService.model.countDocuments({
            createdBy: new Types.ObjectId(user._id),
            status: TicketStatus.NEW,
        });
        return result;
    }

    async playWheels(
        playWheelDTO: PlayWheelDTO,
        user: UserPayload,
        origin: string,
    ) {
        const { _id: userId } = user;
        const { spinCount = 1 } = playWheelDTO || {};

        const wheels = await this.wheelsModel
            .find({}, populateGroupPrizeAggregate)
            .limit(1);
        const wheel = wheels[0];

        const tickets = await this.userWheelTicketsService.model
            .find({
                createdBy: userId,
                status: TicketStatus.NEW,
            })
            .limit(spinCount);

        if (!_.size(tickets) || _.size(tickets) < spinCount) {
            throw new BadRequestException(`Not enough ticket to play`);
        }

        const result = [];
        for (let i = 0; i < tickets.length; i++) {
            const currentTicket = tickets[i];
            const playResult = await this.play(
                wheel,
                currentTicket,
                user,
                origin,
            );
            result.push(playResult);
        }

        return result;
    }

    async play(
        wheel: WheelDocument,
        ticket: UserWheelTicketDocument,
        user: UserPayload,
        origin: string,
    ) {
        let userWheelTicketId: Types.ObjectId;
        try {
            const { prizes } = wheel;
            const totalRate = prizes.reduce((sum, prize) => {
                const currentSum = sum + prize.rate;
                return currentSum;
            }, 0);

            const randomValue = Math.random() * totalRate;

            let accumulatedRate = 0;
            let selectedPrize: WheelPrize | null = null;
            let indexSelectedPrize = 0;
            for (let i = 0; i < prizes.length; i++) {
                const prize = prizes[i];
                accumulatedRate += prize.rate;
                if (randomValue <= accumulatedRate) {
                    selectedPrize = prize;
                    indexSelectedPrize = i;
                    break;
                }
            }

            if (!selectedPrize) {
                throw new BadRequestException('Not found any prize');
            }

            const { prize, type } = selectedPrize;

            const result =
                await this.userWheelTicketsService.model.findOneAndUpdate(
                    { _id: ticket._id },
                    { status: TicketStatus.USED },
                );

            if (!result) {
                throw new Error('Failed to update ticket');
            }

            if (type === WheelPrizeType.GOLD) {
                userWheelTicketId = result._id;
                await this.addPrizeForUser(user._id, origin, result._id, prize);
            }

            if (type === WheelPrizeType.TON) {
            }

            if (type === WheelPrizeType.TICKET) {
                await this.userWheelTicketsService.model.create({
                    status: TicketStatus.NEW,
                    type: TicketType.SPIN,
                    createdBy: user._id,
                });
            }

            return { ...selectedPrize, indexSelectedPrize, rate: null };
        } catch (error) {
            if (userWheelTicketId) {
                await this.userWheelTicketsService.model.findOneAndUpdate(
                    { _id: userWheelTicketId },
                    { status: TicketStatus.NEW },
                );
            }
            throw error;
        }
    }

    async addPrizeForUser(
        userId: Types.ObjectId,
        origin: string,
        wheelId: Types.ObjectId,
        prize: number,
    ) {
        await this.userService.createUserTransaction(
            userId,
            UserTransactionType.SUM,
            prize,
            UserTransactionAction.WHEEL,
            null,
            COLLECTION_NAMES.USER_WHEEL_TICKET,
            wheelId,
        );

        return prize;
    }

    async buyTicket(
        buyTicketDto: BuyTicketDto,
        userPayload: UserPayload,
        origin: string,
    ) {
        const { quantity } = buyTicketDto;
        const user = await this.userService.model.findOne({
            _id: userPayload._id,
        });
        const wheel = await this.getWheel(userPayload);

        if (!user) {
            throw new BadRequestException('Not found user');
        }

        const userTransaction = await this.userService.createUserTransaction(
            userPayload._id,
            UserTransactionType.SUB,
            wheel.fee,
            UserTransactionAction.BUY_TICKET,
            origin,
        );

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

        if (countTicketToday + quantity > wheel.limit) {
            throw new BadRequestException(
                `You can only buy tickets ${wheel.limit} times a day`,
            );
        }

        for (let i = 0; i < quantity; i++) {
            const result = await this.userWheelTicketsService.model.create({
                status: TicketStatus.NEW,
                type: TicketType.BUY,
                createdBy: userPayload._id,
            });

            await this.userService.afterCreateUserTransaction(
                userTransaction,
                COLLECTION_NAMES.USER_WHEEL_TICKET,
                result._id,
            );
        }

        return await this.getTicket(userPayload);
    }
}
