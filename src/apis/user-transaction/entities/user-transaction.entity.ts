import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { COLLECTION_NAMES } from 'src/constants';
import { UserTransactionType } from '../constants';
import { AggregateRoot } from 'src/base/entities/aggregate-root.schema';
import { AutoPopulate } from '@libs/super-search';
import { App, AppDocument } from 'src/apis/apps/entities/apps.entity';
import { SuperProp } from '@libs/super-core/decorators/super-prop.decorator';
import { EMissionType } from 'src/apis/user-app-histories/constants';
import { User } from 'src/apis/users/entities/user.entity';

class Mission {
    _id: string;
    name: string;
    description: string;
    reward: number;
    startDate: string;
    endDate: string;
    type: EMissionType;
    progress: number;
    createdAt: string;
    updatedAt: string;
    link?: string;
    group?: string;
    missionId: string;
}

@Schema({
    timestamps: true,
    collection: COLLECTION_NAMES.USER_TRANSACTION,
})
export class UserTransaction extends AggregateRoot {
    @SuperProp({
        type: String,
        cms: {
            label: 'Type',
            tableShow: true,
            columnPosition: 1,
        },
    })
    type: UserTransactionType;

    @SuperProp({
        type: Number,
        required: true,
        cms: {
            label: 'Amount',
            tableShow: true,
            columnPosition: 2,
        },
    })
    amount: number;

    @SuperProp({
        type: Number,
        required: true,
        cms: {
            label: 'Before Amount',
            tableShow: true,
            columnPosition: 3,
        },
    })
    before: number;

    @SuperProp({
        type: Number,
        required: true,
        cms: {
            label: 'After Amount',
            tableShow: true,
            columnPosition: 4,
        },
    })
    after: number;

    @SuperProp({
        required: false,
        type: Types.ObjectId,
        ref: COLLECTION_NAMES.APP,
        refClass: App,
        cms: {
            label: 'App',
            tableShow: true,
            columnPosition: 5,
        },
    })
    @AutoPopulate({
        ref: COLLECTION_NAMES.APP,
    })
    app?: AppDocument;

    @SuperProp({
        required: false,
        type: String,
        cms: {
            label: 'Action',
            tableShow: true,
            columnPosition: 6,
        },
    })
    action?: string;

    @SuperProp({
        type: Types.ObjectId,
        cms: {
            label: 'Ref ID',
            tableShow: true,
            columnPosition: 7,
        },
    })
    refId: Types.ObjectId;

    @SuperProp({
        type: String,
        cms: {
            label: 'Ref Source',
            tableShow: true,
            columnPosition: 8,
        },
    })
    refSource: string;

    @SuperProp({
        type: Types.ObjectId,
        ref: COLLECTION_NAMES.TELEGRAM_BOT,
        cms: {
            label: 'Telegram Bot',
            tableShow: true,
            columnPosition: 9,
        },
    })
    telegramBot: Types.ObjectId;

    @Prop({
        required: false,
        type: Mission,
    })
    mission?: Mission;

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

export type UserTransactionDocument = UserTransaction & Document;
export const UserTransactionSchema =
    SchemaFactory.createForClass(UserTransaction);
