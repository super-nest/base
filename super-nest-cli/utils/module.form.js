export const Module = (name) => {
    return `import { MongooseModule } from '@nestjs/mongoose';
import { ${name[2]}Service } from './${name[0]}.service';
import { Module } from '@nestjs/common';
import { COLLECTION_NAMES } from 'src/constants';
import { ${name[2]}Schema } from './entities/${name[0]}.entity';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: COLLECTION_NAMES.${name[4]}, schema: ${name[2]}Schema },
        ]),
    ],
    controllers: [],
    providers: [${name[2]}Service],
    exports: [${name[2]}Service],
})
export class ${name[2]}Module {}
`;
};
