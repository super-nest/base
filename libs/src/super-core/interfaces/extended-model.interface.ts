import {
    FilterQuery,
    PipelineStage,
    UpdateQuery,
    UpdateWithAggregationPipeline,
    HydratedDocument,
    Types,
    Document,
    MongooseUpdateQueryOptions,
    QueryOptions,
} from 'mongoose';
import { CustomQueryFindAllService } from '../services/custom-query-find-all.service';
import { CustomQueryFindOneService } from '../services/custom-query-find-one.service';
import { CustomQueryCountDocumentsService } from '../services/custom-query-count-documents.service';
import { CustomQueryCreateService } from '../services/custom-query-create.service';
import { UpdateOptions } from 'mongodb';

export interface ExtendedModel<T extends Document> {
    createInstance(doc: Partial<T>): HydratedDocument<T>;

    find<ResultDoc = HydratedDocument<T>>(
        filter: FilterQuery<ResultDoc>,
        pipeline?: PipelineStage[],
    ): CustomQueryFindAllService<T>;

    findOne<ResultDoc = HydratedDocument<T>>(
        filter: FilterQuery<ResultDoc>,
        pipeline?: PipelineStage[],
    ): CustomQueryFindOneService<T>;

    findById(id: any, pipeline?: PipelineStage[]): CustomQueryFindOneService<T>;

    create<DocContents = Partial<T>>(doc: DocContents | T): Promise<T>;

    insertMany(docs: Array<Partial<T>>);

    updateOne<ResultDoc = HydratedDocument<T>>(
        filter: FilterQuery<T>,
        update?: UpdateQuery<T> | UpdateWithAggregationPipeline,
        options?: (UpdateOptions & MongooseUpdateQueryOptions<T>) | null,
    ): Promise<ResultDoc>;

    updateMany<ResultDoc = HydratedDocument<T>>(
        filter: FilterQuery<T>,
        update?: UpdateQuery<T> | UpdateWithAggregationPipeline,
    ): Promise<ResultDoc>;

    findOneAndUpdate<ResultDoc = HydratedDocument<T>>(
        filter: FilterQuery<T>,
        update?: UpdateQuery<T>,
    ): Promise<ResultDoc>;

    findByIdAndUpdate<ResultDoc = HydratedDocument<T>>(
        id: Types.ObjectId | any,
        update: UpdateQuery<T>,
        options?: QueryOptions<T> | null,
    ): Promise<ResultDoc>;

    countDocuments<ResultDoc = HydratedDocument<T>>(
        filter: FilterQuery<ResultDoc>,
        pipeline?: PipelineStage[],
    ): CustomQueryCountDocumentsService<T>;

    deleteOne(filter: FilterQuery<T>): Promise<T>;

    deleteMany(filter?: FilterQuery<T>);

    findByIdAndDelete(id: Types.ObjectId | any): Promise<T>;

    aggregate(pipeline: PipelineStage[]): Promise<any[]>;
}
