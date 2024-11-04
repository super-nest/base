import { Metadata } from '../entities/metadata.entity';

export class ValueAmountRewardUserModel {
    isGlobal: boolean;
    reward: number;
    limit: number;
    name: string;
}

export class AmountRewardUserModel extends Metadata {
    value: ValueAmountRewardUserModel;
}
