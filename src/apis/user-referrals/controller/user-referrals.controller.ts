import { Controller, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserPayload } from 'src/base/models/user-payload.model';
import { COLLECTION_NAMES } from 'src/constants';
import { AuditLog } from 'src/packages/audits/decorators/audits.decorator';
import { AUDIT_EVENT } from 'src/packages/audits/constants';
import { SuperGet } from '@libs/super-core/decorators/super-get.decorator';
import { SuperAuthorize } from '@libs/super-authorize/decorators/authorize.decorator';
import { PERMISSION, Resource } from '@libs/super-authorize';
import { UserReferralsService } from '../user-referrals.service';
import {
    ExtendedPagingDto,
    PagingDtoPipe,
} from 'src/pipes/page-result.dto.pipe';
import { Me } from 'src/decorators/me.decorator';

@Controller('user-referral')
@Resource('user-referral')
@ApiTags('Front: User Referral')
@AuditLog({
    events: [AUDIT_EVENT.POST, AUDIT_EVENT.PUT, AUDIT_EVENT.DELETE],
    refSource: COLLECTION_NAMES.USER_REFERRAL,
})
export class UserReferralsController {
    constructor(private readonly userReferral: UserReferralsService) {}

    @SuperGet()
    @SuperAuthorize(PERMISSION.GET)
    async getReferral(
        @Me() user: UserPayload,
        @Query(new PagingDtoPipe())
        queryParams: ExtendedPagingDto,
    ) {
        return this.userReferral.getReferralFront(user._id, queryParams);
    }
}
