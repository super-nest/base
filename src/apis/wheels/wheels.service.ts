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

@Injectable()
export class WheelsService extends BaseService<WheelDocument> {
    constructor(
        @ExtendedInjectModel(COLLECTION_NAMES.WHEEL)
        private readonly wheelsModel: ExtendedModel<WheelDocument>,
        private readonly userService: UserService,
        private readonly telegramBotService: TelegramBotService,
        private readonly userWheelsService: UserWheelsService,
    ) {
        super(wheelsModel);
    }

    async getWheel(user: UserPayload) {
        const wheels = await this.wheelsModel.find({}).limit(1).select({
            'prizes.rate': 0,
        });

        if (!wheels.length) {
            throw new BadRequestException('Not found any wheel');
        }

        const [wheel] = wheels;

        return wheel;
    }

    async play(user: UserPayload, origin: string) {
        const { _id: userId } = user;
        const telegramBot = await this.telegramBotService.findByDomain(origin);

        const wheels = await this.wheelsModel.find({}).limit(1);

        const [wheel] = wheels;

        if (!wheel) {
            throw new BadRequestException('Not found any wheel');
        }

        await this.buyTicket(userId, wheel, telegramBot);

        const { prizes } = wheel;
        const totalRate = prizes.reduce((sum, prize) => sum + prize.rate, 0);
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

        const { prize } = selectedPrize;

        await this.addPrizeForUser(userId, telegramBot, wheel._id, prize);
        return { ...selectedPrize, indexSelectedPrize, rate: null };
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

    async buyTicket(
        userId: Types.ObjectId,
        wheel: WheelDocument,
        telegramBot: TelegramBotDocument,
    ) {
        const user = await this.userService.model.findOne({ _id: userId });

        if (!user) {
            throw new BadRequestException('Not found user');
        }

        const { currentPoint, telegramUserId } = user;
        const { _id: telegramBotId } = telegramBot || {};

        const after = currentPoint - wheel.fee;
        if (after < 0) {
            throw new BadRequestException('Not enough point');
        }

        // await this.userService.createUserTransaction(
        //     userId,
        //     telegramUserId,
        //     UserTransactionType.SUB,
        //     wheel.fee,
        //     currentPoint,
        //     after,
        //     COLLECTION_NAMES.WHEEL,
        //     wheel._id,
        //     telegramBotId,
        //     UserTransactionAction.WHEELS,
        // );

        await this.userWheelsService.model.create({
            createdBy: new Types.ObjectId(userId),
            wheel: new Types.ObjectId(wheel._id),
        });
    }
}
