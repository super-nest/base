import { Controller, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AdvertisersService } from '../advertisers.service';
import {
    ExtendedPagingDto,
    PagingDtoPipe,
} from 'src/pipes/page-result.dto.pipe';
import { populateGroupBannerImageAggregate } from '../common/populate-group-banner-image.aggregate';
import { AuditLog } from 'src/packages/audits/decorators/audits.decorator';
import { AUDIT_EVENT } from 'src/packages/audits/constants';
import { COLLECTION_NAMES } from 'src/constants';
import { SuperGet } from '@libs/super-core/decorators/super-get.decorator';
import { Resource } from '@libs/super-authorize';

@Controller('advertisers')
@Resource('advertisers')
@ApiTags('Front: Advertisers')
@AuditLog({
    events: [AUDIT_EVENT.POST, AUDIT_EVENT.PUT, AUDIT_EVENT.DELETE],
    refSource: COLLECTION_NAMES.ADVERTISER,
})
export class AdvertisersController {
    constructor(private readonly advertisersService: AdvertisersService) {}

    @SuperGet()
    async getAll(
        @Query(new PagingDtoPipe())
        queryParams: ExtendedPagingDto,
    ) {
        const result = await this.advertisersService.getAll(queryParams);
        return result;
    }

    @SuperGet({ route: ':slug' })
    async getOneBySlug(@Param('slug') slug: string) {
        const result = await this.advertisersService.model
            .findOne({ slug }, populateGroupBannerImageAggregate)
            .autoPopulate();

        return result;
    }
}
