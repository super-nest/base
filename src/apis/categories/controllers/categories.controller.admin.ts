import { PERMISSION, Resource } from '@libs/super-authorize';
import { SuperAuthorize } from '@libs/super-authorize/decorators/authorize.decorator';
import { SuperDelete } from '@libs/super-core/decorators/super-delete.decorator';
import { SuperGet } from '@libs/super-core/decorators/super-get.decorator';
import { SuperPost } from '@libs/super-core/decorators/super-post.decorator';
import { SuperPut } from '@libs/super-core/decorators/super-put.decorator';
import { Body, Controller, Param, Query } from '@nestjs/common';
import { ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { CategoriesService } from 'src/apis/categories/categories.service';
import { CreateCategoryDto } from 'src/apis/categories/dto/create-categories.dto';
import { UpdateCategoryDto } from 'src/apis/categories/dto/update-categories.dto';
import { UserPayload } from 'src/base/models/user-payload.model';
import { COLLECTION_NAMES } from 'src/constants';
import { Me } from 'src/decorators/me.decorator';
import { AUDIT_EVENT } from 'src/packages/audits/constants';
import { AuditLog } from 'src/packages/audits/decorators/audits.decorator';
import {
    ExtendedPagingDto,
    PagingDtoPipe,
} from 'src/pipes/page-result.dto.pipe';
import { ParseObjectIdPipe } from 'src/pipes/parse-object-id.pipe';
import { ParseObjectIdArrayPipe } from 'src/pipes/parse-object-ids.pipe';

@Controller('categories')
@Resource('categories')
@ApiTags('Admin: Categories')
@AuditLog({
    events: [AUDIT_EVENT.POST, AUDIT_EVENT.PUT, AUDIT_EVENT.DELETE],
    refSource: COLLECTION_NAMES.CATEGORIES,
})
export class CategoriesControllerAdmin {
    constructor(private readonly categoriesService: CategoriesService) {}

    @SuperGet({ route: ':id' })
    @SuperAuthorize(PERMISSION.GET)
    @ApiParam({ name: 'id', type: String })
    async getOne(@Param('id', ParseObjectIdPipe) _id: Types.ObjectId) {
        const result = await this.categoriesService.getOne(_id);
        return result;
    }

    @SuperGet()
    @SuperAuthorize(PERMISSION.GET)
    async getAll(
        @Query(new PagingDtoPipe())
        queryParams: ExtendedPagingDto,
    ) {
        const result = await this.categoriesService.getAll(queryParams);
        return result;
    }

    @SuperPost({
        dto: CreateCategoryDto,
    })
    @SuperAuthorize(PERMISSION.POST)
    async create(
        @Body() createCategoryDto: CreateCategoryDto,
        @Me() user: UserPayload,
    ) {
        const { name } = createCategoryDto;

        const result = await this.categoriesService.createOne(
            createCategoryDto,
            user,
            { slug: await this.categoriesService.generateSlug(name) },
        );

        return result;
    }

    @SuperPut({ route: ':id', dto: UpdateCategoryDto })
    @SuperAuthorize(PERMISSION.PUT)
    @ApiParam({ name: 'id', type: String })
    async update(
        @Param('id', ParseObjectIdPipe) _id: Types.ObjectId,
        @Body() updateCategoryDto: UpdateCategoryDto,
        @Me() user: UserPayload,
    ) {
        const { name } = updateCategoryDto;

        const result = await this.categoriesService.updateOneById(
            _id,
            updateCategoryDto,
            user,
            { slug: await this.categoriesService.generateSlug(name) },
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
        const result = await this.categoriesService.deletes(_ids, user);
        return result;
    }
}
