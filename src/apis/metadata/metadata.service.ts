import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/base/service/base.service';
import { MetadataDocument } from './entities/metadata.entity';
import { COLLECTION_NAMES } from 'src/constants';
import { MetadataType } from './constants';
import { AmountRewardUserModel } from './models/amount-reward-user.model';
import { ExtendedInjectModel } from '@libs/super-core';
import { ExtendedModel } from '@libs/super-core/interfaces/extended-model.interface';

@Injectable()
export class MetadataService extends BaseService<MetadataDocument> {
    constructor(
        @ExtendedInjectModel(COLLECTION_NAMES.METADATA)
        private readonly metadataModel: ExtendedModel<MetadataDocument>,
    ) {
        super(metadataModel);
    }

    async getAmountRewardUserForApp(
        type: MetadataType,
    ): Promise<AmountRewardUserModel> {
        const result = await this.metadataModel.findOne({ type });
        return result;
    }

    async getAmountRewardReferral(): Promise<MetadataDocument> {
        const metadata = await this.metadataModel.findOne({
            type: MetadataType.AMOUNT_REWARD_REFERRAL,
        });

        return metadata;
    }
}
