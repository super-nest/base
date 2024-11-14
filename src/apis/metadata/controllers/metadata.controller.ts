import { ApiTags } from '@nestjs/swagger';
import { COLLECTION_NAMES } from 'src/constants';
import { AuditLog } from 'src/packages/audits/decorators/audits.decorator';
import { AUDIT_EVENT } from 'src/packages/audits/constants';
import { MetadataService } from '../metadata.service';
import { Controller, Param } from '@nestjs/common';
import { Resource } from '@libs/super-authorize';

@Controller('metadata')
@Resource('metadata')
@ApiTags('Front: Metadata')
@AuditLog({
    events: [AUDIT_EVENT.POST, AUDIT_EVENT.PUT, AUDIT_EVENT.DELETE],
    refSource: COLLECTION_NAMES.METADATA,
})
export class MetadataController {
    constructor(private readonly metadataService: MetadataService) {}
}
