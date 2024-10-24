import { AppsService } from './apps.service';
import { forwardRef, Module } from '@nestjs/common';
import { COLLECTION_NAMES } from 'src/constants';
import { App, AppSchema } from './entities/apps.entity';
import { AppEvent } from './event-handlers/apps.event';
import { UserAppHistoriesModule } from '../user-app-histories/user-app-histories.module';
import { UserModule } from '../users/user.module';
import { TagAppsModule } from '../tag-apps/tag-apps.module';
import { TagsModule } from '../tags/tags.module';
import { UserTransactionModule } from '../user-transaction/user-transaction.module';
import { MetadataModule } from '../metadata/metadata.module';
import { ExtendedMongooseModule } from '@libs/super-core/modules/mongoose/extended-mongoose.module';

@Module({
    imports: [
        ExtendedMongooseModule.forFeature([
            { name: COLLECTION_NAMES.APP, schema: AppSchema, entity: App },
        ]),
        UserAppHistoriesModule,
        forwardRef(() => UserModule),
        TagAppsModule,
        TagsModule,
        UserTransactionModule,
        MetadataModule,
    ],
    controllers: [],
    providers: [AppsService, AppEvent],
    exports: [AppsService],
})
export class AppsModule {}
