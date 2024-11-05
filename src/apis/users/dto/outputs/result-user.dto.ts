import { ResultMediaDto } from 'src/apis/media/dto/outputs/result-media.dto';
import { User } from '../../entities/user.entity';
import { SuperApiProperty } from '@libs/super-core';
import { FileDocument } from 'src/apis/media/entities/files.entity';
import { ResultRoleDto } from '@libs/super-authorize/modules/roles/dto/outputs/result-role.dto';
import { RoleDocument } from '@libs/super-authorize/modules/roles/entities/roles.entity';
import { UserStatus } from '../../constants';
import { Exclude } from 'class-transformer';

export class ResultUserDto extends User {
    @SuperApiProperty({
        type: String,
    })
    name: string;

    @SuperApiProperty({
        type: String,
    })
    email: string;

    @SuperApiProperty({
        type: Number,
    })
    telegramUserId: number;

    @SuperApiProperty({
        type: String,
    })
    telegramUsername: string;

    @SuperApiProperty({
        type: ResultMediaDto,
    })
    avatar: FileDocument;

    @SuperApiProperty({
        type: Number,
    })
    currentPoint: number;

    @SuperApiProperty({
        type: ResultRoleDto,
    })
    role: RoleDocument;

    @SuperApiProperty({
        type: String,
    })
    status: UserStatus;

    @SuperApiProperty({
        type: String,
    })
    @Exclude()
    password: string;

    @SuperApiProperty({
        type: String,
    })
    inviteCode: string;
}
