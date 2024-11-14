import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/base/service/base.service';
import { UserWheelsDocument } from './entities/user-wheels.entity';
import { COLLECTION_NAMES } from 'src/constants';
import { Types } from 'mongoose';
import { ExtendedInjectModel } from '@libs/super-core';
import { ExtendedModel } from '@libs/super-core/interfaces/extended-model.interface';

@Injectable()
export class UserWheelsService extends BaseService<UserWheelsDocument> {
    constructor(
        @ExtendedInjectModel(COLLECTION_NAMES.USER_WHEEL)
        private readonly userWheelsModel: ExtendedModel<UserWheelsDocument>,
    ) {
        super(userWheelsModel);
    }

    async findFreeDaily(userId: Types.ObjectId, freeDaily: number) {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const userWheels = await this.userWheelsModel.find({
            createdBy: userId,
            createdAt: {
                $gte: startOfDay,
                $lt: endOfDay,
            },
        });

        const ticketFree = freeDaily - userWheels.length;
        if (ticketFree < 0) {
            return 0;
        }

        return ticketFree;
    }
}
