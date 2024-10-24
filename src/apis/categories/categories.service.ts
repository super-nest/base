import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { CategoryDocument } from './entities/categories.entity';
import { COLLECTION_NAMES } from 'src/constants';
import { Types } from 'mongoose';
import { UserPayload } from 'src/base/models/user-payload.model';
import { UpdateCategoryDto } from './dto/update-categories.dto';
import { CreateCategoryDto } from './dto/create-categories.dto';
import { CategoryType } from './constants';
import { BaseService } from 'src/base/service/base.service';
import { ExtendedInjectModel } from '@libs/super-core';
import { ExtendedModel } from '@libs/super-core/interfaces/extended-model.interface';

@Injectable()
export class CategoriesService extends BaseService<CategoryDocument> {
    constructor(
        @ExtendedInjectModel(COLLECTION_NAMES.CATEGORIES)
        private readonly categoryModel: ExtendedModel<CategoryDocument>,
    ) {
        super(categoryModel);
    }

    async createOne(
        createCategoryDto: CreateCategoryDto,
        user: UserPayload,
        options?: Record<string, any>,
    ) {
        const { _id: userId } = user;
        const { position, type } = createCategoryDto;

        await this.updatePosition(position, type);

        const result = await this.categoryModel.create({
            ...createCategoryDto,
            ...options,
            createdBy: userId,
        });
        return result;
    }

    async updateOneById(
        _id: Types.ObjectId,
        updateCategoryDto: UpdateCategoryDto,
        user: UserPayload,
        options?: Record<string, any>,
    ) {
        const { _id: userId } = user;
        const { position, type } = updateCategoryDto;

        await this.updatePosition(position, type);

        const result = await this.categoryModel.findOneAndUpdate(
            { _id },
            { ...updateCategoryDto, ...options, updatedBy: userId },
        );

        if (!result) {
            throw new BadRequestException(`Not found ${_id}`);
        }

        return result;
    }

    async deleteManyByIdsAndType(
        _ids: Types.ObjectId[],
        type: string,
        user: UserPayload,
    ) {
        const { _id: userId } = user;
        const condition = {
            $or: [{ _id: { $in: _ids } }, { parent: { $in: _ids } }],
            deletedAt: null,
            type,
        };

        const data = await this.categoryModel.find(condition);

        await this.categoryModel.updateMany(condition, {
            deletedAt: new Date(),
            deletedBy: userId,
        });

        return data;
    }

    async updateOneByIdAndType(
        _id: Types.ObjectId,
        type: string,
        updateCategoryDto: UpdateCategoryDto,
        user: UserPayload,
    ) {
        const { _id: userId } = user;

        const result = await this.categoryModel.findOneAndUpdate(
            { _id, type },
            { ...updateCategoryDto, updatedBy: userId },
        );

        if (!result) {
            throw new BadRequestException('Category not found');
        }

        return result;
    }

    private async updatePosition(
        position: number,
        type: CategoryType,
        thisId?: Types.ObjectId,
    ) {
        if (!position) {
            return;
        }

        const category = await this.categoryModel.findOne({
            position,
            type,
            _id: { $ne: thisId },
        });

        if (category) {
            position++;

            const _tagApp = await this.categoryModel.findOneAndUpdate(
                { _id: new Types.ObjectId(category?._id) },
                { position },
            );

            await this.updatePosition(position, _tagApp?.type, _tagApp._id);
        }
    }

    async getOneBySlug(
        slug: string,
        options?: Record<string, any>,
    ): Promise<any> {
        const result = await this.categoryModel
            .findOne({
                slug,
                ...options,
            })
            .autoPopulate();

        if (!result) {
            throw new NotFoundException(
                'category_not_found',
                'Category not found',
            );
        }

        return result;
    }
}
