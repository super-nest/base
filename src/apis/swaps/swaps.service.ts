import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { BaseService } from 'src/base/service/base.service';
import {
    UserSwapDocument,
    UserSwapStatus,
    UserSwapType,
} from './entities/user-swaps.entity';
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
import { AfterSwapsDto } from './dto/after-swaps.dto';
import { TonApiClient } from '@ton-api/client';
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
import { UserTransactionDocument } from '../user-transaction/entities/user-transaction.entity';

interface SwapData {
    signatureData: Buffer;
    coin: number;
    userTransaction: UserTransactionDocument;
    type: UserSwapType;
}

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
                status: UserSwapStatus.PENDING,
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
                appSettings.swap.contractAddress,
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
                const bodyOutput = transaction.outMsgs[0].decodedBody;
                const op = bodyInput.loadUint(32);
                let signature = null;
                let isSuccess = false;
                const successStatus = 'Swap to jetton successfully';
                if (op == 0x25938561) {
                    bodyInput.loadUint(64);
                    bodyInput.loadCoins();
                    bodyInput.loadAddress();
                    signature = bodyInput.loadBuffer(64).toString('hex');
                    isSuccess =
                        transaction.success &&
                        _.get(bodyOutput, 'forwardPayload.value.value.text') ==
                            successStatus;
                }

                if (op == 0xdcb17fc0) {
                    bodyInput.loadUint(64);
                    bodyInput.loadCoins();
                    signature = bodyInput.loadBuffer(64).toString('hex');
                    isSuccess =
                        transaction.success &&
                        _.get(bodyOutput, 'text') == successStatus;
                }

                if (signature) {
                    const exits = await this.jettonTransactionModel.findOne({
                        signature,
                    });
                    if (exits) {
                        continue;
                    }

                    jettonTransactions.push({
                        signature,
                        lt: BigInt(transaction.lt),
                        isSuccess,
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
                status: UserSwapStatus.PENDING,
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
                status: jettonTransaction.isSuccess
                    ? UserSwapStatus.SUCCESS
                    : UserSwapStatus.FAILED,
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
            return false;
        }

        await this.swapModel.updateOne(
            { _id: userSwap._id },
            {
                $set: {
                    boc: afterSwapsDto.boc,
                },
            },
        );

        return true;
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
                $ne: UserSwapStatus.FAILED,
            },
        });

        if (count >= 400) {
            throw new BadRequestException('You can only swap 1 times a day');
        }

        let isCreated = false;
        let swapId = new Types.ObjectId();
        try {
            const { amount, walletAddress, type } = createSwapsDto;

            const signer = await mnemonicToPrivateKey(
                appSettings.swap.walletMNEMONIC.split(' '),
            );

            const expireValue = await this.metadataService.getOneSwapInfoByKey(
                'expire',
            );
            const expire = dayjs().add(expireValue.value, 'minute').unix();

            let swapData: SwapData;
            const signatureId = await this.generateSignatureData();
            if (type === UserSwapType.POINT) {
                swapData = await this.swapPointToJetton(
                    userPayload._id,
                    origin,
                    walletAddress,
                    amount,
                    expire,
                    signatureId,
                );
            }

            if (type === UserSwapType.DRAFT_TON) {
                swapData = await this.swapDraftTon(
                    userPayload._id,
                    origin,
                    walletAddress,
                    amount,
                    expire,
                    signatureId,
                );
            }

            const signature = sign(swapData.signatureData, signer.secretKey);

            const userSwap = await this.swapModel.create({
                amount: swapData.coin,
                createdBy: userPayload._id,
                signature: signature.toString('hex'),
                walletAddress,
                expire,
                point: amount,
                type: swapData.type,
                signatureId,
            });

            if (userSwap) {
                isCreated = true;
                swapId = userSwap._id;

                await this.userService.afterCreateUserTransaction(
                    swapData.userTransaction,
                    COLLECTION_NAMES.USER_SWAP,
                    userSwap._id,
                );
            }

            return {
                _id: userSwap._id,
                signature,
                expire,
                amount: swapData.coin,
                signatureId,
            };
        } catch (error) {
            if (isCreated) {
                await this.rollBackSwap(swapId, userPayload._id);
            }
            throw error;
        }
    }

    async swapPointToJetton(
        userId: Types.ObjectId,
        origin: string,
        walletAddress: string,
        amount: number,
        expire: number,
        signatureId: number,
    ): Promise<SwapData> {
        const minAmount = await this.metadataService.getOneSwapInfoByKey(
            'min-amount',
        );
        const maxAmount = await this.metadataService.getOneSwapInfoByKey(
            'max-amount',
        );

        if (amount < minAmount.value || amount > maxAmount.value) {
            throw new BadRequestException(
                `Amount must be between ${minAmount.value} and ${maxAmount.value}`,
            );
        }

        const fee = await this.metadataService.getOneSwapInfoByKey('fee');

        const userTransaction = await this.userService.createUserTransaction(
            userId,
            UserTransactionType.SUB,
            amount,
            UserTransactionAction.SWAP,
            origin,
        );

        const rate = await this.metadataService.getOneSwapInfoByKey('rate');
        const coin = roundDown(
            (amount - (amount * fee.value) / 100) * rate.value,
        );
        const signatureData = beginCell()
            .storeAddress(appSettings.swap.contractJettonWalletAddress)
            .storeCoins(toNano(coin))
            .storeUint(expire, 32)
            .storeUint(signatureId, 32)
            .endCell()
            .hash();

        return {
            signatureData,
            coin,
            userTransaction,
            type: UserSwapType.POINT,
        };
    }

    async swapDraftTon(
        userId: Types.ObjectId,
        origin: string,
        walletAddress: string,
        amount: number,
        expire: number,
        signatureId: number,
    ): Promise<SwapData> {
        const userTransaction = await this.userService.createUserTransaction(
            userId,
            UserTransactionType.SUB,
            amount,
            UserTransactionAction.DRAFT_TON,
            origin,
        );

        const signatureData = beginCell()
            .storeAddress(Address.parse(walletAddress))
            .storeCoins(toNano(amount))
            .storeUint(expire, 32)
            .storeUint(signatureId, 32)
            .endCell()
            .hash();

        return {
            signatureData,
            coin: amount,
            userTransaction,
            type: UserSwapType.DRAFT_TON,
        };
    }

    async rollBackSwap(userSwapId: Types.ObjectId, userId: Types.ObjectId) {
        const userSwap = await this.swapModel.findOne({
            _id: userSwapId,
            status: UserSwapStatus.PENDING,
        });

        if (userSwap) {
            await this.userService.createUserTransaction(
                userId,
                UserTransactionType.SUM,
                userSwap.point,
                userSwap.type === UserSwapType.POINT
                    ? UserTransactionAction.ROLLBACK_SWAP
                    : UserTransactionAction.ROLLBACK_SWAP_DRAFT_TON,
                null,
                COLLECTION_NAMES.USER_SWAP,
                userSwap._id,
            );

            await this.swapModel.updateOne(
                { _id: userSwap._id },
                {
                    $set: {
                        status: UserSwapStatus.FAILED,
                    },
                },
            );
        }
    }

    private async generateSignatureData() {
        const signatureId = Math.floor(10000000 + Math.random() * 90000000);

        const exits = await this.swapModel.findOne({
            signatureId,
        });

        if (exits) {
            return this.generateSignatureData();
        }

        return signatureId;
    }
}
