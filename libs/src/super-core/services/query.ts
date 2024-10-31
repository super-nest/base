import { dynamicLookupAggregates } from '@libs/super-search';
import { Expression, PipelineStage } from 'mongoose';

export function applySelect(
    pipeline: PipelineStage[],
    fields: Record<string, number>,
): PipelineStage[] {
    if (!fields) {
        return pipeline;
    }
    pipeline.push({ $project: fields });
}

export function applySort(
    pipeline: PipelineStage[],
    sort: Record<string, 1 | -1 | Expression.Meta>,
): PipelineStage[] {
    if (!sort) {
        return pipeline;
    }
    pipeline.push({ $sort: sort });
}

export function applyAutoPopulate(
    pipeline: PipelineStage[],
    entity: new () => any,
): PipelineStage[] {
    if (!entity) {
        return pipeline;
    }
    const dynamicLookupPipeline = dynamicLookupAggregates(entity);
    pipeline.push(...dynamicLookupPipeline);
}

export function applySkip(
    pipeline: PipelineStage[],
    value: number,
): PipelineStage[] {
    if (!value) {
        return pipeline;
    }
    pipeline.push({ $skip: value });
}

export function applyLimit(
    pipeline: PipelineStage[],
    value: number,
): PipelineStage[] {
    if (!value) {
        return pipeline;
    }
    pipeline.push({ $limit: value });
}

export function applyLookup(
    pipeline: PipelineStage[],
    lookup: PipelineStage,
): PipelineStage[] {
    if (!lookup) {
        return pipeline;
    }
    pipeline.push(lookup);
}

export function applyMatch(
    pipeline: PipelineStage[],
    match: Record<string, any>,
): PipelineStage[] {
    if (!match) {
        return pipeline;
    }
    pipeline.push({ $match: match });
}
