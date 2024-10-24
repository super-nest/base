import { SuperCacheService } from '../super-cache.service';
import { ModuleRef } from '@nestjs/core';
import { generateKey } from '../common/genarate-key.utils';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SUPER_CACHE_EVENT_HANDLER } from '../constants';
import _ from 'lodash';
import { RequestContext } from '@libs/super-request-context';
import { appSettings } from 'src/configs/app-settings';
import { createRedisFolderCollection } from '../common/create-redis-folder-collection.utils';
import { COLLECTION_NAMES } from 'src/constants';
import { Types } from 'mongoose';

export function SGetCache() {
    let superCacheService: SuperCacheService;
    let eventEmitter: EventEmitter2;

    return function (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor,
    ) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (...args: any[]) {
            if (this.collectionName === COLLECTION_NAMES.AUDIT) {
                return originalMethod.apply(this, args);
            }

            if (!superCacheService || !eventEmitter) {
                const moduleRef = (this.constructor as any)
                    .moduleRef as ModuleRef;
                if (moduleRef) {
                    superCacheService = moduleRef.get(SuperCacheService, {
                        strict: false,
                    });
                    eventEmitter = moduleRef.get(EventEmitter2, {
                        strict: false,
                    });
                } else {
                    throw new Error(
                        'ModuleRef is not available. Ensure your class is registered in the module.',
                    );
                }
            }

            const req: Request = _.get(
                RequestContext,
                'currentContext.req',
                null,
            );

            const query = _.get(req, 'query', {});
            const locale = _.get(query, 'locale', appSettings.mainLanguage);

            const key = generateKey({
                pipeline: this.pipeline,
                conditions: this.conditions,
                id: this.id,
                collectionName: this.collectionName,
                locale,
                query,
            });

            await createRedisFolderCollection(
                this.collectionName,
                this.entity,
                superCacheService,
            );

            const cacheData = await superCacheService.getDataForCollection(
                this.collectionName,
                key,
            );

            if (cacheData) {
                const convertedData = convertStringToObjectId(cacheData);

                if (Array.isArray(convertedData)) {
                    return convertedData.map((item) =>
                        _.set(item, 'cached', true),
                    );
                } else if (convertedData && typeof convertedData === 'object') {
                    return _.set(convertedData, 'cached', true);
                } else {
                    return convertedData;
                }
            }

            const result = await originalMethod.apply(this, args);

            if (result) {
                eventEmitter.emit(
                    SUPER_CACHE_EVENT_HANDLER.SET,
                    this.collectionName,
                    key,
                    result,
                );
            }

            return result;
        };

        return descriptor;
    };
}

const convertStringToObjectId = (data: any): any => {
    if (Array.isArray(data)) {
        return data.map(convertStringToObjectId);
    } else if (data && typeof data === 'object') {
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                if (
                    typeof data[key] === 'string' &&
                    /^[a-fA-F0-9]{24}$/.test(data[key])
                ) {
                    data[key] = new Types.ObjectId(data[key]);
                } else {
                    data[key] = convertStringToObjectId(data[key]);
                }
            }
        }
    }
    return data;
};
