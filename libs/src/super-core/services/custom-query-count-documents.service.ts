import { PipelineStage, Document } from 'mongoose';
import { SGetCache } from '../../super-cache';
import _ from 'lodash';
import { sortPipelines } from '@libs/super-search';
import { CustomQueryBaseService } from 'libs/src/super-core/services/base-query.service';
import { applyAutoPopulate, applyLimit, applySkip } from './query';

export class CustomQueryCountDocumentsService<
    T extends Document,
> extends CustomQueryBaseService<T> {
    skip(value: number): this {
        applySkip(this.pipeline, value);
        return this;
    }

    limit(value: number): this {
        applyLimit(this.pipeline, value);
        return this;
    }

    autoPopulate(): this {
        applyAutoPopulate(this.pipeline, this.entity);
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
