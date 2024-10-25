import { Body, Controller, Param, Query } from '@nestjs/common';
import { ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { UserPayload } from 'src/base/models/user-payload.model';
import { COLLECTION_NAMES } from 'src/constants';
import { UpdateMeDto } from 'src/apis/users/dto/update-me.dto';
import { UserService } from 'src/apis/users/user.service';
import { Types } from 'mongoose';
import { ParseObjectIdPipe } from 'src/pipes/parse-object-id.pipe';
import { ParseObjectIdArrayPipe } from 'src/pipes/parse-object-ids.pipe';
import { AuditLog } from 'src/packages/audits/decorators/audits.decorator';
import { AUDIT_EVENT } from 'src/packages/audits/constants';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { SuperPost } from '@libs/super-core/decorators/super-post.decorator';
import { SuperPut } from '@libs/super-core/decorators/super-put.decorator';
import { SuperGet } from '@libs/super-core/decorators/super-get.decorator';
import { SuperDelete } from '@libs/super-core/decorators/super-delete.decorator';
import { SuperAuthorize } from '@libs/super-authorize/decorators/authorize.decorator';
import { PERMISSION, Resource } from '@libs/super-authorize';
import {
    ExtendedPagingDto,
    PagingDtoPipe,
} from 'src/pipes/page-result.dto.pipe';
import { Me } from 'src/decorators/me.decorator';

@Controller('users')
@Resource('users')
@ApiTags('Admin: User')
@AuditLog({
    events: [AUDIT_EVENT.POST, AUDIT_EVENT.PUT, AUDIT_EVENT.DELETE],
    refSource: COLLECTION_NAMES.USER,
})
export class UserControllerAdmin {
    constructor(private readonly userService: UserService) {}

    @SuperPut({ route: 'ban', dto: CreateUserDto })
    @SuperAuthorize(PERMISSION.PUT)
    @ApiQuery({ name: 'ids', type: [String] })
    async ban(
        @Query('ids', ParseObjectIdArrayPipe) _ids: Types.ObjectId[],
        @Me() user: UserPayload,
    ) {
        const result = await this.userService.ban(_ids, user);
        return result;
    }

    @SuperPut({ route: 'un-ban', dto: CreateUserDto })
    @SuperAuthorize(PERMISSION.PUT)
    @ApiQuery({ name: 'ids', type: [String] })
    async unBan(
        @Query('ids', ParseObjectIdArrayPipe) _ids: Types.ObjectId[],
        @Me() user: UserPayload,
    ) {
        const result = await this.userService.unBan(_ids, user);
        return result;
    }

    @SuperGet()
    @SuperAuthorize(PERMISSION.GET)
    async getAll(
        @Query(new PagingDtoPipe())
        queryParams: ExtendedPagingDto,
    ) {
        const result = await this.userService.getAll(queryParams);
        return result;
    }

    @SuperGet({ route: 'me' })
    @SuperAuthorize(PERMISSION.GET)
    async getMe(@Me() user: UserPayload) {
        const result = await this.userService.getMe(user);
        return result;
    }

    @SuperPut({ route: 'me', dto: UpdateMeDto })
    @SuperAuthorize(PERMISSION.PUT)
    async updateMe(@Body() updateMeDto: UpdateMeDto, @Me() user: UserPayload) {
        return this.userService.updateMe(user, updateMeDto);
    }

    @SuperGet({ route: ':id' })
    @SuperAuthorize(PERMISSION.GET)
    @ApiParam({ name: 'id', type: String })
    async getOne(@Param('id', ParseObjectIdPipe) _id: Types.ObjectId) {
        const result = await this.userService.getOne(_id);
        return result;
    }

    @SuperPost({
        dto: CreateUserDto,
    })
    @SuperAuthorize(PERMISSION.POST)
    async create(
        @Body() createRoleDto: CreateUserDto,
        @Me() user: UserPayload,
    ) {
        const result = await this.userService.createOne(createRoleDto, user);
        return result;
    }

    @SuperPut({ route: ':id', dto: UpdateUserDto })
    @SuperAuthorize(PERMISSION.PUT)
    @ApiParam({ name: 'id', type: String })
    async update(
        @Param('id', ParseObjectIdPipe) _id: Types.ObjectId,
        @Body() updateUserDto: UpdateUserDto,
        @Me() user: UserPayload,
    ) {
        const result = await this.userService.updateOneById(
            _id,
            updateUserDto,
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
        const result = await this.userService.deletes(_ids, user);
        return result;
    }
}
