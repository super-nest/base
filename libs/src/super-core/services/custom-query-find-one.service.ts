import { Expression, Document, PipelineStage } from 'mongoose';
import { ICustomQueryFindOne } from './interfaces/custom-query-find-one.interface';
import { dynamicLookupAggregates, sortPipelines } from '@libs/super-search';
import { SGetCache } from '@libs/super-cache';
import { CustomQueryBaseService } from 'libs/src/super-core/services/base-query.service';

export class CustomQueryFindOneService<T extends Document>
    extends CustomQueryBaseService<T>
    implements ICustomQueryFindOne<T>
{
    select(fields: Record<string, number>): this {
        this.pipeline.push({ $project: fields });
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
    async exec(): Promise<T> {
        let pipeline: PipelineStage[] = [
            { $match: { deletedAt: null, ...this.conditions } },
        ];

        if (this.pipeline.length) {
            pipeline.push(...this.pipeline);
        }

        pipeline = sortPipelines(pipeline);

        const result = await this.model.aggregate(pipeline).exec();
        return result?.length ? result[0] : null;
    }
}
