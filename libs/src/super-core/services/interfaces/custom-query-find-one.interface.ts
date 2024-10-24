import { ICustomQueryBase } from './custom-query-base.interface';

export interface ICustomQueryFindOne extends ICustomQueryBase {
    autoPopulate(): this;
}
