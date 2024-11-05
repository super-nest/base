import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { AggregateRoot } from 'src/base/entities/aggregate-root.schema';
import { COLLECTION_NAMES } from 'src/constants';
import autopopulateSoftDelete from 'src/utils/mongoose-plugins/autopopulate-soft-delete';
import { WheelPrizeType } from '../constants';
import { SuperProp } from '@libs/super-core';
import { User } from 'src/apis/users/entities/user.entity';
import { AutoPopulate } from '@libs/super-search';
import { File } from 'src/apis/media/entities/files.entity';

export class Prize {
    rate: number;
}

@Schema({})
export class WheelPrize extends Prize {
    @SuperProp({ type: Number })
    prize: number;

    @SuperProp({ type: Number })
    rate: number;

    @SuperProp({ type: String })
    name: string;

    @SuperProp({ type: String })
    description: string;

    @SuperProp({ type: String, enum: WheelPrizeType })
    type: WheelPrizeType;

    @SuperProp({
        type: Types.ObjectId,
        ref: COLLECTION_NAMES.FILE,
        refClass: File,
        cms: {
            label: 'Featured Image',
            tableShow: true,
            columnPosition: 3,
        },
    })
    @AutoPopulate({
        ref: COLLECTION_NAMES.FILE,
    })
    image: Types.ObjectId;
}

@Schema({
    timestamps: true,
    collection: COLLECTION_NAMES.WHEEL,
})
export class Wheel extends AggregateRoot {
    @SuperProp({
        type: Types.ObjectId,
        cms: {
            label: 'Index',
            tableShow: true,
            columnPosition: 1,
            index: true,
        },
        default: () => new Types.ObjectId(),
    })
    _id: Types.ObjectId;

    @SuperProp({
        type: Number,
        required: true,
        cms: {
            label: 'Fee',
            tableShow: true,
            columnPosition: 2,
        },
    })
    fee: number;

    @SuperProp({
        type: Number,
        required: true,
        cms: {
            label: 'Limit',
            tableShow: true,
            columnPosition: 3,
        },
    })
    limit: number;

    @SuperProp({ type: [WheelPrize] })
    prizes: WheelPrize[];

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

export type WheelDocument = Wheel & Document;
export const WheelSchema = SchemaFactory.createForClass(Wheel);
WheelSchema.plugin(autopopulateSoftDelete);
