import { SchemaFactory, Schema } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';
import { COLLECTION_NAMES } from 'src/constants';
import { UserStatus } from '../constants';
import autopopulateSoftDelete from 'src/utils/mongoose-plugins/autopopulate-soft-delete';
import { AutoPopulate } from '@libs/super-search';
import { AggregateRoot } from 'src/base/entities/aggregate-root.schema';
import { SuperProp } from '@libs/super-core';


export type UserDocument = User & Document;

@Schema({
  timestamps: true,
  collection: COLLECTION_NAMES.USER,
})
export class User extends AggregateRoot {
  @SuperProp({
    type: String,
    required: true,
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
      label: 'avatar',
      tableShow: false,
    },
  })
  avatar: string;

  @SuperProp({
    type: String,
    required: false,
    cms: {
      label: 'Gender',
      tableShow: false,
    },
  })
  gender: string;

  @SuperProp({
    type: Date,
    required: false,
    cms: {
      label: 'Birthday',
      tableShow: false,
    },
  })
  birthday: Date;

  @SuperProp({
    type: String,
    required: false,
    cms: {
      label: 'Occupation',
      tableShow: false,
    },
  })
  occupation: string;

  @SuperProp({
    type: Types.Decimal128,
    required: false,
    cms: {
      label: 'Monthly Salary',
      tableShow: false,
    },
  })
  monthlySalary: Types.Decimal128;

  @SuperProp({
    type: Types.ObjectId,
    required: false,
    cms: {
      label: 'Currency',
      tableShow: false,
    },
  })
  currencyId: Types.ObjectId;

  @SuperProp({
    type: String,
    required: false,
    cms: {
      label: 'Language',
      tableShow: false,
    },
  })
  language: string;

  @SuperProp({
    type: String,
    unique: true,
    required: true,
    cms: {
      label: 'Email',
      tableShow: true,
      columnPosition: 3,
    },
  })
  email: string;

  @SuperProp({
    type: {
      googleId: { type: String, sparse: true },
      appleId: { type: String, sparse: true },
      password: { type: String },
    },
    required: false,
    autoPopulateExclude: true,
  })
  auth: {
    googleId?: string;
    appleId?: string;
    password?: string;
  };

  @SuperProp({
    type: {
      code: String,
      expiresAt: Date,
      isVerified: Boolean,
      createdAt: Date,
      updatedAt: Date,
    },
    required: false,
    autoPopulateExclude: true,
  })
  otp: {
    code: string;
    expiresAt: Date;
    isVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
  };

  @SuperProp({
    type: Boolean,
    required: false,
    default: false,
    cms: {
      label: 'Is Premium',
      tableShow: false,
    },
  })
  isPremium: boolean;

  @SuperProp({
    type: String,
    enum: UserStatus,
    default: UserStatus.ACTIVE,
    cms: {
      label: 'Status',
      tableShow: true,
      columnPosition: 9,
    },
  })
  status: UserStatus;

  @SuperProp({
    type: String,
    sparse: true,
    required: false,
    cms: {
      label: 'Access Token',
      tableShow: false,
    },
  })
  token?: string;

  @SuperProp({
    type: String,
    sparse: true,
    required: false,
    cms: {
      label: 'Refresh Token',
      tableShow: false,
    },
  })
  refreshToken?: string;

  @SuperProp({
    type: Types.ObjectId,
    ref: COLLECTION_NAMES.USER,
    refClass: User,
    cms: {
      label: 'Created By',
      tableShow: false,
    },
  })
  @AutoPopulate({ ref: COLLECTION_NAMES.USER })
  createdBy: Types.ObjectId;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.plugin(autopopulateSoftDelete);
