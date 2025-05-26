import { Module } from '@nestjs/common';
import { COLLECTION_NAMES } from 'src/constants';
import { ExtendedMongooseModule } from '@libs/super-core/modules/mongoose/extended-mongoose.module';
import { Countries, CountriesSchema } from './entities/countries.entity';
import { CountriesService } from './service/countries.service';
@Module({
    imports: [
        ExtendedMongooseModule.forFeature([
            {
                name: COLLECTION_NAMES.USER,
                schema: CountriesSchema,
                entity: Countries,
            },
        ]),
    ],
    controllers: [],
    providers: [CountriesService],
    exports: [CountriesService],
})
export class UserModule {}
