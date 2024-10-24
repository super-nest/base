import { COLLECTION_NAMES } from 'src/constants';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ModuleRef } from '@nestjs/core';
import { createRedisFolderCollection } from '../common/create-redis-folder-collection.utils';
import { SuperCacheService } from '../super-cache.service';

export function DeleteCache() {
    let superCacheService: SuperCacheService;
    let eventEmitter: EventEmitter2;
    return (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor,
    ) => {
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

            const collectionName: COLLECTION_NAMES = this.collectionName;

            await createRedisFolderCollection(
                this.collectionName,
                this.entity,
                superCacheService,
            );

            if (!collectionName) {
                throw new Error('Collection name must be provided');
            }

            await superCacheService.deleteForDataCollection(collectionName);

            await createRedisFolderCollection(
                this.collectionName,
                this.entity,
                superCacheService,
            );

            return originalMethod.apply(this, args);
        };

        return descriptor;
    };
}
