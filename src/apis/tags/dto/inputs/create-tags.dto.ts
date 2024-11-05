import { SuperApiProperty } from '@libs/super-core/decorators/super-api-property.decorator';
import { PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
    ValidateNested,
} from 'class-validator';
import { Types } from 'mongoose';
import { SEOTagDto } from 'src/apis/pages/dto/create-pages.dto';
import { ExcludeDto } from 'src/base/dto/exclude.dto';
import { IsExist } from 'src/common/services/is-exist-constraint.service';
import { COLLECTION_NAMES } from 'src/constants';
import { convertStringToObjectId } from 'src/utils/helper';

export class CreateTagDto extends PartialType(ExcludeDto) {
    @SuperApiProperty({
        type: String,
        description: 'Name of the tag',
        default: 'Tag',
        required: true,
        title: 'Name Of Tag',
        maxLength: 50,
    })
    @MaxLength(50)
    @IsString()
    @IsNotEmpty()
    name: string;

    @SuperApiProperty({
        type: String,
        description: 'Short description of the tag',
        default: 'Short description',
        title: 'Short Description Of Tag',
        cms: {
            widget: 'textarea',
        },
        maxLength: 1000,
    })
    @MaxLength(1000)
    @IsString()
    @IsOptional()
    shortDescription: string;

    @SuperApiProperty({
        type: String,
        description: 'Featured image id of the tag',
        default: '60f3b3b3b3b3b3b3b3b3b3',
        title: 'Featured Image Of Tag',
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
