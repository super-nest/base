import { PipelineStage, Document, Expression } from 'mongoose';
import { SGetCache } from '../../super-cache';
import { ICustomQueryFindAll } from './interfaces/custom-query-find-all.interface';
import { dynamicLookupAggregates, sortPipelines } from '@libs/super-search';
import { CustomQueryBaseService } from 'libs/src/super-core/services/base-query.service';

export class CustomQueryFindAllService<T extends Document>
    extends CustomQueryBaseService<T>
    implements ICustomQueryFindAll<T>
{
    select(fields: Record<string, number>): this {
        if (!fields) {
            return this;
        }
        this.pipeline.push({ $project: fields });
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

    sort(sort: Record<string, 1 | -1 | Expression.Meta>): this {
        this.pipeline.push({ $sort: sort });
        return this;
    }

    autoPopulate(): this {
        const pipeline = dynamicLookupAggregates(this.entity);
        if (pipeline.length) {
            this.pipeline.push(...pipeline);
        }
        return this;
    }

    @SGetCache()
    async exec(): Promise<T[]> {
        let pipeline: PipelineStage[] = [
            { $match: { deletedAt: null, ...this.conditions } },
        ];

        if (this.pipeline.length) {
            pipeline.push(...this.pipeline);
        }

        pipeline = sortPipelines(pipeline);

        return await this.model.aggregate(pipeline).exec();
    }
}
