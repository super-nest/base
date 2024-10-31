import { PipelineStage, Document, Expression } from 'mongoose';
import { SGetCache } from '../../super-cache';
import { sortPipelines } from '@libs/super-search';
import { CustomQueryBaseService } from 'libs/src/super-core/services/base-query.service';
import {
    applyAutoPopulate,
    applyLimit,
    applyMultipleLanguage,
    applySelect,
    applySkip,
    applySort,
} from './query';

export class CustomQueryFindAllService<
    T extends Document,
> extends CustomQueryBaseService<T> {
    select(fields: Record<string, number>): this {
        applySelect(this.pipeline, fields);
        return this;
    }

    skip(value: number): this {
        applySkip(this.pipeline, value);
        return this;
    }

    limit(value: number): this {
        applyLimit(this.pipeline, value);
        return this;
    }

    sort(sort: Record<string, 1 | -1 | Expression.Meta>): this {
        applySort(this.pipeline, sort);
        return this;
    }

    autoPopulate(): this {
        applyAutoPopulate(this.pipeline, this.entity);
        return this;
    }

    multipleLanguage(defaultLocale: string): this {
        applyMultipleLanguage(this.pipeline, this.entity, defaultLocale);
        return this;
    }

    @SGetCache()
    private async exec(): Promise<T[]> {
        let pipeline: PipelineStage[] = [
            { $match: { deletedAt: null, ...this.conditions } },
        ];

        if (this.pipeline.length) {
            pipeline.push(...this.pipeline);
        }

        pipeline = sortPipelines(pipeline);

        return await this.model.aggregate(pipeline).exec();
    }

    async then<TResult1 = T[], TResult2 = never>(
        onfulfilled?: ((value: T[]) => TResult1 | PromiseLike<TResult1>) | null,
        onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
    ): Promise<TResult1 | TResult2> {
        try {
            const result = await this.exec();
            return onfulfilled
                ? (onfulfilled(result) as TResult1)
                : (result as TResult1);
        } catch (error) {
            if (onrejected) {
                return onrejected(error) as TResult2;
            } else {
                throw error;
            }
        }
    }
}
