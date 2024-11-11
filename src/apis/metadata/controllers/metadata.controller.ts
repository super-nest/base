import { ApiParam, ApiTags } from '@nestjs/swagger';
import { COLLECTION_NAMES } from 'src/constants';
import { AuditLog } from 'src/packages/audits/decorators/audits.decorator';
import { AUDIT_EVENT } from 'src/packages/audits/constants';
import { MetadataService } from '../metadata.service';
import { Controller, Param } from '@nestjs/common';
import { Resource } from '@libs/super-authorize';
import { SuperGet } from '@libs/super-core';

@Controller('metadata')
@Resource('metadata')
@ApiTags('Front: Metadata')
@AuditLog({
    events: [AUDIT_EVENT.POST, AUDIT_EVENT.PUT, AUDIT_EVENT.DELETE],
    refSource: COLLECTION_NAMES.METADATA,
})
export class MetadataController {
    constructor(private readonly metadataService: MetadataService) {}

    @SuperGet({ route: 'swap/:key' })
    @ApiParam({
        name: 'key',
        type: String,
        example: 'rate | fee | min-amount | max-amount',
    })
    async getOneSwapInfoByKey(
        @Param('key') key: 'rate' | 'fee' | 'min-amount' | 'max-amount',
    ) {
        return this.metadataService.getOneSwapInfoByKey(key);
    }
}
