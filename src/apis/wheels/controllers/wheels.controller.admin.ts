import { Body, Controller, Param, Query } from '@nestjs/common';
import { ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { WheelsService } from '../wheels.service';
import {
    ExtendedPagingDto,
    PagingDtoPipe,
} from 'src/pipes/page-result.dto.pipe';
import { ParseObjectIdPipe } from 'src/pipes/parse-object-id.pipe';
import { ParseObjectIdArrayPipe } from 'src/pipes/parse-object-ids.pipe';
import { UserPayload } from 'src/base/models/user-payload.model';
import { Types } from 'mongoose';
import { CreateWheelsDto } from '../dto/create-wheels.dto';
import { UpdateWheelsDto } from '../dto/update-wheels.dto';
import { PERMISSION, Resource, SuperAuthorize } from '@libs/super-authorize';
import { SuperGet, SuperPost, SuperPut, SuperDelete } from '@libs/super-core';
import { AuditLog } from 'src/packages/audits/decorators/audits.decorator';
import { AUDIT_EVENT } from 'src/packages/audits/constants';
import { COLLECTION_NAMES } from 'src/constants';
import { Me } from 'src/decorators/me.decorator';

@Controller('wheels')
@Resource('wheels')
@ApiTags('Admin: Wheels')
@AuditLog({
    events: [AUDIT_EVENT.POST, AUDIT_EVENT.PUT, AUDIT_EVENT.DELETE],
    refSource: COLLECTION_NAMES.WHEEL,
})
export class WheelsControllerAdmin {
    constructor(private readonly wheelsService: WheelsService) {}

    @SuperGet()
    @SuperAuthorize(PERMISSION.GET)
    async getAll(
        @Query(new PagingDtoPipe())
        queryParams: ExtendedPagingDto,
    ) {
        const result = await this.wheelsService.getAll(queryParams);
        return result;
    }

    @SuperGet({ route: ':id' })
    @SuperAuthorize(PERMISSION.GET)
    @ApiParam({ name: 'id', type: String })
    async getOne(@Param('id', ParseObjectIdPipe) _id: Types.ObjectId) {
        const result = await this.wheelsService.getOne(_id);
        return result;
    }

    @SuperPost({
        dto: CreateWheelsDto,
    })
    @SuperAuthorize(PERMISSION.POST)
    async create(
        @Body() createPostDto: CreateWheelsDto,
        @Me() user: UserPayload,
    ) {
        const result = await this.wheelsService.createOne(createPostDto, user);
        return result;
    }

    @SuperPut({ route: ':id', dto: UpdateWheelsDto })
    @SuperAuthorize(PERMISSION.PUT)
    @ApiParam({ name: 'id' })
    async update(
        @Param('id', ParseObjectIdPipe) _id: Types.ObjectId,
        @Body() updatePostDto: UpdateWheelsDto,
        @Me() user: UserPayload,
    ) {
        const result = await this.wheelsService.updateOneById(
            _id,
            updatePostDto,
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
        const result = await this.wheelsService.deletes(_ids, user);
        return result;
    }
}
