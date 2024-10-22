import { SchemaFactory, Schema } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { COLLECTION_NAMES } from 'src/constants';
import { UserStatus } from '../constants';
import autopopulateSoftDelete from 'src/utils/mongoose-plugins/autopopulate-soft-delete';
import { AutoPopulate } from '@libs/super-search';
import { File } from 'src/apis/media/entities/files.entity';
import { AggregateRoot } from 'src/base/entities/aggregate-root.schema';
import { generateRandomString } from '../common/generate-random-string.util';
import { SuperProp } from '@libs/super-core/decorators/super-prop.decorator';
import {
    Role,
    RoleDocument,
} from '@libs/super-authorize/modules/roles/entities/roles.entity';

export type UserDocument = User & Document;

@Schema({
    timestamps: true,
    collection: COLLECTION_NAMES.USER,
})
export class User extends AggregateRoot {
    @SuperProp({
        type: String,
        required: false,
        default: 'No Name',
        cms: {
            label: 'Name',
            tableShow: true,
            index: true,
            columnPosition: 1,
        },
    })
    name: string;

    @SuperProp({
        type: String,
        required: false,
        cms: {
            label: 'Email',
            tableShow: true,
            columnPosition: 2,
        },
    })
    email: string;

    @SuperProp({
        type: Number,
        required: false,
        cms: {
            label: 'Telegram User ID',
            tableShow: true,
            columnPosition: 3,
        },
    })
    telegramUserId: number;

    @SuperProp({
        type: String,
        required: false,
        cms: {
            label: 'Telegram Username',
            tableShow: true,
            columnPosition: 4,
        },
    })
    telegramUsername: string;

    @SuperProp({
        type: Types.ObjectId,
        ref: COLLECTION_NAMES.FILE,
        refClass: File,
        cms: {
            label: 'Avatar',
            tableShow: true,
            columnPosition: 5,
        },
    })
    @AutoPopulate({
        ref: COLLECTION_NAMES.FILE,
    })
    avatar: File;

    @SuperProp({
        type: Number,
        default: 0,
        cms: {
            label: 'Current Point',
            tableShow: true,
            columnPosition: 6,
        },
    })
    currentPoint: number;

    @SuperProp({
        type: Types.ObjectId,
        required: true,
        ref: COLLECTION_NAMES.ROLE,
        refClass: Role,
        cms: {
            label: 'Role',
            tableShow: true,
            columnPosition: 7,
        },
    })
    @AutoPopulate({
        ref: COLLECTION_NAMES.ROLE,
    })
    role: Types.ObjectId | RoleDocument;

    @SuperProp({
        type: String,
        enum: UserStatus,
        default: UserStatus.ACTIVE,
        cms: {
            label: 'Status',
            tableShow: true,
            columnPosition: 8,
        },
    })
    status: UserStatus;

    @SuperProp({
        autoPopulateExclude: true,
        type: String,
        required: false,
    })
    password: string;

    @SuperProp({
        type: String,
        cms: {
            label: 'Invite Code',
            tableShow: true,
            columnPosition: 9,
        },
    })
    inviteCode: string;

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

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.plugin(autopopulateSoftDelete);
UserSchema.pre<UserDocument>('save', function (next) {
    if (!this.inviteCode) {
        this.inviteCode = generateRandomString(16);
    }
    next();
});
