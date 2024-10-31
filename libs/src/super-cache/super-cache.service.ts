import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { REDIS_FOLDER_NAME } from './constants';
import { CollectionModel } from './models/collections.model';

@Injectable()
export class SuperCacheService implements OnModuleInit {
    private readonly logger = new Logger(SuperCacheService.name);
    constructor(
        @Inject(CACHE_MANAGER)
        private cacheManager: Cache,
    ) {}

    async onModuleInit() {
        return await this.resetCache();
    }

    async get<T>(key: string) {
        return await this.cacheManager.get<T>(key);
    }

    async delete(key: string) {
        return await this.cacheManager.del(key);
    }

    async set(key: string, data: any, ttl = 1) {
        const randomFactor = Math.floor(
            Math.random() * (ttl * 0.1 * 60 * 60 * 1000),
        );
        const finalTTL = ttl * 60 * 60 * 1000 + randomFactor;
        return await this.cacheManager.set(key, data, finalTTL).catch((e) => {
            this.logger.error(e);
        });
    }

    async setOneCollection(
        mainCollectionName: string,
        relationCollectionNames: any,
    ) {
        const collection = await this.getOneCollection(mainCollectionName);

        if (collection) {
            return;
        }

        return await this.cacheManager.set(
            `${REDIS_FOLDER_NAME.COLLECTION}:${mainCollectionName}`,
            {
                mainCollectionName,
                relationCollectionNames,
            },
        );
    }

    async getOneCollection(mainCollectionName: string) {
        const data = await this.cacheManager.get(
            `${REDIS_FOLDER_NAME.COLLECTION}:${mainCollectionName}`,
        );
        return data;
    }

    async deleteForDataCollection(mainCollectionName: string) {
        const collections = await this.getAllCollection();

        if (!collections || !collections?.length) {
            return;
        }

        const keys: string[] = await this.cacheManager.store.keys(
            `${mainCollectionName}:*`,
        );

        if (!keys.length) {
            return;
        }

        await Promise.all(keys.map((key) => this.cacheManager.del(key)));

        const relationCollectionNames = collections.filter((collection) =>
            collection?.relationCollectionNames?.includes(mainCollectionName),
        );

        await this.deleteForDataCollectionRelation(relationCollectionNames);
    }

    async setDataForCollection(
        mainCollectionName: string,
        key: string,
        data: any,
    ) {
        await this.set(`${mainCollectionName}:${key}`, data);
    }

    private async deleteForDataCollectionRelation(
        collectionRelations: CollectionModel[],
    ) {
        if (!collectionRelations || !collectionRelations?.length) {
            return;
        }

        for (const collection of collectionRelations) {
            const keys: string[] = await this.cacheManager.store.keys(
                `${collection.mainCollectionName}:*`,
            );

            if (!keys.length) {
                return;
            }

            await Promise.all(keys.map((key) => this.cacheManager.del(key)));
        }
    }

    async getDataForCollection(mainCollectionName: string, key: string) {
        const data = await this.get(`${mainCollectionName}:${key}`);
        return data;
    }

    async getAllKeyInFolder(folderName: string) {
        try {
            const keys = await this.cacheManager.store.keys(`${folderName}:*`);
            return keys;
        } catch (error) {
            this.logger.error('error getAllKeyInFolder', error);
        }
    }

    async resetCache() {
        await this.cacheManager.reset();
    }

    private async getAllCollection(): Promise<CollectionModel[]> {
        const keys = await this.cacheManager.store.keys(
            `${REDIS_FOLDER_NAME.COLLECTION}:*`,
        );

        if (!keys.length) {
            return null;
        }

        const data: CollectionModel[] = await Promise.all(
            keys.map((key) => this.cacheManager.get<CollectionModel>(key)),
        );

        return data;
    }
}
