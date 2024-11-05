import { SuperApiProperty } from '@libs/super-core/decorators/super-api-property.decorator';

export class UploadMediaDto {
    @SuperApiProperty({ type: 'string', format: 'binary' })
    file: any;
}
