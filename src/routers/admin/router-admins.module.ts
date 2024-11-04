import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { UserControllerAdmin } from 'src/apis/users/controllers/user.controller.admin';
import { AuthModule } from 'src/apis/auth/auth.module';
import { AuthControllerAdmin } from 'src/apis/auth/controllers/auth.controller.admin';
import { CategoriesModule } from 'src/apis/categories/categories.module';
import { CategoriesControllerAdmin } from 'src/apis/categories/controllers/categories.controller.admin';
import { MediaControllerAdmin } from 'src/apis/media/controllers/medias.controller.admin';
import { MediaModule } from 'src/apis/media/medias.module';
import { MetadataControllerAdmin } from 'src/apis/metadata/controllers/metadata.controller.admin';
import { MetadataModule } from 'src/apis/metadata/metadata.module';
import { PostsControllerAdmin } from 'src/apis/posts/controllers/posts.controller.admin';
import { PostsModule } from 'src/apis/posts/posts.module';
import { UserModule } from 'src/apis/users/user.module';
import { CommonModule } from 'src/common/common.module';
import { AuditsModule } from 'src/packages/audits/audits.module';
import { AppsControllerAdmin } from 'src/apis/apps/controllers/apps.controller.admin';
import { AppsModule } from 'src/apis/apps/apps.module';
import { ReviewRatingControllerAdmin } from 'src/apis/review-ratings/controllers/review-ratings.controller.admin';
import { ReviewRatingModule } from 'src/apis/review-ratings/review-ratings.module';
import { AdvertisersControllerAdmin } from 'src/apis/advertisers/controllers/advertisers.controller.admin';
import { AdvertisersModule } from 'src/apis/advertisers/advertisers.module';
import { TelegramBotControllerAdmin } from 'src/apis/telegram-bot/controllers/telegram-bot.controller.admin';
import { TelegramBotModule } from 'src/apis/telegram-bot/telegram-bot.module';
import { TagsModule } from 'src/apis/tags/tags.module';
import { TagsControllerAdmin } from 'src/apis/tags/controllers/tags.controller.admin';
import { NotificationsControllerAdmin } from 'src/apis/notifications/controllers/notifications.controller.admin';
import { NotificationsModule } from 'src/apis/notifications/notifications.module';
import { TagAppsControllerAdmin } from 'src/apis/tag-apps/controllers/tag-apps.controller.admin';
import { TagAppsModule } from 'src/apis/tag-apps/tag-apps.module';
import { UserTransactionControllerAdmin } from 'src/apis/user-transaction/controllers/user-transaction.controller.admin';
import { UserTransactionModule } from 'src/apis/user-transaction/user-transaction.module';
import { FormBuilderModule } from 'src/apis/form-builders/form-builders.module';
import { FormBuilderControllerAdmin } from 'src/apis/form-builders/controllers/form-builders.controller.admin';
import { PagesControllerAdmin } from 'src/apis/pages/controllers/pages.controller.admin';
import { PagesModule } from 'src/apis/pages/pages.module';

@Module({
    imports: [
        ScheduleModule.forRoot(),
        CommonModule,
        UserModule,
        MediaModule,
        AuthModule,
        CategoriesModule,
        PostsModule,
        MetadataModule,
        AuditsModule,
        AppsModule,
        ReviewRatingModule,
        AdvertisersModule,
        TelegramBotModule,
        TagsModule,
        NotificationsModule,
        TagAppsModule,
        UserTransactionModule,
        FormBuilderModule,
        PagesModule,
    ],
    controllers: [
        MediaControllerAdmin,
        AuthControllerAdmin,
        CategoriesControllerAdmin,
        PostsControllerAdmin,
        MetadataControllerAdmin,
        UserControllerAdmin,
        AppsControllerAdmin,
        ReviewRatingControllerAdmin,
        AdvertisersControllerAdmin,
        TelegramBotControllerAdmin,
        TagsControllerAdmin,
        NotificationsControllerAdmin,
        TagAppsControllerAdmin,
        UserTransactionControllerAdmin,
        FormBuilderControllerAdmin,
        PagesControllerAdmin,
    ],
    providers: [],
})
export class RouterAdminsModule {}
