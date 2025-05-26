import {
    Injectable,
    OnModuleInit,
} from '@nestjs/common';
import { BaseService } from 'src/base/service/base.service';
import { COLLECTION_NAMES } from 'src/constants';
import _ from 'lodash';
import { SuperCacheService } from '@libs/super-cache/super-cache.service';
import { ExtendedInjectModel } from '@libs/super-core';
import { ExtendedModel } from '@libs/super-core/interfaces/extended-model.interface';
import { CountriesDocument } from '../entities/countries.entity';

@Injectable()
export class CountriesService
    extends BaseService<CountriesDocument>
    implements OnModuleInit
{
    constructor(
        @ExtendedInjectModel(COLLECTION_NAMES.COUNTRIES)
        private readonly countriesModel: ExtendedModel<CountriesDocument>,
        private readonly superCacheService: SuperCacheService,
    ) {
        super(countriesModel);
    }
    onModuleInit() {
        throw new Error('Method not implemented.');
    }

    async getCountries(): Promise<CountriesDocument[]> {
        const cacheKey = 'countries';
        const cachedCountries = await this.superCacheService.get<CountriesDocument[]>(cacheKey);
        if (cachedCountries) {
            return cachedCountries;
        }

        const countries = await this.countriesModel.find({});
        if (_.isEmpty(countries)) {
            return [];
        }

        await this.superCacheService.set(cacheKey, countries, 60 * 60);
        return countries;
    }


}
