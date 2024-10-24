import { BadRequestException, Injectable } from '@nestjs/common';
import { BaseService } from 'src/base/service/base.service';
import { TagAppDocument } from './entities/tag-apps.entity';
import { COLLECTION_NAMES } from 'src/constants';
import { Types } from 'mongoose';
import { UserPayload } from 'src/base/models/user-payload.model';
import { CreateTagAppDto } from './dto/create-tag-apps.dto';
import { UpdateTagAppDto } from './dto/update-tag-apps.dto';
import { ExtendedInjectModel } from '@libs/super-core';
import { ExtendedModel } from '@libs/super-core/interfaces/extended-model.interface';

@Injectable()
export class TagAppsService extends BaseService<TagAppDocument> {
    constructor(
        @ExtendedInjectModel(COLLECTION_NAMES.TAG_APP)
        private readonly tagAppModel: ExtendedModel<TagAppDocument>,
    ) {
        super(tagAppModel);
    }

    async createOne(
        createTagAppDto: CreateTagAppDto,
        user: UserPayload,
        options?: Record<string, any>,
    ) {
        const { _id: userId } = user;
        const { tag, app, position } = createTagAppDto;

        await this.uniqueTagApp(tag, app);

        await this.updatePosition(tag, position);

        const result = await this.tagAppModel.create({
            ...createTagAppDto,
            ...options,
            createdBy: userId,
        });
        return result;
    }

    async updateOneById(
        _id: Types.ObjectId,
        updateTagAppDto: UpdateTagAppDto,
        user: UserPayload,
        options?: Record<string, any>,
    ) {
        const { _id: userId } = user;

        await this.uniqueTagApp(updateTagAppDto.tag, updateTagAppDto.app, _id);
        await this.updatePosition(
            updateTagAppDto.tag,
            updateTagAppDto.position,
            _id,
        );

        const result = await this.tagAppModel.findOneAndUpdate(
            { _id },
            { ...updateTagAppDto, ...options, updatedBy: userId },
        );

        if (!result) {
            throw new BadRequestException(`Not found ${_id}`);
        }

        return result;
    }

    private async uniqueTagApp(
        tag: Types.ObjectId,
        app: Types.ObjectId,
        thisId?: Types.ObjectId,
    ) {
        const tagApp = await this.tagAppModel.findOne({
            tag,
            app,
            _id: { $ne: thisId },
        });

        if (tagApp) {
            throw new BadRequestException('Tag App already exists');
        }
    }

    private async updatePosition(
        tag: Types.ObjectId,
        position: number,
        thisId?: Types.ObjectId,
    ) {
        const tagApp = await this.tagAppModel.findOne({
            tag,
            position,
            _id: { $ne: thisId },
        });

        if (tagApp) {
            position++;

            const _tagApp = await this.tagAppModel.findOneAndUpdate(
                { _id: tagApp._id },
                { position },
            );

            await this.updatePosition(tag, position, _tagApp._id);
        }
    }
}
