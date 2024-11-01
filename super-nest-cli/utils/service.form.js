export const Service = (name) => {
    return `import { Injectable } from '@nestjs/common';
import { ExtendedInjectModel } from '@libs/super-core';
import { ExtendedModel } from '@libs/super-core/interfaces/extended-model.interface';
import { BaseService } from 'src/base/service/base.service';
import { ${name[2]}Document } from './entities/${name[0]}.entity';
import { COLLECTION_NAMES } from 'src/constants';

@Injectable()
export class ${name[2]}Service extends BaseService<${name[2]}Document> {
    constructor(
        @ExtendedInjectModel(COLLECTION_NAMES.${name[4]})
        private readonly ${name[1]}Model: ExtendedModel<${name[2]}Document>,
    ) {
        super(${name[1]}Model);
    }
}
`;
};
