import {
    BadRequestException,
    forwardRef,
    Inject,
    Injectable,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { COLLECTION_NAMES } from 'src/constants';
import { WebsocketGateway } from 'src/packages/websocket/websocket.gateway';
import { ExtendedPagingDto } from 'src/pipes/page-result.dto.pipe';
import { MetadataService } from '../metadata/metadata.service';
import {
    UserTransactionAction,
    UserTransactionType,
} from '../user-transaction/constants';
import { UserTransactionService } from '../user-transaction/user-transaction.service';
import { UserDocument } from '../users/entities/user.entity';
import { UserService } from '../users/user.service';
import { MissionService } from './../mission/mission.service';
import { UserReferralDocument } from './entities/user-referrals.entity';
import { ExtendedInjectModel } from '@libs/super-core';
import { BaseService } from 'src/base/service/base.service';
import { ExtendedModel } from '@libs/super-core/interfaces/extended-model.interface';

@Injectable()
export class UserReferralsService extends BaseService<UserReferralDocument> {
    constructor(
        @ExtendedInjectModel(COLLECTION_NAMES.USER_REFERRAL)
        private readonly userReferralModel: ExtendedModel<UserReferralDocument>,
        @Inject(forwardRef(() => UserService))
        private readonly userService: UserService,
        private readonly metadataService: MetadataService,
        private readonly userTransactionService: UserTransactionService,
        private readonly websocketGateway: WebsocketGateway,
        @Inject(forwardRef(() => MissionService))
        private readonly missionService: MissionService,
    ) {
        super(userReferralModel);
    }

    async getReferralFront(userId: Types.ObjectId, params: ExtendedPagingDto) {
        const user = await this.userService.model.findOne({ _id: userId });

        const referralList = await this.getAll(params, {
            code: user.inviteCode,
        });

        const result = await this.userService.model
            .find({
                telegramUserId: {
                    $in: referralList.items.map((r) => r.telegramUserId),
                },
            })
            .select({ name: 1 });

        const amount = await this.metadataService.getAmountRewardReferral();
        const response = result.map((r) => ({
            ...r,
            amount: amount.value.reward,
        }));
        return {
            items: response,
            meta: referralList.meta,
        };
    }

    async getReferral(users: UserDocument[]) {
        const result = await Promise.all(
            users.map(async (user) => {
                const countReferral =
                    await this.userReferralModel.countDocuments({
                        code: user.inviteCode,
                    });

                const introducer = await this.userReferralModel.findOne({
                    telegramUserId: user.telegramUserId,
                });

                return {
                    ...user,
                    referralCount: countReferral,
                    introducer: introducer?.code,
                };
            }),
        );

        return result;
    }

    async createReferral(telegramUserId: number, inviteCode: string) {
        await this.validateUserAndReferral(inviteCode);

        await this.userReferralModel.create({
            telegramUserId,
            code: inviteCode,
        });

        await this.addPointForUserReferralAndUserReferred(
            telegramUserId,
            inviteCode,
        );
    }
    async createReferralTransaction(
        userId: Types.ObjectId,
        type: UserTransactionType,
        amount: number,
        before: number,
        after: number,
        refSource: string,
        refId: Types.ObjectId,
        action: string,
    ) {
        if (amount === 0) {
            return 0;
        }

        const userTransaction = await this.userTransactionService.model.create({
            createdBy: new Types.ObjectId(userId),
            type,
            amount,
            before,
            after,
            refSource: refSource,
            refId: new Types.ObjectId(refId?._id),
            action,
        });

        if (userTransaction) {
            await this.userService.model.updateOne(
                { _id: new Types.ObjectId(userId.toString()) },
                {
                    currentPoint: after,
                },
            );

            this.websocketGateway.sendPointsUpdate(userId, after);

            return amount;
        }
    }

    async validateUserAndReferral(inviteCode: string) {
        const referralCode = await this.userService.model.findOne({
            inviteCode,
        });

        if (!referralCode) {
            throw new BadRequestException('Invalid referral code');
        }
    }

    private async addPointForReferral(
        user: UserDocument,
        type: UserTransactionAction,
    ) {
        const amountRewardReferral =
            await this.metadataService.getAmountRewardReferral();

        const after = user.currentPoint + amountRewardReferral.value['reward'];

        await this.createReferralTransaction(
            user._id,
            UserTransactionType.SUM,
            amountRewardReferral.value['reward'],
            user.currentPoint,
            after,
            COLLECTION_NAMES.METADATA,
            amountRewardReferral._id,
            type,
        );
    }

    async addPointForUserReferralAndUserReferred(
        telegramId: number,
        code: string,
    ) {
        // Add point for referrer
        const referrer = await this.userService.model.findOne({
            inviteCode: code,
        });

        await this.addPointForReferral(
            referrer,
            UserTransactionAction.REFERRAL,
        );

        await this.missionService.updateMissionReferral(referrer);

        // Add point for user referred

        const user = await this.userService.model.findOne({
            telegramUserId: telegramId,
        });

        await this.addPointForReferral(user, UserTransactionAction.REFERRED);
    }
}
