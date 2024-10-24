import { UserAppHistoriesService } from './user-app-histories.service';
import { Module } from '@nestjs/common';
import { COLLECTION_NAMES } from 'src/constants';
import {
    UserAppHistory,
    UserAppHistorySchema,
} from './entities/user-app-histories.entity';
import { ExtendedMongooseModule } from '@libs/super-core/modules/mongoose/extended-mongoose.module';

@Module({
    imports: [
        ExtendedMongooseModule.forFeature([
            {
                name: COLLECTION_NAMES.USER_APP_HISTORY,
                schema: UserAppHistorySchema,
                entity: UserAppHistory,
            },
        ]),
    ],
    controllers: [],
    providers: [UserAppHistoriesService],
    exports: [UserAppHistoriesService],
})
export class UserAppHistoriesModule {}
