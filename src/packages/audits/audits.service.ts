import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/base/service/base.service';
import { Audit, AuditDocument } from './entities/audits.entity';
import { COLLECTION_NAMES } from 'src/constants';
import { Types } from 'mongoose';
import { AUDIT_EVENT } from './constants';
import _ from 'lodash';
import { ExtendedInjectModel } from '@libs/super-core';
import { ExtendedModel } from '@libs/super-core/interfaces/extended-model.interface';

@Injectable()
export class AuditsService extends BaseService<AuditDocument> {
    constructor(
        @ExtendedInjectModel(COLLECTION_NAMES.AUDIT)
        private readonly auditModel: ExtendedModel<AuditDocument>,
    ) {
        super(auditModel);
    }

    async createAudit(audit: Audit) {
        const { event, refSource, refId } = audit;

        if (event === AUDIT_EVENT.PUT) {
            audit.oldValues = await this.findOldData(refId, refSource);
        }

        return await this.auditModel.create(audit);
    }

    async findOldData(refId: Types.ObjectId, refSource: string) {
        const result = await this.auditModel
            .findOne({
                $and: [
                    {
                        event: {
                            $in: [AUDIT_EVENT.POST, AUDIT_EVENT.PUT],
                        },
                    },
                ],
                refSource,
                refId,
            })
            .autoPopulate()
            .sort({ createdAt: -1 });

        return _.get(result, 'newValues', {});
    }
}
