import { ICustomQueryBase } from './custom-query-base.interface';

export interface ICustomQueryCountDocuments extends ICustomQueryBase {
    skip(value: number): this;
    limit(value: number): this;
    exec(): Promise<number>;
}
