import { WheelsService } from './wheels.service';
import { Module } from '@nestjs/common';
import { COLLECTION_NAMES } from 'src/constants';
import { Wheel, WheelSchema } from './entities/wheels.entity';
import { UserModule } from '../users/user.module';
import { UserWheelsModule } from '../user-wheels/user-wheels.module';
import { ExtendedMongooseModule } from '@libs/super-core/modules/mongoose/extended-mongoose.module';
import { UserWheelTicketsModule } from '../user-wheel-tickets/user-wheel-tickets.module';
import { WebsocketModule } from 'src/packages/websocket/websocket.module';

@Module({
    imports: [
        ExtendedMongooseModule.forFeature([
            {
                name: COLLECTION_NAMES.WHEEL,
                schema: WheelSchema,
                entity: Wheel,
            },
        ]),
        UserModule,
        UserWheelsModule,
        UserWheelTicketsModule,
        WebsocketModule,
    ],
    controllers: [],
    providers: [WheelsService],
    exports: [WheelsService],
})
export class WheelsModule {}
