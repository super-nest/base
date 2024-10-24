import { Injectable } from '@nestjs/common';
import { AdvertiserDocument } from './entities/advertisers.entity';
import { COLLECTION_NAMES } from 'src/constants';
import { Types } from 'mongoose';
import { populateGroupBannerImageAggregate } from './common/populate-group-banner-image.aggregate';
import { BaseService } from 'src/base/service/base.service';
import { ExtendedInjectModel } from '@libs/super-core';
import { ExtendedModel } from '@libs/super-core/interfaces/extended-model.interface';

@Injectable()
export class AdvertisersService extends BaseService<AdvertiserDocument> {
    constructor(
        @ExtendedInjectModel(COLLECTION_NAMES.ADVERTISER)
        private readonly advertiserDocument: ExtendedModel<AdvertiserDocument>,
    ) {
        super(advertiserDocument);
    }

    async getOne(
        _id: Types.ObjectId,
        options?: Record<string, any>,
    ): Promise<any> {
        const result = await this.advertiserDocument
            .findOne(
                {
                    _id,
                    ...options,
                },
                populateGroupBannerImageAggregate,
            )
            .autoPopulate();

        return result;
    }
}
