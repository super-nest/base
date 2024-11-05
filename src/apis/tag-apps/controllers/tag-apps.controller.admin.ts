import { Body, Controller, Param, Query } from '@nestjs/common';
import { ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { TagAppsService } from '../tag-apps.service';
import { Types } from 'mongoose';
import { UserPayload } from 'src/base/models/user-payload.model';
import {
    PagingDtoPipe,
    ExtendedPagingDto,
} from 'src/pipes/page-result.dto.pipe';
import { ParseObjectIdPipe } from 'src/pipes/parse-object-id.pipe';
import { ParseObjectIdArrayPipe } from 'src/pipes/parse-object-ids.pipe';
import { CreateTagAppDto } from '../dto/create-tag-apps.dto';
import { UpdateTagAppDto } from '../dto/update-tag-apps.dto';
import { SuperPost } from '@libs/super-core/decorators/super-post.decorator';
import { SuperPut } from '@libs/super-core/decorators/super-put.decorator';
import { SuperGet } from '@libs/super-core/decorators/super-get.decorator';
import { SuperDelete } from '@libs/super-core/decorators/super-delete.decorator';
import { SuperAuthorize } from '@libs/super-authorize/decorators/authorize.decorator';
import { PERMISSION, Resource } from '@libs/super-authorize';
import { Me } from 'src/decorators/me.decorator';

@Controller('tag-apps')
@Resource('tag-apps')
@ApiTags('Admin: Tag Apps')
export class TagAppsControllerAdmin {
    constructor(private readonly tagAppsService: TagAppsService) {}

    @SuperGet()
    @SuperAuthorize(PERMISSION.GET)
    async getAll(
        @Query(new PagingDtoPipe())
        queryParams: ExtendedPagingDto,
    ) {
        const result = await this.tagAppsService.getAll(queryParams);
        return result;
    }

    @SuperGet({ route: ':id' })
    @SuperAuthorize(PERMISSION.GET)
    @ApiParam({ name: 'id', type: String })
    async getOne(@Param('id', ParseObjectIdPipe) _id: Types.ObjectId) {
        const result = await this.tagAppsService.getOne(_id);
        return result;
    }

    @SuperPost({
        input: CreateTagAppDto,
    })
    @SuperAuthorize(PERMISSION.POST)
    async create(
        @Body() createTagAppDto: CreateTagAppDto,
        @Me() user: UserPayload,
    ) {
        const result = await this.tagAppsService.createOne(
            createTagAppDto,
            user,
        );
        return result;
    }

    @SuperPut({ route: ':id', dto: UpdateTagAppDto })
    @SuperAuthorize(PERMISSION.PUT)
    @ApiParam({ name: 'id', type: String })
    async update(
        @Param('id', ParseObjectIdPipe) _id: Types.ObjectId,
        @Body() updateTagAppDto: UpdateTagAppDto,
        @Me() user: UserPayload,
    ) {
        const result = await this.tagAppsService.updateOneById(
            _id,
            updateTagAppDto,
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
        const result = await this.tagAppsService.deletes(_ids, user);
        return result;
    }
}
