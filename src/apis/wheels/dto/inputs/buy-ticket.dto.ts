import { SuperApiProperty } from '@libs/super-core';
import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class BuyTicketDto {
    @SuperApiProperty({
        type: Number,
        minimum: 1,
        example: 1,
    })
    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    quantity: number;
}
