import { SuperApiProperty } from '@libs/super-core/decorators/super-api-property.decorator';
import { PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
import { Types } from 'mongoose';
import { ExcludeDto } from 'src/base/dto/exclude.dto';
import { IsExist } from 'src/common/services/is-exist-constraint.service';
import { COLLECTION_NAMES } from 'src/constants';
import { convertStringToObjectId } from 'src/utils/helper';

export class CreateCountriesDto extends PartialType(ExcludeDto) {
   
    @IsNotEmpty()
    @IsString()
    @SuperApiProperty({
        description: 'Name of the country',
        example: 'United States',
    })
    name: string;

    @IsNotEmpty()
    @IsString()
    @Transform(({ value }) => convertStringToObjectId(value))
    @IsExist({
        collectionName: COLLECTION_NAMES.COUNTRIES,
        message: 'Country does not exist',
    })
    countryId: Types.ObjectId;
}
