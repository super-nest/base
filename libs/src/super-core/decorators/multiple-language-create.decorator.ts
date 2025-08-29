import { applyMultipleLanguage } from '../services/query';
import _ from 'lodash';
import { appSettings } from 'src/configs/app-settings';
import { RequestContext } from '@libs/super-request-context';

export function MultipleLanguageCreate(localeParam?: string) {
    return function (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor,
    ) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (...args: any[]) {
            const req: Request = _.get(
                RequestContext,
                'currentContext.req',
                null,
            );

            if (!req) {
                return originalMethod.apply(this, args);
            }

            const query = _.get(req, 'query', {});
            const locale =
                localeParam || _.get(query, 'locale', appSettings.mainLanguage);
            const [doc] = args;

            // Apply multiple language logic before calling original method
            if (this.model && doc) {
                await applyMultipleLanguage(
                    'create',
                    this.model,
                    doc,
                    locale,
                    Array.isArray(doc),
                );
            }

            return originalMethod.apply(this, args);
        };

        return descriptor;
    };
}
