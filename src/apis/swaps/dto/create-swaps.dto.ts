import { SuperApiProperty } from '@libs/super-core';
import { PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ExcludeDto } from 'src/base/dto/exclude.dto';

export class CreateSwapsDto extends PartialType(ExcludeDto) {
    @SuperApiProperty()
    @IsNotEmpty()
    @IsNumber()
    amount: number;

    @SuperApiProperty()
    @IsNotEmpty()
    @IsString()
    walletAddress: string;
}
