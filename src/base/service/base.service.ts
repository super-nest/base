import { BadRequestException, Injectable } from '@nestjs/common';
import { Document, FilterQuery, Types } from 'mongoose';
import { ExtendedPagingDto } from 'src/pipes/page-result.dto.pipe';
import { pagination } from '@libs/super-search';
import { UserPayload } from '../models/user-payload.model';
import { activePublications } from '../aggregates/active-publications.aggregates';
import { removeDiacritics } from 'src/utils/helper';
import _ from 'lodash';
import { generateRandomString } from 'src/apis/users/common/generate-random-string.util';
import { ExtendedModel } from '@libs/super-core/interfaces/extended-model.interface';

@Injectable()
export class BaseService<T extends Document> {
    constructor(public readonly model: ExtendedModel<T>) {}

    async getAll(
        queryParams: ExtendedPagingDto,
        options?: Record<string, any>,
    ) {
        const {
            page,
            limit,
            sortBy,
            sortDirection,
            skip,
            filterPipeline,
            select,
        } = queryParams;

        const result = this.model
            .find(
                {
                    ...options,
                },
                filterPipeline,
            )
            .limit(limit)
            .skip(skip)
            .sort({ [sortBy]: sortDirection })
            .select(select)
            .autoPopulate();

        const total = this.model
            .countDocuments(
                {
                    ...options,
                },
                filterPipeline,
            )
            .autoPopulate();

        return Promise.all([result, total]).then(([items, total]) => {
            const meta = pagination(items, page, limit, total);
            return { items, meta };
        });
    }

    async getOne(
        _id: Types.ObjectId,
        options?: Record<string, any>,
    ): Promise<any> {
        const result = await this.model
            .findOne({
                $or: [{ _id }, { slug: _id }],
                ...options,
            })
            .autoPopulate();

        return result;
    }

    async createOne(
        payload: any,
        user: UserPayload,
        options?: Record<string, any>,
    ) {
        const { _id: userId } = user;

        const result = await this.model.create({
            ...payload,
            ...options,
            createdBy: userId,
        });
        return result;
    }

    async deletes(_ids: Types.ObjectId[], user: UserPayload): Promise<T[]> {
        const { _id: userId } = user;
        const data = await this.model.find({ _id: { $in: _ids } });
        await this.model.updateMany(
            { _id: { $in: _ids } },
            { deletedAt: new Date(), deletedBy: userId },
        );
        return data;
    }

    async updateOneById(
        _id: Types.ObjectId,
        payload: any,
        user: UserPayload,
        options?: Record<string, any>,
    ) {
        const { _id: userId } = user;
        const result = await this.model.findOneAndUpdate(
            { _id },
            { ...payload, ...options, updatedBy: userId },
        );

        if (!result) {
            throw new BadRequestException(`Not found ${_id}`);
        }

        return result;
    }

    async getAllForFront(
        queryParams: ExtendedPagingDto,
        options?: Record<string, any>,
    ) {
        const { page, limit, sortBy, sortDirection, skip, filterPipeline } =
            queryParams;

        activePublications(queryParams.filterPipeline);

        const result = this.model
            .find(
                {
                    ...options,
                },
                filterPipeline,
            )
            .limit(limit)
            .skip(skip)
            .sort({ [sortBy]: sortDirection })
            .select({ longDescription: 0 })
            .autoPopulate();

        const total = this.model
            .countDocuments(
                {
                    ...options,
                },
                filterPipeline,
            )
            .autoPopulate();

        return Promise.all([result, total]).then(([items, total]) => {
            const meta = pagination(items, page, limit, total);
            return { items, meta };
        });
    }

    async delete(filter: FilterQuery<T>) {
        return await this.model.updateOne(filter, {
            deletedAt: new Date(),
        });
    }

    async unDelete(filter: FilterQuery<T>) {
        return this.model.updateMany(filter, {
            deletedAt: null,
        });
    }

    async generateSlug(name: string) {
        const slug = _.kebabCase(removeDiacritics(name));
        const exist = await this.model.findOne({ slug });

        if (exist) {
            return await this.generateSlug(
                `${slug}-${generateRandomString(2)}`,
            );
        }

        return slug;
    }
}
