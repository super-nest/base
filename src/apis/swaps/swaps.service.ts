import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { BaseService } from 'src/base/service/base.service';
import { UserSwapDocument, UserSwapType } from './entities/user-swaps.entity';
import { COLLECTION_NAMES } from 'src/constants';
import { ExtendedInjectModel } from '@libs/super-core';
import { ExtendedModel } from '@libs/super-core/interfaces/extended-model.interface';
import { CreateSwapsDto } from './dto/create-swaps.dto';
import dayjs from 'dayjs';
import { Address, beginCell, toNano } from '@ton/core';
import { appSettings } from 'src/configs/app-settings';
import { sign, mnemonicToPrivateKey } from '@ton/crypto';
import { UserPayload } from 'src/base/models/user-payload.model';
import { UserService } from '../users/user.service';
import { Types } from 'mongoose';
import { MetadataService } from '../metadata/metadata.service';
import { TelegramBotService } from '../telegram-bot/telegram-bot.service';
import { AfterSwapsDto } from './dto/after-swaps.dto';
import { TonApiClient } from '@ton-api/client';
import { UserStatus } from '../users/constants';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
    JettonTransaction,
    JettonTransactionDocument,
} from './entities/jetton-transaction.entity';
import _ from 'lodash';
import {
    UserTransactionAction,
    UserTransactionType,
} from '../user-transaction/constants';
import { roundDown } from './common/round-down.utils';

@Injectable()
export class SwapsService extends BaseService<UserSwapDocument> {
    private readonly tonApiClient: TonApiClient;
    private readonly logger = new Logger(SwapsService.name);
    constructor(
        @ExtendedInjectModel(COLLECTION_NAMES.USER_SWAP)
        private readonly swapModel: ExtendedModel<UserSwapDocument>,
        @ExtendedInjectModel(COLLECTION_NAMES.JETTON_TRANSACTION)
        private readonly jettonTransactionModel: ExtendedModel<JettonTransactionDocument>,
        private readonly userService: UserService,
        private readonly metadataService: MetadataService,
        private readonly telegramBotService: TelegramBotService,
    ) {
        super(swapModel);
        this.tonApiClient = new TonApiClient({
            baseUrl: appSettings.ton.apiClient.url,
        });
    }

    @Cron(CronExpression.EVERY_5_SECONDS)
    async crawJettonTransaction() {
        this.logger.log('Start cron job jetton transaction');
        const userSwaps = await this.swapModel
            .find({
                type: UserSwapType.PENDING,
            })
            .limit(1);

        if (_.size(userSwaps) === 0) {
            return;
        }

        const limit = 10;
        const jettonTransaction = await this.jettonTransactionModel
            .findOne({})
            .sort({ lt: -1 });

        const { transactions } =
            await this.tonApiClient.blockchain.getBlockchainAccountTransactions(
                appSettings.swap.walletAddress,
                {
                    limit,
                    after_lt: jettonTransaction?.lt
                        ? BigInt(jettonTransaction.lt)
                        : BigInt(0),
                    sort_order: 'asc',
                },
            );

        this.logger.log(`Get ${_.size(transactions)} transactions`);
        if (_.size(transactions) == 0) {
            return;
        }
        const jettonTransactions: Partial<JettonTransaction>[] = [];
        for (const transaction of transactions) {
            try {
                const bodyInput = transaction.inMsg.rawBody.beginParse();
                const op = bodyInput.loadUint(32);
                if (op == 0x25938561) {
                    bodyInput.loadUint(64);
                    bodyInput.loadCoins();
                    bodyInput.loadAddress();
                    const signature = bodyInput.loadBuffer(64).toString('hex');

                    const exits = await this.jettonTransactionModel.findOne({
                        signature,
                    });
                    if (exits) {
                        continue;
                    }

                    jettonTransactions.push({
                        signature,
                        lt: BigInt(transaction.lt),
                        isSuccess: transaction.success,
                    });
                }
            } catch (e) {
                this.logger.error(e);
                continue;
            }
        }

        await this.jettonTransactionModel.insertMany(jettonTransactions);
    }

    @Cron(CronExpression.EVERY_30_SECONDS)
    async cronJobTransaction() {
        this.logger.log('Start cron job transaction');
        const userSwap = await this.swapModel
            .findOne({
                type: UserSwapType.PENDING,
                expire: {
                    $lte: dayjs().unix(),
                },
            })
            .sort({
                createdAt: 1,
            });

        if (!userSwap) {
            return;
        }

        const jettonTransaction = await this.jettonTransactionModel.findOne({
            signature: userSwap.signature,
        });

        const countCheck = userSwap?.countCheck || 0;

        if (!jettonTransaction && countCheck < 5) {
            this.logger.log(
                `User swap ${userSwap._id} not found jetton transaction`,
            );
            await this.swapModel.updateOne(
                { _id: userSwap._id },
                {
                    countCheck: countCheck + 1,
                },
            );
            return;
        }

        if (!jettonTransaction) {
            this.logger.log(
                `User swap ${userSwap._id} not found jetton transaction and failed`,
            );

            await this.rollBackSwap(userSwap._id, userSwap.createdBy);
            return;
        }

        this.logger.log(`User swap ${userSwap._id} found jetton transaction`);
        await this.swapModel.updateOne(
            { _id: userSwap._id },
            {
                type: jettonTransaction.isSuccess
                    ? UserSwapType.SUCCESS
                    : UserSwapType.FAILED,
            },
        );
    }

