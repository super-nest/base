import {
    FilterQuery,
    PipelineStage,
    UpdateQuery,
    UpdateWithAggregationPipeline,
    HydratedDocument,
    Types,
    Document,
} from 'mongoose';
import { CustomQueryFindAllService } from '../services/custom-query-find-all.service';
import { CustomQueryFindOneService } from '../services/custom-query-find-one.service';
import { CustomQueryCountDocumentsService } from '../services/custom-query-count-documents.service';

export interface ExtendedModel<T extends Document> {
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
