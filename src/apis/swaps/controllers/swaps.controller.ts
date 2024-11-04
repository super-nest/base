import { Body, Controller, Query, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SwapsService } from '../swaps.service';
import { PERMISSION, Resource, SuperAuthorize } from '@libs/super-authorize';
import { AuditLog } from 'src/packages/audits/decorators/audits.decorator';
import { AUDIT_EVENT } from 'src/packages/audits/constants';
import { COLLECTION_NAMES } from 'src/constants';
import { SuperGet, SuperPost } from '@libs/super-core';
import { CreateSwapsDto } from '../dto/create-swaps.dto';
import { Me } from 'src/decorators/me.decorator';
import { UserPayload } from 'src/base/models/user-payload.model';
import {
    ExtendedPagingDto,
    PagingDtoPipe,
} from 'src/pipes/page-result.dto.pipe';
import { AfterSwapsDto } from '../dto/after-swaps.dto';

@Controller('swaps')
@ApiTags('Front: Swaps')
@Resource('swaps')
@AuditLog({
    events: [AUDIT_EVENT.POST, AUDIT_EVENT.PUT, AUDIT_EVENT.DELETE],
    refSource: COLLECTION_NAMES.USER_SWAP,
})
export class SwapsController {
    constructor(private readonly swapsService: SwapsService) {}

    @SuperPost({ route: 'after-swap', dto: AfterSwapsDto })
    @SuperAuthorize(PERMISSION.POST)
    async afterSwap(
        @Me() user: UserPayload,
        @Body() afterSwapsDto: AfterSwapsDto,
    ) {
        return await this.swapsService.afterSwap(afterSwapsDto, user);
    }

    @SuperGet()
    @SuperAuthorize(PERMISSION.GET)
    async getAll(
        @Query(new PagingDtoPipe())
        queryParams: ExtendedPagingDto,
        @Me() user: UserPayload,
    ) {
        const result = await this.swapsService.getAll(queryParams, {
            createdBy: user._id,
        });
        return result;
    }

    @SuperPost({ dto: CreateSwapsDto })
    @SuperAuthorize(PERMISSION.POST)
    async swap(
        @Body() createSwapsDto: CreateSwapsDto,
        @Me() user: UserPayload,
        @Req() req: { headers: Record<string, string> },
    ) {
        const origin = req.headers['origin'];
        return await this.swapsService.swap(createSwapsDto, user, origin);
    }
}
