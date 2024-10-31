import {
    BadRequestException,
    forwardRef,
    Inject,
    Injectable,
    NotFoundException,
    UnprocessableEntityException,
} from '@nestjs/common';
import { AppDocument, SubmitStatus } from './entities/apps.entity';
import { COLLECTION_NAMES } from 'src/constants';
import mongoose, { PipelineStage, Types } from 'mongoose';
import { SumRatingAppModel } from './models/sum-rating-app.model';
import { activePublications } from 'src/base/aggregates/active-publications.aggregates';
import { UserAppHistoriesService } from '../user-app-histories/user-app-histories.service';
import { UserPayload } from 'src/base/models/user-payload.model';
import { ExtendedPagingDto } from 'src/pipes/page-result.dto.pipe';
import { pagination } from '@libs/super-search';
import { UserService } from '../users/user.service';
import { AddPointForUserDto } from './models/add-point-for-user.model';
import { UserTransactionType } from '../user-transaction/constants';
import { TagAppsService } from '../tag-apps/tag-apps.service';
import { TagsService } from '../tags/tags.service';
import { UserTransactionService } from '../user-transaction/user-transaction.service';
import { MetadataService } from '../metadata/metadata.service';
import { MetadataType } from '../metadata/constants';
import { BaseService } from 'src/base/service/base.service';
import { ExtendedInjectModel } from '@libs/super-core';
import { ExtendedModel } from '@libs/super-core/interfaces/extended-model.interface';
import { appSettings } from 'src/configs/app-settings';

@Injectable()
export class AppsService extends BaseService<AppDocument> {
    constructor(
        @ExtendedInjectModel(COLLECTION_NAMES.APP)
        private readonly appModel: ExtendedModel<AppDocument>,
        private readonly userAppHistoriesService: UserAppHistoriesService,
        @Inject(forwardRef(() => UserService))
        private readonly userServices: UserService,
        private readonly tagAppsService: TagAppsService,
        private readonly tagService: TagsService,
        private readonly userTransactionService: UserTransactionService,
        private readonly metadataService: MetadataService,
    ) {
        super(appModel);
    }
    async getAppById(appId: Types.ObjectId) {
        return await this.appModel.findOne({ _id: appId }).autoPopulate();
    }

    async GetAppCountByStatus() {
        const statusApp = [
            SubmitStatus.Draft,
            SubmitStatus.Pending,
            SubmitStatus.Rejected,
        ];

        const result = await Promise.all(
            statusApp.map(async (status) => {
                return {
                    [status]: await this.appModel.countDocuments({ status }),
                };
            }),
        );
        result.unshift({ All: await this.appModel.countDocuments({}) });

        return result;
    }

    async getAllAppPublish(
        queryParams: ExtendedPagingDto,
        userPayload: UserPayload,
    ) {
        const { _id: userId } = userPayload;
        const {
            page,
            limit,
            sortBy,
            sortDirection,
            skip,
            filterPipeline,
            select,
        } = queryParams;

        activePublications(queryParams.filterPipeline);
        const result = await this.appModel
            .find(
                {
                    $or: [
                        {
                            status: SubmitStatus.Approved,
                        },
                        {
                            status: null,
                        },
                    ],
                },
                filterPipeline,
            )
            .limit(limit)
            .skip(skip)
            .sort({ [sortBy]: sortDirection })
            .select(select)
            .autoPopulate()
            .multipleLanguage(appSettings.mainLanguage);

        const total = await this.appModel
            .countDocuments(
                {
                    $or: [
                        {
                            status: SubmitStatus.Approved,
                        },
                        {
                            status: null,
                        },
                    ],
                },
                filterPipeline,
            )
            .autoPopulate();

        const meta = pagination(result, page, limit, total);
        const items = result.map(async (item) => {
            return {
                ...item,
                isReceivedReward:
                    await this.userTransactionService.checkReceivedReward(
                        userId,
                        item?._id,
                        MetadataType.AMOUNT_REWARD_USER_OPEN_APP,
                    ),
            };
        });

        return Promise.all(items).then((items) => {
            return { items, meta };
        });
    }

