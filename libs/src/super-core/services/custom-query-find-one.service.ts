import { Expression, Document, PipelineStage } from 'mongoose';
import { ICustomQueryFindOne } from './interfaces/custom-query-find-one.interface';
import { dynamicLookupAggregates, sortPipelines } from '@libs/super-search';
import { SGetCache } from '@libs/super-cache';
import { CustomQueryBaseService } from 'libs/src/super-core/services/base-query.service';

export class CustomQueryFindOneService<T extends Document>
    extends CustomQueryBaseService<T>
    implements ICustomQueryFindOne
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
    private async exec(): Promise<T> {
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

    async then<TResult1 = T | null, TResult2 = never>(
        onfulfilled?:
            | ((value: T | null) => TResult1 | PromiseLike<TResult1>)
            | null,
        onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
    ): Promise<TResult1 | TResult2> {
        try {
            const result = await this.exec();
            return onfulfilled
                ? (onfulfilled(result) as TResult1)
                : (result as unknown as TResult1);
        } catch (error) {
            if (onrejected) {
                return onrejected(error) as TResult2;
            }
            throw error;
        }
    }
}
