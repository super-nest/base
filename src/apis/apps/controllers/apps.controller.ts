import { PERMISSION, Resource } from '@libs/super-authorize';
import { SuperAuthorize } from '@libs/super-authorize/decorators/authorize.decorator';
import { SuperDelete, SuperPut } from '@libs/super-core';
import { SuperGet } from '@libs/super-core/decorators/super-get.decorator';
import { SuperPost } from '@libs/super-core/decorators/super-post.decorator';
import { Body, Controller, Param, Query, UseGuards } from '@nestjs/common';
import { ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { MetadataType } from 'src/apis/metadata/constants';
import { UserPayload } from 'src/base/models/user-payload.model';
import { COLLECTION_NAMES } from 'src/constants';
import { UserPayloadExtractorGuard } from 'src/guards/user-payload-extractor.guard';
import { AUDIT_EVENT } from 'src/packages/audits/constants';
import { AuditLog } from 'src/packages/audits/decorators/audits.decorator';
import {
    ExtendedPagingDto,
    PagingDtoPipe,
} from 'src/pipes/page-result.dto.pipe';
import { ParseObjectIdPipe } from 'src/pipes/parse-object-id.pipe';
import { ParseObjectIdArrayPipe } from 'src/pipes/parse-object-ids.pipe';
import { AppsService } from '../apps.service';
import { SubmitAppDto } from '../dto/submit-app.dto';
import { Me } from 'src/decorators/me.decorator';

@Controller('apps')
@Resource('apps')
@ApiTags('Front: Apps')
@AuditLog({
    events: [AUDIT_EVENT.POST, AUDIT_EVENT.PUT, AUDIT_EVENT.DELETE],
    refSource: COLLECTION_NAMES.APP,
})
export class AppsController {
    constructor(private readonly appsService: AppsService) {}

    @SuperPost({
        dto: SubmitAppDto,
    })
    @SuperAuthorize(PERMISSION.POST)
    async create(@Body() data: SubmitAppDto, @Me() user: UserPayload) {
        const { name } = data;

        const result = await this.appsService.createOne(
            {
                ...data,
            },
            user,
            {
                slug: await this.appsService.generateSlug(name),
            },
        );
        return result;
    }

    @SuperGet({ route: 'tags/:tagSlug' })
    @UseGuards(UserPayloadExtractorGuard)
    async getAppsByTag(
        @Param('tagSlug') tagSlug: string,
        @Query(new PagingDtoPipe())
        queryParams: ExtendedPagingDto,
        @Me() user: UserPayload,
    ) {
        const result = await this.appsService.getAppsByTag(
            tagSlug,
            queryParams,
            user,
        );
        return result;
    }

    @SuperGet({ route: 'slugs' })
    async getAllSlug() {
        const result = await this.appsService.getAllSlug();
        return result;
    }

    @SuperPost({ route: 'add-point/:id/:type' })
    @SuperAuthorize(PERMISSION.POST)
    @ApiParam({ name: 'id', type: String })
    async addPointForUser(
        @Param('id', ParseObjectIdPipe) _id: Types.ObjectId,
        @Param('type') type: MetadataType,
        @Me() user: UserPayload,
    ) {
        const result = await this.appsService.addPointForUser(_id, type, user);
        return result;
    }

    @SuperGet({ route: 'user-history' })
    @SuperAuthorize(PERMISSION.GET)
    async getUserAppHistories(
        @Query(new PagingDtoPipe())
        queryParams: ExtendedPagingDto,
        @Me() user: UserPayload,
    ) {
        const result = await this.appsService.getUserAppHistories(
            queryParams,
            user,
        );
        return result;
    }

    @SuperGet()
    @UseGuards(UserPayloadExtractorGuard)
    async getAllForFront(
        @Query(new PagingDtoPipe()) queryParams: ExtendedPagingDto,
        @Me() user: UserPayload,
    ) {
        const result = await this.appsService.getAllAppPublish(
            queryParams,
            user,
        );
        return result;
    }

    @SuperGet({
        route: 'submitted',
    })
    @UseGuards(UserPayloadExtractorGuard)
    @SuperAuthorize(PERMISSION.GET)
    async getSubmittedApp(
        @Query(new PagingDtoPipe())
        queryParams: ExtendedPagingDto,
        @Me() user: UserPayload,
    ) {
        const result = await this.appsService.getSubmittedApp(
            queryParams,
            user,
        );
        return result;
    }

    @SuperPut({ route: ':id', dto: SubmitAppDto })
    @SuperAuthorize(PERMISSION.PUT)
    @ApiParam({ name: 'id', type: String })
    async update(
        @Param('id', ParseObjectIdPipe) _id: Types.ObjectId,
        @Body() data: SubmitAppDto,
        @Me() user: UserPayload,
    ) {
        const result = await this.appsService.updateOneById(_id, data, user);
        return result;
    }

    @SuperGet({ route: ':id' })
    @UseGuards(UserPayloadExtractorGuard)
    @ApiParam({ name: 'id', type: String })
    async getOneAppPublish(
        @Param('id', ParseObjectIdPipe) _id: Types.ObjectId,
        @Me() user: UserPayload,
    ) {
        const result = await this.appsService.getOneAppPublish(_id, user);
        return result;
    }

    @SuperDelete()
    @SuperAuthorize(PERMISSION.DELETE)
    @ApiQuery({ name: 'ids', type: [String] })
    async deletes(
        @Query('ids', ParseObjectIdArrayPipe) _ids: Types.ObjectId[],
        @Me() user: UserPayload,
    ) {
        const result = await this.appsService.deletes(_ids, user);
        return result;
    }
}
