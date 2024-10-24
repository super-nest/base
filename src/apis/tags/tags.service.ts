import { Injectable, NotFoundException } from '@nestjs/common';
import { BaseService } from 'src/base/service/base.service';
import { TagDocument } from './entities/tags.entity';
import { COLLECTION_NAMES } from 'src/constants';
import { ExtendedInjectModel } from '@libs/super-core';
import { ExtendedModel } from '@libs/super-core/interfaces/extended-model.interface';

@Injectable()
export class TagsService extends BaseService<TagDocument> {
    constructor(
        @ExtendedInjectModel(COLLECTION_NAMES.TAG)
        private readonly tagModel: ExtendedModel<TagDocument>,
    ) {
        super(tagModel);
    }

    async getOneBySlug(
        slug: string,
        options?: Record<string, any>,
    ): Promise<any> {
        const result = await this.tagModel.findOne({
            slug,
            ...options,
        });

        if (!result) {
            throw new NotFoundException('tag_not_found', 'Tag not found');
        }

        return result;
    }
}
