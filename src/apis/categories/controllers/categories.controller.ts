import { Controller, Param, Query } from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { COLLECTION_NAMES } from 'src/constants';
import {
    ExtendedPagingDto,
    PagingDtoPipe,
} from 'src/pipes/page-result.dto.pipe';
import { AuditLog } from 'src/packages/audits/decorators/audits.decorator';
import { AUDIT_EVENT } from 'src/packages/audits/constants';
import { CategoriesService } from '../categories.service';
import { CategoryType } from '../constants';
import { SuperGet } from '@libs/super-core/decorators/super-get.decorator';
import { Resource } from '@libs/super-authorize';

@Controller('categories')
@Resource('categories')
@ApiTags('Front: Categories')
@AuditLog({
    events: [AUDIT_EVENT.POST, AUDIT_EVENT.PUT, AUDIT_EVENT.DELETE],
    refSource: COLLECTION_NAMES.CATEGORIES,
})
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) {}

    @SuperGet({ route: ':type' })
    async getAll(
        @Query(new PagingDtoPipe())
        queryParams: ExtendedPagingDto,
        @Param('type') type: CategoryType,
    ) {
        const result = await this.categoriesService.getAll(queryParams, {
            type,
        });
        return result;
    }

    @SuperGet({ route: ':type/:slug' })
    @ApiParam({ name: 'slug', type: String })
    async getOne(
        @Param('slug') slug: string,
        @Param('type') type: CategoryType,
    ) {
        const result = await this.categoriesService.getOneBySlug(slug, {
            type,
        });
        return result;
    }
}
