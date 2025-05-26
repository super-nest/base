import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { COLLECTION_NAMES } from 'src/constants';
import { AuditLog } from 'src/packages/audits/decorators/audits.decorator';
import { AUDIT_EVENT } from 'src/packages/audits/constants';
import { Resource } from '@libs/super-authorize';
import { CountriesService } from '../service/countries.service';

@Controller('countries')
@Resource('countries')
@ApiTags('Front: Countries')
@AuditLog({
    events: [AUDIT_EVENT.POST, AUDIT_EVENT.PUT, AUDIT_EVENT.DELETE],
    refSource: COLLECTION_NAMES.LOGS,
})
export class UserController {
    constructor(private readonly countriesService: CountriesService) {}


}
