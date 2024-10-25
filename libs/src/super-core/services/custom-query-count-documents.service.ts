import { PipelineStage, Document, Expression } from 'mongoose';
import { SGetCache } from '../../super-cache';
import { ICustomQueryCountDocuments } from './interfaces/custom-query-count-documents.interface';
import _ from 'lodash';
import { dynamicLookupAggregates, sortPipelines } from '@libs/super-search';
import { CustomQueryBaseService } from 'libs/src/super-core/services/base-query.service';

export class CustomQueryCountDocumentsService<T extends Document>
    extends CustomQueryBaseService<T>
    implements ICustomQueryCountDocuments
{
    select(fields: Record<string, number>): this {
        this.pipeline.push({ $project: fields });
        return this;
    }

    sort(sort: Record<string, 1 | -1 | Expression.Meta>): this {
        this.pipeline.push({ $sort: sort });
        return this;
    }

    skip(value: number): this {
        this.pipeline.push({ $skip: value });
        return this;
    }

    limit(value: number): this {
        this.pipeline.push({ $limit: value });
        return this;
    }

    autoPopulate(): this {
        const pipeline = dynamicLookupAggregates(this.entity);
        if (pipeline?.length) {
            this.pipeline.push(...pipeline);
        }
        return this;
    }

    @SGetCache()
    private async exec(): Promise<number> {
        let pipeline: PipelineStage[] = [
            { $match: { deletedAt: null, ...this.conditions } },
        ];

        if (this.pipeline.length) {
            pipeline.push(...this.pipeline);
        }

        pipeline.push({ $count: 'totalCount' });

        pipeline = sortPipelines(pipeline);

        const result = await this.model.aggregate(pipeline).exec();
        return _.get(result, '[0].totalCount', 0);
    }

    async then<TResult1 = number, TResult2 = never>(
        onfulfilled?:
            | ((value: number) => TResult1 | PromiseLike<TResult1>)
            | undefined
            | null,
        onrejected?:
            | ((reason: any) => TResult2 | PromiseLike<TResult2>)
            | undefined
            | null,
    ): Promise<TResult1 | TResult2> {
        return this.exec().then(onfulfilled, onrejected);
    }
}
