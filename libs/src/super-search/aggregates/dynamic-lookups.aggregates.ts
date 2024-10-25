import { PipelineStage } from 'mongoose';
import { AutoPopulateMetadataStorage } from '../storages/auto-populate-metadata.storage';
import { getSchemaMetadata, SuperPropOptions } from '@libs/super-core';
import { Type } from '@nestjs/common';

export const dynamicLookupAggregates = (target: Type<unknown>) => {
    const pipelines: PipelineStage[] = [];
    const autoPopulateOptions =
        AutoPopulateMetadataStorage.getAutoPopulateMetadata(target);

    if (!autoPopulateOptions.length) {
        return;
    }

    const lookupStages = autoPopulateOptions.map((option) => {
        const { autoPopulateOptions, propertyKey: fieldName } = option;
        const { ref, isArray } = autoPopulateOptions;
        const metadataSchema = getSchemaMetadata(target);

        const lookupStage: PipelineStage[] = [
            {
                $lookup: {
                    from: ref,
                    localField: fieldName,
                    foreignField: '_id',
                    as: fieldName,
                },
            },
        ];

        const { properties } = metadataSchema;

        if (!isArray) {
            lookupStage.push({
                $unwind: {
                    path: `$${fieldName}`,
                    preserveNullAndEmptyArrays: true,
                },
            });
        }

        const refMetadata = properties.find(
            (property) => property.propertyKey === fieldName,
        );

        if (!refMetadata) {
            return lookupStage;
        }

        const options = refMetadata?.options as SuperPropOptions;

        const { properties: refProperties } =
            getSchemaMetadata(options.refClass) || {};

        if (!refProperties) {
            return lookupStage;
        }

        refProperties.forEach((refProperty) => {
            const options = refProperty.options as SuperPropOptions;

            if (options?.autoPopulateExclude) {
                lookupStage.push({
                    $project: {
                        [`${fieldName}.${refProperty.propertyKey}`]: 0,
                    },
                });
            }
        });

        return lookupStage;
    });

    pipelines.push(...lookupStages.flat());

    return pipelines;
};