    async getSubmittedApp(
        queryParams: ExtendedPagingDto,
        userPayload: UserPayload,
    ) {
        const { _id: userId } = userPayload;
        const {
            page,
            limit,
            sortBy,
            sortDirection,
            skip,
            filterPipeline,
            select,
        } = queryParams;

        const result = await this.appModel
            .find(
                {
                    createdBy: new mongoose.Types.ObjectId(userId),
                },
                filterPipeline,
            )
            .limit(limit)
            .skip(skip)
            .sort({ [sortBy]: sortDirection })
            .select(select)
            .autoPopulate()
            .multipleLanguage(appSettings.mainLanguage);

        const total = await this.appModel
            .countDocuments(
                {
                    createdBy: new mongoose.Types.ObjectId(userId),
                },
                filterPipeline,
            )
            .autoPopulate();

        const meta = pagination(result, page, limit, total);

        const items = result.map(async (item) => {
            return {
                ...item,
                isReceivedReward:
                    await this.userTransactionService.checkReceivedReward(
                        userId,
                        item?._id,
                        MetadataType.AMOUNT_REWARD_USER_OPEN_APP,
                    ),
            };
        });

        return Promise.all(items).then((items) => {
            return { items, meta };
        });
    }

    async getAppsByTag(
        tagSlug: string,
        queryParams: ExtendedPagingDto,
        userPayload: UserPayload,
    ) {
        const { _id: userId } = userPayload;
        const tag = await this.tagService.model.findOne({ slug: tagSlug });

        if (!tag) {
            throw new BadRequestException(`Not found tag ${tagSlug}`);
        }

        const {
            page,
            limit,
            skip,
            filterPipeline,
            sortBy,
            sortDirection,
            select,
        } = queryParams;

        const tagApps = await this.tagAppsService.model
            .find({
                tag: new Types.ObjectId(tag?._id),
            })
            .limit(limit)
            .skip(skip)
            .sort({ [sortBy]: sortDirection });

        const appIds = tagApps.map(
            (item) => new Types.ObjectId(item.app.toString()),
        );

        const apps = await this.appModel
            .find(
                {
                    _id: {
                        $in: appIds,
                    },
                },
                [
                    ...filterPipeline,
                    {
                        $addFields: {
                            [sortBy]: {
                                $indexOfArray: [appIds, '$_id'],
                            },
                        },
                    },
                ],
            )
            .select(select)
            .sort({ [sortBy]: sortDirection })
            .autoPopulate()
            .multipleLanguage(appSettings.mainLanguage);

        const total = await this.appModel
            .countDocuments(
                {
                    _id: {
                        $in: appIds,
                    },
                },
                filterPipeline,
            )
            .autoPopulate();

        const items = apps.map(async (item) => {
            return {
                ...item,
                isReceivedReward:
                    await this.userTransactionService.checkReceivedReward(
                        userId,
                        item?._id,
                        MetadataType.AMOUNT_REWARD_USER_OPEN_APP,
                    ),
            };
        });

        const meta = pagination(items, page, limit, total);
        return Promise.all(items).then((items) => {
            return { items, meta };
        });
    }

    async addPointForUser(
        appId: Types.ObjectId,
        type: MetadataType,
        userPayload: UserPayload,
    ) {
        const app = await this.appModel.findOne({ _id: appId });
        const { _id: userId } = userPayload;

        const addPointForUserDto: AddPointForUserDto = {
            point: 0,
            type: UserTransactionType.SUM,
            app: appId,
            name: '',
            limit: null,
            action: [],
        };

        const amountRewardUserForApp =
            await this.metadataService.getAmountRewardUserForApp(type);

        if (!amountRewardUserForApp) {
            throw new UnprocessableEntityException(
                'amount_reward_user_not_found',
                'Amount reward user not found',
            );
        }

        if (type === MetadataType.AMOUNT_REWARD_USER_OPEN_APP) {
            await this.userAppHistoriesService.createUserAppHistory(
                appId,
                userId,
            );
        }

        const { isGlobal } = amountRewardUserForApp.value;

        if (!isGlobal) {
            addPointForUserDto.point = amountRewardUserForApp.value.reward || 0;
            addPointForUserDto.limit =
                amountRewardUserForApp.value.limit || null;
            addPointForUserDto.action = [amountRewardUserForApp.type];
        }

        if (isGlobal) {
            const amountRewardUserForAppGlobal =
                await this.metadataService.getAmountRewardUserForApp(
                    MetadataType.AMOUNT_REWARD_USER_GLOBAL,
                );

            addPointForUserDto.point =
                amountRewardUserForAppGlobal.value.reward || 0;
            addPointForUserDto.limit =
                amountRewardUserForAppGlobal.value.limit || null;
            addPointForUserDto.action = [
                MetadataType.AMOUNT_REWARD_USER_COMMENT_APP,
                MetadataType.AMOUNT_REWARD_USER_OPEN_APP,
                MetadataType.AMOUNT_REWARD_USER_SHARE_APP,
            ];
        }

        addPointForUserDto.name = amountRewardUserForApp.value.name;

        return await this.userServices.addPointForUser(
            addPointForUserDto,
            app,
            userPayload,
            type,
        );
    }

