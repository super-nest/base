import { Schema } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';
import { SuperProp } from '@libs/super-core/decorators/super-prop.decorator';
import { COLLECTION_NAMES } from 'src/constants';

@Schema()
export abstract class AggregateRoot extends Document<Types.ObjectId> {
    @SuperProp({
        default: null,
        cms: {
            label: 'Deleted At',
        },
    })
    deletedAt: Date;

    @SuperProp({
        type: Types.ObjectId,
        ref: COLLECTION_NAMES.USER,
        cms: {
            label: 'Updated By',
        },
    })
    updatedBy: Types.ObjectId;

    @SuperProp({
        type: Types.ObjectId,
        ref: COLLECTION_NAMES.USER,
        cms: {
            label: 'Deleted By',
        },
    })
    deletedBy: Types.ObjectId;

    createdAt: Date;
    updatedAt: Date;
    _id: Types.ObjectId;
}
