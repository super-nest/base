import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { BaseService } from 'src/base/service/base.service';
import { COLLECTION_NAMES } from 'src/constants';
import { compareToday } from 'src/utils/helper';
import { ActionType } from './constants';
import { UserAppHistoryDocument } from './entities/user-app-histories.entity';
import { ExtendedInjectModel } from '@libs/super-core';
import { ExtendedModel } from '@libs/super-core/interfaces/extended-model.interface';

@Injectable()
export class UserAppHistoriesService extends BaseService<UserAppHistoryDocument> {
    constructor(
        @ExtendedInjectModel(COLLECTION_NAMES.USER_APP_HISTORY)
        private readonly userAppHistoryDocument: ExtendedModel<UserAppHistoryDocument>,
    ) {
        super(userAppHistoryDocument);
    }

    async createUserAppHistory(
        appId: Types.ObjectId,
        userId: Types.ObjectId,
        action?: ActionType,
    ) {
        const userAppHistory = await this.userAppHistoryDocument
            .findOne({
                app: new Types.ObjectId(appId.toString()),
                createdBy: new Types.ObjectId(userId.toString()),
                action,
            })
            .exec();

        if (userAppHistory) {
            const history: any = userAppHistory;
            const date = history.updatedAt;
            await this.userAppHistoryDocument.updateOne(
                { _id: userAppHistory._id },
                {
                    updatedAt: new Date(),
                },
            );
            return !compareToday(date);
        }

        await this.userAppHistoryDocument.create({
            app: new Types.ObjectId(appId.toString()),
            createdBy: userId,
            action,
        });
        return true;
    }
}
