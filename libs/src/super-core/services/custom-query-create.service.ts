import { Document } from 'mongoose';
import { DeleteCache } from '@libs/super-cache';
import { CustomQueryBaseService } from 'libs/src/super-core/services/base-query.service';
import { applyMultipleLanguage } from './query';

export class CustomQueryCreateService<
    T extends Document,
> extends CustomQueryBaseService<T> {
    private data: Partial<T> = {};
    private options: Record<string, any> = {};
    private locale?: string;
    private isArray: boolean = false;

    setData(data: Partial<T>): this {
        this.data = { ...this.data, ...data };
        return this;
    }

    multipleLanguage(locale: string, isArray: boolean = false): this {
        this.locale = locale;
        this.isArray = isArray;
        return this;
    }

    // @DeleteCache()
    private async exec(): Promise<T> {
        const createData = {
            ...this.data,
            ...this.options,
        };

        // Apply multiple language logic if locale is provided
        if (this.locale) {
            await applyMultipleLanguage(
                'create',
                this.model,
                createData,
                this.locale,
                this.isArray,
            );
        }

        const result = await this.model.create(
            createData?._doc ? createData._doc : createData,
        );
        return result;
    }

    async then<TResult1 = T, TResult2 = never>(
        onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null,
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
