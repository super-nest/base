import { SuperApiProperty } from '@libs/super-core/decorators/super-api-property.decorator';
import { PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
    IsEmail,
    IsOptional,
    IsPhoneNumber,
    IsString,
    MaxLength,
} from 'class-validator';
import { Types } from 'mongoose';
import { ExcludeDto } from 'src/base/dto/exclude.dto';
import { IsExist } from 'src/common/services/is-exist-constraint.service';
import { COLLECTION_NAMES } from 'src/constants';
import { convertStringToObjectId } from 'src/utils/helper';

export class UpdateMeDto extends PartialType(ExcludeDto) {
    @SuperApiProperty()
    @IsOptional()
    @IsString()
    @MaxLength(50)
    name: string;

    @SuperApiProperty()
    @IsOptional()
    @IsString()
    @IsEmail()
    email: string;

    @SuperApiProperty()
    @IsOptional()
    @IsString()
    @IsPhoneNumber('VN')
    phone: string;

    @SuperApiProperty()
    @IsOptional()
    @IsString()
    phoneCode: string;

    @SuperApiProperty()
    @IsOptional()
    @IsString()
    country: string;

    @SuperApiProperty()
    @IsOptional()
    @IsExist({
        collectionName: COLLECTION_NAMES.FILE,
        message: 'Avatar does not exist',
    })
    @Transform(({ value }) => convertStringToObjectId(value))
    avatar: Types.ObjectId;
}
