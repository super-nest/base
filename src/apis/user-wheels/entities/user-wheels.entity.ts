import { SuperProp } from '@libs/super-core';
import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { AggregateRoot } from 'src/base/entities/aggregate-root.schema';
import { COLLECTION_NAMES } from 'src/constants';
import autopopulateSoftDelete from 'src/utils/mongoose-plugins/autopopulate-soft-delete';
@Schema({
    timestamps: true,
    collection: COLLECTION_NAMES.USER_WHEEL,
})
export class UserWheels extends AggregateRoot {
    @SuperProp({
        type: Types.ObjectId,
        ref: COLLECTION_NAMES.WHEEL,
    })
    wheel: Types.ObjectId;
}

export type UserWheelsDocument = UserWheels & Document;
export const UserWheelsSchema = SchemaFactory.createForClass(UserWheels);
UserWheelsSchema.plugin(autopopulateSoftDelete);
