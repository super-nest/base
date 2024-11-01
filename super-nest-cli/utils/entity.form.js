export const Entities = (name) => {
    return `import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { AggregateRoot } from 'src/base/entities/aggregate-root.schema';
import { COLLECTION_NAMES } from 'src/constants';
import autopopulateSoftDelete from 'src/utils/mongoose-plugins/autopopulate-soft-delete';
@Schema({
    timestamps: true,
    collection: COLLECTION_NAMES.${name[4]},
})
export class ${name[2]} extends AggregateRoot {}

export type ${name[2]}Document = ${name[2]} & Document;
export const ${name[2]}Schema = SchemaFactory.createForClass(${name[2]});
${name[2]}Schema.plugin(autopopulateSoftDelete);
`;
};
