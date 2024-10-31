import { Body, Controller, Param, Query } from '@nestjs/common';
import { ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PagesService } from '../pages.service';
import {
    ExtendedPagingDto,
    PagingDtoPipe,
} from 'src/pipes/page-result.dto.pipe';
import { ParseObjectIdPipe } from 'src/pipes/parse-object-id.pipe';
import { ParseObjectIdArrayPipe } from 'src/pipes/parse-object-ids.pipe';
import { UserPayload } from 'src/base/models/user-payload.model';
import { Types } from 'mongoose';
import { CreatePagesDto } from '../dto/create-pages.dto';
import { UpdatePagesDto } from '../dto/update-pages.dto';
import { SuperDelete, SuperGet, SuperPost, SuperPut } from '@libs/super-core';
import { PERMISSION, Resource, SuperAuthorize } from '@libs/super-authorize';
import { AuditLog } from 'src/packages/audits/decorators/audits.decorator';
import { AUDIT_EVENT } from 'src/packages/audits/constants';
import { COLLECTION_NAMES } from 'src/constants';
import { Me } from 'src/decorators/me.decorator';

@Controller('pages')
@Resource('pages')
@ApiTags('Admin: Pages')
@AuditLog({
    events: [AUDIT_EVENT.POST, AUDIT_EVENT.PUT, AUDIT_EVENT.DELETE],
    refSource: COLLECTION_NAMES.PAGE,
})
export class PagesControllerAdmin {
    constructor(private readonly pagesService: PagesService) {}

    @SuperGet()
    @SuperAuthorize(PERMISSION.GET)
    async getAll(
        @Query(new PagingDtoPipe())
        queryParams: ExtendedPagingDto,
    ) {
        const result = await this.pagesService.getAll(queryParams);
        return result;
    }

    @SuperGet({ route: ':id' })
    @SuperAuthorize(PERMISSION.GET)
    @ApiParam({ name: 'id', type: String })
    async getOne(@Param('id', ParseObjectIdPipe) _id: Types.ObjectId) {
        const result = await this.pagesService.getOne(_id);
        return result;
    }

    @SuperPost({ dto: CreatePagesDto })
    @SuperAuthorize(PERMISSION.POST)
    @ApiParam({
        name: 'locale',
        required: false,
        type: String,
        description: 'The locale of the content',
    })
    async create(
        @Body() createPagesDto: CreatePagesDto,
        @Me() user: UserPayload,
    ) {
        const { name } = createPagesDto;
        const result = await this.pagesService.createOne(createPagesDto, user, {
            slug: await this.pagesService.generateSlug(name),
        });
        return result;
    }

    @SuperPut({ route: ':id', dto: UpdatePagesDto })
    @SuperAuthorize(PERMISSION.PUT)
    @ApiParam({ name: 'id' })
    @ApiParam({
        name: 'locale',
        required: false,
        type: String,
        description: 'The locale of the content',
    })
    async update(
        @Param('id', ParseObjectIdPipe) _id: Types.ObjectId,
        @Body() updatePagesDto: UpdatePagesDto,
        @Me() user: UserPayload,
    ) {
        const result = await this.pagesService.updateOneById(
            _id,
            updatePagesDto,
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
        const result = await this.pagesService.deletes(_ids, user);
        return result;
    }
}
