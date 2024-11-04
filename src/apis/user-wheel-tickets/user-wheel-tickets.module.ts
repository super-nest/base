import { UserWheelTicketsService } from './user-wheel-tickets.service';
import { Module } from '@nestjs/common';
import { COLLECTION_NAMES } from 'src/constants';
import {
    UserWheelTicket,
    UserWheelTicketSchema,
} from './entities/user-wheel-ticket.entity';
import { ExtendedMongooseModule } from '@libs/super-core/modules/mongoose/extended-mongoose.module';

@Module({
    imports: [
        ExtendedMongooseModule.forFeature([
            {
                name: COLLECTION_NAMES.USER_WHEEL_TICKET,
                schema: UserWheelTicketSchema,
                entity: UserWheelTicket,
            },
        ]),
    ],
    controllers: [],
    providers: [UserWheelTicketsService],
    exports: [UserWheelTicketsService],
})
export class UserWheelTicketsModule {}
