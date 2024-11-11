import { PipelineStage } from 'mongoose';
import { TypeMetadataMultipleLanguageStorage } from '../storages/type-metadata.storage';
import _ from 'lodash';
import { getSchemaMetadata } from '@libs/super-core';
import { RequestContext } from '@libs/super-request-context';

const applyMultipleLanguageFields = (
    entity: any,
    addFieldsStage: any,
    locale: string,
    defaultLocale: string,
    prefix = '',
    isArray = false,
) => {
    const localeFields =
        TypeMetadataMultipleLanguageStorage.getMultipleLanguageMetadata(entity);

    localeFields.forEach((field) => {
        const { propertyKey } = field;

        if (isArray) {
            const mapPath = `${prefix}`;
            if (!_.has(addFieldsStage, `$addFields.${mapPath}`)) {
                _.set(addFieldsStage, `$addFields.${mapPath}`, {
                    $map: {
                        input: `$${prefix}`,
                        as: 'item',
                        in: {
                            $mergeObjects: [
                                '$$item',
                                {
                                    [`${propertyKey}`]: {
                                        $ifNull: [
                                            `$$item.${propertyKey}.${locale}`,
                                            `$$item.${propertyKey}.${defaultLocale}`,
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                });
            } else {
                const mergeObjectsPath = `$addFields.${mapPath}.$map.in.$mergeObjects`;
                const currentMergeObjects = _.get(
                    addFieldsStage,
                    mergeObjectsPath,
                    [],
                );
                currentMergeObjects.push({
                    [`${propertyKey}`]: {
                        $ifNull: [
                            `$$item.${propertyKey}.${locale}`,
                            `$$item.${propertyKey}.${defaultLocale}`,
                        ],
                    },
                });
                _.set(addFieldsStage, mergeObjectsPath, currentMergeObjects);
            }
        } else {
            const _prefix = prefix ? `${prefix}.` : '';
            const fieldPath = `$addFields.${_prefix}${propertyKey}`;
            _.set(addFieldsStage, fieldPath, {
                $ifNull: [
                    `$${_prefix}${propertyKey}.${locale}`,
                    `$${_prefix}${propertyKey}.${defaultLocale}`,
                ],
            });
        }
    });
};

const traverseEntityMultipleLanguage = (
    entity: any,
    pipeline: PipelineStage[],
    locale: string,
    defaultLocale: string,
    prefix = '',
    isArray = false,
    relationLevel = 0,
) => {
    relationLevel++;
    if (relationLevel > 2) return;
    const schemaMetadata = getSchemaMetadata(entity);

    if (!schemaMetadata) return;

    const addFieldsStage = {
        $addFields: {},
    };

    applyMultipleLanguageFields(
        entity,
        addFieldsStage,
        locale,
        defaultLocale,
        prefix,
        isArray,
    );

    if (Object.keys(addFieldsStage.$addFields).length > 0) {
        pipeline.push(addFieldsStage);
    }

    schemaMetadata.properties.forEach((property) => {
        if (property.options['refClass']) {
            const nestedEntity = property.options['refClass'];
            const isArray =
                property.options['type'] &&
                Array.isArray(property.options['type']);

            traverseEntityMultipleLanguage(
                nestedEntity,
                pipeline,
                locale,
                defaultLocale,
                `${prefix}${property.propertyKey}`,
                isArray,
                relationLevel,
            );
        }
    });
};

export const findDocumentMultipleLanguage = (
    entity: any,
    defaultLocale: string,
) => {
    const req: Request = _.get(RequestContext, 'currentContext.req', null);
    const query = _.get(req, 'query', {});
    const locale = _.get(query, 'locale', defaultLocale);
    const pipeline: PipelineStage[] = [];
    traverseEntityMultipleLanguage(entity, pipeline, locale, defaultLocale);
    return pipeline;
};
