import { Document } from 'mongoose';
import { ICustomQueryBase } from './custom-query-base.interface';

export interface ICustomQueryFindOne<T extends Document>
    extends ICustomQueryBase {
    exec(): Promise<T | null>;
}