    async sumTotalRating(sumRatingAppModel: SumRatingAppModel) {
        const { app, star } = sumRatingAppModel;
        const appData = await this.appModel.findOne({ _id: app });

        if (!appData) {
            throw new UnprocessableEntityException(
                'user_not_found',
                'User not found',
            );
        }

        const totalRating = (appData.totalRating || 0) + star;
        const totalRatingCount = (appData.totalRatingCount || 0) + 1;
        const avgRating = totalRating / totalRatingCount;

        await this.appModel.updateOne(
            { _id: app },
            {
                totalRating,
                totalRatingCount,
                avgRating,
            },
        );
    }

    async getOneAppPublish(_id: Types.ObjectId, userPayload: UserPayload) {
        const { _id: userId } = userPayload;
        const filterPipeline: PipelineStage[] = [];
        activePublications(filterPipeline);

        const result = await this.appModel
            .findOne({ slug: _id }, filterPipeline)
            .autoPopulate()
            .multipleLanguage(appSettings.mainLanguage);

        if (!result) {
            throw new NotFoundException('app_not_found', 'App not found');
        }

        return {
            ...result,
            isReceivedReward:
                await this.userTransactionService.checkReceivedReward(
                    userId,
                    result._id,
                    MetadataType.AMOUNT_REWARD_USER_OPEN_APP,
                ),
            isReceivedRewardShare:
                await this.userTransactionService.checkReceivedReward(
                    userId,
                    result._id,
                    MetadataType.AMOUNT_REWARD_USER_SHARE_APP,
                ),
        };
    }

    async getUserAppHistories(
        queryParams: ExtendedPagingDto,
        user: UserPayload,
    ) {
        const { _id: userId } = user;
        const { page, limit, skip, filterPipeline, select } = queryParams;

        const userAppHistories = await this.userAppHistoriesService.model
            .find({
                createdBy: userId,
            })
            .sort({ updatedAt: -1 });

        const appIds = userAppHistories.map(
            (item) => new Types.ObjectId(item?.app?.toString()),
        );

        const apps = await this.appModel
            .find(
                {
                    _id: {
                        $in: appIds,
                    },
                },
                [
                    {
                        $addFields: {
                            __order: {
                                $indexOfArray: [appIds, '$_id'],
                            },
                        },
                    },
                    ...filterPipeline,
                ],
            )
            .select(select)
            .sort({ __order: 1 })
            .limit(limit)
            .skip(skip)
            .autoPopulate()
            .multipleLanguage(appSettings.mainLanguage);

        const items = apps.map(async (item) => {
            return {
                ...item,
                isReceivedReward: userId
                    ? await this.userTransactionService.checkReceivedReward(
                          userId,
                          item._id,
                          MetadataType.AMOUNT_REWARD_USER_OPEN_APP,
                      )
                    : false,
            };
        });

        const total = await this.appModel
            .countDocuments(
                {
                    _id: {
                        $in: appIds,
                    },
                },
                filterPipeline,
            )
            .autoPopulate();

        return Promise.all(items).then((items) => {
            const meta = pagination(items, page, limit, total);
            return { items, meta };
        });
    }

    async getAllSlug() {
        return (await this.appModel.find({})).map((p) => p.slug);
    }
}
