import { ForbiddenException, Injectable } from '@nestjs/common';
import { BaseService } from 'src/base/service/base.service';
import { TelegramBotDocument } from './entities/telegram-bot.entity';
import { COLLECTION_NAMES } from 'src/constants';
import { ExtendedInjectModel } from '@libs/super-core';
import { ExtendedModel } from '@libs/super-core/interfaces/extended-model.interface';

@Injectable()
export class TelegramBotService extends BaseService<TelegramBotDocument> {
    constructor(
        @ExtendedInjectModel(COLLECTION_NAMES.TELEGRAM_BOT)
        private readonly telegramBotModel: ExtendedModel<TelegramBotDocument>,
    ) {
        super(telegramBotModel);
    }

    async findByDomain(domain: string): Promise<TelegramBotDocument> {
        const result = await this.telegramBotModel.findOne({ domain });

        if (!result) {
            throw new ForbiddenException(
                'You must use telegram mini app for this feature',
            );
        }

        return result;
    }

    async getDomains() {
        const result = await this.telegramBotModel.find({});
        return result.map((item) => item.domain);
    }
}
