import { SuperProp } from '@libs/super-core';
import { AutoPopulate } from '@libs/super-search';
import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/apis/users/entities/user.entity';
import { AggregateRoot } from 'src/base/entities/aggregate-root.schema';
import { COLLECTION_NAMES } from 'src/constants';
import autopopulateSoftDelete from 'src/utils/mongoose-plugins/autopopulate-soft-delete';

export enum UserSwapStatus {
    PENDING = 'pending',
    SUCCESS = 'success',
    FAILED = 'failed',
}

export enum UserSwapType {
    POINT = 'POINT',
    DRAFT_TON = 'DRAFT_TON',
}

@Schema({
    timestamps: true,
    collection: COLLECTION_NAMES.USER_SWAP,
})
export class UserSwap extends AggregateRoot {
    @SuperProp({
        type: String,
        cms: {
            label: 'Status',
            tableShow: true,
            columnPosition: 1,
            index: true,
        },
        enum: UserSwapStatus,
        default: UserSwapStatus.PENDING,
    })
    status: UserSwapStatus;

    @SuperProp({
        type: String,
        cms: {
            label: 'Type',
            tableShow: true,
            columnPosition: 2,
            index: true,
        },
        enum: UserSwapType,
    })
    type: UserSwapType;

    @SuperProp({
        type: Number,
        cms: {
            label: 'Amount',
            tableShow: true,
            columnPosition: 2,
        },
    })
    amount: number;

    @SuperProp({
        type: String,
        cms: {
            label: 'Signature',
            tableShow: true,
            columnPosition: 5,
        },
    })
    signature: string;

    @SuperProp({
        type: String,
        cms: {
            label: 'Wallet Address',
            tableShow: true,
            columnPosition: 6,
        },
    })
    walletAddress: string;

    @SuperProp({
        type: Number,
        cms: {
            label: 'Signature ID',
            tableShow: true,
            columnPosition: 7,
        },
    })
    signatureId: number;

    @SuperProp({
        type: String,
    })
    boc: string;

    @SuperProp({
        type: Number,
    })
    expire: number;

    @SuperProp({
        type: Number,
    })
    point: number;

    @SuperProp({
        type: Number,
        default: 0,
    })
    countCheck: number;

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

export type UserSwapDocument = UserSwap & Document;
export const UserSwapSchema = SchemaFactory.createForClass(UserSwap);
UserSwapSchema.plugin(autopopulateSoftDelete);
