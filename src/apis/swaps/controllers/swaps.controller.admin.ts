import { Controller, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SwapsService } from '../swaps.service';
import {
    ExtendedPagingDto,
    PagingDtoPipe,
} from 'src/pipes/page-result.dto.pipe';
import { SuperGet } from '@libs/super-core';
import { PERMISSION, Resource, SuperAuthorize } from '@libs/super-authorize';
import { AuditLog } from 'src/packages/audits/decorators/audits.decorator';
import { AUDIT_EVENT } from 'src/packages/audits/constants';
import { COLLECTION_NAMES } from 'src/constants';

@Controller('swaps')
@ApiTags('Admin: Swaps')
@Resource('swaps')
@AuditLog({
    events: [AUDIT_EVENT.POST, AUDIT_EVENT.PUT, AUDIT_EVENT.DELETE],
    refSource: COLLECTION_NAMES.USER_SWAP,
})
export class SwapsControllerAdmin {
    constructor(private readonly swapsService: SwapsService) {}

    @SuperGet()
    @SuperAuthorize(PERMISSION.GET)
    async getAll(
        @Query(new PagingDtoPipe())
        queryParams: ExtendedPagingDto,
    ) {
        const result = await this.swapsService.getAll(queryParams);
        return result;
    }
}
