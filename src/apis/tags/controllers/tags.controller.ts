import { ApiParam, ApiTags } from '@nestjs/swagger';
import { TagsService } from '../tags.service';
import { AuditLog } from 'src/packages/audits/decorators/audits.decorator';
import { AUDIT_EVENT } from 'src/packages/audits/constants';
import { COLLECTION_NAMES } from 'src/constants';
import { Controller, Param, Query } from '@nestjs/common';
import { Resource } from '@libs/super-authorize';
import { SuperGet } from '@libs/super-core';
import {
    ExtendedPagingDto,
    PagingDtoPipe,
} from 'src/pipes/page-result.dto.pipe';

@Controller('tags')
@Resource('tags')
@ApiTags('Front: Tags')
@AuditLog({
    events: [AUDIT_EVENT.POST, AUDIT_EVENT.PUT, AUDIT_EVENT.DELETE],
    refSource: COLLECTION_NAMES.TAG,
})
export class TagsController {
    constructor(private readonly tagsService: TagsService) {}

    @SuperGet()
    async getAll(
        @Query(new PagingDtoPipe())
        queryParams: ExtendedPagingDto,
    ) {
        const result = await this.tagsService.getAll(queryParams);
        return result;
    }

    @SuperGet({ route: ':slug' })
    @ApiParam({ name: 'slug', type: String, description: 'Slug' })
    async getOne(@Param('slug') slug: string) {
        const result = await this.tagsService.getOneBySlug(slug);
        return result;
    }
}
