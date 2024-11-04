import { SuperApiProperty } from '@libs/super-core';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
import { Types } from 'mongoose';
import { IsExist } from 'src/common/services/is-exist-constraint.service';
import { COLLECTION_NAMES } from 'src/constants';
import { convertStringToObjectId } from 'src/utils/helper';

export class AfterSwapsDto {
    @SuperApiProperty({
        type: String,
        required: true,
        title: 'User Swap ID',
    })
    @Transform(({ value }) => convertStringToObjectId(value))
    @IsExist({
        collectionName: COLLECTION_NAMES.USER_SWAP,
        message: 'Role does not exist',
    })
    @IsNotEmpty()
    userSwap: Types.ObjectId;

    @SuperApiProperty({
        type: String,
        required: true,
        title: 'Boc ',
    })
    @IsNotEmpty()
    @IsString()
    boc: string;
}
