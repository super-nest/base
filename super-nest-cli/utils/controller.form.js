export const Controller = (name) => {
    return `import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ${name[2]}Service } from '../${name[0]}.service';

@Controller('${name[0]}')
@ApiTags('Front: ${name[2]}')
export class ${name[2]}Controller {
    constructor(private readonly ${name[1]}Service: ${name[2]}Service) {}
}
`;
};
export const controllerAdmin = (name) => {
    return `import { Body, Controller, Param, Query, Req } from '@nestjs/common';
import { ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ${name[2]}Service } from '../${name[0]}.service';
import {
    DefaultDelete,
    DefaultGet,
    DefaultPost,
    DefaultPut,
} from 'src/base/controllers/base.controller';
import { PERMISSIONS } from 'src/constants';
import { Authorize } from 'src/decorators/authorize.decorator';
import {
    ExtendedPagingDto,
    PagingDtoPipe,
} from 'src/pipes/page-result.dto.pipe';
import { ParseObjectIdPipe } from 'src/pipes/parse-object-id.pipe';
import { ParseObjectIdArrayPipe } from 'src/pipes/parse-object-ids.pipe';
import { UserPayload } from 'src/base/models/user-payload.model';
import { Types } from 'mongoose';
import { Create${name[2]}Dto } from '../dto/create-${name[0]}.dto';
import { Update${name[2]}Dto } from '../dto/update-${name[0]}.dto';

@Controller('${name[0]}')
@ApiTags('Admin: ${name[2]}')
export class ${name[2]}ControllerAdmin {
    constructor(private readonly ${name[1]}Service: ${name[2]}Service) {}

    @DefaultGet('')
    @Authorize(PERMISSIONS.${name[4]}.index)
    async getAll(
        @Query(new PagingDtoPipe())
        queryParams: ExtendedPagingDto,
    ) {
        const result = await this.${name[1]}Service.getAll(queryParams);
        return result;
    }

    @DefaultGet(':id')
    @Authorize(PERMISSIONS.${name[4]}.index)
    @ApiParam({ name: 'id', type: String })
    async getOne(@Param('id', ParseObjectIdPipe) _id: Types.ObjectId) {
        const result = await this.${name[1]}Service.getOne(_id);
        return result;
    }

    @DefaultPost('')
    @Authorize(PERMISSIONS.${name[4]}.create)
    @ApiParam({
        name: 'locale',
        required: false,
        type: String,
        description: 'The locale of the content',
    })
    async create(
        @Body() createPostDto: Create${name[2]}Dto,
        @Req() req: { user: UserPayload },
    ) {
        const { user } = req;
        const result = await this.${name[1]}Service.createOne(
            createPostDto,
            user,
        );
        return result;
    }

    @DefaultPut(':id')
    @Authorize(PERMISSIONS.${name[4]}.edit)
    @ApiParam({ name: 'id' })
    @ApiParam({
        name: 'locale',
        required: false,
        type: String,
        description: 'The locale of the content',
    })
    async update(
        @Param('id', ParseObjectIdPipe) _id: Types.ObjectId,
        @Body() updatePostDto: Update${name[2]}Dto,
        @Req() req: { user: UserPayload },
    ) {
        const { user } = req;
        const result = await this.${name[1]}Service.updateOne(
            _id,
            updatePostDto,
            user,
        );
        return result;
    }

    @DefaultDelete()
    @Authorize(PERMISSIONS.${name[4]}.destroy)
    @ApiQuery({ name: 'ids', type: [String] })
    async deletes(
        @Query('ids', ParseObjectIdArrayPipe) _ids: Types.ObjectId[],
        @Req() req: { user: UserPayload },
    ) {
        const { user } = req;

        const result = await this.${name[1]}Service.deletes(_ids, user);
        return result;
    }
}
`;
};
