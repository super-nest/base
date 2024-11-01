export const Module = (name) => {
    return `import { Module } from '@nestjs/common';
import { ExtendedMongooseModule } from '@libs/super-core/modules/mongoose/extended-mongoose.module';
import { COLLECTION_NAMES } from 'src/constants';
import { ${name[2]}Service } from './${name[0]}.service';
import { ${name[5]}, ${name[5]}Schema } from './entities/${name[0]}.entity';

@Module({
    imports: [
        ExtendedMongooseModule.forFeature([
            {
                name: COLLECTION_NAMES.${name[4]}, 
                schema: ${name[5]}Schema,
                entity: ${name[5]},
            },
        ]),
    ],
    controllers: [],
    providers: [${name[2]}Service],
    exports: [${name[2]}Service],
})
export class ${name[2]}Module {}
`;
};
