import { SuperApiProperty } from '@libs/super-core/decorators/super-api-property.decorator';
import { PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
    IsArray,
    IsNotEmpty,
    IsNumber,
    IsString,
    Max,
    MaxLength,
    Min,
} from 'class-validator';
import { ExcludeDto } from 'src/base/dto/exclude.dto';
import { IsExist } from 'src/common/services/is-exist-constraint.service';
import { COLLECTION_NAMES } from 'src/constants';
import { convertStringToObjectId } from 'src/utils/helper';

export class PermissionDto {
    name: string;
    admin: RolePermissionsDto;
    front: RolePermissionsDto;
    [key: string]: any;
}

interface RolePermissionsDto {
    index: boolean;
    create: boolean;
    edit: boolean;
    destroy: boolean;
}

export class CreateRoleDto extends PartialType(ExcludeDto) {
    @SuperApiProperty()
    @IsNotEmpty()
    @IsString()
    @MaxLength(50)
    name: string;

    @SuperApiProperty()
    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    @Max(100)
    type: number;

    @SuperApiProperty({
        type: [PermissionDto],
    })
    @Transform(({ value }) => convertStringToObjectId(value, true))
    @IsExist({
        collectionName: COLLECTION_NAMES.PERMISSION,
        message: 'permissions must be an array of valid permission ids',
        isArray: true,
    })
    @IsNotEmpty()
    @IsArray()
    permissions: PermissionDto[];
}
