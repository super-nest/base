import { DECORATORS } from '@nestjs/swagger/dist/constants';
import { DTOMetadataStorage } from '../storages/data-transfer-objects.storage';
import {
    DTOMetadata,
    DTOMetadataForm,
} from '../metadata/data-transfer-objects.interface';
import _ from 'lodash';
import { isClass } from '@libs/super-core';

export const addDtoProperties = (dto: new () => any) => {
    const properties =
        Reflect.getMetadata(
            DECORATORS.API_MODEL_PROPERTIES_ARRAY,
            dto.prototype,
        ) || [];

    const form: DTOMetadataForm = {};
    for (const property of properties) {
        const [, propertyKey] = property.split(':');

        const propertyData = Reflect.getMetadata(
            DECORATORS.API_MODEL_PROPERTIES,
            dto.prototype,
            propertyKey,
        );

        form[propertyKey] = {
            title: _.get(propertyData, 'title', propertyKey),
            type: _.lowerCase(_.get(propertyData, 'type.name', 'String')),
            isArray: _.get(propertyData, 'isArray', false),
            ref: _.get(propertyData, 'cms.ref', null),
            required: _.get(propertyData, 'required', false),
            form: null,
            isShow: _.get(propertyData, 'cms.isShow', true),
            widget: _.get(propertyData, 'cms.widget', null),
            enum: _.get(propertyData, 'enum', null),
            minimum: _.get(propertyData, 'minimum', null),
            maximum: _.get(propertyData, 'maximum', null),
            maxLength: _.get(propertyData, 'maxLength', null),
            description: _.get(propertyData, 'description', null),
        };

        const type = _.get(propertyData, 'type');
        if (isClass(type)) {
            form[propertyKey].form = addDtoProperties(type);
            form[propertyKey].type = 'object';
        }
    }

    const dtoMetadata: DTOMetadata = {
        name: dto.name,
        form,
    };

    DTOMetadataStorage.addDTOMetadata(dtoMetadata);

    return dtoMetadata;
};
