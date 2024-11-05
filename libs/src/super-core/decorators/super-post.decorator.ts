import { applyDecorators, Post } from '@nestjs/common';
import { addDtoProperties } from '../modules/data-transfer-objects/common/add-dto-properties.utils';
import { ApiBearerAuth, ApiBody, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { appSettings } from 'src/configs/app-settings';

export interface SuperPostOptions {
    route?: string;
    input?: new () => any;
    output?: new () => any;
}

export const SuperPost = (option?: SuperPostOptions) => {
    const { route, input, output } = option || {};

    const decorators = [
        ApiBearerAuth(),
        ApiQuery({
            name: 'locale',
            type: String,
            required: false,
            description: 'Locale of the request',
            example: appSettings.mainLanguage,
        }),
        Post(route),
    ];

    if (input) {
        addDtoProperties(input);
        decorators.push(ApiBody({ type: input }));
    }

    if (output) {
        decorators.push(
            ApiResponse({
                status: 201,
                description: 'Successful response',
                type: output,
            }),
        );
    }

    return applyDecorators(...decorators);
};
