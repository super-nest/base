import { SchemaFactory, Schema } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { COLLECTION_NAMES } from 'src/constants';
import autopopulateSoftDelete from 'src/utils/mongoose-plugins/autopopulate-soft-delete';
import { AggregateRoot } from 'src/base/entities/aggregate-root.schema';
import { SuperProp } from '@libs/super-core';

export type CountriesDocument = Countries & Document;

@Schema({
  timestamps: true,
  collection: COLLECTION_NAMES.COUNTRIES,
})
export class Countries extends AggregateRoot {
  @SuperProp({
    type: String,
    required: true,
    cms: {
      label: 'name',
      tableShow: true,
      index: true,
      columnPosition: 1,
    },
  })
  name: string;

  @SuperProp({
    type: String,
    required: false,
    cms: {
      label: 'phoneCode',
      tableShow: false,
    },
  })
  phoneCode: string;

 
}

export const CountriesSchema = SchemaFactory.createForClass(Countries);
CountriesSchema.plugin(autopopulateSoftDelete);
