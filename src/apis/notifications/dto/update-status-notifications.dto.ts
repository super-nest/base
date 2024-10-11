import { SuperApiProperty } from '@libs/super-core/decorators/super-api-property.decorator';
import { PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsOptional } from 'class-validator';
import { Types } from 'mongoose';
import { ExcludeDto } from 'src/base/dto/exclude.dto';
import { IsExist } from 'src/common/services/is-exist-constraint.service';
import { COLLECTION_NAMES } from 'src/constants';

export class UpdateStatusNotificationDto extends PartialType(ExcludeDto) {
    @SuperApiProperty({
        type: [String],
        description: 'List of notification id',
        default: ['60f3b3b3b3b3b3b3b3b3b3', '60f3b3b3b3b3b3b3b3b4'],
    })
    @IsArray()
    @IsExist({
        collectionName: COLLECTION_NAMES.NOTIFICATION,
        isArray: true,
    })
    @IsOptional()
    @Transform(({ value }) => value.map((v) => new Types.ObjectId(v)))
    notifications: Types.ObjectId[];
}
