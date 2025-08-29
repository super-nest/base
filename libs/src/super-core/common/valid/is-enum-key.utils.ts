import {
    registerDecorator,
    ValidationOptions,
    ValidationArguments,
} from 'class-validator';

export function IsEnumKey(
    enumType: any,
    validationOptions?: ValidationOptions,
) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isEnumKey',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    if (value === undefined || value === null) {
                        return true;
                    }
                    return Object.keys(enumType).includes(value);
                },
                defaultMessage(args: ValidationArguments) {
                    const enumKeys = Object.keys(enumType).join(', ');
                    return `${args.property} must be one of the following values: ${enumKeys}`;
                },
            },
        });
    };
}
