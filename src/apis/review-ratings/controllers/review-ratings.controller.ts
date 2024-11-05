import { Body, Query, Param, Controller } from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { ReviewRatingService } from '../review-ratings.service';
import { COLLECTION_NAMES } from 'src/constants';
import { UserPayload } from 'src/base/models/user-payload.model';
import { CreateReviewRatingDto } from '../dto/create-review-rating.dto';
import {
    ExtendedPagingDto,
    PagingDtoPipe,
} from 'src/pipes/page-result.dto.pipe';
import { ParseObjectIdPipe } from 'src/pipes/parse-object-id.pipe';
import { Types } from 'mongoose';
import { AuditLog } from 'src/packages/audits/decorators/audits.decorator';
import { AUDIT_EVENT } from 'src/packages/audits/constants';

import { SuperPost } from '@libs/super-core/decorators/super-post.decorator';
import { SuperGet } from '@libs/super-core/decorators/super-get.decorator';
import { SuperAuthorize } from '@libs/super-authorize/decorators/authorize.decorator';
import { PERMISSION, Resource } from '@libs/super-authorize';
import { Me } from 'src/decorators/me.decorator';

@Controller('review-ratings')
@Resource('review-ratings')
@ApiTags('Front: Review Ratings')
@AuditLog({
    refSource: COLLECTION_NAMES.REVIEW_RATING,
    events: [AUDIT_EVENT.POST, AUDIT_EVENT.PUT, AUDIT_EVENT.DELETE],
})
export class ReviewRatingController {
    constructor(private readonly reviewRatingService: ReviewRatingService) {}

    @SuperGet({ route: 'overview/:appId' })
    @ApiParam({ name: 'appId', type: String })
    async reviewRatingOverviewForApp(
        @Param('appId', ParseObjectIdPipe) appId: Types.ObjectId,
    ) {
        return await this.reviewRatingService.reviewRatingOverviewForApp(appId);
    }

    @SuperGet({ route: ':appId' })
    @ApiParam({ name: 'appId', type: String })
    async getAll(
        @Query(new PagingDtoPipe())
        queryParams: ExtendedPagingDto,
        @Param('appId', ParseObjectIdPipe) appId: Types.ObjectId,
    ) {
        const result = await this.reviewRatingService.getAllForFront(
            queryParams,
            appId,
        );
        return result;
    }

    @SuperPost({
        input: CreateReviewRatingDto,
    })
    @SuperAuthorize(PERMISSION.POST)
    async create(
        @Body() createReviewRatingDto: CreateReviewRatingDto,
        @Me() user: UserPayload,
    ) {
        const result = await this.reviewRatingService.createOne(
            createReviewRatingDto,
            user,
        );
        return result;
    }
}
