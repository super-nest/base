import { SuperProp } from '@libs/super-core';
import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { AggregateRoot } from 'src/base/entities/aggregate-root.schema';
import { COLLECTION_NAMES } from 'src/constants';
import autopopulateSoftDelete from 'src/utils/mongoose-plugins/autopopulate-soft-delete';
import { User } from 'src/apis/users/entities/user.entity';
import { AutoPopulate } from '@libs/super-search';
import { TicketStatus } from '../constant';
@Schema({
    timestamps: true,
    collection: COLLECTION_NAMES.USER_WHEEL_TICKET,
})
export class UserWheelTicket extends AggregateRoot {
    @SuperProp({
        type: String,
        enum: TicketStatus,
        default: TicketStatus.NEW,
        cms: {
            label: 'Status',
            tableShow: true,
            columnPosition: 8,
        },
    })
    status: TicketStatus;

    @SuperProp({
        type: Types.ObjectId,
        ref: COLLECTION_NAMES.USER,
        refClass: User,
        cms: {
            label: 'Created By',
            tableShow: true,
            columnPosition: 99,
        },
    })
    @AutoPopulate({
        ref: COLLECTION_NAMES.USER,
    })
    createdBy: Types.ObjectId;
}

export type UserWheelTicketDocument = UserWheelTicket & Document;
export const UserWheelTicketSchema =
    SchemaFactory.createForClass(UserWheelTicket);
UserWheelTicketSchema.plugin(autopopulateSoftDelete);
