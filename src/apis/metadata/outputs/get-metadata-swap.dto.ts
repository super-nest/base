import { MetadataType } from '../constants';
import { Metadata } from '../entities/metadata.entity';

export class GetMetadataSwapDto extends Metadata {
    type: MetadataType.SWAP;
    value: number;
    key: 'rate' | 'fee';
}
