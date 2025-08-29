import { findDocumentMultipleLanguage } from '@libs/super-multiple-language/common/find.utils';
import { createDocumentMultipleLanguage } from '@libs/super-multiple-language/common/create.utils';
import { dynamicLookupAggregates } from '@libs/super-search';
import { Expression, PipelineStage } from 'mongoose';

export interface PopulateConfig {
    from: string;
    localField: string;
    foreignField?: string;
    as?: string;
    pipeline?: any[];
    preserveNullAndEmptyArrays?: boolean;
    isArray?: boolean;
}

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
    if (dynamicLookupPipeline) {
        pipeline.unshift(...dynamicLookupPipeline);
    }
}

export function applyPopulate(
    pipeline: PipelineStage[],
    populate: PopulateConfig | PopulateConfig[],
): PipelineStage[] {
    if (!populate) {
        return pipeline;
    }

    const populateArray = Array.isArray(populate) ? populate : [populate];

    for (const config of populateArray) {
        const { isArray = false } = config;
        if (!config.from || !config.localField) {
            continue;
        }

        const lookupStage: PipelineStage = {
            $lookup: {
                from: config.from,
                localField: config.localField,
                foreignField: config.foreignField || '_id',
                as: config.as || config.localField,
                ...(config.pipeline && { pipeline: config.pipeline }),
            },
        };

        pipeline.push(lookupStage);

        if (!isArray) {
            const unwindStage: PipelineStage = {
                $unwind: {
                    path: `$${config.as || config.localField}`,
                    preserveNullAndEmptyArrays:
                        config.preserveNullAndEmptyArrays !== undefined
                            ? config.preserveNullAndEmptyArrays
                            : true,
                },
            };
            pipeline.push(unwindStage);
        }
    }

    return pipeline;
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

export type MultipleLanguageOperation = 'create' | 'query';

/**
 * Applies multiple language logic for both create and query operations
 * @param operation - The operation type: 'create' or 'query'
 * @param entity - The entity class/model
 * @param data - The data (for create) or pipeline (for query)
 * @param defaultLocale - The default locale for multiple language
 * @param isArray - Whether the data is an array (only for create operation)
 * @returns Promise<void> for create, void for query
 *
 * @example
 * // For create operation
 * await applyMultipleLanguage('create', UserEntity, userData, 'en', false);
 *
 * // For query operation
 * applyMultipleLanguage('query', UserEntity, pipeline, 'en');
 */
export function applyMultipleLanguage(
    operation: MultipleLanguageOperation,
    entity: new () => any,
    data: any,
    defaultLocale: string,
    isArray?: boolean,
): Promise<void> | void {
    if (!defaultLocale || !entity) {
        return operation === 'create' ? Promise.resolve() : undefined;
    }

    if (operation === 'create') {
        if (!data) {
            return Promise.resolve();
        }
        return createDocumentMultipleLanguage(
            entity,
            data,
            defaultLocale,
            isArray || false,
        );
    } else if (operation === 'query') {
        if (!data || !Array.isArray(data)) {
            return;
        }
        const multipleLanguagePipeline = findDocumentMultipleLanguage(
            entity,
            defaultLocale,
        );
        if (multipleLanguagePipeline) {
            data.push(...multipleLanguagePipeline);
        }
    }
}
