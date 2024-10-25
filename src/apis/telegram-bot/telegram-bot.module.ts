import { TelegramBotService } from './telegram-bot.service';
import { Global, Module } from '@nestjs/common';
import { COLLECTION_NAMES } from 'src/constants';
import { TelegramBot, TelegramBotSchema } from './entities/telegram-bot.entity';
import { ExtendedMongooseModule } from '@libs/super-core/modules/mongoose/extended-mongoose.module';

@Global()
@Module({
    imports: [
        ExtendedMongooseModule.forFeature([
            {
                name: COLLECTION_NAMES.TELEGRAM_BOT,
                schema: TelegramBotSchema,
                entity: TelegramBot,
            },
        ]),
    ],
    controllers: [],
    providers: [TelegramBotService],
    exports: [TelegramBotService],
})
export class TelegramBotModule {}
