import { BadRequestException, Injectable } from '@nestjs/common';
import { BaseService } from 'src/base/service/base.service';
import { WheelDocument, WheelPrize } from './entities/wheels.entity';
import { COLLECTION_NAMES } from 'src/constants';
import { Types } from 'mongoose';
import { UserPayload } from 'src/base/models/user-payload.model';
import { UserService } from '../users/user.service';
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
import { populateGroupPrizeAggregate } from './common/populate-group-wheel.aggregate';
import { WheelPrizeCategory, WheelPrizeType } from './constants';
import { BuyTicketDto } from './dto/inputs/buy-ticket.dto';
import { ExtendedPagingDto } from 'src/pipes/page-result.dto.pipe';
import { pagination } from '@libs/super-search';
import { generateRandomString } from '../users/common/generate-random-string.util';
import { sleep } from 'src/utils/helper';
import { WebsocketGateway } from 'src/packages/websocket/websocket.gateway';

@Injectable()
export class WheelsService extends BaseService<WheelDocument> {
    constructor(
        @ExtendedInjectModel(COLLECTION_NAMES.WHEEL)
        private readonly wheelsModel: ExtendedModel<WheelDocument>,
        private readonly userService: UserService,
        private readonly userWheelsService: UserWheelsService,
        private readonly userWheelTicketsService: UserWheelTicketsService,
        private readonly websocketGateway: WebsocketGateway,
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

    async history(queryParams: ExtendedPagingDto, user: UserPayload) {
        const { page, limit, sortBy, sortDirection, skip, filterPipeline } =
            queryParams;

        const result = this.userWheelsService.model
            .find(
                {
                    createdBy: user._id,
                },
                [
                    {
                        $lookup: {
                            from: COLLECTION_NAMES.FILE,
                            localField: 'prize.image',
                            foreignField: '_id',
                            as: 'prize.image',
                        },
                    },
                    {
                        $unwind: {
                            path: '$prize.image',
                            preserveNullAndEmptyArrays: true,
                        },
                    },
                ],
            )
            .limit(limit)
            .skip(skip)
            .sort({ [sortBy]: sortDirection })
            .autoPopulate();

        const total = this.userWheelsService.model
            .countDocuments(
                {
                    createdBy: user._id,
                },
                filterPipeline,
            )
            .autoPopulate();

        return Promise.all([result, total]).then(([items, total]) => {
            const meta = pagination(items, page, limit, total);
            return {
                items: items.map((item) => {
                    return {
                        ...item,
                        ..._.get(item, 'prize', {}),
                        rate: null,
                    };
                }),
                meta,
            };
        });
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
            const {
                prizes,
                coolDownTime = 0,
                coolDownValue,
                ticketPrizeShare,
                ticketPrize,
            } = wheel;
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

            const { prize, type, category } = selectedPrize;

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
                await this.addPrizeForUser(
                    user._id,
                    origin,
                    result._id,
                    prize,
                    UserTransactionAction.WHEEL,
                );
            }

            if (type === WheelPrizeType.TON) {
                userWheelTicketId = result._id;
                await this.addPrizeForUser(
                    user._id,
                    origin,
                    result._id,
                    prize,
                    UserTransactionAction.DRAFT_TON,
                );
            }

            if (type === WheelPrizeType.TICKET) {
                for (let i = 0; i < ticketPrize; i++) {
                    this.addPrizeTypeTicketForUser(user);
                }

                const inviteCode = generateRandomString(16);
                for (let i = 0; i < ticketPrizeShare; i++) {
                    await this.userWheelTicketsService.model.create({
                        status: TicketStatus.PENDING,
                        type: TicketType.REFERRAL,
                        inviteCode,
                        referrer: user._id,
                    });
                }

                return {
                    ...selectedPrize,
                    indexSelectedPrize,
                    inviteCode,
                    rate: null,
                };
            }

            if (
                [
                    WheelPrizeCategory.JACKPOT,
                    WheelPrizeCategory.SUPER_JACKPOT,
                ].includes(category)
            ) {
                const now = dayjs().unix();
                if (coolDownTime + coolDownValue * 3600 > now) {
                    return await this.play(wheel, ticket, user, origin);
                }

                await this.wheelsModel.findOneAndUpdate(
                    { _id: wheel._id },
                    {
                        coolDownTime: now,
                    },
                );
            }

            await this.userWheelsService.model.create({
                prize: {
                    ...selectedPrize,
                    image: _.get(selectedPrize, 'image._id', null),
                },
                createdBy: user._id,
            });
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

    async addPrizeTypeTicketForUser(user: UserPayload) {
        await sleep(6000);

        await this.userWheelTicketsService.model.create({
            status: TicketStatus.NEW,
            type: TicketType.SPIN,
            createdBy: user._id,
        });
        const tickets = await this.getTicket(user);
        this.websocketGateway.sendTicketUpdate(user._id, tickets);
    }

    async addPrizeForUser(
        userId: Types.ObjectId,
        origin: string,
        wheelId: Types.ObjectId,
        prize: number,
        userTransactionAction: UserTransactionAction,
    ) {
        await this.userService.createUserTransaction(
            userId,
            UserTransactionType.SUM,
            prize,
            userTransactionAction,
            origin,
            COLLECTION_NAMES.USER_WHEEL_TICKET,
            wheelId,
            6000,
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
            const userTransaction =
                await this.userService.createUserTransaction(
                    userPayload._id,
                    UserTransactionType.SUB,
                    wheel.fee,
                    UserTransactionAction.BUY_TICKET,
                    origin,
                );

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

    async referral(inviteCode: string, userPayload: UserPayload) {
        const exist = await this.userWheelTicketsService.model.findOne({
            type: TicketType.REFERRAL,
            createdBy: userPayload._id,
        });

        if (exist) {
            throw new BadRequestException('You already have referral ticket');
        }

        const ticket = await this.userWheelTicketsService.model.findOne({
            inviteCode,
            status: TicketStatus.PENDING,
            referrer: {
                $ne: userPayload._id,
            },
        });

        if (!ticket) {
            throw new BadRequestException('Not found any referral ticket');
        }

        await this.userWheelTicketsService.model.findOneAndUpdate(
            { _id: ticket._id },
            { status: TicketStatus.NEW, createdBy: userPayload._id },
        );

        return await this.getTicket(userPayload);
    }
}
