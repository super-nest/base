import { SwapsService } from './swaps.service';
import { Module } from '@nestjs/common';
import { COLLECTION_NAMES } from 'src/constants';
import { UserSwap, UserSwapSchema } from './entities/user-swaps.entity';
import { ExtendedMongooseModule } from '@libs/super-core/modules/mongoose/extended-mongoose.module';
import { UserModule } from '../users/user.module';
import { MetadataModule } from '../metadata/metadata.module';
import {
    JettonTransaction,
    JettonTransactionSchema,
} from './entities/jetton-transaction.entity';

@Module({
    imports: [
        ExtendedMongooseModule.forFeature([
            {
                name: COLLECTION_NAMES.USER_SWAP,
                schema: UserSwapSchema,
                entity: UserSwap,
            },
            {
                name: COLLECTION_NAMES.JETTON_TRANSACTION,
                schema: JettonTransactionSchema,
                entity: JettonTransaction,
            },
        ]),
        UserModule,
        MetadataModule,
    ],
    controllers: [],
    providers: [SwapsService],
    exports: [SwapsService],
})
export class SwapsModule {}
