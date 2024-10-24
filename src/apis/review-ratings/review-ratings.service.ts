import { BadRequestException, Injectable } from '@nestjs/common';
import { BaseService } from 'src/base/service/base.service';
import { ReviewRatingDocument } from './entities/review-ratings.entity';
import { COLLECTION_NAMES } from 'src/constants';
import { Types } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserPayload } from 'src/base/models/user-payload.model';
import { CreateReviewRatingDto } from './dto/create-review-rating.dto';
import _ from 'lodash';
import { SumRatingAppModel } from '../apps/models/sum-rating-app.model';
import { APP_EVENT_HANDLER } from '../apps/constants';
import { ExtendedPagingDto } from 'src/pipes/page-result.dto.pipe';
import { pagination } from '@libs/super-search';
import { WebsocketGateway } from 'src/packages/websocket/websocket.gateway';
import { AppsService } from '../apps/apps.service';
import { ExtendedInjectModel } from '@libs/super-core';
import { ExtendedModel } from '@libs/super-core/interfaces/extended-model.interface';

@Injectable()
export class ReviewRatingService extends BaseService<ReviewRatingDocument> {
    constructor(
        @ExtendedInjectModel(COLLECTION_NAMES.REVIEW_RATING)
        private readonly reviewModel: ExtendedModel<ReviewRatingDocument>,
        private readonly eventEmitter: EventEmitter2,
        private readonly websocketGateway: WebsocketGateway,
        private readonly appService: AppsService,
    ) {
        super(reviewModel);
    }

    async getAllForFront(
        queryParams: ExtendedPagingDto,
        appId: Types.ObjectId,
    ) {
        const {
            page,
            limit,
            sortBy,
            sortDirection,
            skip,
            filterPipeline,
            select,
        } = queryParams;

        const app = await this.appService.model
            .findOne({
                $or: [{ _id: appId }, { slug: appId }],
            })
            .exec();

        if (!app) {
            return null;
        }

        const result = this.reviewModel
            .find(
                {
                    app: app._id,
                },
                [
                    ...filterPipeline,
                    {
                        $lookup: {
                            from: 'files',
                            localField: 'createdBy.avatar',
                            foreignField: '_id',
                            as: 'createdBy.avatar',
                        },
                    },
                    {
                        $unwind: {
                            path: '$createdBy.avatar',
                            preserveNullAndEmptyArrays: true,
                        },
                    },
                ],
            )
            .limit(limit)
            .skip(skip)
            .sort({ [sortBy]: sortDirection })
            .select(select)
            .autoPopulate()
            .exec();

        const total = this.reviewModel
            .countDocuments(
                {
                    app: app._id,
                },
                filterPipeline,
            )
            .exec();

        return Promise.all([result, total]).then(([items, total]) => {
            const meta = pagination(items, page, limit, total);
            return { items, meta };
        });
    }

    async createOne(
        createReviewRatingDto: CreateReviewRatingDto,
        user: UserPayload,
        options?: Record<string, any>,
    ) {
        const { _id: userId } = user;
        const { app } = createReviewRatingDto;

        await this.userJustOneReviewEachApp(userId, app);

        const result = await this.reviewModel.create({
            ...createReviewRatingDto,
            ...options,
            createdBy: userId,
        });

        if (result) {
            const sumRatingAppModel: SumRatingAppModel = {
                app: _.get(result, 'app', null),
                star: _.get(result, 'star', 0),
            };
            this.eventEmitter.emit(
                APP_EVENT_HANDLER.ADD_RATING_FOR_USER,
                sumRatingAppModel,
            );

            await this.sendReviewRatingToClient(result._id, app);
        }

        return result;
    }

    async userJustOneReviewEachApp(
        createdBy: Types.ObjectId,
        app: Types.ObjectId,
    ) {
        const review = await this.reviewModel
            .findOne({
                createdBy: createdBy,
                app: app,
            })
            .autoPopulate(false)
            .exec();

        if (review) {
            throw new BadRequestException('You have already reviewed this app');
        }
    }

    async reviewRatingOverviewForApp(appId: Types.ObjectId) {
        const app = await this.appService.model
            .findOne({
                $or: [{ _id: appId }, { slug: appId }],
            })
            .exec();

        if (!app) {
            return null;
        }

        const reviews = await this.reviewModel
            .find({
                app: app._id,
            })
            .exec();

        const totalReviews = reviews.length;
        const starRatingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

        reviews.forEach((review) => {
            starRatingDistribution[review.star] += 1;
        });

        const avgRating =
            reviews.reduce((acc, review) => acc + review.star, 0) /
            totalReviews;

        return {
            totalReviews,
            avgRating,
            starRatingDistribution,
        };
    }

    private async sendReviewRatingToClient(
        reviewRatingId: Types.ObjectId,
        appId: Types.ObjectId,
    ) {
        const result = await this.reviewModel
            .findOne(
                {
                    _id: new Types.ObjectId(reviewRatingId),
                },
                [
                    {
                        $lookup: {
                            from: 'files',
                            localField: 'createdBy.avatar',
                            foreignField: '_id',
                            as: 'createdBy.avatar',
                        },
                    },
                    {
                        $unwind: {
                            path: '$createdBy.avatar',
                            preserveNullAndEmptyArrays: true,
                        },
                    },
                ],
            )
            .exec();

        this.websocketGateway.sendNewReviewRating(appId, result);
    }
}
