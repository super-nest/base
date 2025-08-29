import { ApiParam } from '@nestjs/swagger';

/**
 * Parse route parameters and generate ApiParam decorators
 * @param route - The route string containing parameters (e.g., '/users/:id')
 * @param paramTypes - Object mapping parameter names to their types
 * @returns Array of ApiParam decorators
 */
export const parseRouteParams = (
    route: string,
    paramTypes: Record<string, any> = {},
): any[] => {
    const decorators: any[] = [];
    const paramMatches = route.match(/:([^\/]+)/g);

    if (paramMatches) {
        paramMatches.forEach((param) => {
            const paramName = param.substring(1); // Remove the ':'
            const paramType = paramTypes[paramName] || String;
            decorators.push(
                ApiParam({
                    name: paramName,
                    type: paramType,
                }),
            );
        });
    }

    return decorators;
};
