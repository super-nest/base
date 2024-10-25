import { MetadataService } from './metadata.service';
import { Global, Module } from '@nestjs/common';
import { COLLECTION_NAMES } from 'src/constants';
import { Metadata, MetadataSchema } from './entities/metadata.entity';
import { SuperCacheModule } from '@libs/super-cache/super-cache.module';
import { ExtendedMongooseModule } from '@libs/super-core/modules/mongoose/extended-mongoose.module';

@Global()
@Module({
    imports: [
        ExtendedMongooseModule.forFeature([
            {
                name: COLLECTION_NAMES.METADATA,
                schema: MetadataSchema,
                entity: Metadata,
            },
        ]),
        SuperCacheModule,
    ],
    controllers: [],
    providers: [MetadataService],
    exports: [MetadataService],
})
export class MetadataModule {}
