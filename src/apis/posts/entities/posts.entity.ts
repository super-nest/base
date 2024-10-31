import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { AggregateRoot } from 'src/base/entities/aggregate-root.schema';
import { COLLECTION_NAMES } from 'src/constants';
import { PostStatus, PostType } from '../constants';
import autopopulateSoftDelete from 'src/utils/mongoose-plugins/autopopulate-soft-delete';
import {
    MultipleLanguage,
    MultipleLanguageType,
} from '@libs/super-multiple-language';
import { AutoPopulate } from '@libs/super-search';
import { Category } from 'src/apis/categories/entities/categories.entity';
import { File } from 'src/apis/media/entities/files.entity';
import { SuperProp } from '@libs/super-core/decorators/super-prop.decorator';
import { User } from 'src/apis/users/entities/user.entity';

@Schema({})
export class SEOTag {
    @SuperProp({ type: String })
    title: string;

    @SuperProp({ type: String })
    description: string;
}

@Schema({
    timestamps: true,
    collection: COLLECTION_NAMES.POST,
})
export class Post extends AggregateRoot {
    @SuperProp({
        type: MultipleLanguageType,
        required: true,
        cms: {
            label: 'Name',
            tableShow: true,
            index: true,
            columnPosition: 1,
        },
    })
    @MultipleLanguage()
    name: MultipleLanguageType;

    @SuperProp({
        type: String,
        required: true,
        unique: true,
        cms: {
            label: 'Slug',
            tableShow: true,
            columnPosition: 2,
        },
    })
    slug: string;

    @SuperProp({
        type: Number,
        default: 99999,
        cms: {
            label: 'Position',
            tableShow: true,
            columnPosition: 2,
        },
    })
    position: number;

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
    featuredImage: File;

    @SuperProp({
        type: String,
        enum: PostStatus,
        default: PostStatus.DRAFT,
        cms: {
            label: 'Status',
            tableShow: true,
            columnPosition: 4,
        },
    })
    status: PostStatus;

    @SuperProp({
        type: String,
        enum: PostType,
        cms: {
            label: 'Type',
            tableShow: true,
            columnPosition: 5,
        },
    })
    type: PostType;

    @SuperProp({
        type: [Types.ObjectId],
        ref: COLLECTION_NAMES.CATEGORIES,
        refClass: Category,
        cms: {
            label: 'Categories',
            tableShow: true,
            columnPosition: 6,
        },
    })
    @AutoPopulate({
        ref: COLLECTION_NAMES.CATEGORIES,
        isArray: true,
    })
    categories: Category[];

    @SuperProp({
        type: MultipleLanguageType,
        cms: {
            label: 'Short Description',
            tableShow: true,
            columnPosition: 7,
        },
    })
    @MultipleLanguage()
    shortDescription: MultipleLanguageType;

    @SuperProp({
        type: Date,
        default: null,
        cms: {
            label: 'Published Start',
            tableShow: true,
            columnPosition: 8,
        },
    })
    publishedStart: Date;

    @SuperProp({
        type: Date,
        default: null,
        cms: {
            label: 'Published End',
            tableShow: true,
            columnPosition: 9,
        },
    })
    publishedEnd: Date;

    @SuperProp({ type: MultipleLanguageType })
    @MultipleLanguage()
    longDescription: MultipleLanguageType;

    @SuperProp({
        type: SEOTag,
    })
    seoTag: SEOTag;

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

    @SuperProp({
        type: String,
        default: 0,
        cms: {
            label: 'Reading Time',
            tableShow: true,
            columnPosition: 10,
        },
    })
    estimatedReadingTime: number;
}

export type PostDocument = Post & Document;
export const PostSchema = SchemaFactory.createForClass(Post);
PostSchema.plugin(autopopulateSoftDelete);
