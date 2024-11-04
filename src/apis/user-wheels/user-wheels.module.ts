import { UserWheelsService } from './user-wheels.service';
import { Module } from '@nestjs/common';
import { COLLECTION_NAMES } from 'src/constants';
import { UserWheels, UserWheelsSchema } from './entities/user-wheels.entity';
import { ExtendedMongooseModule } from '@libs/super-core/modules/mongoose/extended-mongoose.module';

@Module({
    imports: [
        ExtendedMongooseModule.forFeature([
            {
                name: COLLECTION_NAMES.USER_WHEEL,
                schema: UserWheelsSchema,
                entity: UserWheels,
            },
        ]),
    ],
    controllers: [],
    providers: [UserWheelsService],
    exports: [UserWheelsService],
})
export class UserWheelsModule {}
