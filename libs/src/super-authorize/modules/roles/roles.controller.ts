import { Body, Controller, Param, Query } from '@nestjs/common';
import { ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { UserPayload } from 'src/base/models/user-payload.model';
import { COLLECTION_NAMES } from 'src/constants';
import {
    ExtendedPagingDto,
    PagingDtoPipe,
} from 'src/pipes/page-result.dto.pipe';
import { ParseObjectIdPipe } from 'src/pipes/parse-object-id.pipe';
import { ParseObjectIdArrayPipe } from 'src/pipes/parse-object-ids.pipe';
import { UpdateRoleDto } from './dto/update-role.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { AuditLog } from 'src/packages/audits/decorators/audits.decorator';
import { AUDIT_EVENT } from 'src/packages/audits/constants';
import { SuperPost } from '@libs/super-core/decorators/super-post.decorator';
import { SuperPut } from '@libs/super-core/decorators/super-put.decorator';
import { SuperGet } from '@libs/super-core/decorators/super-get.decorator';
import { SuperDelete } from '@libs/super-core/decorators/super-delete.decorator';
import { SuperAuthorize } from '@libs/super-authorize/decorators/authorize.decorator';
import { RolesService } from './roles.service';
import { Resource } from '@libs/super-authorize/decorators';
import { PERMISSION } from '@libs/super-authorize';
import { Me } from 'src/decorators/me.decorator';

@Controller('admin/roles')
@Resource('roles')
@ApiTags('Admin: Roles')
@AuditLog({
    events: [AUDIT_EVENT.POST, AUDIT_EVENT.PUT, AUDIT_EVENT.DELETE],
    refSource: COLLECTION_NAMES.ROLE,
})
export class RolesController {
    constructor(private readonly rolesService: RolesService) {}

    @SuperGet()
    @SuperAuthorize(PERMISSION.GET)
    async getAll(
        @Query(new PagingDtoPipe())
        queryParams: ExtendedPagingDto,
    ) {
        const result = await this.rolesService.getAll(queryParams, {});
        return result;
    }

    @SuperGet({ route: ':id' })
    @SuperAuthorize(PERMISSION.GET)
    @ApiParam({ name: 'id', type: String })
    async getOne(@Param('id', ParseObjectIdPipe) _id: Types.ObjectId) {
        const result = await this.rolesService.getOne(_id, {});
        return result;
    }

    @SuperPost({
        dto: CreateRoleDto,
    })
    @SuperAuthorize(PERMISSION.POST)
    async create(
        @Body() createRoleDto: CreateRoleDto,
        @Me() user: UserPayload,
    ) {
        const result = await this.rolesService.createOne(
            createRoleDto,
            user,
            {},
        );
        return result;
    }

    @SuperPut({ route: ':id', dto: UpdateRoleDto })
    @SuperAuthorize(PERMISSION.PUT)
    @ApiParam({ name: 'id', type: String })
    async update(
        @Param('id', ParseObjectIdPipe) _id: Types.ObjectId,
        @Body() updateRoleDto: UpdateRoleDto,
        @Me() user: UserPayload,
    ) {
        const result = await this.rolesService.updateOneById(
            _id,
            updateRoleDto,
            user,
        );

        return result;
    }

    @SuperDelete()
    @SuperAuthorize(PERMISSION.DELETE)
    @ApiQuery({ name: 'ids', type: [String] })
    async deletes(
        @Query('ids', ParseObjectIdArrayPipe) _ids: Types.ObjectId[],
        @Me() user: UserPayload,
    ) {
        const result = await this.rolesService.deletes(_ids, user);
        return result;
    }
}
