import { SuperApiProperty } from '@libs/super-core/decorators/super-api-property.decorator';
import { PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
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
import { convertStringToObjectId } from 'src/utils/helper';
import { CategoryType } from '../constants';
import { SEOTagDto } from 'src/apis/posts/dto/create-posts.dto';

export class CreateCategoryDto extends PartialType(ExcludeDto) {
    @SuperApiProperty({
        type: String,
        description: 'Name of the category',
        default: 'Category',
        required: true,
        maxLength: 50,
        title: 'Name Of Category',
    })
    @MaxLength(50)
    @IsString()
    @IsNotEmpty()
    name: string;

    @SuperApiProperty({
        type: String,
        description: 'Name of the category',
        default: CategoryType.APP,
        title: 'Type',
        required: true,
        enum: CategoryType,
    })
    @IsString()
    @IsNotEmpty()
    @IsEnum(CategoryType)
    type: CategoryType;

    @SuperApiProperty({
        type: String,
        description: 'Parent of the category',
        default: '60f3b3b3b3b3b3b3b3b3b3',
        title: 'Parent Of Category',
        cms: {
            ref: COLLECTION_NAMES.CATEGORIES,
        },
    })
    @IsOptional()
    @Transform(({ value }) => convertStringToObjectId(value))
    @IsExist({
        collectionName: COLLECTION_NAMES.CATEGORIES,
        message: 'Parent category does not exist',
    })
    parent: Types.ObjectId;

    @SuperApiProperty({
        type: String,
        description: 'Featured image id of the post',
        default: '60f3b3b3b3b3b3b3b3b3b3',
        title: 'Featured Image Of Category',
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
        type: Number,
        description: 'Position of the tag in the app',
        default: 0,
        title: 'Position Of Category',
    })
    @IsNumber()
    @IsOptional()
    position: number;

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
