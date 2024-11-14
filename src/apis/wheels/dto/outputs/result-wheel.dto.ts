import { SuperApiProperty } from '@libs/super-core';
import { Wheel } from '../../entities/wheels.entity';
import { Types } from 'mongoose';
import { WheelPrizeDto } from '../inputs/create-wheels.dto';

export class ResultWheelDto extends Wheel {
    @SuperApiProperty({
        type: String,
    })
    _id: Types.ObjectId;

    @SuperApiProperty({
        type: Number,
    })
    fee: number;

    @SuperApiProperty({
        type: Number,
    })
    limit: number;

    @SuperApiProperty({
        type: WheelPrizeDto,
        isArray: true,
    })
    prizes: WheelPrizeDto[];
}
