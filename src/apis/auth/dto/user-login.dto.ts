import { SuperApiProperty } from '@libs/super-core/decorators/super-api-property.decorator';
import {
    IsEmail,
    IsNotEmpty,
    IsString,
    MaxLength,
    MinLength,
} from 'class-validator';

export class UserLoginDto {
    @SuperApiProperty({ default: 'admin@gmail.com' })
    @IsString()
    @IsNotEmpty()
    @IsEmail()
    readonly email: string;

    @SuperApiProperty({ default: 'admin123!@#' })
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    @MaxLength(20)
    readonly password: string;
}
