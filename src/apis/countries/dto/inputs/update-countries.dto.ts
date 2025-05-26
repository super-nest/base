import { PartialType } from '@nestjs/swagger';
import { CreateCountriesDto } from './create-countries.dto';

export class UpdateUserDto extends PartialType(CreateCountriesDto) {}
