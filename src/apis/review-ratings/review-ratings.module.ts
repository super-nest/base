import { ReviewRatingService } from './review-ratings.service';
import { Module } from '@nestjs/common';
import { COLLECTION_NAMES } from 'src/constants';
import {
    ReviewRating,
    ReviewRatingSchema,
} from './entities/review-ratings.entity';
import { WebsocketModule } from 'src/packages/websocket/websocket.module';
import { AppsModule } from '../apps/apps.module';
import { ExtendedMongooseModule } from '@libs/super-core/modules/mongoose/extended-mongoose.module';

@Module({
    imports: [
        ExtendedMongooseModule.forFeature([
            {
                name: COLLECTION_NAMES.REVIEW_RATING,
                schema: ReviewRatingSchema,
                entity: ReviewRating,
            },
        ]),
        WebsocketModule,
        AppsModule,
    ],
    controllers: [],
    providers: [ReviewRatingService],
    exports: [ReviewRatingService],
})
export class ReviewRatingModule {}
