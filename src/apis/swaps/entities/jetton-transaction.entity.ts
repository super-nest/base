import { SuperProp } from '@libs/super-core';
import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { AggregateRoot } from 'src/base/entities/aggregate-root.schema';
import { COLLECTION_NAMES } from 'src/constants';

@Schema({
    timestamps: true,
    collection: COLLECTION_NAMES.JETTON_TRANSACTION,
})
export class JettonTransaction extends AggregateRoot {
    @SuperProp({
        type: String,
        unique: true,
    })
    signature: string;

    @SuperProp({
        type: Boolean,
    })
    isSuccess: boolean;

    @SuperProp({
        type: BigInt,
    })
    lt: bigint;
}

export type JettonTransactionDocument = JettonTransaction & Document;
export const JettonTransactionSchema =
    SchemaFactory.createForClass(JettonTransaction);
