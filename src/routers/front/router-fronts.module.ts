import { Module } from '@nestjs/common';
import { MediaModule } from 'src/apis/media/medias.module';
import { UserModule } from 'src/apis/users/user.module';
import { CommonModule } from 'src/common/common.module';
import { AuthModule } from 'src/apis/auth/auth.module';
import { CategoriesModule } from 'src/apis/categories/categories.module';
import { PostsModule } from 'src/apis/posts/posts.module';
import { MetadataModule } from 'src/apis/metadata/metadata.module';
import { CategoriesController } from 'src/apis/categories/controllers/categories.controller';
import { AuthController } from 'src/apis/auth/controllers/auth.controller';
import { MediaController } from 'src/apis/media/controllers/medias.controller';
import { MetadataController } from 'src/apis/metadata/controllers/metadata.controller';
import { PostsController } from 'src/apis/posts/controllers/posts.controller';
import { UserController } from 'src/apis/users/controllers/user.controller';
import { AppsController } from 'src/apis/apps/controllers/apps.controller';
import { AppsModule } from 'src/apis/apps/apps.module';
import { ReviewRatingController } from 'src/apis/review-ratings/controllers/review-ratings.controller';
import { ReviewRatingModule } from 'src/apis/review-ratings/review-ratings.module';
import { AdvertisersModule } from 'src/apis/advertisers/advertisers.module';
import { AdvertisersController } from 'src/apis/advertisers/controllers/advertisers.controller';
import { TagsModule } from 'src/apis/tags/tags.module';
import { TagsController } from 'src/apis/tags/controllers/tags.controller';
import { NotificationsController } from 'src/apis/notifications/controllers/notifications.controller';
import { NotificationsModule } from 'src/apis/notifications/notifications.module';
import { FormBuilderModule } from 'src/apis/form-builders/form-builders.module';
import { FormBuilderController } from 'src/apis/form-builders/controllers/form-builders.controller';
import { UserTransactionController } from 'src/apis/user-transaction/controllers/user-transaction.controller';
import { UserTransactionModule } from 'src/apis/user-transaction/user-transaction.module';
import { MissionModule } from 'src/apis/mission/mission.module';
import { MissionController } from 'src/apis/mission/controllers/mission.controller';
import { UserReferralsModule } from 'src/apis/user-referrals/user-referrals.module';
import { PagesModule } from 'src/apis/pages/pages.module';
import { PagesController } from 'src/apis/pages/controllers/pages.controller';
import { UserReferralsController } from 'src/apis/user-referrals/controller/user-referrals.controller';

@Module({
    imports: [
        CommonModule,
        UserModule,
        MediaModule,
        AuthModule,
        CategoriesModule,
        PostsModule,
        MetadataModule,
        AppsModule,
        ReviewRatingModule,
        AdvertisersModule,
        TagsModule,
        NotificationsModule,
        FormBuilderModule,
        UserTransactionModule,
        UserReferralsModule,
        PagesModule,
        MissionModule,
    ],
    controllers: [
        UserController,
        MediaController,
        AuthController,
        CategoriesController,
        PostsController,
        MetadataController,
        AppsController,
        ReviewRatingController,
        AdvertisersController,
        TagsController,
        NotificationsController,
        FormBuilderController,
        UserTransactionController,
        PagesController,
        UserReferralsController,
        MissionController,
    ],
    providers: [],
})
export class RouterFrontsModule {}
