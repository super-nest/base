import { applyDecorators } from '@nestjs/common';
import { Prop } from '@nestjs/mongoose';
import { SchemaTypeOptions, Types } from 'mongoose';

export class SuperPropOptions extends SchemaTypeOptions<any> {
    autoPopulateExclude?: boolean;
    refClass?: any;
    cms?: {
        label?: string;
        tableShow?: boolean;
        index?: boolean;
        columnPosition?: number;
    };
}

export const SuperProp = (options?: SuperPropOptions) => {
    const { type } = options;
    if (type === Types.ObjectId) {
        options.set = (value: any) =>
            value ? new Types.ObjectId(value) : value;
    }
    return applyDecorators(Prop(options));
};