    async afterSwap(afterSwapsDto: AfterSwapsDto, userPayload: UserPayload) {
        const user = await this.userService.getMe(userPayload);
        const userSwap = await this.swapModel.findOne({
            _id: afterSwapsDto.userSwap,
            createdBy: user._id,
            boc: {
                $exists: false,
            },
            expire: {
                $gte: dayjs().unix(),
            },
        });

        if (!userSwap) {
            return;
        }

        await this.swapModel.updateOne(
            { _id: userSwap._id },
            {
                $set: {
                    boc: afterSwapsDto.boc,
                },
            },
        );
    }

    async swap(
        createSwapsDto: CreateSwapsDto,
        userPayload: UserPayload,
        origin: string,
    ) {
        const now = dayjs();
        const startDay = now.startOf('day').toDate();
        const endDay = now.endOf('day').toDate();
        const count = await this.swapModel.countDocuments({
            createdAt: {
                $gte: startDay,
                $lte: endDay,
            },
            createdBy: userPayload._id,
            status: {
                $ne: UserSwapType.FAILED,
            },
        });

        if (count >= 1) {
            throw new BadRequestException('You can only swap 1 times a day');
        }

        let isCreated = false;
        let swapId = new Types.ObjectId();
        try {
            const telegramBot = await this.telegramBotService.findByDomain(
                origin,
            );
            const { amount, walletAddress } = createSwapsDto;
            const minAmount = await this.metadataService.getOneSwapInfoByKey(
                'min-amount',
            );
            const maxAmount = await this.metadataService.getOneSwapInfoByKey(
                'max-amount',
            );
            const fee = await this.metadataService.getOneSwapInfoByKey('fee');

            if (amount < minAmount.value || amount > maxAmount.value) {
                throw new BadRequestException(
                    `Amount must be between ${minAmount.value} and ${maxAmount.value}`,
                );
            }

            const user = await this.userService.getMe(userPayload);

            const after = user.currentPoint - amount;

            if (after < 0) {
                throw new BadRequestException('Not enough point');
            }

            const signer = await mnemonicToPrivateKey(
                appSettings.swap.walletMNEMONIC.split(' '),
            );

            const rate = await this.metadataService.getOneSwapInfoByKey('rate');
            const coin = roundDown(
                (amount - (amount * fee.value) / 100) * rate.value,
            );

            const expireValue = await this.metadataService.getOneSwapInfoByKey(
                'expire',
            );
            const expire = dayjs().add(expireValue.value, 'minute').unix();
            const signatureData = beginCell()
                .storeAddress(appSettings.swap.walletJettonAddress)
                .storeAddress(Address.parse(walletAddress))
                .storeCoins(toNano(coin))
                .storeUint(expire, 32)
                .endCell()
                .hash();

            const signature = sign(signatureData, signer.secretKey);

            const swap = await this.swapModel.create({
                amount: coin,
                createdBy: user._id,
                signature: signature.toString('hex'),
                walletAddress,
                expire,
                point: amount,
            });

            if (swap) {
                isCreated = true;
                swapId = swap._id;

                // await this.userService.createUserTransaction(
                //     user._id,
                //     userPayload.telegramUserId,
                //     UserTransactionType.SUB,
                //     amount,
                //     user.currentPoint,
                //     after,
                //     COLLECTION_NAMES.USER_SWAP,
                //     swap._id,
                //     telegramBot._id,
                //     UserTransactionAction.SWAP,
                // );
            }

            return {
                _id: swap._id,
                signature,
                expire,
                amount: coin,
            };
        } catch (error) {
            if (isCreated) {
                await this.rollBackSwap(swapId, userPayload._id);
            }
            throw error;
        }
    }

    async rollBackSwap(userSwapId: Types.ObjectId, userId: Types.ObjectId) {
        const userSwap = await this.swapModel.findOne({
            _id: userSwapId,
            type: UserSwapType.PENDING,
        });

        if (userSwap) {
            const user = await this.userService.model.findOne({
                _id: userId,
                status: UserStatus.ACTIVE,
            });

            // await this.userService.createUserTransaction(
            //     user._id,
            //     user.telegramUserId,
            //     UserTransactionType.SUB,
            //     userSwap.point,
            //     user.currentPoint,
            //     user.currentPoint + userSwap.point,
            //     COLLECTION_NAMES.USER_SWAP,
            //     userSwap._id,
            //     null,
            //     UserTransactionAction.ROLLBACK_SWAP,
            // );
            await this.swapModel.updateOne(
                { _id: userSwap._id },
                {
                    $set: {
                        type: UserSwapType.FAILED,
                    },
                },
            );
        }
    }
}
