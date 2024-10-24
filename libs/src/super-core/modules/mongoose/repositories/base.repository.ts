import { Injectable } from '@nestjs/common';
import {
    FilterQuery,
    Model,
    PipelineStage,
    Types,
    UpdateQuery,
    UpdateWithAggregationPipeline,
    HydratedDocument,
    MergeType,
} from 'mongoose';
import { DynamicLookup } from '@libs/super-search';
import {
    CreateWithMultipleLanguage,
    FindWithMultipleLanguage,
    UpdateWithMultipleLanguage,
} from '@libs/super-multiple-language';
import { DeleteCache } from '@libs/super-cache';
import { ModuleRef } from '@nestjs/core';
import { CustomQueryFindAllService } from '@libs/super-core/services/custom-query-find-all.service';
import { CustomQueryFindOneService } from '@libs/super-core/services/custom-query-find-one.service';
import { CustomQueryCountDocumentsService } from '@libs/super-core/services/custom-query-count-documents.service';
import { AggregateRoot } from 'src/base/entities/aggregate-root.schema';
import { ExtendedModel } from '@libs/super-core/interfaces/extended-model.interface';
import _ from 'lodash';

type AnyKeys<T> = { [P in keyof T]?: T[P] | any };

@Injectable()
export class BaseRepositories<T extends AggregateRoot, E>
    implements ExtendedModel<T>
{
    public static moduleRef: ModuleRef;

    constructor(
        public readonly model: Model<T>,
        public readonly entity: new () => E,
        public readonly collectionName: string,
        public moduleRef: ModuleRef,
    ) {
        BaseRepositories.moduleRef = moduleRef;
    }

    @FindWithMultipleLanguage()
    find<ResultDoc = HydratedDocument<T>>(
        filter: FilterQuery<ResultDoc>,
        pipeline: PipelineStage[] = [],
    ) {
        const clonedPipeline = _.cloneDeep(pipeline);
        return new CustomQueryFindAllService(
            this.model,
            this.entity,
            this.collectionName,
            this.moduleRef,
            filter,
            clonedPipeline,
        );
    }

    @FindWithMultipleLanguage()
    @DynamicLookup()
    findOne<ResultDoc = HydratedDocument<T>>(
        filter: FilterQuery<ResultDoc>,
        pipeline: PipelineStage[] = [],
    ) {
        const clonedPipeline = _.cloneDeep(pipeline);
        return new CustomQueryFindOneService(
            this.model,
            this.entity,
            this.collectionName,
            this.moduleRef,
            filter,
            clonedPipeline,
        );
    }

    @FindWithMultipleLanguage()
    @DynamicLookup()
    findById(id: any, pipeline: PipelineStage[] = []) {
        return new CustomQueryFindOneService(
            this.model,
            this.entity,
            this.collectionName,
            this.moduleRef,
            { _id: new Types.ObjectId(id.toString()) },
            pipeline,
        );
    }

    @CreateWithMultipleLanguage()
    @DeleteCache()
    async create<DocContents = AnyKeys<T>>(doc: DocContents | T): Promise<T> {
        return await this.model.create(doc);
    }

    @CreateWithMultipleLanguage()
    @DeleteCache()
    async insertMany<DocContents = T>(
        docs: Array<DocContents | T>,
    ): Promise<
        Array<MergeType<HydratedDocument<T>, Omit<DocContents, '_id'>>>
    > {
        return await this.model.insertMany(docs);
    }

    @UpdateWithMultipleLanguage()
    @DeleteCache()
    async updateOne<ResultDoc = HydratedDocument<T>>(
        filter: FilterQuery<T>,
        update?: UpdateQuery<T> | UpdateWithAggregationPipeline,
    ) {
        const result = await this.model.updateOne(
            { deletedAt: null, ...filter },
            update,
        );
        return result as unknown as ResultDoc;
    }

    @UpdateWithMultipleLanguage()
    @DeleteCache()
    async updateMany<ResultDoc = HydratedDocument<T>>(
        filter: FilterQuery<T>,
        update?: UpdateQuery<T> | UpdateWithAggregationPipeline,
    ) {
        const result = await this.model.updateMany(
            { deletedAt: null, ...filter },
            update,
        );
        return result as unknown as ResultDoc;
    }

    @UpdateWithMultipleLanguage()
    @DeleteCache()
    async findOneAndUpdate<ResultDoc = HydratedDocument<T>>(
        filter?: FilterQuery<T>,
        update?: UpdateQuery<T>,
    ) {
        const result = await this.model.findOneAndUpdate(
            { deletedAt: null, ...filter },
            update,
        );
        return result as unknown as ResultDoc;
    }

    @UpdateWithMultipleLanguage()
    @DeleteCache()
    async findByIdAndUpdate<ResultDoc = HydratedDocument<T>>(
        id: Types.ObjectId | any,
        update: UpdateQuery<T>,
    ) {
        const result = await this.model.findByIdAndUpdate(id, update);
        return result as unknown as ResultDoc;
    }

    @DynamicLookup()
    countDocuments(filter: FilterQuery<T>, pipeline: PipelineStage[] = []) {
        const clonedPipeline = _.cloneDeep(pipeline);
        return new CustomQueryCountDocumentsService(
            this.model,
            this.entity,
            this.collectionName,
            this.moduleRef,
            filter,
            clonedPipeline,
        );
    }

    @DeleteCache()
    async deleteOne(filter: FilterQuery<T>) {
        const result = await this.model.deleteOne(filter);
        return result as unknown as T;
    }

    @DeleteCache()
    deleteMany(filter?: FilterQuery<T>): Promise<any> {
        return this.model.deleteMany(filter);
    }

    @DeleteCache()
    findByIdAndDelete(id?: Types.ObjectId | any) {
        return this.model.findByIdAndDelete(id);
    }

    @DeleteCache()
    aggregate(pipeline: PipelineStage[]) {
        return this.model.aggregate(pipeline);
    }
}
