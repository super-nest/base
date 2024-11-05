import { SuperApiProperty } from '@libs/super-core';
import { PartialType } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ExcludeDto } from 'src/base/dto/exclude.dto';

export class UpdateMediaDto extends PartialType(ExcludeDto) {
    @SuperApiProperty({
        type: String,
        default: 'name',
        required: false,
    })
    @MaxLength(100)
    @IsString()
    @IsOptional()
    name: string;

    @SuperApiProperty({
        type: String,
        default: 'alt',
        required: false,
    })
    @MaxLength(100)
    @IsString()
    @IsOptional()
    alt: string;
}
