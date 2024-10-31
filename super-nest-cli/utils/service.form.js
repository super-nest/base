export const Service = (name) => {
    return `import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/base/service/base.service';
import { ${name[2]}, ${name[2]}Document } from './entities/${name[0]}.entity';
import { InjectModel } from '@nestjs/mongoose';
import { COLLECTION_NAMES } from 'src/constants';
import { Update${name[2]}Dto } from './dto/update-${name[0]}.dto';
import { Create${name[2]}Dto } from './dto/create-${name[0]}.dto';
import { ModuleRef } from '@nestjs/core';
import { Model } from 'mongoose';

@Injectable()
export class ${name[2]}Service extends BaseService<${name[2]}Document, ${name[2]}> {
    constructor(
        @InjectModel(COLLECTION_NAMES.${name[4]})
        private readonly ${name[1]}Model: Model<${name[2]}Document>,
        moduleRef: ModuleRef,
    ) {
        super(${name[1]}Model, ${name[2]}, COLLECTION_NAMES.${name[4]}, moduleRef);
    }
}
`;
};
