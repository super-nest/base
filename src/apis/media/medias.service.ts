import { BadRequestException, Injectable } from '@nestjs/common';
import { IUploadedMulterFile, S3Service } from 'src/packages/s3/s3.service';
import { FileDocument } from './entities/files.entity';
import { COLLECTION_NAMES } from 'src/constants';
import { UserPayload } from 'src/base/models/user-payload.model';
import { appSettings } from 'src/configs/app-settings';
import { BaseService } from 'src/base/service/base.service';
import { ExtendedInjectModel } from '@libs/super-core';
import { ExtendedModel } from '@libs/super-core/interfaces/extended-model.interface';

@Injectable()
export class MediaService extends BaseService<FileDocument> {
    constructor(
        @ExtendedInjectModel(COLLECTION_NAMES.FILE)
        private readonly fileModel: ExtendedModel<FileDocument>,
        private readonly s3Service: S3Service,
    ) {
        super(fileModel);
    }

    async createFile(
        file: IUploadedMulterFile,
        user: UserPayload,
        folder: string = appSettings.s3.folder,
    ) {
        const uploadedFile = await this.s3Service.uploadPublicFile(
            file,
            folder,
        );

        if (!uploadedFile) {
            throw new BadRequestException('Can not upload image');
        }

        const { fieldName, originalname, mimetype, size } = file;

        const result = await this.fileModel.create({
            filename: fieldName,
            name: originalname,
            alt: originalname,
            mime: mimetype,
            size,
            filePath: uploadedFile.url,
            folder,
            createdBy: user._id,
        });
        return result;
    }

    async deleteMedia(fileName: string) {
        const uploadedAvatar = await this.s3Service.deletePublicFile(
            fileName,
            'marketplace',
        );
        if (!uploadedAvatar)
            throw new BadRequestException('Can not delte image');

        return uploadedAvatar;
    }
}
