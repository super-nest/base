import {
    Body,
    Controller,
    Param,
    Query,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { ApiConsumes, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { MediaService } from 'src/apis/media/medias.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadMediaDto } from 'src/apis/media/dto/inputs/upload-media.dto';
import { IUploadedMulterFile } from 'src/packages/s3/s3.service';
import {
    ExtendedPagingDto,
    PagingDtoPipe,
} from 'src/pipes/page-result.dto.pipe';
import { ParseObjectIdPipe } from 'src/pipes/parse-object-id.pipe';
import { Types } from 'mongoose';
import { ParseObjectIdArrayPipe } from 'src/pipes/parse-object-ids.pipe';
import { COLLECTION_NAMES } from 'src/constants';
import { UserPayload } from 'src/base/models/user-payload.model';
import { appSettings } from 'src/configs/app-settings';
import { AuditLog } from 'src/packages/audits/decorators/audits.decorator';
import { AUDIT_EVENT } from 'src/packages/audits/constants';

import { SuperPost } from '@libs/super-core/decorators/super-post.decorator';
import { SuperGet } from '@libs/super-core/decorators/super-get.decorator';
import { SuperDelete } from '@libs/super-core/decorators/super-delete.decorator';
import { SuperAuthorize } from '@libs/super-authorize/decorators/authorize.decorator';
import { PERMISSION, Resource } from '@libs/super-authorize';
import { SuperPut } from '@libs/super-core';
import { UpdateMediaDto } from '../dto/inputs/update-media.dto';
import { Me } from 'src/decorators/me.decorator';

@Controller('media')
@Resource('media')
@ApiTags('Admin: Media')
@AuditLog({
    events: [AUDIT_EVENT.POST, AUDIT_EVENT.PUT, AUDIT_EVENT.DELETE],
    refSource: COLLECTION_NAMES.FILE,
})
export class MediaControllerAdmin {
    constructor(private readonly mediaService: MediaService) {}

    @SuperGet()
    @SuperAuthorize(PERMISSION.GET)
    async getAll(
        @Query(new PagingDtoPipe())
        queryParams: ExtendedPagingDto,
    ) {
        const result = await this.mediaService.getAll(queryParams);
        return result;
    }

    @SuperGet({ route: ':id' })
    @SuperAuthorize(PERMISSION.GET)
    @ApiParam({ name: 'id', type: String })
    async getOne(@Param('id', ParseObjectIdPipe) _id: Types.ObjectId) {
        const result = await this.mediaService.getOne(_id);
        return result;
    }

    @SuperPost({ input: UploadMediaDto })
    @ApiConsumes('multipart/form-data')
    @SuperAuthorize(PERMISSION.POST)
    @UseInterceptors(
        FileInterceptor('file', {
            limits: {
                fileSize: 1024 * 1024 * appSettings.maxFileSize.admin,
            },
        }),
    )
    async create(
        @UploadedFile() file: IUploadedMulterFile,
        @Me() user: UserPayload,
    ) {
        const result = await this.mediaService.createFile(file, user);
        return result;
    }

    @SuperPut({ route: ':id', dto: UpdateMediaDto })
    @SuperAuthorize(PERMISSION.PUT)
    @ApiParam({ name: 'id', type: String })
    async update(
        @Param('id', ParseObjectIdPipe) _id: Types.ObjectId,
        @Body() updateMediaDto: UpdateMediaDto,
        @Me() user: UserPayload,
    ) {
        const result = await this.mediaService.updateOneById(
            _id,
            updateMediaDto,
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
        const result = await this.mediaService.deletes(_ids, user);
        return result;
    }
}
