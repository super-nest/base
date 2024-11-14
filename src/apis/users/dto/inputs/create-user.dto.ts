import { SuperApiProperty } from '@libs/super-core/decorators/super-api-property.decorator';
import { PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
import { Types } from 'mongoose';
import { ExcludeDto } from 'src/base/dto/exclude.dto';
import { IsExist } from 'src/common/services/is-exist-constraint.service';
import { COLLECTION_NAMES } from 'src/constants';
import { convertStringToObjectId } from 'src/utils/helper';

export class CreateUserDto extends PartialType(ExcludeDto) {
    @SuperApiProperty({
        type: String,
        required: true,
        title: 'Name Of User',
    })
    @IsNotEmpty()
    @IsString()
    name: string;

    @SuperApiProperty({
        type: String,
        required: true,
        title: 'Email Of User',
    })
    @IsNotEmpty()
    @IsString()
    email: string;

    @SuperApiProperty({
        type: String,
        required: true,
        title: 'Password Of User',
        cms: {
            widget: 'password',
        },
    })
    @IsNotEmpty()
    @IsString()
    password: string;

    @SuperApiProperty({
        type: String,
        required: true,
        title: 'Role Of User',
        cms: {
            ref: COLLECTION_NAMES.ROLE,
        },
    })
    @Transform(({ value }) => convertStringToObjectId(value))
    @IsExist({
        collectionName: COLLECTION_NAMES.ROLE,
        message: 'Role does not exist',
    })
    @IsNotEmpty()
    role: Types.ObjectId;
}
