import { PartialType } from '@nestjs/swagger';
import { ExcludeDto } from 'src/base/dto/exclude.dto';

import {
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Max,
    Min,
    ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { SuperApiProperty } from '@libs/super-core';
import { WheelPrize } from '../../entities/wheels.entity';
import { WheelPrizeCategory, WheelPrizeType } from '../../constants';
import { convertStringToObjectId } from 'src/utils/helper';
import { COLLECTION_NAMES } from 'src/constants';
import { IsExist } from 'src/common/services/is-exist-constraint.service';
import { Types } from 'mongoose';

export class WheelPrizeDto extends WheelPrize {
    @SuperApiProperty({
        type: String,
        description: 'Rate of the wheel',
        example: 'name',
        required: true,
        title: 'Name Of Wheel',
    })
    @IsNotEmpty()
    @IsString()
    name: string;

    @SuperApiProperty({
        type: String,
        description: 'Description of the wheel',
        example: 'description',
        required: false,
        title: 'Description',
    })
    @IsOptional()
    @IsString()
    description: string;

    @SuperApiProperty({
        type: String,
        description: `Type of the wheel. Available values: ${WheelPrizeType.GOLD} | ${WheelPrizeType.TON} | ${WheelPrizeType.OTHER}`,
        example: 'money',
        enum: WheelPrizeType,
        required: true,
        title: 'Type Of Wheel',
    })
    @IsNotEmpty()
    @IsEnum(WheelPrizeType)
    type: WheelPrizeType;

    @SuperApiProperty({
        type: String,
        description: `Category of the wheel. Available values: ${WheelPrizeCategory.COMMON} | ${WheelPrizeCategory.MEDIUM} | ${WheelPrizeCategory.JACKPOT} | ${WheelPrizeCategory.SUPER_JACKPOT}`,
        enum: WheelPrizeCategory,
        required: true,
        title: 'Category',
    })
    @IsNotEmpty()
    @IsEnum(WheelPrizeCategory)
    category: WheelPrizeCategory;

    @SuperApiProperty({
        type: Number,
        description: 'Prize pool of the wheel',
        example: 1000,
        required: true,
        title: 'Prize Of Wheel',
    })
    @IsNotEmpty()
    @IsNumber()
    prize: number;

    @SuperApiProperty({
        type: Number,
        description: 'Rate of the wheel',
        example: 100,
        required: true,
        title: 'Rate Of Wheel',
    })
    @Min(0)
    @Max(100)
    @IsNotEmpty()
    rate: number;

    @SuperApiProperty({
        type: String,
        description: 'Featured image id of the app',
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
    image: Types.ObjectId;
}

export class CreateWheelsDto extends PartialType(ExcludeDto) {
    @SuperApiProperty({
        type: Number,
        description: 'Fee of the wheel',
        example: 100,
        required: true,
        title: 'Fee Of Wheel',
    })
    @IsNotEmpty()
    @IsNumber()
    fee: number;

    @SuperApiProperty({
        type: Number,
        description: 'Limit ticket can buy',
        example: 1,
        required: true,
        title: 'Limit Ticket Can Buy',
    })
    @IsNotEmpty()
    @IsNumber()
    limit: number;

    @SuperApiProperty({
        type: Number,
        description:
            'Cool down value of the wheel prize Jackpot and Super Jackpot',
        example: 8,
        required: true,
        title: 'Cool Down Value',
    })
    @IsNotEmpty()
    @IsNumber()
    coolDownValue: number;

    @SuperApiProperty({
        type: Number,
        description:
            'Cool down time of the wheel prize Jackpot and Super Jackpot',
        title: 'Cool Down Time',
    })
    @IsOptional()
    @IsNumber()
    coolDownTime: number;

    @SuperApiProperty({
        type: Number,
        description: 'Ticket prize of the wheel',
        example: 1,
        required: false,
        title: 'Ticket Prize',
    })
    @IsOptional()
    @IsNumber()
    ticketPrize: number;

    @SuperApiProperty({
        type: Number,
        description: 'Ticket prize share of the wheel',
        example: 2,
        required: false,
        title: 'Ticket Prize Share',
    })
    @IsOptional()
    @IsNumber()
    ticketPrizeShare: number;

    @SuperApiProperty({
        type: [WheelPrizeDto],
        description: 'Prizes of the wheel',
        default: [
            {
                prize: 100,
                rate: 100,
            },
        ],
        title: 'Prizes Of Wheel',
        required: true,
    })
    @IsNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => WheelPrizeDto)
    prizes: WheelPrizeDto[];
}
