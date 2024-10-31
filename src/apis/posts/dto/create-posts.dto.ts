import { PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
    IsDate,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    MaxLength,
    ValidateNested,
} from 'class-validator';
import { Types } from 'mongoose';
import { ExcludeDto } from 'src/base/dto/exclude.dto';
import { IsExist } from 'src/common/services/is-exist-constraint.service';
import { COLLECTION_NAMES } from 'src/constants';
import { PostStatus } from '../constants';
import { convertStringToObjectId } from 'src/utils/helper';
import { SuperApiProperty } from '@libs/super-core/decorators/super-api-property.decorator';
import { SEOTag } from '../entities/posts.entity';

export class SEOTagDto extends SEOTag {
    @SuperApiProperty({
        type: String,
        description: 'Title of the seo tag',
        default: 'Post',
        title: 'Title',
        required: true,
        maxLength: 255,
    })
    @MaxLength(255)
    @IsString()
    @IsOptional()
    title: string;

    @SuperApiProperty({
        type: String,
        description: 'Description of the seo tag',
        default: 'Post',
        title: 'Description',
        required: true,
        cms: {
            widget: 'textarea',
        },
    })
    @IsString()
    @IsOptional()
    description: string;
}

export class CreatePostDto extends PartialType(ExcludeDto) {
    @SuperApiProperty({
        type: String,
        description: 'Name of the post',
        default: 'Post',
        title: 'Name',
        required: true,
        maxLength: 255,
    })
    @MaxLength(255)
    @IsString()
    @IsNotEmpty()
    name: string;

    @SuperApiProperty({
        type: String,
        description:
            'Status for this post. Available values: PUBLISHED & DRAFT',
        default: PostStatus.PUBLISHED,
        required: true,
        title: 'Status',
        enum: PostStatus,
    })
    @IsString()
    @IsEnum(PostStatus, {
        message: `status must be a valid enum ${PostStatus.PUBLISHED} | ${PostStatus.DRAFT}`,
    })
    @IsNotEmpty()
    status: PostStatus;

    @SuperApiProperty({
        type: Number,
        description: 'Position of the tag in the app',
        default: 0,
        title: 'Position Of Category',
    })
    @IsNumber()
    @IsOptional()
    position: number;

    @SuperApiProperty({
        type: String,
        description: 'Featured image id of the post',
        default: '60f3b3b3b3b3b3b3b3b3b3',
        title: 'Featured Image',
        cms: {
            ref: COLLECTION_NAMES.FILE,
        },
    })
    @IsOptional()
    @Transform(({ value }) => convertStringToObjectId(value))
    @IsExist({
        collectionName: COLLECTION_NAMES.FILE,
        message: 'Featured image does not exist',
    })
    featuredImage: Types.ObjectId;

    @SuperApiProperty({
        type: [String],
        description: 'Category of id the post',
        default: ['60f3b3b3b3b3b3b3b3b3b3'],
        title: 'Category',
        cms: {
            ref: COLLECTION_NAMES.CATEGORIES,
        },
    })
    @IsOptional()
    @Transform(({ value }) => convertStringToObjectId(value, true))
    @IsExist({
        collectionName: COLLECTION_NAMES.CATEGORIES,
        message: 'Category does not exist',
        isArray: true,
    })
    categories: Types.ObjectId[];

    @SuperApiProperty({
        type: String,
        description: 'Short description of the post',
        default: 'Short description',
        title: 'Short Description',
        maxLength: 1000,
        cms: {
            widget: 'textarea',
        },
    })
    @MaxLength(1000)
    @IsString()
    @IsOptional()
    shortDescription: string;

    @SuperApiProperty({
        type: String,
        description: 'Long description of the post',
        default: 'Long description',
        title: 'Long Description',
        cms: {
            widget: 'textEditor',
        },
    })
    @IsString()
    @IsOptional()
    longDescription: string;

    @SuperApiProperty({
        type: Date,
        description: 'Published date of the post',
        default: new Date(),
        title: 'Published Date',
    })
    @IsOptional()
    @IsDate()
    @Transform(({ value }) => (value == null ? null : new Date(value)))
    publishedStart: Date;

    @SuperApiProperty({
        type: Date,
        default: new Date(),
        description: 'Published end date of the post',
        title: 'Published End Date',
    })
    @IsOptional()
    @IsDate()
    @Transform(({ value }) => (value == null ? null : new Date(value)))
    publishedEnd: Date;

    @SuperApiProperty({
        type: SEOTagDto,
        description: 'SEO tag of the page',
        title: 'SEO Tag',
        required: true,
        default: {
            title: 'Post',
            description: 'Post',
        },
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => SEOTagDto)
    seoTag: SEOTagDto;
}
