import { ICustomQueryBase } from './custom-query-base.interface';

export interface ICustomQueryFindAll extends ICustomQueryBase {
    skip(value: number): this;
    limit(value: number): this;
    autoPopulate(): this;
}
