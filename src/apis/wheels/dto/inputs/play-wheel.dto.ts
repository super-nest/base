import { SuperApiProperty } from '@libs/super-core';
import { IsNumber, IsOptional, Max, Min } from 'class-validator';

export class PlayWheelDTO {
    @SuperApiProperty({
        type: Number,
        minimum: 1,
        maximum: 10,
        example: 10,
    })
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(10)
    spinCount: number;
}
