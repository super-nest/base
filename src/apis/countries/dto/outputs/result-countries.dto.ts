import { SuperApiProperty } from '@libs/super-core';
import { Countries } from '../../entities/countries.entity';

export class ResultCountriesDto extends Countries {
    @SuperApiProperty({
        description: 'The ID of the country',
        example: 'US',
    })
    id: string;
    
    @SuperApiProperty({
        description: 'The name of the country',
        example: 'United States',
    })
    name: string;
    
    @SuperApiProperty({
        description: 'The phone code of the country',
        example: '+84',
    })
    phoneCode: string;
    

}
