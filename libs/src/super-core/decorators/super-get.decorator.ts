import { applyDecorators, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { appSettings } from 'src/configs/app-settings';

export interface SuperGetOptions {
    route?: string;
    output?: new () => any;
    isArrayOutput?: boolean;
    description?: string;
    status?: number;
}

export const SuperGet = (options?: SuperGetOptions) => {
    const {
        route,
        output,
        isArrayOutput = false,
        description = 'Successful response',
        status = 200,
    } = options || {};

    const decorators = [
        ApiBearerAuth(),
        ApiQuery({
            name: 'locale',
            type: String,
            required: false,
            description: 'Locale of the request',
            example: appSettings.mainLanguage,
        }),
        Get(route),
    ];

    if (output) {
        decorators.push(
            ApiResponse({
                status,
                description,
                type: output,
                isArray: isArrayOutput,
            }),
        );
    }

    return applyDecorators(...decorators);
};
