import { SuperApiProperty } from '@libs/super-core';
import { Role } from '../../entities/roles.entity';
import { RoleType } from '../../constants';
import { Types } from 'mongoose';
import { PermissionDocument } from '@libs/super-authorize/modules/permissions/entities/permissions.entity';
import { ResultUserDto } from 'src/apis/users/dto/outputs/result-user.dto';

export class ResultRoleDto extends Role {
    @SuperApiProperty({ type: String })
    name: string;

    @SuperApiProperty({ type: Number })
    type: RoleType;

    @SuperApiProperty({ type: [Types.ObjectId] })
    permissions: PermissionDocument[];

    @SuperApiProperty({ type: ResultUserDto })
    createdBy: Types.ObjectId;
}
