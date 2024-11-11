import { SuperApiProperty } from '@libs/super-core';
import { PartialType } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ExcludeDto } from 'src/base/dto/exclude.dto';
import { UserSwapType } from '../entities/user-swaps.entity';

export class CreateSwapsDto extends PartialType(ExcludeDto) {
    @SuperApiProperty()
    @IsNotEmpty()
    @IsNumber()
    amount: number;

    @SuperApiProperty()
    @IsNotEmpty()
    @IsString()
    walletAddress: string;

    @SuperApiProperty({
        type: String,
        description: `Type of the swap. Available values: ${UserSwapType.DRAFT_TGM} & ${UserSwapType.POINT} & ${UserSwapType.DRAFT_TON}`,
        default: `${UserSwapType.POINT} | ${UserSwapType.DRAFT_TGM} | ${UserSwapType.DRAFT_TON}`,
        required: true,
        title: 'Status',
        enum: UserSwapType,
    })
    @IsString()
    @IsEnum(UserSwapType, {
        message: `status must be a valid enum ${UserSwapType.DRAFT_TGM} | ${UserSwapType.DRAFT_TON} | ${UserSwapType.POINT}`,
    })
    @IsNotEmpty()
    type: UserSwapType;
}
