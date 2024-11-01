export const Controller = (name) => {
    return `import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { COLLECTION_NAMES } from 'src/constants';
import { AuditLog } from 'src/packages/audits/decorators/audits.decorator';
import { AUDIT_EVENT } from 'src/packages/audits/constants';
import { Resource } from '@libs/super-authorize';
import { ${name[2]}Service } from '../${name[0]}.service';

@Controller('${name[0]}')
@Resource('${name[0]}')
@ApiTags('Front: ${name[2]}')
@AuditLog({
    events: [AUDIT_EVENT.POST, AUDIT_EVENT.PUT, AUDIT_EVENT.DELETE],
    refSource: COLLECTION_NAMES.${name[4]},
})
export class ${name[2]}Controller {
    constructor(private readonly ${name[1]}Service: ${name[2]}Service) {}
}
`;
};
export const controllerAdmin = (name) => {
    return `import { Body, Controller, Param, Query } from '@nestjs/common';
import { SuperGet } from '@libs/super-core/decorators/super-get.decorator';
import { SuperPost } from '@libs/super-core/decorators/super-post.decorator';
import { SuperDelete } from '@libs/super-core/decorators/super-delete.decorator';
import { SuperPut } from '@libs/super-core/decorators/super-put.decorator';
import { ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PERMISSION, Resource } from '@libs/super-authorize';
import { SuperAuthorize } from '@libs/super-authorize/decorators/authorize.decorator';
import {
    ExtendedPagingDto,
    PagingDtoPipe,
} from 'src/pipes/page-result.dto.pipe';
import { ParseObjectIdPipe } from 'src/pipes/parse-object-id.pipe';
import { ParseObjectIdArrayPipe } from 'src/pipes/parse-object-ids.pipe';
import { UserPayload } from 'src/base/models/user-payload.model';
import { Types } from 'mongoose';
import { AuditLog } from 'src/packages/audits/decorators/audits.decorator';
import { Me } from 'src/decorators/me.decorator';
import { AUDIT_EVENT } from 'src/packages/audits/constants';
import { COLLECTION_NAMES } from 'src/constants';
import { Create${name[2]}Dto } from '../dto/create-${name[0]}.dto';
import { Update${name[2]}Dto } from '../dto/update-${name[0]}.dto';
import { ${name[2]}Service } from '../${name[0]}.service';

@Controller('${name[0]}')
@Resource('${name[0]}')
@ApiTags('Admin: ${name[2]}')
@AuditLog({
    events: [AUDIT_EVENT.POST, AUDIT_EVENT.PUT, AUDIT_EVENT.DELETE],
    refSource: COLLECTION_NAMES.${name[4]},
})
export class ${name[2]}ControllerAdmin {
    constructor(private readonly ${name[1]}Service: ${name[2]}Service) {}

    @SuperGet()
    @SuperAuthorize(PERMISSION.GET)
    async getAll(
        @Query(new PagingDtoPipe())
        queryParams: ExtendedPagingDto,
    ) {
        const result = await this.${name[1]}Service.getAll(queryParams);
        return result;
    }

    @SuperGet({ route: ':id' })
    @SuperAuthorize(PERMISSION.GET)
    @ApiParam({ name: 'id', type: String })
    async getOne(@Param('id', ParseObjectIdPipe) _id: Types.ObjectId) {
        const result = await this.${name[1]}Service.getOne(_id);
        return result;
    }

    @SuperPost({
        dto: Create${name[2]}Dto,
    })
    @SuperAuthorize(PERMISSION.POST)
    async create(
        @Body() create${name[2]}Dto: Create${name[2]}Dto,
        @Me() user: UserPayload,
    ) {
        const result = await this.${name[1]}Service.createOne(create${name[2]}Dto, user);
        return result;
    }

    @SuperPut({ route: ':id', dto: Update${name[2]}Dto })
    @SuperAuthorize(PERMISSION.PUT)
    @ApiParam({ name: 'id', type: String })
    async update(
        @Param('id', ParseObjectIdPipe) _id: Types.ObjectId,
        @Body() update${name[2]}Dto: Update${name[2]}Dto,
        @Me() user: UserPayload,
    ) {
        const result = await this.${name[1]}Service.updateOneById(
            _id,
            update${name[2]}Dto,
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
        const result = await this.${name[1]}Service.deletes(_ids, user);
        return result;
    }
}
`;
};
