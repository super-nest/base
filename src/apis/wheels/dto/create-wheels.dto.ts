import { PartialType } from '@nestjs/swagger';
import { ExcludeDto } from 'src/base/dto/exclude.dto';
import { WheelPrize } from '../entities/wheels.entity';

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
import { Type } from 'class-transformer';
import { WheelPrizeType } from '../constants';
import { SuperApiProperty } from '@libs/super-core';

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
        description: `Type of the wheel. Available values: ${WheelPrizeType.GOLD} | ${WheelPrizeType.PISTON} | ${WheelPrizeType.OTHER}`,
        example: 'money',
        enum: WheelPrizeType,
        required: true,
        title: 'Type Of Wheel',
    })
    @IsNotEmpty()
    @IsEnum(WheelPrizeType)
    type: WheelPrizeType;

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
        description: 'Color of the wheel',
        example: '#000000',
        required: false,
        title: 'Color Of Wheel',
    })
    @IsOptional()
    @IsString()
    color: string;
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
