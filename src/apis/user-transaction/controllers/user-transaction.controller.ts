import { Controller, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { UserTransactionService } from 'src/apis/user-transaction/user-transaction.service';
import { COLLECTION_NAMES } from 'src/constants';
import {
    PagingDtoPipe,
    ExtendedPagingDto,
} from 'src/pipes/page-result.dto.pipe';
import { AuditLog } from 'src/packages/audits/decorators/audits.decorator';
import { AUDIT_EVENT } from 'src/packages/audits/constants';
import { SuperGet } from '@libs/super-core/decorators/super-get.decorator';
import { SuperAuthorize } from '@libs/super-authorize/decorators/authorize.decorator';
import { PERMISSION, Resource } from '@libs/super-authorize';
import { UserPayload } from 'src/base/models/user-payload.model';
import { ParamTimeType } from '../constants';
import { Me } from 'src/decorators/me.decorator';

@Controller('user-transactions')
@Resource('user-transactions')
@ApiTags('Front: User Transactions')
@AuditLog({
    events: [AUDIT_EVENT.POST, AUDIT_EVENT.PUT, AUDIT_EVENT.DELETE],
    refSource: COLLECTION_NAMES.USER_TRANSACTION,
})
export class UserTransactionController {
    constructor(
        private readonly userTransactionService: UserTransactionService,
    ) {}

    @SuperGet({ route: '/earn/total' })
    @ApiBearerAuth()
    @SuperAuthorize(PERMISSION.GET)
    async getTotalEarn(@Me() user: UserPayload) {
        return await this.userTransactionService.getTotalEarn(user._id);
    }

    @SuperGet({ route: ':type' })
    @ApiBearerAuth()
    @SuperAuthorize(PERMISSION.GET)
    @ApiParam({
        enum: ParamTimeType,
        required: false,
        name: 'type',
    })
    async getAll(
        @Query(new PagingDtoPipe())
        queryParams: ExtendedPagingDto,
        @Param('type') type: ParamTimeType,
        @Me() user: UserPayload,
    ) {
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));

        const startOfYesterday = new Date(startOfDay);
        startOfYesterday.setDate(startOfYesterday.getDate() - 1);

        const endOfYesterday = new Date(startOfDay);
        endOfYesterday.setMilliseconds(-1);

        const endOfBeforeYesterday = new Date(startOfYesterday);
        endOfBeforeYesterday.setMilliseconds(-1);
        const query: any = {
            createdBy: new Types.ObjectId(user._id),
        };

        switch (type) {
            case ParamTimeType.TODAY:
                query.createdAt = { $gte: startOfDay, $lt: endOfDay };
                break;
            case ParamTimeType.YESTERDAY:
                query.createdAt = {
                    $gte: startOfYesterday,
                    $lt: endOfYesterday,
                };
                break;
            case ParamTimeType.EARLIER:
                query.createdAt = { $lt: endOfBeforeYesterday };
                break;
        }
        const result = await this.userTransactionService.getAll(
            queryParams,
            query,
        );
        return result;
    }
}
